import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { listStudioTransfers } from '../../api/studioTransfers'
import { Card, PageHeader, Spinner, Pagination, EmptyState } from '../../components/ui'
import { PAGE_SIZE } from '../../constants/pagination'
import useContent from '../../i18n/useContent'

const fmtDate = (d, language) =>
  d
    ? new Date(d).toLocaleDateString(language === 'en' ? 'en-GB' : 'de-CH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—'

const STATUS_CLASS = {
  ausstehend: 'text-studio-gold-2',
  genehmigt: 'text-studio-teal-2',
  abgelehnt: 'text-[#e05555]',
}

const RICHTUNG_CLASS = {
  eingehend: 'text-studio-teal-2 bg-studio-teal/10',
  ausgehend: 'text-[#ff9a3c] bg-[#ff9a3c]/10',
}

const StudioTransfers = () => {
  const { language, studioPages } = useContent()
  const copy = studioPages.transfers

  const [transfers, setTransfers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const load = useCallback(async (pageNum, status, { background = false } = {}) => {
    if (!background) setLoading(true)
    try {
      const params = { page: pageNum, limit: PAGE_SIZE }
      if (status) params.status = status
      const res = await listStudioTransfers(params)
      setTransfers(res.data.data.transfers ?? [])
      setPagination(res.data.data.pagination)
    } catch {
      toast.error(copy.loadError)
    } finally {
      setLoading(false)
    }
  }, [copy.loadError])

  useEffect(() => {
    load(page, statusFilter, { background: page > 1 })
  }, [page, statusFilter, load])

  const filters = [
    { value: 'ausstehend', label: copy.filters.open },
    { value: 'genehmigt', label: copy.filters.approved },
    { value: 'abgelehnt', label: copy.filters.rejected },
    { value: '', label: copy.filters.all },
  ]

  const headers = [
    copy.headers.request,
    copy.headers.joined,
    copy.headers.transfer,
    copy.headers.direction,
    copy.headers.customer,
    copy.headers.fromStudio,
    copy.headers.toStudio,
    copy.headers.status,
  ]

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="mb-4 px-4 py-3 rounded-[12px] border border-elaya-border bg-studio-bg-4">
        <p
          className="text-studio-w2 text-[12px] m-0 leading-relaxed [&_strong]:text-studio-white"
          dangerouslySetInnerHTML={{ __html: copy.info }}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => {
              setPage(1)
              setStatusFilter(f.value)
            }}
            className={`px-3 py-1.5 rounded-[8px] text-[11px] font-semibold border cursor-pointer transition-colors ${
              statusFilter === f.value
                ? 'bg-studio-gold/15 border-studio-gold text-studio-gold-2'
                : 'bg-studio-bg-3 border-elaya-border text-studio-w2 hover:text-studio-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && transfers.length === 0 ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : transfers.length === 0 ? (
        <EmptyState title={copy.emptyTitle} description={copy.emptyDesc} />
      ) : (
        <Card
          padding="none"
          className={loading && transfers.length > 0 ? 'opacity-60 pointer-events-none' : ''}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-elaya-border">
                  {headers.map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] font-semibold text-studio-w3 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transfers.map((tr) => (
                  <tr
                    key={tr.id}
                    className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4"
                  >
                    <td className="px-5 py-3 text-studio-w2 text-[12px] font-mono whitespace-nowrap">
                      {fmtDate(tr.erstellt_am, language)}
                    </td>
                    <td className="px-5 py-3 text-studio-w2 text-[12px] font-mono whitespace-nowrap">
                      {fmtDate(tr.beitritt_quelle_am, language)}
                    </td>
                    <td className="px-5 py-3 text-studio-w2 text-[12px] font-mono whitespace-nowrap">
                      {tr.status === 'genehmigt'
                        ? fmtDate(tr.wechsel_genehmigt_am ?? tr.genehmigt_am ?? tr.bearbeitet_am, language)
                        : tr.status === 'ausstehend'
                          ? '—'
                          : fmtDate(tr.bearbeitet_am, language)}
                    </td>
                    <td className="px-5 py-3 text-[12px]">
                      {tr.richtung ? (
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${RICHTUNG_CLASS[tr.richtung] || ''}`}
                        >
                          {copy.direction[tr.richtung] ?? tr.richtung}
                        </span>
                      ) : (
                        <span className="text-studio-w4">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-studio-white text-[12px] font-medium">
                      {tr.kunde_name || '—'}
                    </td>
                    <td className="px-5 py-3 text-studio-w2 text-[12px] max-w-[180px] truncate">
                      {tr.von_firma_name || '—'}
                    </td>
                    <td className="px-5 py-3 text-studio-w2 text-[12px] max-w-[180px] truncate">
                      {tr.zu_firma_name || '—'}
                    </td>
                    <td
                      className={`px-5 py-3 text-[12px] font-semibold ${STATUS_CLASS[tr.status] || ''}`}
                    >
                      {copy.status[tr.status] ?? tr.status}
                      {tr.status === 'abgelehnt' && tr.ablehnungsgrund ? (
                        <span
                          className="block text-studio-w4 text-[10px] font-normal mt-0.5 truncate max-w-[160px]"
                          title={tr.ablehnungsgrund}
                        >
                          {tr.ablehnungsgrund}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </Card>
      )}
    </div>
  )
}

export default StudioTransfers
