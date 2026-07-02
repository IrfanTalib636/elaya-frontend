import api from '../lib/axios'

export const createAppointment = (data)        => api.post('/appointments', data)

export const listAppointments  = (params = {}) => api.get('/appointments', { params })
