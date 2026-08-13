import api from '../lib/axios'

export const listNachsorge = (params = {}) => api.get('/nachsorge', { params })

export const getNachsorge  = (id)          => api.get(`/nachsorge/${id}`)
