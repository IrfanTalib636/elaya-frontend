/** Keys used for client-side session storage */
export const TOKEN_KEY = 'elaya_token'
export const AUTH_STORAGE_KEY = 'elaya_auth'

/** Wipe all local auth state (no API call — safe from axios interceptors). */
export const clearLocalSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
