import api from '../lib/axios'

export const getPlatformConfig = () => api.get('/config/platform')
export const updatePlatformConfig = (payload) => api.patch('/config/platform', payload)

export const getFeatureCatalog = () => api.get('/config/features/catalog')
export const getEffectiveFeatures = (params) =>
  api.get('/config/features/effective', { params })
export const listStudioFeatures = () => api.get('/config/features/studios')
export const getStudioConfigAdmin = (studioId) =>
  api.get(`/config/studios/${studioId}`)
export const updateStudioConfigAdmin = (studioId, payload) =>
  api.patch(`/config/studios/${studioId}`, payload)
