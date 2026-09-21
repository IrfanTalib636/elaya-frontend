import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authApi from '../api/auth'
import {
  enterStudioWorkspace as enterStudioWorkspaceApi,
  enableStudioWorkspaceEdit as enableStudioWorkspaceEditApi,
  exitStudioWorkspace as exitStudioWorkspaceApi,
} from '../api/adminStudios'
import { TOKEN_KEY, clearLocalSession as wipeLocalSession } from '../lib/session'
import {
  saveAdminSessionBackup,
  loadAdminSessionBackup,
  clearAdminSessionBackup,
  isStudioWorkspaceActive,
} from '../lib/adminWorkspaceSession'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      accessToken: null,
      isAuthenticated: false,
      /** True once AuthSessionGate has a usable access token (post-refresh). */
      sessionReady: false,
      /** Admin is viewing/editing a studio dashboard without studio login. */
      studioWorkspace: null,

      login: async ({ email, password, allowedRoles }) => {
        const { data: loginRes } = await authApi.login({ email, password })
        const { accessToken } = loginRes.data

        localStorage.setItem(TOKEN_KEY, accessToken)
        clearAdminSessionBackup()

        try {
          const { data: meRes } = await authApi.getMe()
          const { user, profile } = meRes.data

          if (allowedRoles && !allowedRoles.includes(user.role)) {
            const err = new Error('WRONG_PORTAL')
            err.code = 'WRONG_PORTAL'
            throw err
          }

          set({
            user,
            profile,
            accessToken,
            isAuthenticated: true,
            sessionReady: true,
            studioWorkspace: null,
          })
          return { user, profile }
        } catch (err) {
          wipeLocalSession()
          try {
            await authApi.logout()
          } catch {
            // ignore
          }
          throw err
        }
      },

      clearLocalSession: () => {
        wipeLocalSession()
        clearAdminSessionBackup()
        set({
          user: null,
          profile: null,
          accessToken: null,
          isAuthenticated: false,
          sessionReady: false,
          studioWorkspace: null,
        })
      },

      setAccessToken: (accessToken) => {
        localStorage.setItem(TOKEN_KEY, accessToken)
        set({ accessToken })
      },

      setSessionReady: (sessionReady) => set({ sessionReady }),

      logout: async () => {
        try {
          await authApi.logout()
        } catch {
          // Always clear local session even if the server call fails
        }
        useAuthStore.getState().clearLocalSession()
      },

      refreshProfile: async () => {
        const { data: meRes } = await authApi.getMe()
        const { user, profile } = meRes.data
        const imp = user?.impersonation
        set({
          user,
          profile,
          studioWorkspace: imp?.active
            ? {
                studioId: imp.studio_id,
                firma: imp.studio_firma,
                studioCode: imp.studio_code,
                editMode: !!imp.edit_mode,
                reason: imp.reason || '',
                adminEmail: imp.admin_email || '',
              }
            : get().studioWorkspace && isStudioWorkspaceActive()
              ? get().studioWorkspace
              : null,
        })
        return profile
      },

      enterStudioWorkspace: async (studioId) => {
        const state = get()
        if (!state.accessToken || !state.user) {
          throw new Error('Not authenticated')
        }

        if (!isStudioWorkspaceActive()) {
          saveAdminSessionBackup({
            accessToken: state.accessToken,
            user: state.user,
            profile: state.profile,
          })
        }

        const res = await enterStudioWorkspaceApi(studioId)
        const { accessToken, studio, edit_mode: editMode } = res.data.data
        localStorage.setItem(TOKEN_KEY, accessToken)

        const { data: meRes } = await authApi.getMe()
        const { user, profile } = meRes.data
        const imp = user?.impersonation

        set({
          accessToken,
          user,
          profile,
          isAuthenticated: true,
          sessionReady: true,
          studioWorkspace: {
            studioId: String(studio?.id || studioId),
            firma: studio?.firma || imp?.studio_firma || '',
            studioCode: studio?.studio_code || imp?.studio_code || '',
            editMode: !!editMode,
            reason: '',
            adminEmail: imp?.admin_email || state.user?.email || '',
          },
        })

        return { studio, editMode: !!editMode }
      },

      enableStudioWorkspaceEdit: async (reason) => {
        const ws = get().studioWorkspace
        if (!ws?.studioId) throw new Error('No active studio workspace')

        const res = await enableStudioWorkspaceEditApi(ws.studioId, reason)
        const { accessToken, edit_mode: editMode } = res.data.data
        localStorage.setItem(TOKEN_KEY, accessToken)

        const { data: meRes } = await authApi.getMe()
        const { user, profile } = meRes.data

        set({
          accessToken,
          user,
          profile,
          studioWorkspace: {
            ...ws,
            editMode: !!editMode,
            reason: reason || '',
          },
        })
      },

      exitStudioWorkspace: async () => {
        const ws = get().studioWorkspace
        const backup = loadAdminSessionBackup()

        try {
          if (ws?.studioId) {
            await exitStudioWorkspaceApi(ws.studioId)
          }
        } catch {
          // still restore admin session
        }

        clearAdminSessionBackup()

        if (backup?.accessToken) {
          localStorage.setItem(TOKEN_KEY, backup.accessToken)
          set({
            accessToken: backup.accessToken,
            user: backup.user,
            profile: backup.profile,
            isAuthenticated: true,
            sessionReady: true,
            studioWorkspace: null,
          })
          try {
            await get().refreshProfile()
          } catch {
            /* backup profile is enough */
          }
          return { restored: true }
        }

        get().clearLocalSession()
        return { restored: false }
      },
    }),
    {
      name: 'elaya_auth',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        studioWorkspace: state.studioWorkspace,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          localStorage.setItem(TOKEN_KEY, state.accessToken)
        }
      },
    }
  )
)

export default useAuthStore
