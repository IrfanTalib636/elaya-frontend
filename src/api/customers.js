import api from '../lib/axios'

export const listCustomers  = (params = {}) => api.get('/customers', { params })

export const createCustomer = (data)        => api.post('/customers', data)

export const getCustomer    = (id)          => api.get(`/customers/${id}`)

export const updateCustomer = (id, data)    => api.patch(`/customers/${id}`, data)
