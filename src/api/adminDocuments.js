import api from '../lib/axios'

export const listAdminDocuments = (params) =>
  api.get('/admin/documents', { params })

export const getAdminDocument = (id) => api.get(`/admin/documents/${id}`)

export const createAdminDocument = (body) => api.post('/admin/documents', body)

export const updateAdminDocument = (id, body) =>
  api.patch(`/admin/documents/${id}`, body)

export const toggleAdminDocumentActive = (id, body = {}) =>
  api.post(`/admin/documents/${id}/toggle-active`, body)

export const deleteAdminDocument = (id) => api.delete(`/admin/documents/${id}`)
