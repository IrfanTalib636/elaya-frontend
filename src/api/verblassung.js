import api from '../lib/axios'

export const analyzeVerblassung = (data) => api.post('/verblassung', data)
