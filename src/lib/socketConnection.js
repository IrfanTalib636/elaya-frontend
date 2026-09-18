import { TOKEN_KEY } from './session'
import { isJwtExpired } from './token'
import { trySilentRefresh } from './refreshSession'
import { SOCKET_ORIGIN } from './socketOrigin'
import useAuthStore from '../store/authStore'

/** Current access token, refreshed silently when it has expired. */
export async function resolveAccessToken() {
  let token = localStorage.getItem(TOKEN_KEY) || useAuthStore.getState().accessToken
  if (!token || isJwtExpired(token)) {
    try {
      token = await trySilentRefresh()
      useAuthStore.getState().setAccessToken?.(token)
    } catch {
      token = localStorage.getItem(TOKEN_KEY) || useAuthStore.getState().accessToken
      if (token && isJwtExpired(token)) return null
    }
  }
  return token && !isJwtExpired(token) ? token : null
}

/**
 * One Socket.io connection for the whole dashboard.
 *
 * Every screen used to open its own socket, so a studio user could hold eight
 * at once — eight handshakes, eight JWT verifications and eight room joins for
 * the same events. This multiplexes instead: a single connection, and exactly
 * one socket-level listener per event name that fans out to the subscribers.
 *
 * Deliberately free of React so the lifecycle can be reasoned about on its own;
 * `SocketProvider` owns when it connects and disconnects.
 */
export const createSocketConnection = () => {
  /** event name → set of subscriber callbacks */
  const handlers = new Map()
  /** event name → the single listener actually attached to the socket */
  const dispatchers = new Map()
  const statusListeners = new Set()

  let socket = null
  let connecting = null
  let closed = false
  let watchdogTimer = null

  const isLive = () => Boolean(socket?.connected)

  const notifyStatus = () => {
    const live = isLive()
    for (const listener of statusListeners) listener(live)
  }

  const attach = (event) => {
    if (!socket || dispatchers.has(event)) return
    const dispatch = (payload) => {
      for (const handler of [...(handlers.get(event) ?? [])]) {
        try {
          handler(payload)
        } catch (err) {
          console.error(`[socket] handler for "${event}" failed:`, err)
        }
      }
    }
    dispatchers.set(event, dispatch)
    socket.on(event, dispatch)
  }

  const detach = (event) => {
    const dispatch = dispatchers.get(event)
    if (!dispatch) return
    socket?.off(event, dispatch)
    dispatchers.delete(event)
  }

  const teardownSocket = () => {
    for (const event of [...dispatchers.keys()]) detach(event)
    socket?.removeAllListeners()
    socket?.disconnect()
    socket = null
    notifyStatus()
  }

  const openSocket = async (token) => {
    const { io } = await import('socket.io-client')
    if (closed) return null

    socket = io(SOCKET_ORIGIN, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      reconnectionDelayMax: 5000,
    })

    socket.on('connect', () => notifyStatus())
    socket.on('disconnect', () => notifyStatus())

    socket.on('connect_error', async (err) => {
      notifyStatus()
      if (/authoriz|token|jwt/i.test(err?.message || '')) {
        const fresh = await resolveAccessToken()
        if (fresh && socket) {
          socket.auth = { token: fresh }
          socket.connect()
        }
      }
      for (const handler of [...(handlers.get('connect_error') ?? [])]) {
        handler(err?.message)
      }
    })

    for (const event of handlers.keys()) attach(event)
    return socket
  }

  const connect = async () => {
    if (closed) closed = false

    if (isLive()) return true

    if (connecting) return connecting

    connecting = (async () => {
      try {
        const token = await resolveAccessToken()
        if (!token || closed) return false

        if (socket && !socket.connected) {
          socket.auth = { token }
          if (socket.active === false) {
            teardownSocket()
          } else {
            socket.connect()
            return isLive()
          }
        }

        if (socket) return isLive()

        await openSocket(token)
        return isLive()
      } finally {
        connecting = null
      }
    })()

    return connecting
  }

  /** Apply a freshly issued access token (e.g. after AuthSessionGate refresh). */
  const reauth = async (token) => {
    if (!token || isJwtExpired(token)) return
    localStorage.setItem(TOKEN_KEY, token)
    if (closed) closed = false

    if (!socket) {
      await connect()
      return
    }

    socket.auth = { token }
    if (!isLive()) {
      if (socket.active === false) {
        teardownSocket()
        await connect()
        return
      }
      socket.connect()
    }
  }

  /** Keep trying while the dashboard session is active. */
  const startWatchdog = () => {
    if (watchdogTimer) return
    watchdogTimer = setInterval(() => {
      if (closed) return
      if (!isLive() && !connecting) void connect()
    }, 4000)
  }

  const stopWatchdog = () => {
    if (!watchdogTimer) return
    clearInterval(watchdogTimer)
    watchdogTimer = null
  }

  /**
   * @returns {() => void} unsubscribe
   */
  const subscribe = (event, handler) => {
    if (!handlers.has(event)) handlers.set(event, new Set())
    handlers.get(event).add(handler)
    attach(event)

    return () => {
      const set = handlers.get(event)
      if (!set) return
      set.delete(handler)
      if (set.size === 0) {
        handlers.delete(event)
        detach(event)
      }
    }
  }

  const emit = (event, payload, ack) => {
    if (!isLive()) return false
    if (ack) socket.emit(event, payload, ack)
    else socket.emit(event, payload)
    return true
  }

  const onStatusChange = (listener) => {
    statusListeners.add(listener)
    listener(isLive())
    return () => statusListeners.delete(listener)
  }

  const disconnect = () => {
    closed = true
    stopWatchdog()
    teardownSocket()
  }

  return {
    connect,
    disconnect,
    reauth,
    startWatchdog,
    stopWatchdog,
    subscribe,
    emit,
    onStatusChange,
    isConnected: isLive,
    stats: () => ({ events: handlers.size, socketListeners: dispatchers.size }),
  }
}

export const secureTransport =
  typeof window !== 'undefined'
    ? window.location.protocol === 'https:'
    : SOCKET_ORIGIN.startsWith('https://')
