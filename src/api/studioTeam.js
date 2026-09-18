import api from '../lib/axios'

export const getStudioSeatStatus = (params) =>
  api.get('/studio/team/seats', { params })
export const listStudioLogins = (params) =>
  api.get('/studio/team/logins', { params })
export const inviteStudioLogin = (payload) =>
  api.post('/studio/team/logins/invite', payload)
export const updateStudioLogin = (id, payload) =>
  api.patch(`/studio/team/logins/${id}`, payload)

export const listAdminStudioLogins = (params) =>
  api.get('/studio/team/admin/logins', { params })
export const listAdminStaffProfiles = (params) =>
  api.get('/studio/team/admin/staff-profiles', { params })
