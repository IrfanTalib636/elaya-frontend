import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'
import { listSessions } from '../../api/sessions'
import { Card, Spinner, PageHeader, EmptyState, Pagination } from '../../components/ui'
import { PAGE_SIZE, SEARCH_FETCH_LIMIT } from '../../constants/pagination'

const DRAFT_FILTERS = [
  { value: '',      label: 'Alle'          },
  { value: 'false', label: 'Abgeschlossen' },
  { value: 'true',  label: 'Entwürfe'      },
]

const TABLE_HEADERS = ['Nr.', 'Datum', 'Kunde', 'Fall', 'Verbl. %', 'Zahlung', 'Status', '']

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('de-CH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const chfFmt = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 })
const fmtCHF = (n) => chfFmt.format(n ?? 0)

const customerName = (c) => {
  if (!c || typeof c !== 'object') return '—'
  const n = `${c.vorname ?? ''} ${c.nachname ?? ''}`.trim()
  return n || '—'
}

const sessionStatus = (s) => {
  if (s.is_no_show) return { label: 'No-Show', className: 'text-elaya-error' }
  if (s.is_draft)   return { label: 'Entwurf', className: 'text-studio-amber' }
  return { label: 'Abgeschlossen', className: 'text-elaya-success' }
}

const SessionRow = ({ s, onClick }) => {
  const st = sessionStatus(s)
  const caseLabel = s.case?.caseId ?? (typeof s.case === 'string' ? '—' : '—')

  return (
    <tr
      className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-5 py-3 text-studio-w1 text-[12px] font-mono tabular-nums">{s.session_number ?? '—'}</td>
      <td className="px-5 py-3 text-studio-white text-[12px]">{fmtDate(s.treatment_date)}</td>
      <td className="px-5 py-3 text-studio-w1 text-[12px]">{customerName(s.customer)}</td>
      <td className="px-5 py-3 text-studio-gold-2 text-[12px] font-mono">{caseLabel}</td>
      <td className="px-5 py-3 text-studio-w2 text-[12px] tabular-nums">
        {s.verblassung_prozent != null ? `${s.verblassung_prozent}%` : '—'}
      </td>
      <td className="px-5 py-3 text-studio-w1 text-[12px]">
        {s.zahlung?.betragCHF ? fmtCHF(s.zahlung.betragCHF) : '—'}
      </td>
      <td className={`px-5 py-3 text-[11px] font-semibold ${st.className}`}>{st.label}</td>
      <td className="px-5 py-3 text-studio-w3"><ChevronRight size={14} /></td>
    </tr>
  )
}

const StudioSessions = () => {
  const navigate = useNavigate()

  const [sessions, setSessions]     = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [draftFilter, setDraftFilter] = useState('')
  const [page, setPage] = useState(1)

  const isSearching = search.trim().length > 0

  const load = useCallback(async (draft, pageNum, searching) => {
    setLoading(true)
    try {
      const params = {
        limit: searching ? SEARCH_FETCH_LIMIT : PAGE_SIZE,
        page: searching ? 1 : pageNum,
      }
      if (draft) params.is_draft = draft
      const res = await listSessions(params)
      setSessions(res.data.data.sessions ?? [])
      setPagination(res.data.data.pagination)
    } catch {
      toast.error('Sitzungen konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(draftFilter, page, isSearching) }, [draftFilter, page, isSearching, load])

  useEffect(() => { setPage(1) }, [draftFilter, search])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sessions
    return sessions.filter((s) => {
      const cust = customerName(s.customer).toLowerCase()
      const caseId = (s.case?.caseId ?? '').toLowerCase()
      return (
        cust.includes(q) ||
        caseId.includes(q) ||
        String(s.session_number ?? '').includes(q)
      )
    })
  }, [sessions, search])

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader
        title="Sitzungen"
        subtitle={pagination ? `${pagination.total} Sitzungen gesamt` : ''}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-w3 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kunde, Fall-ID, Sitzungs-Nr…"
            className="w-full pl-8 pr-4 py-[9px] rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[13px] outline-none focus:border-studio-gold transition-colors placeholder:text-studio-w3"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {DRAFT_FILTERS.map((f) => (
            <button
              key={f.value || 'all'}
              type="button"
              onClick={() => setDraftFilter(f.value)}
              className={`px-3 py-[7px] rounded-[8px] text-[11px] font-semibold transition-colors border cursor-pointer whitespace-nowrap ${
                draftFilter === f.value
                  ? 'bg-studio-gold/15 text-studio-gold-2 border-studio-gold/30'
                  : 'bg-transparent text-studio-w2 border-elaya-border hover:text-studio-white hover:border-elaya-border-strong'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Keine Sitzungen gefunden"
          description={search ? 'Versuche einen anderen Suchbegriff.' : 'Noch keine Sitzungen dokumentiert.'}
        />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-elaya-border">
                  {TABLE_HEADERS.map((h) => (
                    <th key={h || 'action'} className="px-5 py-3 text-left text-[10px] font-semibold text-studio-w3 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <SessionRow
                    key={s.id}
                    s={s}
                    onClick={() => navigate(`/studio/sessions/${s.id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {!isSearching && (
            <Pagination pagination={pagination} onPageChange={setPage} />
          )}
        </Card>
      )}
    </div>
  )
}

export default StudioSessions
