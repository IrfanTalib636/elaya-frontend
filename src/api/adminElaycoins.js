import api from '../lib/axios'

export const getAdminElaycoinOverview = (params) =>
  api.get('/elaycoins/admin/overview', { params })

export const adminAdjustElaycoins = (payload) =>
  api.post('/elaycoins/admin/adjust', payload)
