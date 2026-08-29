import { createContext, useContext } from 'react'

/**
 * The value is intentionally a stable object of functions — `subscribe`,
 * `emit`, `onStatusChange`, `isConnected` — and never the connection status
 * itself. Putting `connected` in here would re-render every consumer on each
 * connect and disconnect, including the many screens that only listen for
 * events and do not care about status. Components that need status opt in via
 * `useSocketStatus()`.
 */
export const SocketContext = createContext(null)

export const useSocketBus = () => useContext(SocketContext)
