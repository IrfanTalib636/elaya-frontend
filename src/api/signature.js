import api from '../lib/axios'

export const getCaseMerkblatt = (caseId, params = {}) =>
  api.get(`/cases/${caseId}/merkblatt`, { params })

export const submitCaseSignature = (caseId, data) =>
  api.post(`/cases/${caseId}/signature`, data)

export const fetchCaseSignatureImage = (caseId, { t } = {}) =>
  api.get(`/cases/${caseId}/signature/image`, {
    responseType: 'blob',
    params: t ? { t } : undefined,
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
  })
