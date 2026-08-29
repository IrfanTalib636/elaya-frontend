import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, MessageCircle, Radio, Send, WifiOff } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getOrCreateConversation,
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage as sendMessageRest,
} from '../../api/messaging'
import { getApiErrorMessage } from '../../lib/apiError'
import useMessagingSocket from '../../hooks/useMessagingSocket'
import { Card, EmptyState, PageHeader, Spinner } from '../../components/ui'
import useContent from '../../i18n/useContent'

const customerName = (c, fallback = 'Customer') => {
  if (!c) return fallback
  const name = [c.vorname, c.nachname].filter(Boolean).join(' ').trim()
  return name || c.email || fallback
}

const fmtTime = (d) => {
  if (!d) return ''
  try {
    return new Date(d).toLocaleString('de-CH', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export default function StudioChatPage() {
  const { studioPages } = useContent()
  const copy = studioPages.chat
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const customerIdParam = searchParams.get('customerId')

  const [conversations, setConversations] = useState([])
  const [loadingInbox, setLoadingInbox] = useState(true)
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingThread, setLoadingThread] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [peerTyping, setPeerTyping] = useState(false)
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) || null,
    [conversations, activeId]
  )

  const loadInbox = useCallback(async () => {
    setLoadingInbox(true)
    try {
      const res = await listConversations({ limit: 50 })
      setConversations(res.data?.data?.conversations || [])
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.inboxLoadError))
    } finally {
      setLoadingInbox(false)
    }
  }, [copy.inboxLoadError])

  useEffect(() => {
    void loadInbox()
  }, [loadInbox])

  // Deep-link from customer detail: ?customerId=
  useEffect(() => {
    if (!customerIdParam) return undefined
    let cancelled = false
    ;(async () => {
      try {
        const res = await getOrCreateConversation({ customer_id: customerIdParam })
        const conversation = res.data?.data?.conversation
        if (cancelled || !conversation?.id) return
        setConversations((prev) => {
          if (prev.some((c) => c.id === conversation.id)) return prev
          return [conversation, ...prev]
        })
        setActiveId(conversation.id)
        setSearchParams({}, { replace: true })
      } catch (err) {
        toast.error(getApiErrorMessage(err, copy.openError))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [customerIdParam, setSearchParams, copy.openError])

  const loadThread = useCallback(async (conversationId) => {
    if (!conversationId) return
    setLoadingThread(true)
    try {
      const res = await listMessages(conversationId, { limit: 100 })
      setMessages(res.data?.data?.messages || [])
      await markConversationRead(conversationId).catch(() => undefined)
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unread_studio: 0 } : c
        )
      )
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.messagesLoadError))
    } finally {
      setLoadingThread(false)
    }
  }, [copy.messagesLoadError])

  useEffect(() => {
    if (activeId) void loadThread(activeId)
    else setMessages([])
  }, [activeId, loadThread])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, peerTyping])

  const upsertMessage = useCallback((message, conversation) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev
      return [...prev, message]
    })
    if (conversation) {
      setConversations((prev) => {
        const others = prev.filter((c) => c.id !== conversation.id)
        return [conversation, ...others]
      })
    }
  }, [])

  const { connected, secureTransport, send, setTyping, markRead } = useMessagingSocket({
    conversationId: activeId,
    enabled: true,
    onMessage: ({ message, conversation }) => {
      if (message.conversation_id === activeId || conversation?.id === activeId) {
        upsertMessage(message, conversation)
        markRead(message.id)
      } else if (conversation) {
        setConversations((prev) => {
          const others = prev.filter((c) => c.id !== conversation.id)
          return [conversation, ...others]
        })
      }
    },
    onTyping: ({ role, is_typing, conversation_id }) => {
      if (conversation_id !== activeId) return
      if (role === 'studio') return
      setPeerTyping(Boolean(is_typing))
    },
    onConversationUpdated: (conversation) => {
      if (!conversation?.id) return
      setConversations((prev) => {
        const others = prev.filter((c) => c.id !== conversation.id)
        return [conversation, ...others]
      })
    },
  })

  const handleSend = async (e) => {
    e?.preventDefault?.()
    const text = draft.trim()
    if (!text || !activeId || sending) return
    setSending(true)
    setTyping(false)
    setDraft('')
    try {
      let payload
      try {
        payload = await send(text)
      } catch {
        const res = await sendMessageRest(activeId, { text })
        payload = res.data?.data
      }
      if (payload?.message) upsertMessage(payload.message, payload.conversation)
    } catch (err) {
      setDraft(text)
      toast.error(getApiErrorMessage(err, copy.sendFailed))
    } finally {
      setSending(false)
    }
  }

  const onDraftChange = (value) => {
    setDraft(value)
    setTyping(value.trim().length > 0)
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => setTyping(false), 1200)
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto h-[calc(100vh-2rem)] flex flex-col">
      <PageHeader title={copy.title} subtitle={copy.subtitle}>
        <div className="flex items-center gap-2 text-[12px] text-studio-w2">
          {secureTransport ? <Lock size={13} className="text-studio-teal-2" /> : null}
          {connected ? (
            <span className="inline-flex items-center gap-1 text-studio-teal-2">
              <Radio size={13} /> {secureTransport ? copy.liveSecure : copy.live}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-studio-w3">
              <WifiOff size={13} /> {copy.connecting}
            </span>
          )}
        </div>
      </PageHeader>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 mt-4">
        {/* Inbox */}
        <Card padding="none" className="overflow-hidden flex flex-col min-h-[280px]">
          <div className="px-4 py-3 border-b border-elaya-border">
            <p className="text-studio-w3 text-[11px] font-semibold uppercase tracking-wider m-0">
              {copy.conversations}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingInbox ? (
              <div className="p-8 flex justify-center">
                <Spinner />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={MessageCircle}
                  title={copy.emptyInboxTitle}
                  description={copy.emptyInboxDesc}
                />
                <button
                  type="button"
                  className="mt-3 text-studio-gold-2 text-[13px] bg-transparent border-0 cursor-pointer"
                  onClick={() => navigate('/studio/customers')}
                >
                  {copy.toCustomers}
                </button>
              </div>
            ) : (
              conversations.map((c) => {
                const active = c.id === activeId
                const unread = c.unread_studio || 0
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={`w-full text-left px-4 py-3 border-0 border-b border-elaya-border cursor-pointer transition-colors ${
                      active ? 'bg-(--nav-active-bg)' : 'bg-transparent hover:bg-studio-bg-4'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-studio-white text-[13px] font-semibold m-0 truncate">
                        {customerName(c.customer, copy.customerFallback)}
                      </p>
                      {unread > 0 ? (
                        <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-studio-gold text-[10px] font-bold text-studio-bg flex items-center justify-center">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-studio-w3 text-[12px] m-0 mt-1 truncate">
                      {c.last_message_preview || copy.noMessagesYet}
                    </p>
                    <p className="text-studio-w3 text-[10px] m-0 mt-1">
                      {fmtTime(c.last_message_at)}
                    </p>
                  </button>
                )
              })
            )}
          </div>
        </Card>

        {/* Thread */}
        <Card padding="none" className="overflow-hidden flex flex-col min-h-[420px]">
          {!activeId ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <EmptyState
                icon={MessageCircle}
                title={copy.selectTitle}
                description={copy.selectDesc}
              />
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-elaya-border flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-studio-white text-[14px] font-semibold m-0 truncate">
                    {customerName(activeConversation?.customer, copy.customerFallback)}
                  </p>
                  <p className="text-studio-w3 text-[11px] m-0 mt-0.5">
                    {peerTyping
                      ? copy.customerTyping
                      : activeConversation?.customer?.email || copy.liveChat}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-studio-bg/40">
                {loadingThread ? (
                  <div className="flex justify-center py-10">
                    <Spinner />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-studio-w3 text-[13px] text-center py-10 m-0">
                    {copy.writeFirst}
                  </p>
                ) : (
                  messages.map((m) => {
                    const mine = m.sender_role === 'studio'
                    return (
                      <div
                        key={m.id}
                        className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-[14px] px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
                            mine
                              ? 'bg-studio-gold/20 text-studio-white border border-studio-gold/30'
                              : 'bg-studio-bg-4 text-studio-w1 border border-elaya-border'
                          }`}
                        >
                          {m.text}
                          <div
                            className={`text-[10px] mt-1 ${
                              mine ? 'text-studio-gold-2/80' : 'text-studio-w3'
                            }`}
                          >
                            {fmtTime(m.createdAt)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="p-3 border-t border-elaya-border flex items-end gap-2 bg-studio-bg-3"
              >
                <textarea
                  value={draft}
                  onChange={(e) => onDraftChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void handleSend()
                    }
                  }}
                  rows={2}
                  maxLength={4000}
                  placeholder={copy.placeholder}
                  className="flex-1 resize-none rounded-[12px] bg-studio-bg-4 border border-elaya-border text-studio-white text-[13px] px-3 py-2.5 outline-none focus:border-studio-gold/50"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="shrink-0 w-11 h-11 rounded-[12px] bg-studio-gold text-studio-bg flex items-center justify-center border-0 cursor-pointer disabled:opacity-40"
                  aria-label={copy.sendAria}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
