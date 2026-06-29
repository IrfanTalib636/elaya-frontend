import api from '../lib/axios'

/** POST /auth/login — shared for customer, studio, admin */
export const login = (data) => api.post('/auth/login', data)

/** POST /auth/register/studio */
export const registerStudio = (data) =>  api.post('/auth/register/studio', data)

/** GET /auth/me — shared current user + profile */
export const getMe = () => api.get('/auth/me')

/** POST /auth/refresh — uses HttpOnly refresh cookie */
export const refresh = () => api.post('/auth/refresh')

/** POST /auth/logout */
export const logout = () => api.post('/auth/logout')
