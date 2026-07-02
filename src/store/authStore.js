import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authApi from '../api/auth'

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

        localStorage.setItem('elaya_token', accessToken)

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
          localStorage.removeItem('elaya_token')
          try {
            await authApi.logout()
          } catch {
            // ignore
          }
          throw err
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch {
          // Always clear local session even if the server call fails
        }
        localStorage.removeItem('elaya_token')
        set({ user: null, profile: null, accessToken: null, isAuthenticated: false })
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
          localStorage.setItem('elaya_token', state.accessToken)
        }
      },
    }
  )
)

export default useAuthStore
