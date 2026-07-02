import api from '../lib/axios'

export const createCase          = (data)           => api.post('/cases', data)

export const listCases           = (params = {})    => api.get('/cases', { params })

export const getCase             = (id)             => api.get(`/cases/${id}`)

export const updateCase          = (id, data)       => api.patch(`/cases/${id}`, data)
