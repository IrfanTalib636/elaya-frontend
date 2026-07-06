import api from '../lib/axios'

export const getAnalyticsSummary = (params) =>
  api.get('/studio/analytics/summary', { params })
