import api from '../lib/axios'
import { optimizeImageForUpload } from '../utils/optimizeImageForUpload'

export const getCustomerMedicalClearance = (customerId) =>
  api.get(`/medical-clearance/customers/${customerId}`)

export const reviewCustomerMedicalClearance = (customerId, data) =>
  api.patch(`/medical-clearance/customers/${customerId}/review`, data)

export const uploadCustomerMedicalClearance = async (customerId, file) => {
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '')
  const prepared = isPdf ? file : await optimizeImageForUpload(file)
  const form = new FormData()
  form.append('file', prepared)
  form.append('customer_id', customerId)
  return api.post(`/medical-clearance/customers/${customerId}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
