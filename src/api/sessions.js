import api from '../lib/axios'

export const createSession = (data)        => api.post('/sessions', data)

export const listSessions  = (params = {}) => api.get('/sessions', { params })

export const getSession    = (id)          => api.get(`/sessions/${id}`)

export const updateSession = (id, data)    => api.patch(`/sessions/${id}`, data)
