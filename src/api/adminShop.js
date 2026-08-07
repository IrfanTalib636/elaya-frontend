import api from '../lib/axios'

export const listAdminProducts = (params) =>
  api.get('/admin/shop/products', { params })
export const createAdminProduct = (payload) =>
  api.post('/admin/shop/products', payload)
export const updateAdminProduct = (id, payload) =>
  api.patch(`/admin/shop/products/${id}`, payload)

export const listAdminOrders = (params) =>
  api.get('/admin/shop/orders', { params })
export const patchOrderCommission = (id, commission_status, extras = {}) =>
  api.patch(`/admin/shop/orders/${id}/commission`, {
    commission_status,
    ...extras,
  })

export const getShopFinance = (params) =>
  api.get('/admin/shop/finance', { params })
export const getAdminShipping = () => api.get('/admin/shop/shipping')
