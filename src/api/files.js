import api from '../lib/axios'

export const uploadStagingPhoto = (file, { customerId, slot }) => {
  const form = new FormData()
  form.append('file', file)
  form.append('slot', slot)
  if (customerId) form.append('customer_id', customerId)
  return api.post('/files/staging', form)
}

export const uploadCaseIntakePhoto = (caseId, file, slot) => {
  const form = new FormData()
  form.append('file', file)
  form.append('slot', slot)
  return api.post(`/files/cases/${caseId}/intake`, form)
}

export const deleteStagingPhoto = (fileId) => api.delete(`/files/${fileId}`)

export const fetchPhotoBlobUrl = async (fileId) => {
  const res = await api.get(`/files/${fileId}/content`, { responseType: 'blob' })
  return URL.createObjectURL(res.data)
}
