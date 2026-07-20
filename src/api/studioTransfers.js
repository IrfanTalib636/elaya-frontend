import api from '../lib/axios'

export const listStudioTransfers = (params) =>
  api.get('/studio-transfers', { params })
