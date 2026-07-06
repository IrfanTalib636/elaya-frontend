import api from '../lib/axios'

export const getCrmPipeline = () => api.get('/studio/crm/pipeline')

export const getCrmTasks = (params) => api.get('/studio/crm/tasks', { params })

export const createCrmTask = (body) => api.post('/studio/crm/tasks', body)

export const updateCrmTask = (id, body) => api.patch(`/studio/crm/tasks/${id}`, body)

export const deleteCrmTask = (id) => api.delete(`/studio/crm/tasks/${id}`)

export const getCrmNotes = (customerId) =>
  api.get('/studio/crm/notes', { params: { customer_id: customerId } })

export const createCrmNote = (body) => api.post('/studio/crm/notes', body)

export const getCrmTemplate = (customerId) => api.get(`/studio/crm/templates/${customerId}`)
