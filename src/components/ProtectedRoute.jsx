import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useAuthHydrated from '../hooks/useAuthHydrated'
import AuthBootLoader from './AuthBootLoader'
import AuthSessionGate from './AuthSessionGate'

const ProtectedRoute = ({ children, allowedRoles, loginPath }) => {
  const location = useLocation()
  const hydrated = useAuthHydrated()
  const { isAuthenticated, user } = useAuthStore()

  if (!hydrated) return <AuthBootLoader />

  if (!isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return <AuthSessionGate>{children}</AuthSessionGate>
}

export default ProtectedRoute
