import api from '../lib/axios'

export const getPublicConfig    = ()     => api.get('/config/public')

export const getStudioConfig    = ()     => api.get('/config/studio')

export const updateStudioConfig = (data) => api.patch('/config/studio', data)

/** Live Sitzungsprognose calculator — draft params + sample case, no persist. */
export const previewSessionPrediction = (data) =>
  api.post('/config/session-prediction/preview', data)
