import { API_BASE } from '../lib/socketOrigin'

const ORIGIN = API_BASE.replace(/\/+$/, '').replace(/\/api\/v1$/i, '')

/** Resolves a product image reference to an absolute URL. Passes through
 * absolute http(s)/data URIs unchanged; prefixes server-relative uploads
 * (e.g. "/shop-images/xyz.jpg") with the API origin. */
export const resolveShopImageUrl = (url) => {
  if (!url) return ''
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url
  return `${ORIGIN}${url.startsWith('/') ? url : `/${url}`}`
}
