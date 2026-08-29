import { useEffect, useMemo, useState } from 'react'
import useAuthStore from '../store/authStore'
import { createSocketConnection } from '../lib/socketConnection'
import { SocketContext } from './socketContext'

/**
 * Owns the single dashboard socket: connects once the user is authenticated and
 * tears down on logout. Subscriptions from screens survive across route changes
 * because the connection lives above the router outlet.
 */
const SocketProvider = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // One manager for the life of the app. Its identity never changes, so the
  // context value is stable and no consumer re-renders because of this
  // provider; logging out only drops the transport.
  const [connection] = useState(createSocketConnection)

  useEffect(() => {
    if (!isAuthenticated) return undefined
    void connection.connect()
    return () => connection.disconnect()
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
