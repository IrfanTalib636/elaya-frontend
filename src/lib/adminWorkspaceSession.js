/** Session keys for admin → studio workspace (Vollzugriff). */
export const ADMIN_SESSION_BACKUP_KEY = 'elaya_admin_session_backup'
export const WORKSPACE_ACTIVE_KEY = 'elaya_studio_workspace_active'

export const saveAdminSessionBackup = ({ accessToken, user, profile }) => {
  try {
    sessionStorage.setItem(
      ADMIN_SESSION_BACKUP_KEY,
      JSON.stringify({ accessToken, user, profile })
    )
    sessionStorage.setItem(WORKSPACE_ACTIVE_KEY, '1')
  } catch {
    /* ignore */
  }
}

export const loadAdminSessionBackup = () => {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_BACKUP_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const clearAdminSessionBackup = () => {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_BACKUP_KEY)
    sessionStorage.removeItem(WORKSPACE_ACTIVE_KEY)
  } catch {
    /* ignore */
  }
}

export const isStudioWorkspaceActive = () => {
  try {
    return sessionStorage.getItem(WORKSPACE_ACTIVE_KEY) === '1'
  } catch {
    return false
  }
}
