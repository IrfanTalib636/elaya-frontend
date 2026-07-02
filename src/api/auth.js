import api from '../lib/axios'

export const login         = (data) => api.post('/auth/login', data)

export const registerStudio = (data) => api.post('/auth/register/studio', data)

export const getMe         = ()     => api.get('/auth/me')

export const logout        = ()     => api.post('/auth/logout')
