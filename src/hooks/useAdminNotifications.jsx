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
import { useSocketEvent } from './useSocketEvent'

const studioName = (conversation) => {
  const s = conversation?.studio
  if (!s) return null
  return s.firma || s.studio_code || null
}

/**
 * Admin inbox: REST badge + live toasts for Support chat (studio → admin).
 */
export default function useAdminNotifications({ enabled = true } = {}) {
  const navigate = useNavigate()
  const { adminPages } = useContent()
  const copy = adminPages.studioChat
  const [unreadCount, setUnreadCount] = useState(0)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const seenMessageIds = useRef(new Set())

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

  const openSupportChat = useCallback(
    (studioId) => {
      if (studioId) {
        navigate(`/admin/studio-chat?studioId=${encodeURIComponent(studioId)}`)
        return
      }
      navigate('/admin/studio-chat')
    },
    [navigate]
  )

  const notifyIncoming = useCallback(
    ({ message, conversation, fromSocket = false }) => {
      if (!enabled || message?.sender_role !== 'studio') return
      if (fromSocket && message?.id) {
        if (seenMessageIds.current.has(message.id)) return
        seenMessageIds.current.add(message.id)
      }

      const name = studioName(conversation)
      const title = name
        ? (copy.newMessageFrom || 'New message from {name}').replace('{name}', name)
        : copy.newStudioMessage || 'New studio message'
      const body = String(message?.text || '').trim() || title
      const studioId = conversation?.studio?.id || message?.studio_id

      void refreshUnread()

      if (window.location.pathname.startsWith('/admin/studio-chat')) {
        return
      }

      if (document.hidden && typeof Notification !== 'undefined') {
        if (Notification.permission === 'granted') {
          const n = new Notification(title, {
            body,
            tag: studioId ? `platform-chat-${studioId}` : 'platform-chat',
          })
          n.onclick = () => {
            window.focus()
            openSupportChat(studioId)
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
              openSupportChat(studioId)
            }}
          >
            <p className="m-0 text-[13px] font-semibold text-studio-white">{title}</p>
            <p className="m-0 mt-1 text-[12px] text-studio-w2 line-clamp-2">{body}</p>
          </button>
        ),
        { duration: 6000 }
      )
    },
    [copy.newMessageFrom, copy.newStudioMessage, enabled, openSupportChat, refreshUnread]
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
    'platform_messaging:message',
    useCallback(
      (payload) => notifyIncoming({ ...payload, fromSocket: true }),
      [notifyIncoming]
    ),
    { enabled }
  )

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
        openSupportChat(notification.studio_id)
      }
    },
    [markRead, openSupportChat]
  )

  return {
    unreadCount,
    items,
    loading,
    loadList,
    refreshUnread,
    openNotification,
    markAllRead,
  }
}
