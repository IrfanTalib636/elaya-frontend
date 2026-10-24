import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getMessagingUnreadCount } from '../api/messaging'
import { getPlatformMessagingUnreadCount } from '../api/platformMessaging'
import { useSocketEvent } from './useSocketEvent'

const formatBadge = (n) => {
  const count = Number(n) || 0
  if (count <= 0) return null
  return count > 99 ? '99+' : String(count)
}

/**
 * Persistent WhatsApp-style unread totals for studio/admin chrome.
 * Counters come from Mongo conversation docs and only drop after mark-read
 * when the chat is opened — not when a push/toast fires.
 */
export const useChatUnreadBadges = ({
  customerChat = false,
  platformChat = false,
  pollMs = 45000,
} = {}) => {
  const location = useLocation()
  const [customerUnread, setCustomerUnread] = useState(0)
  const [platformUnread, setPlatformUnread] = useState(0)

  const refresh = useCallback(() => {
    if (customerChat) {
      getMessagingUnreadCount()
        .then((res) => setCustomerUnread(Number(res?.data?.data?.unread_count) || 0))
        .catch(() => undefined)
    }
    if (platformChat) {
      getPlatformMessagingUnreadCount()
        .then((res) => setPlatformUnread(Number(res?.data?.data?.unread_count) || 0))
        .catch(() => undefined)
    }
  }, [customerChat, platformChat])

  useEffect(() => {
    refresh()
    if (!customerChat && !platformChat) return undefined
    const timer = setInterval(refresh, pollMs)
    return () => clearInterval(timer)
  }, [refresh, customerChat, platformChat, pollMs, location.pathname])

  useSocketEvent('messaging:conversation_updated', refresh, {
    enabled: customerChat,
    debounceMs: 400,
  })
  useSocketEvent('messaging:message', refresh, {
    enabled: customerChat,
    debounceMs: 400,
  })
  useSocketEvent('platform_messaging:conversation_updated', refresh, {
    enabled: platformChat,
    debounceMs: 400,
  })
  useSocketEvent('platform_messaging:message', refresh, {
    enabled: platformChat,
    debounceMs: 400,
  })

  return {
    customerUnread,
    platformUnread,
    totalUnread: customerUnread + platformUnread,
    customerBadge: formatBadge(customerUnread),
    platformBadge: formatBadge(platformUnread),
    totalBadge: formatBadge(customerUnread + platformUnread),
    refresh,
  }
}

export default useChatUnreadBadges
