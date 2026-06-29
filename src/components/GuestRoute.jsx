import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { getDashboardPathForRole } from '../lib/authRedirect'

export default function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user?.role) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace />
  }

  return children
}
