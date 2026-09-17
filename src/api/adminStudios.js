import api from '../lib/axios'

export const listAdminStudios = (params) =>
  api.get('/studio/admin/studios', { params })

export const patchStudioStatus = (studioId, status) =>
  api.patch(`/studio/admin/studios/${studioId}/status`, { status })

export const openStudioWorkspace = (studioId, payload = {}) =>
  api.post(`/studio/admin/studios/${studioId}/workspace/open`, payload)
