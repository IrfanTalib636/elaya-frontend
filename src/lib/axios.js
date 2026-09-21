import axios from 'axios'
import { TOKEN_KEY } from './session'
import { trySilentRefresh } from './refreshSession'
import { isStudioWorkspaceActive } from './adminWorkspaceSession'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`

  if (config.data instanceof FormData) {
    if (typeof config.headers?.delete === 'function') {
      config.headers.delete('Content-Type')
    } else if (config.headers) {
      delete config.headers['Content-Type']
    }
  }
  return config
})

let isRefreshing = false
let queue = []

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

    // During admin→studio workspace, do not silent-refresh to an admin token
    // (would drop acting-studio claims). Let the UI exit workspace instead.
    if (
      err.response?.status === 401 &&
      isStudioWorkspaceActive() &&
      !original.url?.includes('/auth/login')
    ) {
      return Promise.reject(err)
    }

    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
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
        try {
          await useAuthStore.getState().refreshProfile()
        } catch {
          // Profile sync is best-effort
        }
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        original.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return api(original)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        const { default: useAuthStore } = await import('../store/authStore')
        useAuthStore.getState().clearLocalSession()
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  }
)

export default api
