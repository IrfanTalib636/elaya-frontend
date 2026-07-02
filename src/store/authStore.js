import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authApi from '../api/auth'
import { TOKEN_KEY, clearLocalSession as wipeLocalSession } from '../lib/session'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      profile: null,
      accessToken: null,
      isAuthenticated: false,

      login: async ({ email, password, allowedRoles }) => {
        const { data: loginRes } = await authApi.login({ email, password })
        const { accessToken } = loginRes.data

        localStorage.setItem(TOKEN_KEY, accessToken)

        try {
          const { data: meRes } = await authApi.getMe()
          const { user, profile } = meRes.data

          if (allowedRoles && !allowedRoles.includes(user.role)) {
            const err = new Error('WRONG_PORTAL')
            err.code = 'WRONG_PORTAL'
            throw err
          }

          set({ user, profile, accessToken, isAuthenticated: true })
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

      /** Clear client session without a server round-trip (used by axios on refresh failure). */
      clearLocalSession: () => {
        wipeLocalSession()
        set({ user: null, profile: null, accessToken: null, isAuthenticated: false })
      },

      setAccessToken: (accessToken) => {
        localStorage.setItem(TOKEN_KEY, accessToken)
        set({ accessToken })
      },

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
        set({ user, profile })
        return profile
      },
    }),
    {
      name: 'elaya_auth',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
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
