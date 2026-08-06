import api from '../lib/axios'

export const listConversations = (params) =>
  api.get('/messaging/conversations', { params })

export const getOrCreateConversation = (body = {}) =>
  api.post('/messaging/conversations', body)

export const getConversation = (conversationId) =>
  api.get(`/messaging/conversations/${conversationId}`)

export const listMessages = (conversationId, params) =>
  api.get(`/messaging/conversations/${conversationId}/messages`, { params })

export const sendMessage = (conversationId, body) =>
  api.post(`/messaging/conversations/${conversationId}/messages`, body)

export const markConversationRead = (conversationId, body = {}) =>
  api.post(`/messaging/conversations/${conversationId}/read`, body)
