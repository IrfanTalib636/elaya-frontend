import { useEffect, useMemo, useState } from 'react'
import useAuthStore from '../store/authStore'
import useAuthHydrated from '../hooks/useAuthHydrated'
import { createSocketConnection } from '../lib/socketConnection'
import { SocketContext } from './socketContext'

/**
 * Owns the single dashboard socket: connects once the user is authenticated and
 * tears down on logout. Subscriptions from screens survive across route changes
 * because the connection lives above the router outlet.
 */
const SocketProvider = ({ children }) => {
  const hydrated = useAuthHydrated()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const sessionReady = useAuthStore((s) => s.sessionReady)
  const accessToken = useAuthStore((s) => s.accessToken)

  const [connection] = useState(createSocketConnection)

  // Connect only after AuthSessionGate has verified/refreshed the JWT — avoids
  // racing refresh-token rotation and connecting with an expired access token.
  useEffect(() => {
    if (!hydrated || !isAuthenticated || !sessionReady) return undefined

    void connection.connect()
    connection.startWatchdog()

    return () => {
      connection.stopWatchdog()
    }
  }, [hydrated, isAuthenticated, sessionReady, connection])

  useEffect(() => {
    if (!sessionReady || !accessToken) return undefined
    void connection.reauth(accessToken)
  }, [sessionReady, accessToken, connection])

  useEffect(() => {
    if (!isAuthenticated) connection.disconnect()
  }, [isAuthenticated, connection])

  const value = useMemo(
    () => ({
      subscribe: connection.subscribe,
      emit: connection.emit,
      onStatusChange: connection.onStatusChange,
      isConnected: connection.isConnected,
    }),
    [connection]
  )

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export default SocketProvider
