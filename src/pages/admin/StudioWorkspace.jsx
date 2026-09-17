import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Calendar,
  FolderOpen,
  MessageSquare,
  Search,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { openStudioWorkspace } from '../../api/adminStudios'
import { listCustomers } from '../../api/customers'
import { listCases } from '../../api/cases'
import { listAppointments } from '../../api/appointments'
import { getApiErrorMessage } from '../../lib/apiError'
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  Pagination,
  Spinner,
} from '../../components/ui'
import useContent from '../../i18n/useContent'

const PAGE_SIZE = 30

const TABS = [
  { id: 'customers', icon: Users },
  { id: 'cases', icon: FolderOpen },
  { id: 'appointments', icon: Calendar },
]

const fmtDate = (d) => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

const customerLabel = (c) => {
  if (!c) return '—'
  if (typeof c === 'string') return c
  const name = `${c.vorname ?? ''} ${c.nachname ?? ''}`.trim()
  return name || c.email || '—'
}

/**
 * Admin support workspace for one studio.
 * Remains logged in as Elaya Admin — no studio impersonation.
 */
const AdminStudioWorkspace = () => {
  const { studioId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { adminPages } = useContent()
  const copy = adminPages.studioWorkspace || {}

  const tabFromUrl = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(
    TABS.some((t) => t.id === tabFromUrl) ? tabFromUrl : 'customers'
  )
  const [bootLoading, setBootLoading] = useState(true)
  const [studio, setStudio] = useState(null)
  const [counts, setCounts] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    if (tabFromUrl && TABS.some((t) => t.id === tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const selectTab = (id) => {
    setActiveTab(id)
    setPage(1)
    setSearch('')
    setSearchParams(id === 'customers' ? {} : { tab: id })
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setBootLoading(true)
      try {
        const res = await openStudioWorkspace(studioId)
        if (cancelled) return
        setStudio(res.data?.data?.studio || null)
        setCounts(res.data?.data?.counts || null)
      } catch (err) {
        toast.error(getApiErrorMessage(err, copy.openError || 'Could not open workspace'))
        navigate('/admin/studios', { replace: true })
      } finally {
        if (!cancelled) setBootLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [studioId, navigate, copy.openError])

  const loadTab = useCallback(async () => {
    if (!studioId) return
    setLoading(true)
    try {
      if (activeTab === 'customers') {
        const params = { studio_id: studioId, limit: PAGE_SIZE, page }
        if (search.trim()) params.search = search.trim()
        const res = await listCustomers(params)
        setRows(res.data?.data?.customers || [])
        setPagination(res.data?.data?.pagination || null)
      } else if (activeTab === 'cases') {
        const params = { studio_id: studioId, limit: PAGE_SIZE, page }
        const res = await listCases(params)
        setRows(res.data?.data?.cases || [])
        setPagination(res.data?.data?.pagination || null)
      } else {
        const params = { studio_id: studioId, limit: PAGE_SIZE, page }
        const res = await listAppointments(params)
        setRows(res.data?.data?.appointments || [])
        setPagination(res.data?.data?.pagination || null)
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.loadError || 'Could not load data'))
      setRows([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [activeTab, studioId, page, search, copy.loadError])

  useEffect(() => {
    if (bootLoading || !studio) return undefined
    const tmr = setTimeout(() => void loadTab(), search ? 300 : 0)
    return () => clearTimeout(tmr)
  }, [bootLoading, studio, loadTab, search])

  useEffect(() => {
    setPage(1)
  }, [search, activeTab])

  if (bootLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!studio) return null

  const title = studio.firma || studio.studio_code || copy.title || 'Studio workspace'

  return (
    <div className="max-w-[1100px]">
      <button
        type="button"
        onClick={() => navigate('/admin/studios')}
        className="inline-flex items-center gap-1.5 text-[12px] text-studio-w2 hover:text-studio-white bg-transparent border-0 cursor-pointer mb-3 p-0"
      >
        <ArrowLeft size={14} />
        {copy.backToStudios || 'Back to studios'}
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <PageHeader
          title={title}
          subtitle={
            copy.subtitle ||
            'Support workspace — you stay logged in as Elaya Admin. Actions are audited.'
          }
        />
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/admin/studio-chat?studioId=${encodeURIComponent(studio.id)}`}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-elaya-border bg-studio-bg-4 px-3 py-2 text-[12px] font-semibold text-studio-white no-underline hover:border-studio-gold/40"
          >
            <MessageSquare size={14} />
            {copy.openChat || 'Studio chat'}
          </Link>
        </div>
      </div>

      <div className="mb-4 rounded-[12px] border border-studio-gold/25 bg-studio-gold/5 px-4 py-3 text-[12px] text-studio-w1">
        <span className="font-semibold text-studio-gold-2">
          {copy.bannerTitle || 'Admin support mode'}
        </span>
        {' — '}
        {copy.bannerBody ||
          'No studio impersonation. You remain Elaya Admin; this opening is recorded in the audit log.'}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Card>
          <p className="m-0 text-[11px] text-admin-muted">{copy.kpiCode || 'Studio code'}</p>
          <p className="m-0 mt-1 text-[14px] font-semibold flex items-center gap-1.5">
            <Building2 size={14} />
            {studio.studio_code || '—'}
          </p>
        </Card>
        <Card>
          <p className="m-0 text-[11px] text-admin-muted">{copy.kpiCustomers || 'Customers'}</p>
          <p className="m-0 mt-1 text-[18px] font-bold">{counts?.customers ?? '—'}</p>
        </Card>
        <Card>
          <p className="m-0 text-[11px] text-admin-muted">{copy.kpiCases || 'Cases'}</p>
          <p className="m-0 mt-1 text-[18px] font-bold">{counts?.cases ?? '—'}</p>
        </Card>
        <Card>
          <p className="m-0 text-[11px] text-admin-muted">
            {copy.kpiAppointments || 'Upcoming appointments'}
          </p>
          <p className="m-0 mt-1 text-[18px] font-bold">
            {counts?.upcoming_appointments ?? '—'}
          </p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {TABS.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => selectTab(id)}
            className={`inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-[12px] font-semibold border-0 cursor-pointer transition-colors ${
              activeTab === id
                ? 'bg-(--nav-active-bg) text-studio-gold-2'
                : 'bg-studio-bg-4 text-studio-w1 hover:text-studio-white'
            }`}
          >
            <Icon size={13} />
            {copy.tabs?.[id] || id}
          </button>
        ))}
        {activeTab === 'customers' ? (
          <label className="relative ml-auto block w-full max-w-[240px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-w3 pointer-events-none"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={copy.searchPlaceholder || 'Search…'}
              className="w-full rounded-[10px] border border-elaya-border bg-studio-bg-4 py-2 pl-9 pr-3 text-[12px] text-studio-white placeholder:text-studio-w3 outline-none focus:border-studio-gold/50"
            />
          </label>
        ) : null}
      </div>

      <Card padding="none">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title={copy.empty || 'No records'} />
        ) : (
          <>
          <div className="overflow-x-auto">
            {activeTab === 'customers' ? (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-admin-muted border-b border-admin-line">
                    <th className="p-3">{copy.headers?.name || 'Name'}</th>
                    <th className="p-3">{copy.headers?.email || 'Email'}</th>
                    <th className="p-3">{copy.headers?.phone || 'Phone'}</th>
                    <th className="p-3">{copy.headers?.pipeline || 'Pipeline'}</th>
                    <th className="p-3">{copy.headers?.cases || 'Open cases'}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c._id || c.id} className="border-b border-admin-line/50">
                      <td className="p-3 font-medium text-studio-white">
                        {customerLabel(c)}
                        {c.wechsel_status && c.wechsel_status !== 'aktuell' ? (
                          <span className="block text-[10px] text-studio-gold-2 uppercase">
                            {c.wechsel_status}
                          </span>
                        ) : null}
                      </td>
                      <td className="p-3 text-studio-w1">{c.email || '—'}</td>
                      <td className="p-3 text-studio-w1">{c.telefon || '—'}</td>
                      <td className="p-3">
                        {c.pipeline_stufe ? (
                          <Badge variant="status" value={c.pipeline_stufe}>
                            {c.pipeline_stufe}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3">{c.offene_faelle ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}

            {activeTab === 'cases' ? (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-admin-muted border-b border-admin-line">
                    <th className="p-3">{copy.headers?.caseId || 'Case'}</th>
                    <th className="p-3">{copy.headers?.customer || 'Customer'}</th>
                    <th className="p-3">{copy.headers?.type || 'Type'}</th>
                    <th className="p-3">{copy.headers?.sessions || 'Sessions'}</th>
                    <th className="p-3">{copy.headers?.status || 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.id || c._id} className="border-b border-admin-line/50">
                      <td className="p-3 font-mono text-[12px] text-studio-gold-2">
                        {c.caseId || c.id || '—'}
                      </td>
                      <td className="p-3">{customerLabel(c.customer)}</td>
                      <td className="p-3 text-studio-w1">{c.type || c.bodyLabel || '—'}</td>
                      <td className="p-3 tabular-nums">
                        {c.sessionsDone ?? 0}
                        {c.sessions ? `/${c.sessions}` : ''}
                      </td>
                      <td className="p-3">
                        <Badge variant="status" value={c.status}>
                          {c.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}

            {activeTab === 'appointments' ? (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-admin-muted border-b border-admin-line">
                    <th className="p-3">{copy.headers?.date || 'Date'}</th>
                    <th className="p-3">{copy.headers?.time || 'Time'}</th>
                    <th className="p-3">{copy.headers?.customer || 'Customer'}</th>
                    <th className="p-3">{copy.headers?.type || 'Type'}</th>
                    <th className="p-3">{copy.headers?.status || 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => (
                    <tr key={a.id || a._id} className="border-b border-admin-line/50">
                      <td className="p-3">{fmtDate(a.date)}</td>
                      <td className="p-3 tabular-nums">{a.time || '—'}</td>
                      <td className="p-3">{customerLabel(a.customer)}</td>
                      <td className="p-3 text-studio-w1">
                        {a.consultationOnly ? 'beratung' : a.type || '—'}
                      </td>
                      <td className="p-3">
                        <Badge variant="status" value={a.status}>
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            showPageNumbers
          />
          </>
        )}
      </Card>
    </div>
  )
}

export default AdminStudioWorkspace
