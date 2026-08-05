import { useCallback, useEffect, useRef, useState } from 'react'
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
 * Authenticated Socket.io for studio ↔ customer live chat.
 * JWT in handshake.auth.token; conversation ACL enforced on server.
 * Uses WSS automatically when SOCKET_ORIGIN is https.
 */
export default function useMessagingSocket({
  conversationId,
  enabled = true,
  onMessage,
  onTyping,
  onConversationUpdated,
  onError,
} = {}) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const secureTransport = SOCKET_ORIGIN.startsWith('https://')

  const onMessageRef = useRef(onMessage)
  const onTypingRef = useRef(onTyping)
  const onConvRef = useRef(onConversationUpdated)
  const onErrorRef = useRef(onError)
  onMessageRef.current = onMessage
  onTypingRef.current = onTyping
  onConvRef.current = onConversationUpdated
  onErrorRef.current = onError

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
      socketRef.current = socket

      socket.on('connect', () => {
        if (!cancelled) setConnected(true)
      })
      socket.on('disconnect', () => {
        if (!cancelled) setConnected(false)
      })
      socket.on('connect_error', async (err) => {
        if (/authoriz|token|jwt/i.test(err.message || '')) {
          const fresh = await resolveAccessToken()
          if (fresh && socket) {
            socket.auth = { token: fresh }
            socket.connect()
          }
        }
        onErrorRef.current?.(err.message)
      })

      socket.on('messaging:message', (payload) => onMessageRef.current?.(payload))
      socket.on('messaging:typing', (payload) => onTypingRef.current?.(payload))
      socket.on('messaging:conversation_updated', (payload) => {
        onConvRef.current?.(payload?.conversation)
      })
      socket.on('messaging:error', (payload) => {
        onErrorRef.current?.(payload?.message || 'Chat error')
      })
    }

    void connect()

    return () => {
      cancelled = true
      setConnected(false)
      socket?.removeAllListeners()
      socket?.disconnect()
      socketRef.current = null
    }
  }, [enabled])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !connected || !conversationId) return undefined
    socket.emit('messaging:join', { conversation_id: conversationId })
    return () => {
      socket.emit('messaging:leave', { conversation_id: conversationId })
    }
  }, [connected, conversationId])

  const send = useCallback(
    (text, caseId) =>
      new Promise((resolve, reject) => {
        const socket = socketRef.current
        if (!socket || !conversationId || !connected) {
          reject(new Error('Socket not connected'))
          return
        }
        socket.emit(
          'messaging:send',
          { conversation_id: conversationId, text, case_id: caseId },
          (ack) => {
            if (ack?.success && ack.message && typeof ack.message === 'object') {
              resolve(ack)
              return
            }
            reject(new Error(typeof ack?.message === 'string' ? ack.message : 'Send failed'))
          }
        )
      }),
    [connected, conversationId]
  )

  const setTyping = useCallback(
    (isTyping) => {
      const socket = socketRef.current
      if (!socket || !conversationId || !connected) return
      socket.emit('messaging:typing', {
        conversation_id: conversationId,
        is_typing: Boolean(isTyping),
      })
    },
    [connected, conversationId]
  )

  const markRead = useCallback(
    (upToMessageId) => {
      const socket = socketRef.current
      if (!socket || !conversationId || !connected) return
      socket.emit('messaging:read', {
        conversation_id: conversationId,
        up_to_message_id: upToMessageId,
      })
    },
    [connected, conversationId]
  )

  return { connected, secureTransport, send, setTyping, markRead }
}
