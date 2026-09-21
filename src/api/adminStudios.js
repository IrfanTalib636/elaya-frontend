import api from '../lib/axios'

export const listAdminStudios = (params) =>
  api.get('/studio/admin/studios', { params })

export const patchStudioStatus = (studioId, status) =>
  api.patch(`/studio/admin/studios/${studioId}/status`, { status })

export const openStudioWorkspace = (studioId, payload = {}) =>
  api.post(`/studio/admin/studios/${studioId}/workspace/open`, payload)

/** Enter full studio dashboard as that studio (admin remains Elaya Admin in audit). */
export const enterStudioWorkspace = (studioId) =>
  api.post(`/studio/admin/studios/${studioId}/workspace/enter`, {})

export const enableStudioWorkspaceEdit = (studioId, reason) =>
  api.post(`/studio/admin/studios/${studioId}/workspace/edit-mode`, { reason })

export const exitStudioWorkspace = (studioId) =>
  api.post(`/studio/admin/studios/${studioId}/workspace/exit`, {})
