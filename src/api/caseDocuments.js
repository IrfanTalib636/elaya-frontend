import api from '../lib/axios'

export const listCaseDocuments = (caseId, params = {}) =>
  api.get(`/cases/${caseId}/documents`, { params })

export const fetchCaseDocumentBlob = (caseId, docId, { download = false } = {}) =>
  api.get(`/cases/${caseId}/documents/${docId}/content`, {
    responseType: 'blob',
    params: download ? { download: 1 } : undefined,
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
  })

export const openCaseDocument = async (caseId, docId, { download = false, filename } = {}) => {
  const res = await fetchCaseDocumentBlob(caseId, docId, { download })
  const blob = res.data
  const url = URL.createObjectURL(blob)
  if (download) {
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `elaya-document-${docId}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 30_000)
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
