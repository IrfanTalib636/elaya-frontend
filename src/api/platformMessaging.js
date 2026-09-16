import api from '../lib/axios'

export const listPlatformConversations = (params) =>
  api.get('/platform-messaging/conversations', { params })

export const openPlatformConversation = (body = {}) =>
  api.post('/platform-messaging/conversations', body)

export const getPlatformConversation = (conversationId) =>
  api.get(`/platform-messaging/conversations/${conversationId}`)

export const listPlatformMessages = (conversationId, params) =>
  api.get(`/platform-messaging/conversations/${conversationId}/messages`, { params })

export const sendPlatformMessage = (conversationId, body) =>
  api.post(`/platform-messaging/conversations/${conversationId}/messages`, body)

export const markPlatformConversationRead = (conversationId, body = {}) =>
  api.post(`/platform-messaging/conversations/${conversationId}/read`, body)
