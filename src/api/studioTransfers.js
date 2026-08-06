import api from '../lib/axios'

export const listStudioTransfers = (params) =>
  api.get('/studio-transfers', { params })

export const approveStudioTransfer = (id) =>
  api.patch(`/studio-transfers/${id}/approve`)

export const rejectStudioTransfer = (id, body) =>
  api.patch(`/studio-transfers/${id}/reject`, body)
