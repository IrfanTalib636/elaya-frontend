import api from '../lib/axios'

export const listNotifications = (params) =>
  api.get('/notifications', { params })

export const getNotificationsUnreadCount = () =>
  api.get('/notifications/unread-count')

export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`)

export const markAllNotificationsRead = () =>
  api.post('/notifications/read-all')

export const markConversationNotificationsRead = (conversationId) =>
  api.post('/notifications/read-conversation', { conversation_id: conversationId })
