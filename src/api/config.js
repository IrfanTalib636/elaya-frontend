import api from '../lib/axios'

export const getPublicConfig    = ()     => api.get('/config/public')
export const getStudioConfig    = ()     => api.get('/config/studio')
export const updateStudioConfig = (data) => api.patch('/config/studio', data)
