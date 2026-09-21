import api from '../lib/axios'

export const getAdminCrmOverview = () => api.get('/admin/crm/overview')

export const listAdminStudioLeads = (params) =>
  api.get('/admin/crm/leads', { params })

export const createAdminStudioLead = (body) =>
  api.post('/admin/crm/leads', body)

export const updateAdminStudioLead = (id, body) =>
  api.patch(`/admin/crm/leads/${id}`, body)

export const advanceAdminStudioLead = (id, body) =>
  api.post(`/admin/crm/leads/${id}/advance`, body)
