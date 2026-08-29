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
      if (token) localStorage.setItem(TOKEN_KEY, token)
    } catch {
      token = localStorage.getItem(TOKEN_KEY)
    }
  }
  return token
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
  let connected = false
  let connecting = false
  let closed = false

  const setConnected = (next) => {
    if (connected === next) return
    connected = next
    for (const listener of statusListeners) listener(next)
  }

  const attach = (event) => {
    if (!socket || dispatchers.has(event)) return
    const dispatch = (payload) => {
      // Copy first: a handler may unsubscribe itself while we iterate.
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

  const connect = async () => {
    if (socket || connecting) return
    connecting = true
    closed = false

    try {
      const token = await resolveAccessToken()
      if (!token || closed) return

      // Loaded on demand: socket.io-client is ~40 kB and nobody who is not
      // signed in — a visitor on the landing page, for instance — should pay
      // for it in the initial bundle.
      const { io } = await import('socket.io-client')
      if (closed) return

      socket = io(SOCKET_ORIGIN, {
        path: '/socket.io',
        auth: { token },
        transports: ['websocket', 'polling'],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 12,
        reconnectionDelay: 800,
      })

      socket.on('connect', () => setConnected(true))
      socket.on('disconnect', () => setConnected(false))

      socket.on('connect_error', async (err) => {
        setConnected(false)
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

      // Subscriptions registered before the socket existed.
      for (const event of handlers.keys()) attach(event)
    } finally {
      connecting = false
    }
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
    if (!socket || !connected) return false
    if (ack) socket.emit(event, payload, ack)
    else socket.emit(event, payload)
    return true
  }

  const onStatusChange = (listener) => {
    statusListeners.add(listener)
    return () => statusListeners.delete(listener)
  }

  /**
   * Drops the transport but keeps the subscriber registry, because that belongs
   * to whichever components are still mounted. Logging back in re-attaches the
   * same subscriptions to a fresh socket, so this manager — and therefore the
   * context value — can stay identity-stable for the life of the app.
   */
  const disconnect = () => {
    closed = true
    for (const event of [...dispatchers.keys()]) detach(event)
    socket?.removeAllListeners()
    socket?.disconnect()
    socket = null
    setConnected(false)
  }

  return {
    connect,
    disconnect,
    subscribe,
    emit,
    onStatusChange,
    isConnected: () => connected,
    /** Test/debug only: how many events currently have subscribers. */
    stats: () => ({ events: handlers.size, socketListeners: dispatchers.size }),
  }
}

export const secureTransport = SOCKET_ORIGIN.startsWith('https://')
