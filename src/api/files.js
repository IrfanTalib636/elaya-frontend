import api from '../lib/axios'
import { optimizeImageForUpload } from '../utils/optimizeImageForUpload'

export const uploadStagingPhoto = async (file, { customerId, slot }) => {
  const prepared = await optimizeImageForUpload(file)
  const form = new FormData()
  form.append('file', prepared)
  form.append('slot', slot)
  if (customerId) form.append('customer_id', customerId)
  return api.post('/files/staging', form)
}

export const uploadCaseIntakePhoto = async (caseId, file, slot) => {
  const prepared = await optimizeImageForUpload(file)
  const form = new FormData()
  form.append('file', prepared)
  form.append('slot', slot)
  return api.post(`/files/cases/${caseId}/intake`, form)
}

export const uploadSessionProgressPhoto = async (sessionId, file) => {
  const prepared = await optimizeImageForUpload(file)
  const form = new FormData()
  form.append('file', prepared)
  return api.post(`/files/sessions/${sessionId}/progress`, form)
}

export const deleteStagingPhoto = (fileId) => api.delete(`/files/${fileId}`)

export const fetchPhotoBlobUrl = async (fileId) => {
  const res = await api.get(`/files/${fileId}/content`, { responseType: 'blob' })
  return URL.createObjectURL(res.data)
}
