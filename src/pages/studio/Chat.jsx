import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  Circle,
  Lock,
  MessageCircle,
  Pin,
  Radio,
  Send,
  Trash2,
  WifiOff,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  deleteConversations,
  getConversation,
  getOrCreateConversation,
  listConversations,
  listMessages,
  markConversationRead,
  pinConversation,
  sendMessage as sendMessageRest,
} from '../../api/messaging'
import { markConversationNotificationsRead } from '../../api/notifications'
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

const LONG_PRESS_MS = 480

const sortConversations = (list) =>
  [...list].sort((a, b) => {
    const ap = a.pinned_by_studio ? 1 : 0
    const bp = b.pinned_by_studio ? 1 : 0
    if (ap !== bp) return bp - ap
    if (ap && bp) {
      const at = new Date(a.pinned_by_studio_at || 0).getTime()
      const bt = new Date(b.pinned_by_studio_at || 0).getTime()
      if (at !== bt) return bt - at
    }
    const am = new Date(a.last_message_at || a.updatedAt || 0).getTime()
    const bm = new Date(b.last_message_at || b.updatedAt || 0).getTime()
    return bm - am
  })

/** Prefer the summary that still has display fields (vorname/email/firma). */
const mergeParty = (prev, next) => {
  if (!next) return prev || null
  if (!prev) return next
  const prevHasName = Boolean(
    prev.vorname || prev.nachname || prev.email || prev.firma || prev.studio_code
  )
  const nextHasName = Boolean(
    next.vorname || next.nachname || next.email || next.firma || next.studio_code
  )
  // Incoming socket/read payloads sometimes only carry `{ id }` — keep the name.
  if (prevHasName && !nextHasName) return { ...next, ...prev }
  return { ...prev, ...next }
}

const mergeConversation = (prev, incoming) => {
  if (!prev) return incoming
  if (!incoming) return prev
  return {
    ...prev,
    ...incoming,
    customer: mergeParty(prev.customer, incoming.customer),
    studio: mergeParty(prev.studio, incoming.studio),
  }
}

export default function StudioChatPage() {
  const { studioPages } = useContent()
  const copy = studioPages.chat
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const customerIdParam = searchParams.get('customerId')
  const conversationIdParam = searchParams.get('conversationId')

  const [conversations, setConversations] = useState([])
  const [loadingInbox, setLoadingInbox] = useState(true)
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingThread, setLoadingThread] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [peerTyping, setPeerTyping] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [busyAction, setBusyAction] = useState(false)
  const threadScrollRef = useRef(null)
  const typingTimer = useRef(null)
  const longPressTimer = useRef(null)
  const longPressTriggered = useRef(false)

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) || null,
    [conversations, activeId]
  )

  const selectedCount = selectedIds.size
  const allSelected =
    conversations.length > 0 && selectedCount === conversations.length
  const singleSelectedId =
    selectedCount === 1 ? [...selectedIds][0] : null
  const singleSelectedConversation = singleSelectedId
    ? conversations.find((c) => c.id === singleSelectedId) || null
    : null

  const clearSelection = useCallback(() => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }, [])

  const enterSelection = useCallback((conversationId) => {
    setSelectionMode(true)
    setSelectedIds(new Set([conversationId]))
  }, [])

  const toggleSelected = useCallback((conversationId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(conversationId)) next.delete(conversationId)
      else next.add(conversationId)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectionMode(true)
    setSelectedIds(new Set(conversations.map((c) => c.id)))
  }, [conversations])

  const loadInbox = useCallback(async () => {
    setLoadingInbox(true)
    try {
      const res = await listConversations({ limit: 50 })
      setConversations(sortConversations(res.data?.data?.conversations || []))
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

  // Deep-link from notification bell: ?conversationId=
  useEffect(() => {
    if (!conversationIdParam) return undefined
    let cancelled = false
    ;(async () => {
      try {
        setActiveId(conversationIdParam)
        const res = await getConversation(conversationIdParam)
        const conversation = res.data?.data?.conversation
        if (cancelled || !conversation?.id) return
        setConversations((prev) => {
          if (prev.some((c) => c.id === conversation.id)) return prev
          return [conversation, ...prev]
        })
        await markConversationNotificationsRead(conversationIdParam).catch(() => undefined)
        setSearchParams({}, { replace: true })
      } catch (err) {
        toast.error(getApiErrorMessage(err, copy.openError))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [conversationIdParam, setSearchParams, copy.openError])

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

  /**
   * Pull the tail of the thread without clearing the pane (socket fallback).
   * Never call mark-read here for conversation_updated events — that emit would
   * re-enter this path and flood unread-count clients.
   */
  const syncLatestMessages = useCallback(async (conversationId, { markRead: shouldMarkRead = false } = {}) => {
    if (!conversationId) return
    try {
      const res = await listMessages(conversationId, { limit: 30 })
      const incoming = res.data?.data?.messages || []
      setMessages((prev) => {
        const merged = [...prev]
        for (const message of incoming) {
          if (!merged.some((m) => m.id === message.id)) merged.push(message)
        }
        return merged.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      })
      if (shouldMarkRead) {
        await markConversationRead(conversationId).catch(() => undefined)
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, unread_studio: 0 } : c
          )
        )
      }
    } catch {
      // Best-effort — realtime path may have already delivered the message.
    }
  }, [])

  useEffect(() => {
    if (activeId) void loadThread(activeId)
    else setMessages([])
  }, [activeId, loadThread])

  useEffect(() => {
    const el = threadScrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, peerTyping])

  const bumpConversation = useCallback((conversation) => {
    if (!conversation?.id) return
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === conversation.id)
      const next =
        idx === -1
          ? [conversation, ...prev]
          : prev.map((c, i) => (i === idx ? mergeConversation(c, conversation) : c))
      return sortConversations(next)
    })
  }, [])

  useEffect(() => {
    if (!selectionMode) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') clearSelection()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectionMode, clearSelection])

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const startLongPress = useCallback(
    (conversationId) => {
      longPressTriggered.current = false
      clearLongPress()
      longPressTimer.current = setTimeout(() => {
        longPressTriggered.current = true
        enterSelection(conversationId)
      }, LONG_PRESS_MS)
    },
    [clearLongPress, enterSelection]
  )

  const handleConversationClick = useCallback(
    (conversationId) => {
      if (longPressTriggered.current) {
        longPressTriggered.current = false
        return
      }
      if (selectionMode) {
        toggleSelected(conversationId)
        return
      }
      setActiveId(conversationId)
    },
    [selectionMode, toggleSelected]
  )

  const handlePinSelected = async () => {
    if (!singleSelectedId || busyAction) return
    const currentlyPinned = Boolean(singleSelectedConversation?.pinned_by_studio)
    setBusyAction(true)
    try {
      const res = await pinConversation(singleSelectedId, !currentlyPinned)
      const updated = res.data?.data?.conversation
      if (updated) bumpConversation(updated)
      toast.success(currentlyPinned ? copy.unpinSuccess : copy.pinSuccess)
      clearSelection()
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.pinFailed))
    } finally {
      setBusyAction(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (!selectedCount || busyAction) return
    const ids = [...selectedIds]
    const ok = window.confirm(
      ids.length === 1
        ? copy.deleteConfirmOne
        : String(copy.deleteConfirmMany || '').replace('{{count}}', String(ids.length))
    )
    if (!ok) return
    setBusyAction(true)
    try {
      await deleteConversations(ids)
      setConversations((prev) => prev.filter((c) => !ids.includes(c.id)))
      if (ids.includes(activeId)) {
        setActiveId(null)
        setMessages([])
      }
      toast.success(
        ids.length === 1
          ? copy.deleteSuccess
          : String(copy.deleteSuccessMany || '').replace('{{count}}', String(ids.length))
      )
      clearSelection()
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.deleteFailed))
    } finally {
      setBusyAction(false)
    }
  }

  const upsertMessage = useCallback((message, conversation) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev
      return [...prev, message]
    })
    if (conversation) bumpConversation(conversation)
  }, [bumpConversation])

  const { connected, secureTransport, send, setTyping, markRead } = useMessagingSocket({
    conversationId: activeId,
    enabled: true,
    onMessage: ({ message, conversation }) => {
      if (message.conversation_id === activeId || conversation?.id === activeId) {
        upsertMessage(message, conversation)
        markRead(message.id)
      } else if (conversation) {
        bumpConversation(conversation)
      }
    },
    onTyping: ({ role, is_typing, conversation_id }) => {
      if (conversation_id !== activeId) return
      if (role === 'studio') return
      setPeerTyping(Boolean(is_typing))
    },
    onConversationUpdated: (conversation) => {
      if (!conversation?.id) return
      bumpConversation(conversation)
      // Only pull messages when there is still unread studio mail — never mark
      // read from this path (mark-read emits conversation_updated again).
      if (
        conversation.id === activeId &&
        conversation.last_sender_role === 'customer' &&
        Number(conversation.unread_studio || 0) > 0
      ) {
        void syncLatestMessages(conversation.id, { markRead: false })
        markRead()
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversation.id ? { ...c, unread_studio: 0 } : c
          )
        )
      }
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
    <div className="p-6 max-w-[1400px] mx-auto h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
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
        <Card padding="none" className="overflow-hidden flex flex-col min-h-0 h-full">
          <div className="px-4 py-3 border-b border-elaya-border shrink-0 flex items-center justify-between gap-2">
            <p className="text-studio-w3 text-[11px] font-semibold uppercase tracking-wider m-0">
              {copy.conversations}
            </p>
            {selectionMode ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={busyAction || selectedCount === 0}
                  onClick={() => void handleDeleteSelected()}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] border-0 bg-transparent text-elaya-error hover:bg-elaya-error/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label={copy.deleteSelected}
                  title={copy.deleteSelected}
                >
                  <Trash2 size={15} />
                </button>
                {selectedCount === 1 ? (
                  <button
                    type="button"
                    disabled={busyAction}
                    onClick={() => void handlePinSelected()}
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-[8px] border-0 bg-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      singleSelectedConversation?.pinned_by_studio
                        ? 'text-studio-gold-2 hover:bg-studio-gold/10'
                        : 'text-studio-w2 hover:bg-studio-bg-4 hover:text-studio-white'
                    }`}
                    aria-label={
                      singleSelectedConversation?.pinned_by_studio
                        ? copy.unpinSelected
                        : copy.pinSelected
                    }
                    title={
                      singleSelectedConversation?.pinned_by_studio
                        ? copy.unpinSelected
                        : copy.pinSelected
                    }
                  >
                    <Pin size={15} />
                  </button>
                ) : null}
                {selectedCount > 1 || allSelected || selectedCount === 0 ? (
                  <button
                    type="button"
                    disabled={busyAction}
                    onClick={clearSelection}
                    className="h-8 px-2 rounded-[8px] border-0 bg-transparent text-studio-w2 hover:text-studio-white hover:bg-studio-bg-4 text-[11px] font-semibold cursor-pointer disabled:opacity-40"
                  >
                    {copy.unselectAll}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busyAction || conversations.length === 0}
                    onClick={selectAll}
                    className="h-8 px-2 rounded-[8px] border-0 bg-transparent text-studio-w2 hover:text-studio-white hover:bg-studio-bg-4 text-[11px] font-semibold cursor-pointer disabled:opacity-40"
                  >
                    {copy.selectAll}
                  </button>
                )}
              </div>
            ) : null}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
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
                const selected = selectedIds.has(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleConversationClick(c.id)}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      enterSelection(c.id)
                    }}
                    onPointerDown={() => startLongPress(c.id)}
                    onPointerUp={clearLongPress}
                    onPointerLeave={clearLongPress}
                    onPointerCancel={clearLongPress}
                    className={`w-full text-left px-4 py-3 border-0 border-b border-elaya-border cursor-pointer transition-colors select-none ${
                      selectionMode && selected
                        ? 'bg-(--nav-active-bg)'
                        : active && !selectionMode
                          ? 'bg-(--nav-active-bg)'
                          : 'bg-transparent hover:bg-studio-bg-4'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {selectionMode ? (
                        <span className="shrink-0 mt-0.5 text-studio-gold-2">
                          {selected ? <CheckCircle2 size={16} /> : <Circle size={16} className="text-studio-w3" />}
                        </span>
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-studio-white text-[13px] m-0 truncate flex items-center gap-1.5 ${
                              unread > 0 ? 'font-bold' : 'font-medium'
                            }`}
                          >
                            {c.pinned_by_studio ? (
                              <Pin size={12} className="shrink-0 text-studio-gold-2" />
                            ) : null}
                            <span className="truncate">
                              {customerName(c.customer, copy.customerFallback)}
                            </span>
                          </p>
                          {unread > 0 ? (
                            <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-elaya-error text-[10px] font-bold text-white flex items-center justify-center">
                              {unread > 9 ? '9+' : unread}
                            </span>
                          ) : null}
                        </div>
                        <p
                          className={`text-[12px] m-0 mt-1 truncate ${
                            unread > 0 ? 'text-studio-w1 font-medium' : 'text-studio-w3 font-normal'
                          }`}
                        >
                          {c.last_message_preview || copy.noMessagesYet}
                        </p>
                        <p className="text-studio-w3 text-[10px] m-0 mt-1 font-normal">
                          {fmtTime(c.last_message_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </Card>

        {/* Thread */}
        <Card padding="none" className="overflow-hidden flex flex-col min-h-0 h-full">
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
              <div className="px-4 py-3 border-b border-elaya-border flex items-center justify-between gap-3 shrink-0">
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

              <div
                ref={threadScrollRef}
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 space-y-3 bg-studio-bg/40"
              >
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
                    const isSystem =
                      m.sender_role === 'system' || m.typ === 'system'
                    const aftercareMeta =
                      m.meta?.kind === 'aftercare_alert' ? m.meta : null
                    const mine = m.sender_role === 'studio'
                    if (isSystem || aftercareMeta) {
                      return (
                        <div key={m.id} className="flex justify-center">
                          <div className="max-w-[90%] w-full rounded-[14px] px-3.5 py-3 text-[13px] leading-relaxed border border-elaya-error/35 bg-elaya-error/10 text-studio-w1">
                            <p className="m-0 font-semibold text-elaya-error text-[12px] uppercase tracking-wide">
                              {aftercareMeta
                                ? `Aftercare Alert – Case #${aftercareMeta.case_display_id || '—'}`
                                : copy.systemLabel || 'System'}
                            </p>
                            <p className="m-0 mt-2 whitespace-pre-wrap break-words text-studio-w1">
                              {m.text}
                            </p>
                            {aftercareMeta ? (
                              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-studio-w2">
                                {aftercareMeta.standort_name ? (
                                  <span>{aftercareMeta.standort_name}</span>
                                ) : null}
                                {aftercareMeta.ampel ? (
                                  <span>Ampel: {aftercareMeta.ampel}</span>
                                ) : null}
                                {aftercareMeta.healing_status ? (
                                  <span>{aftercareMeta.healing_status}</span>
                                ) : null}
                              </div>
                            ) : null}
                            {aftercareMeta?.nachsorge_check_id ? (
                              <button
                                type="button"
                                className="mt-3 inline-flex items-center px-3 py-1.5 rounded-[10px] bg-studio-gold text-studio-bg text-[12px] font-semibold border-0 cursor-pointer"
                                onClick={() =>
                                  navigate(
                                    `/studio/aftercare?check=${encodeURIComponent(aftercareMeta.nachsorge_check_id)}`
                                  )
                                }
                              >
                                {copy.openAftercare || 'Nachsorge-Check öffnen'}
                              </button>
                            ) : null}
                            <div className="text-[10px] mt-2 text-studio-w3">
                              {fmtTime(m.createdAt)}
                            </div>
                          </div>
                        </div>
                      )
                    }
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
