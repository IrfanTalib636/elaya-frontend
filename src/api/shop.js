import api from '../lib/axios'

export const listShopOrders = (params) => api.get('/studio/shop/orders', { params })

export const patchShopOrderStatus = (id, status) =>
  api.patch(`/studio/shop/orders/${id}`, { status })
