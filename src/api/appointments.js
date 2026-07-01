import api from '../lib/axios'

export const createAppointment = (data)        => api.post('/appointments', data)

export const listAppointments  = (params = {}) => api.get('/appointments', { params })

export const getAppointment    = (id)          => api.get(`/appointments/${id}`)

export const updateAppointment = (id, data)    => api.patch(`/appointments/${id}`, data)
