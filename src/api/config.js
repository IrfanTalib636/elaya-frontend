import api from '../lib/axios'

export const getStudioConfig    = ()     => api.get('/config/studio')

export const updateStudioConfig = (data) => api.patch('/config/studio', data)
