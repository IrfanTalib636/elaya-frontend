import { STUDIO_ROLES, ADMIN_ROLES } from '../constants/roles'

export function getDashboardPathForRole(role) {
  if (STUDIO_ROLES.includes(role)) return '/studio'
  if (ADMIN_ROLES.includes(role)) return '/admin'
  return '/'
}
