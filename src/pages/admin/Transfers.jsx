import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Card,
  PageHeader,
  Spinner,
  Button,
  EmptyState,
  Modal,
  Input,
  Pagination,
} from '../../components/ui'
import {
  listStudioTransfers,
  approveStudioTransfer,
  rejectStudioTransfer,
} from '../../api/studioTransfers'
import { PAGE_SIZE } from '../../constants/pagination'
import useContent from '../../i18n/useContent'

const STATUS_CLASS = {
  ausstehend: 'text-studio-gold-2',
  genehmigt: 'text-studio-teal-2',
  abgelehnt: 'text-[#e05555]',
}

const fmtDate = (d, language) =>
  d
    ? new Date(d).toLocaleDateString(language === 'en' ? 'en-GB' : 'de-CH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—'

const AdminTransfers = () => {
  const { t, language, adminPages } = useContent()
  const copy = adminPages.transfers

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('ausstehend')
  const [rejectId, setRejectId] = useState(null)
  const [ablehnungsgrund, setAblehnungsgrund] = useState('')
  const [acting, setActing] = useState(null)

  const load = useCallback(
    async (pageNum, status, { background = false } = {}) => {
      if (!background) setLoading(true)
      try {
        const params = { page: pageNum, limit: PAGE_SIZE }
        if (status) params.status = status
        const res = await listStudioTransfers(params)
        setItems(res.data.data?.transfers ?? [])
        setPagination(res.data.data?.pagination ?? null)
      } catch {
        toast.error(copy.loadError)
      } finally {
        setLoading(false)
      }
    },
    [copy.loadError]
  )

  useEffect(() => {
    load(page, statusFilter, { background: page > 1 })
  }, [page, statusFilter, load])

  const approve = async (id) => {
    setActing(id)
    try {
      await approveStudioTransfer(id)
      toast.success(copy.approved)
      await load(page, statusFilter)
    } catch {
      toast.error(copy.approveError)
    } finally {
      setActing(null)
    }
  }

  const reject = async () => {
    if (!rejectId) return
    const reason = ablehnungsgrund.trim()
    if (!reason) {
      toast.error(copy.reasonRequired)
      return
    }
    setActing(rejectId)
    try {
      await rejectStudioTransfer(rejectId, { ablehnungsgrund: reason })
      toast.success(copy.rejected)
      setRejectId(null)
      setAblehnungsgrund('')
      await load(page, statusFilter)
    } catch {
      toast.error(copy.rejectError)
    } finally {
      setActing(null)
    }
  }

  const filters = [
    { value: 'ausstehend', label: copy.filters?.open || 'Open' },
    { value: 'genehmigt', label: copy.filters?.approved || 'Approved' },
    { value: 'abgelehnt', label: copy.filters?.rejected || 'Rejected' },
    { value: '', label: copy.filters?.all || 'All' },
  ]

  const headers = [
    copy.headers?.request || 'Request',
    copy.headers?.customer || 'Customer',
    copy.headers?.fromStudio || 'From studio',
    copy.headers?.toStudio || 'To studio',
    copy.headers?.status || 'Status',
    copy.headers?.actions || 'Actions',
  ]

  const emptyTitle =
    statusFilter === 'ausstehend'
      ? copy.emptyOpen || copy.empty
      : copy.emptyTitle || copy.empty

  return (
    <div className="max-w-[1100px]">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="mb-4 px-4 py-3 rounded-[12px] border border-elaya-border bg-studio-bg-4">
        <p className="text-studio-w2 text-[12px] m-0 leading-relaxed">{copy.info}</p>
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

      {loading && items.length === 0 ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState title={emptyTitle} description={copy.emptyHint} />
        </Card>
      ) : (
        <Card
          padding="none"
          className={loading && items.length > 0 ? 'opacity-60 pointer-events-none' : ''}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px]">
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
                {items.map((tr) => {
                  const id = tr.id || tr._id
                  const pending = tr.status === 'ausstehend' || tr.status === 'pending'
                  return (
                    <tr
                      key={id}
                      className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4"
                    >
                      <td className="px-5 py-3 text-studio-w2 text-[12px] font-mono whitespace-nowrap">
                        {fmtDate(tr.erstellt_am, language)}
                      </td>
                      <td className="px-5 py-3 text-studio-white text-[12px] font-medium">
                        {tr.kunde_name || copy.customerFallback}
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
                        {t(`adminPages.transfers.statuses.${tr.status}`, {
                          defaultValue: tr.status,
                        })}
                        {tr.status === 'abgelehnt' && tr.ablehnungsgrund ? (
                          <span
                            className="block text-studio-w4 text-[10px] font-normal mt-0.5 truncate max-w-[160px]"
                            title={tr.ablehnungsgrund}
                          >
                            {tr.ablehnungsgrund}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3">
                        {pending ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              disabled={acting === id}
                              onClick={() => approve(id)}
                            >
                              {copy.approve}
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={acting === id}
                              onClick={() => {
                                setRejectId(id)
                                setAblehnungsgrund('')
                              }}
                            >
                              {copy.reject}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-studio-w4 text-[12px]">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </Card>
      )}

      {rejectId ? (
        <Modal title={copy.rejectTitle} onClose={() => setRejectId(null)}>
          <Input
            label={copy.rejectReason}
            value={ablehnungsgrund}
            onChange={(e) => setAblehnungsgrund(e.target.value)}
            placeholder={copy.rejectPh}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setRejectId(null)}>
              {copy.cancel}
            </Button>
            <Button disabled={!!acting} onClick={reject}>
              {copy.reject}
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

export default AdminTransfers
