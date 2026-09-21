import api from '../lib/axios'

export const listLasers = (params) => api.get('/lasers', { params })
export const createLaser = (payload) => api.post('/lasers', payload)
export const updateLaser = (id, payload) => api.patch(`/lasers/${id}`, payload)
export const listLaserRequests = (params) => api.get('/lasers/requests', { params })
export const resolveLaserRequest = (id, payload) =>
  api.post(`/lasers/requests/${id}/resolve`, payload)
export const requestLaser = (payload) => api.post('/lasers/requests', payload)

export const getAiConfig = () => api.get('/ai-config')
export const updateAiConfig = (payload) => api.patch('/ai-config', payload)

export const listAdminUsers = () => api.get('/admin/users')
export const inviteAdminUser = (payload) => api.post('/admin/users/invite', payload)
export const resendAdminInvite = (id) => api.post(`/admin/users/${id}/resend-invite`)
export const updateAdminUser = (id, payload) => api.patch(`/admin/users/${id}`, payload)
export const getAdminPermissionCatalog = () => api.get('/admin/users/permissions')
