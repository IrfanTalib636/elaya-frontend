import api from '../lib/axios'

export const getCaseAnamnesis = (caseId) => api.get(`/cases/${caseId}/anamnesis`)

export const previewCaseAnamnesis = (caseId, data) =>
  api.post(`/cases/${caseId}/anamnesis/preview`, data)

export const upsertCaseAnamnesis = (caseId, data) => api.put(`/cases/${caseId}/anamnesis`, data)
