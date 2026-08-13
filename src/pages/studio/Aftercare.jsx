import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { listNachsorge } from '../../api/nachsorge'
import { fetchPhotoBlobUrl } from '../../api/files'
import { Card, Button, Spinner, PageHeader, Modal, Pagination } from '../../components/ui'

// ── Constants ─────────────────────────────────────────────────────────────
const TABLE_HEADERS = ['Datum', 'Kunde', 'Fall', 'Ampel', 'Titel', 'Tage n. Sitzung', 'Kontakt']

const AMPEL_META = {
  gruen:  { label: 'Grün',   classes: 'bg-elaya-success/15 text-elaya-success' },
  orange: { label: 'Orange', classes: 'bg-elaya-warning/15 text-elaya-warning' },
  rot:    { label: 'Rot',    classes: 'bg-elaya-error/15 text-elaya-error'     },
}

const FILTERS = [
  { value: 'alle',   label: 'Alle'   },
  { value: 'rot',    label: 'Rot'    },
  { value: 'orange', label: 'Orange' },
  { value: 'gruen',  label: 'Grün'   },
]

// ── Helpers ───────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('de-CH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

// ── Sub-components ────────────────────────────────────────────────────────
const AmpelBadge = ({ ampel }) => {
  const meta = AMPEL_META[ampel]
  if (!meta) return <span className="text-studio-w3 text-[11px]">—</span>
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${meta.classes}`}>
      {meta.label}
    </span>
  )
}

const CheckPhoto = ({ fileId }) => {
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!fileId) {
      setPreviewUrl('')
      return undefined
    }

    let cancelled = false
    let objectUrl = ''

    ;(async () => {
      try {
        objectUrl = await fetchPhotoBlobUrl(fileId)
        if (cancelled) {
          URL.revokeObjectURL(objectUrl)
          return
        }
        setPreviewUrl(objectUrl)
      } catch {
        if (!cancelled) setPreviewUrl('')
      }
    })()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [fileId])

  if (!fileId) return null

  return (
    <div className="rounded-[12px] border border-elaya-border bg-studio-bg-4 overflow-hidden">
      {previewUrl ? (
        <img src={previewUrl} alt="Nachsorge-Foto" className="w-full max-h-[40vh] object-contain mx-auto" />
      ) : (
        <div className="py-10 flex justify-center"><Spinner /></div>
      )}
    </div>
  )
}

const DetailBlock = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <span className="text-studio-w3 text-[10px] font-semibold uppercase tracking-wider">{label}</span>
    {children}
  </div>
)

// ── Page ──────────────────────────────────────────────────────────────────
const Aftercare = () => {
  const navigate = useNavigate()

  const [checks, setChecks] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('alle')
  const [detail, setDetail] = useState(null)

  const load = useCallback(async (pageNum) => {
    setLoading(true)
    try {
      const res = await listNachsorge({ page: pageNum, limit: 20 })
      setChecks(res.data.data.checks ?? [])
      setPagination(res.data.data.pagination)
    } catch {
      toast.error('Nachsorge-Checks konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [page, load])

  // Ampel filter is client-side — the backend list endpoint only filters by case_id.
  const visibleChecks = filter === 'alle' ? checks : checks.filter((c) => c.ampel === filter)

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader
        title="Nachsorge"
        subtitle="KI-Nachsorge-Checks deiner Kunden — Heilungsverlauf und Auffälligkeiten"
      />

      <div className="flex gap-2 mb-4">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border cursor-pointer transition-colors ${
              filter === value
                ? 'border-studio-gold/40 bg-studio-gold/10 text-studio-gold-2'
                : 'border-elaya-border bg-transparent text-studio-w2 hover:border-elaya-border-strong hover:text-studio-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : visibleChecks.length === 0 ? (
        <Card>
          <div className="py-10 text-center">
            <Heart size={32} className="text-studio-w4 mx-auto mb-3" />
            <p className="text-studio-w2 text-[13px] m-0">
              {filter === 'alle'
                ? 'Noch keine Nachsorge-Checks vorhanden.'
                : 'Keine Nachsorge-Checks mit diesem Filter.'}
            </p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-elaya-border">
                  {TABLE_HEADERS.map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-studio-w3 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleChecks.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4 cursor-pointer transition-colors"
                    onClick={() => setDetail(c)}
                  >
                    <td className="px-5 py-3 text-studio-w1 text-[12px] whitespace-nowrap">{fmtDate(c.erstellt_am)}</td>
                    <td className="px-5 py-3 text-studio-white text-[12px] whitespace-nowrap">
                      {c.customer_name || '—'}
                    </td>
                    <td className="px-5 py-3 text-studio-gold-2 text-[12px] font-mono">
                      {c.case_display_id || (c.case_id ? `…${String(c.case_id).slice(-6)}` : '—')}
                    </td>
                    <td className="px-5 py-3"><AmpelBadge ampel={c.ampel} /></td>
                    <td className="px-5 py-3 text-studio-white text-[12px] font-medium">{c.titel || '—'}</td>
                    <td className="px-5 py-3 text-studio-w1 text-[12px]">
                      {c.tage_nach_sitzung != null ? `${c.tage_nach_sitzung} Tage` : '—'}
                    </td>
                    <td className="px-5 py-3">
                      {c.studio_kontakt ? (
                        <span className="inline-flex items-center gap-1 text-elaya-error text-[11px] font-semibold">
                          <Phone size={11} />
                          Kontakt empfohlen
                        </span>
                      ) : (
                        <span className="text-studio-w3 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </Card>
      )}

      {detail && (
        <Modal title={detail.titel || 'Nachsorge-Check'} onClose={() => setDetail(null)} width="max-w-2xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <AmpelBadge ampel={detail.ampel} />
              {detail.customer_name && (
                <span className="text-studio-white text-[12px] font-medium">{detail.customer_name}</span>
              )}
              {detail.case_display_id && (
                <span className="text-studio-gold-2 text-[12px] font-mono">{detail.case_display_id}</span>
              )}
              <span className="text-studio-w3 text-[12px]">{fmtDate(detail.erstellt_am)}</span>
              {detail.tage_nach_sitzung != null && (
                <span className="text-studio-w3 text-[12px]">{detail.tage_nach_sitzung} Tage nach Sitzung</span>
              )}
              {detail.studio_kontakt && (
                <span className="inline-flex items-center gap-1 text-elaya-error text-[11px] font-semibold">
                  <Phone size={11} />
                  Studio-Kontakt empfohlen
                </span>
              )}
            </div>

            {detail.zusammenfassung && (
              <DetailBlock label="Zusammenfassung">
                <p className="text-studio-w1 text-[13px] m-0 leading-relaxed">{detail.zusammenfassung}</p>
              </DetailBlock>
            )}

            {detail.symptome?.length > 0 && (
              <DetailBlock label="Gemeldete Symptome">
                <div className="flex flex-wrap gap-1.5">
                  {detail.symptome.map((s) => (
                    <span key={s} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-studio-bg-4 border border-elaya-border text-studio-w1">
                      {s}
                    </span>
                  ))}
                </div>
              </DetailBlock>
            )}

            {detail.empfehlungen?.length > 0 && (
              <DetailBlock label="Empfehlungen">
                <ul className="m-0 pl-4 flex flex-col gap-1">
                  {detail.empfehlungen.map((e) => (
                    <li key={e} className="text-studio-w1 text-[13px]">{e}</li>
                  ))}
                </ul>
              </DetailBlock>
            )}

            {detail.foto_file_id && (
              <DetailBlock label="Foto">
                <CheckPhoto fileId={detail.foto_file_id} />
              </DetailBlock>
            )}

            {detail.foto_befund && (
              <DetailBlock label="Foto-Befund (KI)">
                <p className="text-studio-w1 text-[13px] m-0 leading-relaxed">{detail.foto_befund}</p>
              </DetailBlock>
            )}

            {detail.hinweis && (
              <p className="text-studio-w3 text-[11px] m-0 border border-elaya-border rounded-[10px] px-3 py-2 bg-studio-bg-4">
                {detail.hinweis}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              {detail.case_id && (
                <Button size="sm" variant="secondary" onClick={() => navigate(`/studio/cases/${detail.case_id}`)}>
                  Zum Fall
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setDetail(null)}>
                Schliessen
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Aftercare
