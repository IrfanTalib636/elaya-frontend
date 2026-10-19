import api from '../lib/axios'

export const getAdminCrmOverview = () => api.get('/admin/crm/overview')

export const getAdminCrmFunnel = () => api.get('/admin/crm/funnel')

export const listAdminCrmCustomers = (params) =>
  api.get('/admin/crm/customers', { params })

export const getAdminCrmCustomer = (id) =>
  api.get(`/admin/crm/customers/${id}`)

export const listAdminCrmStudioLeads = (params) =>
  api.get('/admin/crm/studio-leads', { params })

export const getAdminCrmStudioLead = (id) =>
  api.get(`/admin/crm/studio-leads/${id}`)

export const listAdminCrmTasks = (params) =>
  api.get('/admin/crm/tasks', { params })

export const createAdminCrmTask = (body) =>
  api.post('/admin/crm/tasks', body)

export const updateAdminCrmTask = (id, body) =>
  api.patch(`/admin/crm/tasks/${id}`, body)

export const listAdminCrmNotes = (params) =>
  api.get('/admin/crm/notes', { params })

export const createAdminCrmNote = (body) =>
  api.post('/admin/crm/notes', body)

export const listAdminStudioLeads = (params) =>
  api.get('/admin/crm/leads', { params })

export const createAdminStudioLead = (body) =>
  api.post('/admin/crm/leads', body)

export const updateAdminStudioLead = (id, body) =>
  api.patch(`/admin/crm/leads/${id}`, body)

export const advanceAdminStudioLead = (id, body) =>
  api.post(`/admin/crm/leads/${id}/advance`, body)
