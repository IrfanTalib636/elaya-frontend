import api from '../lib/axios'

export const getCustomerMedicalClearance = (customerId) =>
  api.get(`/medical-clearance/customers/${customerId}`)

export const reviewCustomerMedicalClearance = (customerId, data) =>
  api.patch(`/medical-clearance/customers/${customerId}/review`, data)

export const uploadCustomerMedicalClearance = (customerId, file) => {
  const form = new FormData()
  form.append('file', file)
  form.append('customer_id', customerId)
  return api.post(`/medical-clearance/customers/${customerId}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
