import api from '../lib/axios'

export const getCaseAnamnesis    = (caseId) => api.get(`/cases/${caseId}/anamnesis`)

export const upsertCaseAnamnesis = (caseId, data) => api.put(`/cases/${caseId}/anamnesis`, data)
