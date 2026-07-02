import api from '../lib/axios'

export const getStudioSettings    = ()     => api.get('/studio/settings')

export const updateStudioSettings = (data) => api.patch('/studio/settings', data)
