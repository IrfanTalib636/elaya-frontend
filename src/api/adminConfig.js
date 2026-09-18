import api from '../lib/axios'

export const getPlatformConfig = () => api.get('/config/platform')
export const updatePlatformConfig = (payload) => api.patch('/config/platform', payload)

export const getConfigLifecycle = (domain) =>
  api.get(`/config/platform/${domain}/lifecycle`)
export const saveConfigDraft = (domain, data, note = '') =>
  api.put(`/config/platform/${domain}/draft`, { data, note })
export const discardConfigDraft = (domain) =>
  api.delete(`/config/platform/${domain}/draft`)
export const publishConfigDomain = (domain, { reason, data } = {}) =>
  api.post(`/config/platform/${domain}/publish`, { reason, ...(data ? { data } : {}) })
export const listConfigVersions = (domain, params) =>
  api.get(`/config/platform/${domain}/versions`, { params })
export const rollbackConfigVersion = (domain, version, { reason }) =>
  api.post(`/config/platform/${domain}/versions/${version}/rollback`, { reason })

export const previewSessionPrediction = (data) =>
  api.post('/config/session-prediction/preview', data)

export const getFeatureCatalog = () => api.get('/config/features/catalog')
export const getEffectiveFeatures = (params) =>
  api.get('/config/features/effective', { params })
export const listStudioFeatures = () => api.get('/config/features/studios')
export const getStudioConfigAdmin = (studioId) =>
  api.get(`/config/studios/${studioId}`)
export const updateStudioConfigAdmin = (studioId, payload) =>
  api.patch(`/config/studios/${studioId}`, payload)
