import api from '../lib/axios'

export const getStudioSettings = () => api.get('/studio/settings')

export const updateStudioSettings = (data) => api.patch('/studio/settings', data)

export const getStudioStripeStatus = () => api.get('/studio/stripe/status')
export const startStudioStripeConnect = () => api.post('/studio/stripe/connect')
export const refreshStudioStripeConnect = () => api.post('/studio/stripe/refresh')
