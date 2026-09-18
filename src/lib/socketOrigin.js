/** Socket.io origin = API host without /api/v1. HTTPS → WSS (TLS). */
export const getSocketOrigin = (apiBaseUrl) => {
  const base = String(apiBaseUrl || '').replace(/\/+$/, '')
  return base.replace(/\/api\/v1$/i, '') || base
}

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

/** In dev, connect via the Vite proxy (same origin as the dashboard). */
export const SOCKET_ORIGIN =
  typeof window !== 'undefined' && import.meta.env.DEV
    ? window.location.origin
    : getSocketOrigin(API_BASE)
