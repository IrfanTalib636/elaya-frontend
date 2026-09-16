import { useCallback, useEffect } from 'react'
import { secureTransport } from '../lib/socketConnection'
import { useSocketBus } from '../socket/socketContext'
import { useSocketEvent, useSocketStatus } from './useSocketEvent'

/**
 * Super admin ↔ studio platform chat over the shared dashboard socket.
 */
export default function usePlatformMessagingSocket({
  conversationId,
  enabled = true,
  onMessage,
  onTyping,
  onConversationUpdated,
  onError,
} = {}) {
  const bus = useSocketBus()
  const connected = useSocketStatus()

  useSocketEvent('platform_messaging:message', onMessage, { enabled })
  useSocketEvent('platform_messaging:typing', onTyping, { enabled })

  useSocketEvent(
    'platform_messaging:conversation_updated',
    useCallback(
      (payload) => onConversationUpdated?.(payload?.conversation),
      [onConversationUpdated]
    ),
    { enabled }
  )

  useSocketEvent(
    'platform_messaging:error',
    useCallback(
      (payload) => onError?.(payload?.message || 'Chat error'),
      [onError]
    ),
    { enabled }
  )

  useEffect(() => {
    if (!bus || !enabled || !connected || !conversationId) return undefined
    if (String(conversationId).startsWith('pending:')) return undefined
    bus.emit('platform_messaging:join', { conversation_id: conversationId })
    return () => {
      bus.emit('platform_messaging:leave', { conversation_id: conversationId })
    }
  }, [bus, enabled, connected, conversationId])

  const send = useCallback(
    (text) =>
      new Promise((resolve, reject) => {
        if (!bus || !conversationId || !connected) {
          reject(new Error('Socket not connected'))
          return
        }
        const sent = bus.emit(
          'platform_messaging:send',
          { conversation_id: conversationId, text },
          (ack) => {
            if (ack?.success && ack.message && typeof ack.message === 'object') {
              resolve(ack)
              return
            }
            reject(
              new Error(typeof ack?.message === 'string' ? ack.message : 'Send failed')
            )
          }
        )
        if (!sent) reject(new Error('Socket not connected'))
      }),
    [bus, connected, conversationId]
  )

  const setTyping = useCallback(
    (isTyping) => {
      if (!conversationId || String(conversationId).startsWith('pending:')) return
      bus?.emit('platform_messaging:typing', {
        conversation_id: conversationId,
        is_typing: Boolean(isTyping),
      })
    },
    [bus, conversationId]
  )

  return { connected, secureTransport, send, setTyping }
}
