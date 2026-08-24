import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { TOKEN_KEY } from '../lib/session'
import { isJwtExpired } from '../lib/token'
import { trySilentRefresh } from '../lib/refreshSession'
import useAuthStore from '../store/authStore'
import { SOCKET_ORIGIN } from '../lib/socketOrigin'

async function resolveAccessToken() {
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
 * Live platform + studio schedule events.
 * - config:session_prediction_updated → room config:platform
 * - studio:schedule_updated → room availability:studio:{id}
 */
export default function usePlatformConfigSocket({
  enabled = true,
  onSessionPredictionUpdated,
  onStudioScheduleUpdated,
} = {}) {
  const sessionHandlerRef = useRef(onSessionPredictionUpdated)
  sessionHandlerRef.current = onSessionPredictionUpdated
  const scheduleHandlerRef = useRef(onStudioScheduleUpdated)
  scheduleHandlerRef.current = onStudioScheduleUpdated

  useEffect(() => {
    if (!enabled) return undefined
    let cancelled = false
    let socket = null

    const connect = async () => {
      const token = await resolveAccessToken()
      if (!token || cancelled) return

      socket = io(SOCKET_ORIGIN, {
        path: '/socket.io',
        auth: { token },
        transports: ['websocket', 'polling'],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 12,
        reconnectionDelay: 800,
      })

      socket.on('connect_error', async (err) => {
        if (/authoriz|token|jwt/i.test(err.message || '')) {
          const fresh = await resolveAccessToken()
          if (fresh && socket) {
            socket.auth = { token: fresh }
            socket.connect()
          }
        }
      })

      socket.on('config:session_prediction_updated', (payload) => {
        sessionHandlerRef.current?.(payload)
      })

      socket.on('studio:schedule_updated', (payload) => {
        scheduleHandlerRef.current?.(payload)
      })
    }

    void connect()

    return () => {
      cancelled = true
      socket?.removeAllListeners()
      socket?.disconnect()
    }
  }, [enabled])
}
