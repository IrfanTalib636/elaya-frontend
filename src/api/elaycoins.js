import api from '../lib/axios'

export const getStudioElaycoinOverview = (params) =>
  api.get('/elaycoins/studio/overview', { params })

export const getCustomerElaycoins = (customerId) =>
  api.get(`/elaycoins/customers/${customerId}`)
