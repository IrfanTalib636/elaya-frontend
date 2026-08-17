import api from '../lib/axios'

export const sendElayaChat = (payload) => api.post('/chat', payload)
