import api from '../lib/axios'

export const listStudioOpenActions = (params) =>
  api.get('/studio/actions', { params })

export const getStudioActionSummary = () =>
  api.get('/studio/actions/summary')

export const listAdminOpenActions = (params) =>
  api.get('/admin/actions', { params })

export const getAdminActionSummary = () =>
  api.get('/admin/actions/summary')
