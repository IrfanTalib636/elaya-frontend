import api from '../lib/axios'

/** Append-only platform audit log (read-only). */
export const listAdminAuditLogs = (params) => api.get('/admin/audit', { params })
