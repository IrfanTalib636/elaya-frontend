import { useCallback, useEffect, useRef, useState } from 'react'
import { Radio, Send, WifiOff } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  openPlatformConversation,
  listPlatformMessages,
  sendPlatformMessage,
  markPlatformConversationRead,
} from '../../api/platformMessaging'
import { markConversationNotificationsRead } from '../../api/notifications'
import { getApiErrorMessage } from '../../lib/apiError'
import usePlatformMessagingSocket from '../../hooks/usePlatformMessagingSocket'
import { PageHeader, Spinner } from '../../components/ui'
import useContent from '../../i18n/useContent'

const fmtTime = (d) => {
  if (!d) return ''
  try {
    return new Date(d).toLocaleString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export default function StudioPlatformChat() {
  const { studioPages } = useContent()
  const copy = studioPages.platformChat

  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [peerTyping, setPeerTyping] = useState(false)
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const opened = await openPlatformConversation({})
      const conversation = opened.data?.data?.conversation
      if (!conversation?.id) throw new Error(copy.openError)
      setConversationId(conversation.id)
      const res = await listPlatformMessages(conversation.id, { limit: 100 })
      setMessages(res.data?.data?.messages || [])
      await markPlatformConversationRead(conversation.id).catch(() => undefined)
      await markConversationNotificationsRead(conversation.id).catch(() => undefined)
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.openError))
    } finally {
      setLoading(false)
    }
  }, [copy.openError])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, peerTyping])

  const upsertMessage = useCallback((message) => {
    if (!message) return
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev
      return [...prev, message]
    })
  }, [])

  const { connected, send, setTyping } = usePlatformMessagingSocket({
    conversationId,
    enabled: Boolean(conversationId),
    onMessage: ({ message }) => {
      if (message?.conversation_id === conversationId) {
        upsertMessage(message)
        setPeerTyping(false)
        void markPlatformConversationRead(conversationId).catch(() => undefined)
        void markConversationNotificationsRead(conversationId).catch(() => undefined)
      }
    },
    onTyping: ({ role, is_typing, conversation_id }) => {
      if (conversation_id !== conversationId) return
      if (role === 'admin') setPeerTyping(Boolean(is_typing))
    },
  })

  const handleSend = async (e) => {
    e?.preventDefault()
    const text = draft.trim()
    if (!text || !conversationId || sending) return
    setSending(true)
    setTyping(false)
    try {
      let payload
      try {
        payload = await send(text)
      } catch {
        const res = await sendPlatformMessage(conversationId, { text })
        payload = res.data?.data
      }
      if (payload?.message) {
        upsertMessage(payload.message)
        setDraft('')
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.sendError))
    } finally {
      setSending(false)
    }
  }

  const onDraftChange = (value) => {
    setDraft(value)
    if (!conversationId) return
    setTyping(true)
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => setTyping(false), 1200)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[480px]">
      <div className="flex items-start justify-between gap-4 mb-4">
        <PageHeader title={copy.title} subtitle={copy.subtitle} />
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] mt-1 ${
            connected ? 'text-studio-teal' : 'text-studio-w3'
          }`}
        >
          {connected ? <Radio size={12} /> : <WifiOff size={12} />}
          {connected ? copy.live : copy.offline}
        </span>
      </div>

      <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-elaya-border bg-studio-bg-3 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-studio-w2 text-[13px] text-center py-10 m-0">{copy.empty}</p>
          ) : (
            messages.map((msg) => {
              const fromStudio = msg.sender_role === 'studio'
              return (
                <div
                  key={msg.id}
                  className={`flex ${fromStudio ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 border ${
                      fromStudio
                        ? 'bg-studio-gold/20 border-studio-gold/30'
                        : 'bg-studio-bg-4 border-elaya-border'
                    }`}
                  >
                    <p className="text-studio-w3 text-[10px] m-0 mb-1">
                      {fromStudio ? copy.youLabel : copy.adminLabel}
                    </p>
                    <p className="text-studio-white text-[13px] m-0 whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                    <p className="text-studio-w3 text-[10px] m-0 mt-1.5 text-right">
                      {fmtTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          {peerTyping ? (
            <p className="text-studio-w2 text-[11px] m-0 italic">{copy.typing}</p>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="p-4 border-t border-elaya-border flex items-center gap-2"
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder={copy.inputPlaceholder}
            disabled={!conversationId || sending}
            className="flex-1 rounded-xl border border-elaya-border bg-studio-bg-4 px-4 py-3 text-[13px] text-studio-white placeholder:text-studio-w3 outline-none focus:border-studio-gold"
          />
          <button
            type="submit"
            disabled={!draft.trim() || !conversationId || sending}
            className="h-11 w-11 rounded-full bg-studio-gold text-white border-0 flex items-center justify-center cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            aria-label={copy.send}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}
