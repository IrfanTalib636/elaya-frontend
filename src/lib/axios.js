import axios from 'axios'
import { TOKEN_KEY } from './session'
import { trySilentRefresh } from './refreshSession'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Token auto-refresh ────────────────────────────────────────────────────
// When a 401 is received, try once to refresh using the HttpOnly cookie.
// If refresh succeeds, retry the original request with the new token.
// If refresh fails, clear the session and redirect to login.

let isRefreshing = false
let queue = []           // pending requests waiting for refresh

const processQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  queue = []
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config

    // Only attempt refresh on 401 and not on the refresh endpoint itself
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const newToken = await trySilentRefresh()
        const { default: useAuthStore } = await import('../store/authStore')
        useAuthStore.getState().setAccessToken(newToken)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        original.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return api(original)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        const { default: useAuthStore } = await import('../store/authStore')
        useAuthStore.getState().clearLocalSession()
        // Let ProtectedRoute redirect — avoid full-page reload loop with GuestRoute
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  }
)

export default api
