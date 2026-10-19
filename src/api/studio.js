import api from '../lib/axios'

export const getStudioSettings = () => api.get('/studio/settings')

export const updateStudioSettings = (data) => api.patch('/studio/settings', data)

/** Lasers assigned to this studio (inventory — not full platform catalog). */
export const listStudioLasers = () => api.get('/studio/lasers')

export const getStudioStripeStatus = () => api.get('/studio/stripe/status')
export const startStudioStripeConnect = () => api.post('/studio/stripe/connect')
export const refreshStudioStripeConnect = () => api.post('/studio/stripe/refresh')
