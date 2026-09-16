import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageSquare, Radio, Search, Send, WifiOff } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  listPlatformConversations,
  openPlatformConversation,
  listPlatformMessages,
  sendPlatformMessage,
  markPlatformConversationRead,
} from '../../api/platformMessaging'
import { markConversationNotificationsRead } from '../../api/notifications'
import { getApiErrorMessage } from '../../lib/apiError'
import usePlatformMessagingSocket from '../../hooks/usePlatformMessagingSocket'
import { Spinner } from '../../components/ui'
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

const studioLabel = (item) => {
  const s = item?.studio
  if (!s) return 'Studio'
  const name = s.firma || s.studio_code || 'Studio'
  return s.ort ? `${name}` : name
}

const AdminStudioChat = () => {
  const { adminPages } = useContent()
  const copy = adminPages.studioChat
  const [searchParams, setSearchParams] = useSearchParams()

  const [query, setQuery] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [inbox, setInbox] = useState([])
  const [loadingInbox, setLoadingInbox] = useState(true)
  const [activeStudioId, setActiveStudioId] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingThread, setLoadingThread] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [peerTyping, setPeerTyping] = useState(false)
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)
  const openedFromQuery = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 250)
    return () => clearTimeout(t)
  }, [query])

  const activeItem = useMemo(
    () =>
      inbox.find(
        (c) =>
          c.id === activeId ||
          c.studio?.id === activeStudioId ||
          String(c.id) === `pending:${activeStudioId}`
      ) || null,
    [inbox, activeId, activeStudioId]
  )

  const loadInbox = useCallback(async () => {
    setLoadingInbox(true)
    try {
      const res = await listPlatformConversations({ q: debouncedQ || undefined, limit: 200 })
      setInbox(res.data?.data?.conversations || [])
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.inboxLoadError))
    } finally {
      setLoadingInbox(false)
    }
  }, [debouncedQ, copy.inboxLoadError])

  useEffect(() => {
    void loadInbox()
  }, [loadInbox])

  const openStudio = useCallback(
    async (item) => {
      const studioId = item.studio?.id
      if (!studioId) return
      setActiveStudioId(studioId)
      setPeerTyping(false)
      setLoadingThread(true)
      try {
        const opened = await openPlatformConversation({ studio_id: studioId })
        const conversation = opened.data?.data?.conversation
        if (!conversation?.id) throw new Error(copy.openError)
        setActiveId(conversation.id)
        setInbox((prev) => {
          const without = prev.filter(
            (c) =>
              c.studio?.id !== studioId &&
              c.id !== conversation.id &&
              c.id !== `pending:${studioId}`
          )
          return [conversation, ...without]
        })
        const res = await listPlatformMessages(conversation.id, { limit: 100 })
        setMessages(res.data?.data?.messages || [])
        await markPlatformConversationRead(conversation.id).catch(() => undefined)
        await markConversationNotificationsRead(conversation.id).catch(() => undefined)
        setInbox((prev) =>
          prev.map((c) =>
            c.id === conversation.id ? { ...c, unread_admin: 0 } : c
          )
        )
      } catch (err) {
        toast.error(getApiErrorMessage(err, copy.openError))
        setMessages([])
        setActiveId(null)
      } finally {
        setLoadingThread(false)
      }
    },
    [copy.openError]
  )

  // Deep-link from notification toast / bell: /admin/studio-chat?studioId=…
  useEffect(() => {
    const studioId = searchParams.get('studioId')
    if (!studioId || loadingInbox || openedFromQuery.current === studioId) return
    const item =
      inbox.find((c) => c.studio?.id === studioId) ||
      ({ studio: { id: studioId } })
    openedFromQuery.current = studioId
    void openStudio(item).then(() => {
      setSearchParams({}, { replace: true })
    })
  }, [searchParams, loadingInbox, inbox, openStudio, setSearchParams])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, peerTyping])

  const upsertMessage = useCallback((message, conversation) => {
    if (!message) return
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev
      return [...prev, message]
    })
    if (conversation) {
      setInbox((prev) => {
        const others = prev.filter(
          (c) => c.id !== conversation.id && c.studio?.id !== conversation.studio?.id
        )
        return [conversation, ...others]
      })
    }
  }, [])

  const { connected, send, setTyping } = usePlatformMessagingSocket({
    conversationId: activeId,
    enabled: true,
    onMessage: ({ message, conversation }) => {
      if (message?.conversation_id === activeId || conversation?.id === activeId) {
        upsertMessage(message, conversation)
        setPeerTyping(false)
        if (activeId) {
          void markPlatformConversationRead(activeId).catch(() => undefined)
          void markConversationNotificationsRead(activeId).catch(() => undefined)
        }
      } else if (conversation) {
        setInbox((prev) => {
          const others = prev.filter((c) => c.id !== conversation.id)
          return [conversation, ...others]
        })
      }
    },
    onTyping: ({ role, is_typing, conversation_id }) => {
      if (conversation_id !== activeId) return
      if (role === 'studio') setPeerTyping(Boolean(is_typing))
    },
    onConversationUpdated: (conversation) => {
      if (!conversation) return
      setInbox((prev) => {
        const others = prev.filter(
          (c) => c.id !== conversation.id && c.studio?.id !== conversation.studio?.id
        )
        return [conversation, ...others]
      })
    },
  })

  const handleSend = async (e) => {
    e?.preventDefault()
    const text = draft.trim()
    if (!text || !activeId || sending) return
    setSending(true)
    setTyping(false)
    try {
      let payload
      try {
        payload = await send(text)
      } catch {
        const res = await sendPlatformMessage(activeId, { text })
        payload = res.data?.data
      }
      if (payload?.message) {
        upsertMessage(payload.message, payload.conversation)
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
    if (!activeId) return
    setTyping(true)
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => setTyping(false), 1200)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] min-h-[560px] -my-2">
      <div className="flex items-end justify-between gap-4 mb-4 shrink-0">
        <h1 className="text-[28px] leading-none font-bold text-studio-white m-0 tracking-tight">
          {copy.title}
        </h1>
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-sans ${
            connected ? 'text-studio-gold-2' : 'text-studio-w2'
          }`}
        >
          {connected ? <Radio size={12} /> : <WifiOff size={12} />}
          {connected ? copy.live : copy.offline}
        </span>
      </div>

      <div className="flex flex-1 min-h-0 gap-4">
        {/* Studio list */}
        <aside className="w-[280px] shrink-0 flex flex-col rounded-2xl border border-elaya-border bg-studio-bg-3 !p-0 overflow-hidden">
          <div className="p-3 border-b border-elaya-border">
            <label className="relative block">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-w2 pointer-events-none"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy.searchPlaceholder}
                className="w-full rounded-lg border border-elaya-border bg-studio-bg-4 py-2 pl-9 pr-3 text-[12px] text-studio-white placeholder:text-studio-w3 outline-none focus:border-studio-gold/50 font-sans"
              />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingInbox ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : inbox.length === 0 ? (
              <p className="text-studio-w2 text-[12px] font-sans p-4 m-0">{copy.emptyStudios}</p>
            ) : (
              <ul className="m-0 p-0 list-none">
                {inbox.map((item) => {
                  const selected =
                    item.studio?.id === activeStudioId || item.id === activeId
                  const unread = item.unread_admin || 0
                  return (
                    <li key={item.id || item.studio?.id}>
                      <button
                        type="button"
                        onClick={() => void openStudio(item)}
                        className={`w-full text-left px-3 py-3 border-0 border-b border-elaya-border cursor-pointer transition-colors font-sans ${
                          selected
                            ? 'bg-(--nav-active-bg)'
                            : 'bg-transparent hover:bg-studio-bg-4'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-studio-white text-[13px] font-semibold m-0 truncate">
                            {studioLabel(item)}
                          </p>
                          {unread > 0 ? (
                            <span className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-studio-gold text-white text-[10px] font-bold flex items-center justify-center px-1">
                              {unread > 9 ? '9+' : unread}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-studio-w2 text-[11px] m-0 mt-1 truncate">
                          {item.last_message_preview || copy.noMessagesYet}
                        </p>
                        {item.last_message_at ? (
                          <p className="text-studio-w3 text-[10px] m-0 mt-1">
                            {fmtTime(item.last_message_at)}
                          </p>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Thread */}
        <section className="flex-1 min-w-0 flex flex-col rounded-2xl border border-elaya-border bg-studio-bg-3 !p-0 overflow-hidden">
          {!activeStudioId ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-studio-w2 px-6">
              <MessageSquare size={28} className="opacity-50" />
              <p className="m-0 text-[13px] font-sans text-center">{copy.selectStudio}</p>
            </div>
          ) : (
            <>
              <header className="px-5 py-4 border-b border-elaya-border shrink-0">
                <p className="text-studio-white text-[16px] font-semibold m-0 font-sans">
                  {studioLabel(activeItem)}
                </p>
                {activeItem?.studio?.studio_code ? (
                  <p className="text-studio-w2 text-[11px] m-0 mt-0.5 font-sans">
                    {activeItem.studio.studio_code}
                  </p>
                ) : null}
              </header>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {loadingThread ? (
                  <div className="flex justify-center py-10">
                    <Spinner />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-studio-w2 text-[12px] font-sans m-0 text-center py-8">
                    {copy.threadEmpty}
                  </p>
                ) : (
                  messages.map((msg) => {
                    const fromAdmin = msg.sender_role === 'admin'
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${fromAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 border ${
                            fromAdmin
                              ? 'bg-studio-gold/20 border-studio-gold/30'
                              : 'bg-studio-bg-4 border-elaya-border'
                          }`}
                        >
                          <p className="text-studio-w2 text-[10px] m-0 mb-1 font-sans">
                            {fromAdmin ? copy.youLabel : studioLabel(activeItem)}
                          </p>
                          <p className="text-studio-white text-[13px] m-0 font-sans whitespace-pre-wrap break-words">
                            {msg.text}
                          </p>
                          <p className="text-studio-w3 text-[10px] m-0 mt-1.5 font-sans text-right">
                            {fmtTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                {peerTyping ? (
                  <p className="text-studio-w2 text-[11px] font-sans m-0 italic">
                    {copy.typing}
                  </p>
                ) : null}
                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="p-4 border-t border-elaya-border flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => onDraftChange(e.target.value)}
                  placeholder={copy.inputPlaceholder}
                  disabled={!activeId || sending}
                  className="flex-1 rounded-xl border border-elaya-border bg-studio-bg-4 px-4 py-3 text-[13px] text-studio-white placeholder:text-studio-w3 outline-none focus:border-studio-gold/50 font-sans"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || !activeId || sending}
                  className="h-11 w-11 rounded-full bg-studio-gold text-white border-0 flex items-center justify-center cursor-pointer hover:bg-studio-gold-soft disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  aria-label={copy.send}
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminStudioChat
