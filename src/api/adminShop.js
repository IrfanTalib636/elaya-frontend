import api from '../lib/axios'

export const listAdminProducts = (params) =>
  api.get('/admin/shop/products', { params })
export const createAdminProduct = (payload) =>
  api.post('/admin/shop/products', payload)
export const updateAdminProduct = (id, payload) =>
  api.patch(`/admin/shop/products/${id}`, payload)

/** Multipart upload of one or more product photos. Returns { data: { urls: [...] } }. */
export const uploadAdminProductImages = (files) => {
  const form = new FormData()
  for (const file of files) form.append('files', file)
  return api.post('/admin/shop/products/upload-image', form)
}
export const deleteAdminProductImage = (productId, url) =>
  api.delete(`/admin/shop/products/${productId}/images`, { data: { url } })

export const listAdminOrders = (params) =>
  api.get('/admin/shop/orders', { params })
export const patchOrderCommission = (id, commission_status, extras = {}) =>
  api.patch(`/admin/shop/orders/${id}/commission`, {
    commission_status,
    ...extras,
  })

// ── Promotions (platform-wide general discount) ───────────────────────────
export const listAdminPromotions = (params) =>
  api.get('/admin/shop/promotions', { params })
export const createAdminPromotion = (payload) =>
  api.post('/admin/shop/promotions', payload)
export const updateAdminPromotion = (id, payload) =>
  api.patch(`/admin/shop/promotions/${id}`, payload)
export const deleteAdminPromotion = (id) =>
  api.delete(`/admin/shop/promotions/${id}`)

export const getShopFinance = (params) =>
  api.get('/admin/shop/finance', { params })
export const getStudioShopFinance = (studioId, params) =>
  api.get(`/admin/shop/finance/studios/${studioId}`, { params })
export const patchStudioFinanceTerms = (studioId, payload) =>
  api.patch(`/admin/shop/finance/studios/${studioId}`, payload)
export const getAdminShipping = () => api.get('/admin/shop/shipping')
export const updateAdminShopCatalog = (payload) =>
  api.patch('/admin/shop/shipping', payload)
