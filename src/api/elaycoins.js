import api from '../lib/axios'

export const getMyCoins       = ()           => api.get('/elaycoins/me')
export const getCustomerCoins = (customerId) => api.get(`/elaycoins/customers/${customerId}`)
