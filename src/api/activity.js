import api from '../lib/axios'

export const listStudioActivity = (params = {}) =>
  api.get('/studio/activity', { params })
