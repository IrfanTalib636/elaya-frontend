import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const ProtectedRoute = ({ children, allowedRoles, loginPath }) => {
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
