import api from '../lib/axios'

/** Studio-scoped orders for this studio's customers (read-only). */
export const listShopOrders = (params) => api.get('/studio/shop/orders', { params })

/** Platform catalog — active products set by super admin (read-only for studio). */
export const listShopCatalogProducts = (params) => api.get('/shop/products', { params })
