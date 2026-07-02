import { useEffect, useState } from 'react'
import useAuthStore from '../store/authStore'
import { TOKEN_KEY } from '../lib/session'
import { isJwtExpired } from '../lib/token'
import { trySilentRefresh } from '../lib/refreshSession'
import AuthBootLoader from './AuthBootLoader'

/**
 * After Zustand rehydrates, validate or renew the access token before
 * rendering protected content. Handles expired tokens after deploy without
 * a redirect loop.
 */
const AuthSessionGate = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return undefined

    let cancelled = false

    const ensureSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY) || useAuthStore.getState().accessToken

      if (token && !isJwtExpired(token)) {
        if (!cancelled) setVerified(true)
        return
      }

      try {
        const newToken = await trySilentRefresh()
        useAuthStore.getState().setAccessToken(newToken)
      } catch {
        useAuthStore.getState().clearLocalSession()
      }

      if (!cancelled) setVerified(true)
    }

    ensureSession()

    return () => { cancelled = true }
  }, [isAuthenticated])

  if (!verified) return <AuthBootLoader />

  return children
}

export default AuthSessionGate
