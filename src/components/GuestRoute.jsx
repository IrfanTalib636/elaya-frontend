import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { getDashboardPathForRole } from '../lib/authRedirect'
import useAuthHydrated from '../hooks/useAuthHydrated'
import AuthBootLoader from './AuthBootLoader'

const GuestRoute = ({ children }) => {
  const hydrated = useAuthHydrated()
  const { isAuthenticated, user } = useAuthStore()

  if (!hydrated) return <AuthBootLoader />

  if (isAuthenticated && user?.role) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace />
  }

  return children
}

export default GuestRoute
