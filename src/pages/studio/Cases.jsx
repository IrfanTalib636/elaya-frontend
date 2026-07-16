import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight, FolderOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { listCases } from '../../api/cases'
import { Card, Badge, Spinner, PageHeader, EmptyState, Pagination } from '../../components/ui'
import MedicalAmpelDot from '../../components/medical/MedicalAmpelDot'
import { PAGE_SIZE, SEARCH_FETCH_LIMIT } from '../../constants/pagination'

const STATUS_FILTERS = [
  { value: '',                         label: 'Alle'              },
  { value: 'pending',                  label: 'Ausstehend'        },
  { value: 'active',                   label: 'Aktiv'             },
  { value: 'completed',                label: 'Abgeschlossen'     },
  { value: 'loeschantrag_ausstehend',  label: 'Löschantrag pend.' },
]

const MEDICAL_FILTERS = [
  { value: '',       label: 'Alle Ampeln' },
  { value: 'rot',    label: '🔴 Abklärung' },
  { value: 'orange', label: '🟡 Hinweise' },
  { value: 'gruen',  label: '🟢 Geklärt' },
]

const TYPE_LABELS = { tattoo: 'Tattoo', pmu: 'PMU' }

const TABLE_HEADERS = ['Fall', 'Kunde', 'Körperstelle', 'Typ', 'Sitzungen', 'Ampel', 'Status', '']

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('de-CH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const customerName = (c) => {
  if (!c || typeof c !== 'object') return '—'
  const n = `${c.vorname ?? ''} ${c.nachname ?? ''}`.trim()
  return n || c.email || '—'
}

const CaseRow = ({ c, onClick }) => {
  const label = c.bodyLabel || c.tc_title || TYPE_LABELS[c.type] || '—'
  const progress = c.sessions > 0
    ? `${c.sessionsDone ?? 0}/${c.sessions}`
    : `${c.sessionsDone ?? 0}`

  return (
    <tr
      className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-5 py-3">
        <span className="text-studio-gold-2 text-[12px] font-mono font-semibold">{c.caseId ?? '—'}</span>
        {c.lastSessionDate && (
          <p className="text-studio-w3 text-[10px] m-0 mt-0.5">Letzte: {fmtDate(c.lastSessionDate)}</p>
        )}
      </td>
      <td className="px-5 py-3 text-studio-white text-[13px]">{customerName(c.customer)}</td>
      <td className="px-5 py-3 text-studio-w1 text-[12px]">{label}</td>
      <td className="px-5 py-3 text-studio-w2 text-[12px]">{TYPE_LABELS[c.type] ?? c.type ?? '—'}</td>
      <td className="px-5 py-3 text-studio-w1 text-[12px] tabular-nums">{progress}</td>
      <td className="px-5 py-3">
        <MedicalAmpelDot
          level={c.medical_flag_level}
          pending={!c.anamnesis_complete}
          count={c.open_medical_flags_count}
          size="sm"
        />
      </td>
      <td className="px-5 py-3">
        <Badge variant="status" value={c.status}>{c.status}</Badge>
      </td>
      <td className="px-5 py-3 text-studio-w3">
        <ChevronRight size={14} />
      </td>
    </tr>
  )
}

const StudioCases = () => {
  const navigate = useNavigate()

  const [cases, setCases]       = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [medicalFilter, setMedicalFilter] = useState('')
  const [page, setPage] = useState(1)

  const isSearching = search.trim().length > 0

  const load = useCallback(async (status, medical, pageNum, searching) => {
    setLoading(true)
    try {
      const params = {
        limit: searching ? SEARCH_FETCH_LIMIT : PAGE_SIZE,
        page: searching ? 1 : pageNum,
      }
      if (status) params.status = status
      if (medical) params.medical_flag = medical
      const res = await listCases(params)
      setCases(res.data.data.cases ?? [])
      setPagination(res.data.data.pagination)
    } catch {
      toast.error('Fälle konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(statusFilter, medicalFilter, page, isSearching) }, [statusFilter, medicalFilter, page, isSearching, load])

  useEffect(() => { setPage(1) }, [statusFilter, medicalFilter, search])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return cases
    return cases.filter((c) => {
      const cust = customerName(c.customer).toLowerCase()
      return (
        (c.caseId ?? '').toLowerCase().includes(q) ||
        (c.bodyLabel ?? '').toLowerCase().includes(q) ||
        (c.tc_title ?? '').toLowerCase().includes(q) ||
        cust.includes(q)
      )
    })
  }, [cases, search])

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader
        title="Alle Fälle"
        subtitle={pagination ? `${pagination.total} Fälle gesamt` : ''}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-w3 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Fall-ID, Körperstelle, Kunde…"
            className="w-full pl-8 pr-4 py-[9px] rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[13px] outline-none focus:border-studio-gold transition-colors placeholder:text-studio-w3"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value || 'all'}
              type="button"
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-[7px] rounded-[8px] text-[11px] font-semibold transition-colors border cursor-pointer whitespace-nowrap ${
                statusFilter === s.value
                  ? 'bg-studio-gold/15 text-studio-gold-2 border-studio-gold/30'
                  : 'bg-transparent text-studio-w2 border-elaya-border hover:text-studio-white hover:border-elaya-border-strong'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {MEDICAL_FILTERS.map((m) => (
            <button
              key={m.value || 'all-medical'}
              type="button"
              onClick={() => setMedicalFilter(m.value)}
              className={`px-3 py-[7px] rounded-[8px] text-[11px] font-semibold transition-colors border cursor-pointer whitespace-nowrap ${
                medicalFilter === m.value
                  ? 'bg-studio-teal-2/15 text-studio-teal-2 border-studio-teal-2/30'
                  : 'bg-transparent text-studio-w2 border-elaya-border hover:text-studio-white hover:border-elaya-border-strong'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Keine Fälle gefunden"
          description={search ? 'Versuche einen anderen Suchbegriff.' : 'Noch keine Fälle angelegt.'}
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
                {filtered.map((c) => (
                  <CaseRow
                    key={c.id}
                    c={c}
                    onClick={() => navigate(`/studio/cases/${c.id}`)}
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

export default StudioCases
