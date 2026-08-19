import api from '../lib/axios'

export const listNachsorge = (params = {}) => api.get('/nachsorge', { params })

export const getNachsorge  = (id)          => api.get(`/nachsorge/${id}`)

export const reviewNachsorge = (id, data) => api.patch(`/nachsorge/${id}/review`, data)
