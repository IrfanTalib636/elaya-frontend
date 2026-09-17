import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getNotificationsUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications'
import useContent from '../i18n/useContent'
import useAuthStore from '../store/authStore'
import { useSocketEvent } from './useSocketEvent'

const customerName = (conversation) => {
  const c = conversation?.customer
  if (!c) return null
  const name = [c.vorname, c.nachname].filter(Boolean).join(' ').trim()
  return name || c.email || null
}

/**
 * Studio inbox notifications: REST badge + live socket toasts for
 * customer chat and Support chat (Elaya admin).
 */
export default function useStudioNotifications({ enabled = true } = {}) {
  const navigate = useNavigate()
  const studioId = useAuthStore((s) => s.user?.studio_id)
  const { studioPages } = useContent()
  const chatCopy = studioPages.chat
  const supportCopy = studioPages.platformChat
  const transferCopy = studioPages.transfers
  const [unreadCount, setUnreadCount] = useState(0)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const seenMessageIds = useRef(new Set())
  const seenTransferKeys = useRef(new Set())

  const refreshUnread = useCallback(async () => {
    if (!enabled) return
    try {
      const res = await getNotificationsUnreadCount()
      setUnreadCount(res.data?.data?.unread_count ?? 0)
    } catch {
      // ignore badge errors
    }
  }, [enabled])

  const loadList = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    try {
      const res = await listNotifications({ limit: 30 })
      setItems(res.data?.data?.notifications || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [enabled])

  const openCustomerChat = useCallback(
    (conversationId, customerId) => {
      if (conversationId) {
        navigate(`/studio/chat?conversationId=${encodeURIComponent(conversationId)}`)
        return
      }
      if (customerId) {
        navigate(`/studio/chat?customerId=${encodeURIComponent(customerId)}`)
      }
    },
    [navigate]
  )

  const openSupportChat = useCallback(() => {
    navigate('/studio/platform-chat')
  }, [navigate])

  const notifyCustomerMessage = useCallback(
    ({ message, conversation, fromSocket = false }) => {
      if (!enabled || message?.sender_role !== 'customer') return
      if (fromSocket && message?.id) {
        if (seenMessageIds.current.has(message.id)) return
        seenMessageIds.current.add(message.id)
      }

      const name = customerName(conversation)
      const title = name
        ? chatCopy.newMessageFrom.replace('{name}', name)
        : chatCopy.newCustomerMessage
      const body = String(message?.text || '').trim() || title
      const conversationId = conversation?.id || message?.conversation_id

      void refreshUnread()

      if (window.location.pathname.startsWith('/studio/chat')) {
        return
      }

      if (document.hidden && typeof Notification !== 'undefined') {
        if (Notification.permission === 'granted') {
          const n = new Notification(title, {
            body,
            tag: conversationId ? `chat-${conversationId}` : 'chat',
          })
          n.onclick = () => {
            window.focus()
            openCustomerChat(conversationId, conversation?.customer?.id)
            n.close()
          }
        }
      }

      toast(
        (t) => (
          <button
            type="button"
            className="text-left w-full bg-transparent border-0 cursor-pointer p-0"
            onClick={() => {
              toast.dismiss(t.id)
              openCustomerChat(conversationId, conversation?.customer?.id)
            }}
          >
            <p className="m-0 text-[13px] font-semibold text-studio-white">{title}</p>
            <p className="m-0 mt-1 text-[12px] text-studio-w2 line-clamp-2">{body}</p>
          </button>
        ),
        { duration: 6000 }
      )
    },
    [chatCopy.newCustomerMessage, chatCopy.newMessageFrom, enabled, openCustomerChat, refreshUnread]
  )

  const notifySupportMessage = useCallback(
    ({ message, conversation, fromSocket = false }) => {
      if (!enabled || message?.sender_role !== 'admin') return
      if (fromSocket && message?.id) {
        if (seenMessageIds.current.has(message.id)) return
        seenMessageIds.current.add(message.id)
      }

      const title =
        supportCopy.newMessageTitle || 'New message from Elaya Support'
      const body = String(message?.text || '').trim() || title
      const conversationId = conversation?.id || message?.conversation_id

      void refreshUnread()

      if (window.location.pathname.startsWith('/studio/platform-chat')) {
        return
      }

      if (document.hidden && typeof Notification !== 'undefined') {
        if (Notification.permission === 'granted') {
          const n = new Notification(title, {
            body,
            tag: conversationId ? `support-${conversationId}` : 'support',
          })
          n.onclick = () => {
            window.focus()
            openSupportChat()
            n.close()
          }
        }
      }

      toast(
        (t) => (
          <button
            type="button"
            className="text-left w-full bg-transparent border-0 cursor-pointer p-0"
            onClick={() => {
              toast.dismiss(t.id)
              openSupportChat()
            }}
          >
            <p className="m-0 text-[13px] font-semibold text-studio-white">{title}</p>
            <p className="m-0 mt-1 text-[12px] text-studio-w2 line-clamp-2">{body}</p>
          </button>
        ),
        { duration: 6000 }
      )
    },
    [enabled, openSupportChat, refreshUnread, supportCopy.newMessageTitle]
  )

  const openTransfers = useCallback(() => {
    navigate('/studio/transfers')
  }, [navigate])

  const notifyTransfer = useCallback(
    ({ event, transfer }) => {
      if (!enabled || event !== 'approved' || !transfer || !studioId) return
      const tid = String(transfer.id || transfer._id || '')
      const myId = String(studioId)
      const fromId = String(transfer.von_firma_id || '')
      const toId = String(transfer.zu_firma_id || '')
      const role = myId === fromId ? 'left' : myId === toId ? 'joined' : null
      if (!role) return

      const dedupeKey = `${tid}:${role}`
      if (tid && seenTransferKeys.current.has(dedupeKey)) return
      if (tid) seenTransferKeys.current.add(dedupeKey)

      const name = transfer.kunde_name || 'Customer'
      const from = transfer.von_firma_name || '—'
      const to = transfer.zu_firma_name || '—'
      const title =
        role === 'left'
          ? transferCopy.notifyLeftTitle || 'Customer left studio'
          : transferCopy.notifyJoinedTitle || 'New customer joined'
      const body =
        role === 'left'
          ? (transferCopy.notifyLeftBody || '{name} has switched from your studio to {to}.')
              .replace('{name}', name)
              .replace('{to}', to)
          : (transferCopy.notifyJoinedBody ||
              '{name} has joined your studio (from {from}).')
              .replace('{name}', name)
              .replace('{from}', from)

      void refreshUnread()

      if (window.location.pathname.startsWith('/studio/transfers')) {
        return
      }

      if (document.hidden && typeof Notification !== 'undefined') {
        if (Notification.permission === 'granted') {
          const n = new Notification(title, { body, tag: dedupeKey || title })
          n.onclick = () => {
            window.focus()
            openTransfers()
            n.close()
          }
        }
      }

      toast(
        (t) => (
          <button
            type="button"
            className="text-left w-full bg-transparent border-0 cursor-pointer p-0"
            onClick={() => {
              toast.dismiss(t.id)
              openTransfers()
            }}
          >
            <p className="m-0 text-[13px] font-semibold text-studio-white">{title}</p>
            <p className="m-0 mt-1 text-[12px] text-studio-w2 line-clamp-2">{body}</p>
          </button>
        ),
        { duration: 6000 }
      )
    },
    [enabled, openTransfers, refreshUnread, studioId, transferCopy]
  )

  useEffect(() => {
    if (!enabled) return undefined
    void refreshUnread()
    const timer = setInterval(() => void refreshUnread(), 60_000)
    return () => clearInterval(timer)
  }, [enabled, refreshUnread])

  useEffect(() => {
    if (!enabled || typeof Notification === 'undefined') return undefined
    if (Notification.permission === 'default') {
      void Notification.requestPermission().catch(() => undefined)
    }
  }, [enabled])

  useSocketEvent(
    'messaging:message',
    useCallback(
      (payload) => notifyCustomerMessage({ ...payload, fromSocket: true }),
      [notifyCustomerMessage]
    ),
    { enabled }
  )

  useSocketEvent(
    'platform_messaging:message',
    useCallback(
      (payload) => notifySupportMessage({ ...payload, fromSocket: true }),
      [notifySupportMessage]
    ),
    { enabled }
  )

  useSocketEvent('studio_transfer:updated', notifyTransfer, { enabled })

  const markRead = useCallback(async (notification) => {
    if (!notification?.id || !notification.unread) return
    try {
      await markNotificationRead(notification.id)
      setItems((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, unread: false, read_at: new Date().toISOString() }
            : n
        )
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch {
      // ignore
    }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead()
      setItems((prev) => prev.map((n) => ({ ...n, unread: false })))
      setUnreadCount(0)
    } catch {
      // ignore
    }
  }, [])

  const openNotification = useCallback(
    async (notification) => {
      await markRead(notification)
      if (notification.type === 'platform_chat') {
        openSupportChat()
        return
      }
      if (
        notification.type === 'studio_transfer_left' ||
        notification.type === 'studio_transfer_joined'
      ) {
        navigate('/studio/transfers')
        return
      }
      if (notification.type === 'chat') {
        openCustomerChat(notification.conversation_id, null)
      }
    },
    [markRead, navigate, openCustomerChat, openSupportChat]
  )

  return {
    unreadCount,
    items,
    loading,
    loadList,
    refreshUnread,
    openNotification,
    markAllRead,
    openChat: openCustomerChat,
  }
}
