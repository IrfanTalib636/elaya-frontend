import api from '../lib/axios'

export const createCase          = (data)           => api.post('/cases', data)

export const listCases           = (params = {})    => api.get('/cases', { params })

export const getCase             = (id)             => api.get(`/cases/${id}`)

export const updateCase          = (id, data)       => api.patch(`/cases/${id}`, data)

export const deleteCase          = (id)             => api.delete(`/cases/${id}`)

export const getCaseAvailability = (id, params = {}) => api.get(`/cases/${id}/availability`, { params })

export const getCasePricing      = (id)             => api.get(`/cases/${id}/pricing`)

export const previewCasePricing  = (data)          => api.post('/cases/pricing/preview', data)

export const updateEstimateConfirmation = (id, data) =>
  api.patch(`/cases/${id}/estimate-confirmation`, data)
