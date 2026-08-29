import { useCallback, useEffect } from 'react'
import { secureTransport } from '../lib/socketConnection'
import { useSocketBus } from '../socket/socketContext'
import { useSocketEvent, useSocketStatus } from './useSocketEvent'

/**
 * Studio ↔ customer live chat over the shared dashboard socket. Conversation
 * ACL is enforced server-side; WSS is used automatically when the origin is
 * https.
 */
export default function useMessagingSocket({
  conversationId,
  enabled = true,
  onMessage,
  onTyping,
  onConversationUpdated,
  onError,
} = {}) {
  const bus = useSocketBus()
  const connected = useSocketStatus()

  useSocketEvent('messaging:message', onMessage, { enabled })
  useSocketEvent('messaging:typing', onTyping, { enabled })

  useSocketEvent(
    'messaging:conversation_updated',
    useCallback((payload) => onConversationUpdated?.(payload?.conversation), [onConversationUpdated]),
    { enabled }
  )

  useSocketEvent(
    'messaging:error',
    useCallback((payload) => onError?.(payload?.message || 'Chat error'), [onError]),
    { enabled }
  )

  useSocketEvent('connect_error', onError, { enabled })

  // Room membership follows the open conversation. The shared socket outlives
  // this screen, so leaving on unmount is what stops the messages.
  useEffect(() => {
    if (!bus || !enabled || !connected || !conversationId) return undefined
    bus.emit('messaging:join', { conversation_id: conversationId })
    return () => {
      bus.emit('messaging:leave', { conversation_id: conversationId })
    }
  }, [bus, enabled, connected, conversationId])

  const send = useCallback(
    (text, caseId) =>
      new Promise((resolve, reject) => {
        if (!bus || !conversationId || !connected) {
          reject(new Error('Socket not connected'))
          return
        }
        const sent = bus.emit(
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
        if (!sent) reject(new Error('Socket not connected'))
      }),
    [bus, connected, conversationId]
  )

  const setTyping = useCallback(
    (isTyping) => {
      if (!conversationId) return
      bus?.emit('messaging:typing', {
        conversation_id: conversationId,
        is_typing: Boolean(isTyping),
      })
    },
    [bus, conversationId]
  )

  const markRead = useCallback(
    (upToMessageId) => {
      if (!conversationId) return
      bus?.emit('messaging:read', {
        conversation_id: conversationId,
        up_to_message_id: upToMessageId,
      })
    },
    [bus, conversationId]
  )

  return { connected, secureTransport, send, setTyping, markRead }
}
