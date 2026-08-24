import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { listNachsorge, reviewNachsorge } from '../../api/nachsorge'
import { fetchPhotoBlobUrl } from '../../api/files'
import { Card, Button, Spinner, PageHeader, Modal, Pagination, Select } from '../../components/ui'
import useContent from '../../i18n/useContent'

// ── Constants ─────────────────────────────────────────────────────────────
const HEALING_STATUS_CLASSES = {
  normal:      'bg-elaya-success/15 text-elaya-success',
  monitor:     'bg-elaya-warning/15 text-elaya-warning',
  delayed:     'bg-elaya-warning/15 text-elaya-warning',
  conspicuous: 'bg-elaya-error/15 text-elaya-error',
}

const AMPEL_CLASSES = {
  gruen:  'bg-elaya-success/15 text-elaya-success',
  orange: 'bg-elaya-warning/15 text-elaya-warning',
  rot:    'bg-elaya-error/15 text-elaya-error',
}

const FILTER_VALUES = ['alle', 'rot', 'orange', 'gruen']
const HEALING_STATUS_VALUES = ['normal', 'monitor', 'delayed', 'conspicuous']
const SYMPTOM_KEYS = [
  'erythema_level', 'swelling_level', 'blistering_flag', 'crusting_level',
  'pain_score', 'itching_level', 'hyperpigmentation_level', 'hypopigmentation_level',
  'infection_suspected', 'oozing', 'warmth',
]

// ── Helpers ───────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('de-CH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

// ── Sub-components ────────────────────────────────────────────────────────
const AmpelBadge = ({ ampel }) => {
  const { studioPages } = useContent()
  const labels = studioPages.aftercare.ampel
  const classes = AMPEL_CLASSES[ampel]
  if (!classes) return <span className="text-studio-w3 text-[11px]">—</span>
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${classes}`}>
      {labels[ampel] ?? ampel}
    </span>
  )
}

const CheckPhoto = ({ fileId }) => {
  const { studioPages } = useContent()
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
        <img src={previewUrl} alt={studioPages.aftercare.photoAlt} className="w-full max-h-[40vh] object-contain mx-auto" />
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

const HealingReviewForm = ({ check, onSaved }) => {
  const { t, studioPages } = useContent()
  const copy = studioPages.aftercare
  const [notes, setNotes] = useState(check.studio_review_notes || '')
  const [status, setStatus] = useState(check.healing_status || 'normal')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setNotes(check.studio_review_notes || '')
    setStatus(check.healing_status || 'normal')
  }, [check.id, check.studio_review_notes, check.healing_status])

  const save = async (overrideStatus) => {
    setSaving(true)
    try {
      const res = await reviewNachsorge(check.id, {
        studio_review_notes: notes.trim(),
        ...(overrideStatus ? { healing_status: overrideStatus } : status && status !== check.healing_status
          ? { healing_status: status }
          : {}),
      })
      const updated = res.data.data.check
      onSaved(updated)
      toast.success(copy.reviewSaved)
    } catch (err) {
      toast.error(err?.response?.data?.message ?? copy.reviewError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 pt-2 border-t border-elaya-border">
      <DetailBlock label={copy.reviewTitle}>
        {check.healing_needs_review && !check.healing_studio_reviewed_at && (
          <p className="text-elaya-warning text-[11px] m-0 mb-1">
            {copy.autoAssessment}
          </p>
        )}
        {check.healing_studio_reviewed_at && (
          <p className="text-studio-w3 text-[11px] m-0 mb-1">
            {t('studioPages.aftercare.lastReviewed', { date: fmtDate(check.healing_studio_reviewed_at) })}
            {check.healing_studio_reviewed_by ? ` · ${check.healing_studio_reviewed_by}` : ''}
            {check.healing_status_calculated && check.healing_status_calculated !== check.healing_status
              ? t('studioPages.aftercare.systemStatus', {
                  status: copy.healingStatus[check.healing_status_calculated] || check.healing_status_calculated,
                })
              : ''}
          </p>
        )}
        <Select
          label={copy.healingStatusLabel}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {HEALING_STATUS_VALUES.map((v) => (
            <option key={v} value={v}>{copy.healingStatus[v]}</option>
          ))}
        </Select>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder={copy.notesPlaceholder}
          className="w-full mt-2 px-3 py-2 rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-w1 text-[12px] outline-none focus:border-studio-gold transition-colors placeholder:text-studio-w3 resize-none"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          <Button size="sm" loading={saving} onClick={() => save(check.healing_status)}>
            {copy.confirmAssessment}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={saving || !status || status === check.healing_status}
            onClick={() => save(status)}
          >
            {copy.correct}
          </Button>
        </div>
      </DetailBlock>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────
const Aftercare = () => {
  const { t, studioPages } = useContent()
  const copy = studioPages.aftercare
  const navigate = useNavigate()
  const tableHeaders = [
    copy.headers.date, copy.headers.customer, copy.headers.case, copy.headers.ampel,
    copy.headers.title, copy.headers.daysAfter, copy.headers.contact,
  ]
  const filters = FILTER_VALUES.map((value) => ({ value, label: copy.filters[value] }))

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
      toast.error(copy.loadError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [page, load])

  // Ampel filter is client-side — the backend list endpoint only filters by case_id.
  const visibleChecks = filter === 'alle' ? checks : checks.filter((c) => c.ampel === filter)

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="flex gap-2 mb-4">
        {filters.map(({ value, label }) => (
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
              {filter === 'alle' ? copy.emptyAll : copy.emptyFilter}
            </p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-elaya-border">
                  {tableHeaders.map((h) => (
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
                      {c.tage_nach_sitzung != null ? t('studioPages.aftercare.days', { count: c.tage_nach_sitzung }) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      {c.studio_kontakt ? (
                        <span className="inline-flex items-center gap-1 text-elaya-error text-[11px] font-semibold">
                          <Phone size={11} />
                          {copy.contactRecommended}
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
        <Modal title={detail.titel || copy.modalFallbackTitle} onClose={() => setDetail(null)} width="max-w-2xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <AmpelBadge ampel={detail.ampel} />
              {detail.healing_status && HEALING_STATUS_CLASSES[detail.healing_status] && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${HEALING_STATUS_CLASSES[detail.healing_status]}`}>
                  {copy.healingStatus[detail.healing_status]}
                </span>
              )}
              {detail.healing_phase && (
                <span className="text-studio-w3 text-[12px]">
                  {copy.healingPhase[detail.healing_phase] || detail.healing_phase}
                </span>
              )}
              {detail.customer_name && (
                <span className="text-studio-white text-[12px] font-medium">{detail.customer_name}</span>
              )}
              {detail.case_display_id && (
                <span className="text-studio-gold-2 text-[12px] font-mono">{detail.case_display_id}</span>
              )}
              <span className="text-studio-w3 text-[12px]">{fmtDate(detail.erstellt_am)}</span>
              {detail.tage_nach_sitzung != null && (
                <span className="text-studio-w3 text-[12px]">{t('studioPages.aftercare.daysAfterSession', { count: detail.tage_nach_sitzung })}</span>
              )}
              {detail.studio_kontakt && (
                <span className="inline-flex items-center gap-1 text-elaya-error text-[11px] font-semibold">
                  <Phone size={11} />
                  {copy.studioContactRecommended}
                </span>
              )}
            </div>

            {detail.healing_customer_summary && (
              <DetailBlock label={copy.customerText}>
                <p className="text-studio-w1 text-[13px] m-0 leading-relaxed">{detail.healing_customer_summary}</p>
              </DetailBlock>
            )}
            {detail.healing_recommended_action && (
              <DetailBlock label={copy.recommendedAction}>
                <p className="text-studio-w1 text-[13px] m-0">
                  {copy.healingAction[detail.healing_recommended_action] || detail.healing_recommended_action}
                  {detail.healing_progress_score != null ? t('studioPages.aftercare.progressScore', { score: detail.healing_progress_score }) : ''}
                </p>
              </DetailBlock>
            )}
            {detail.progress_direction_self && (
              <DetailBlock label={copy.courseCustomer}>
                <p className="text-studio-w1 text-[13px] m-0">{detail.progress_direction_self}</p>
              </DetailBlock>
            )}
            {detail.zusammenfassung && (
              <DetailBlock label={copy.summary}>
                <p className="text-studio-w1 text-[13px] m-0 leading-relaxed">{detail.zusammenfassung}</p>
              </DetailBlock>
            )}
            {detail.healing_red_flag && (
              <DetailBlock label={copy.redFlags}>
                <p className="text-elaya-error text-[13px] m-0">
                  {(detail.healing_red_flags || []).join(', ') || copy.yes}
                  {detail.healing_needs_review ? copy.reviewRecommended : ''}
                </p>
              </DetailBlock>
            )}

            {detail.healing_symptoms && (
              <DetailBlock label={copy.structuredSymptoms}>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(detail.healing_symptoms)
                    .filter(([key, value]) =>
                      SYMPTOM_KEYS.includes(key)
                      && value
                      && value !== 'none'
                      && value !== false
                      && value !== 0
                      && value !== 'no'
                    )
                    .map(([key, value]) => (
                      <span key={key} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-studio-bg-4 border border-elaya-border text-studio-w1">
                        {copy.symptoms[key]}: {String(value)}
                      </span>
                    ))}
                </div>
              </DetailBlock>
            )}
            {detail.symptome?.length > 0 && !detail.healing_symptoms && (
              <DetailBlock label={copy.reportedSymptoms}>
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
              <DetailBlock label={copy.recommendations}>
                <ul className="m-0 pl-4 flex flex-col gap-1">
                  {detail.empfehlungen.map((e) => (
                    <li key={e} className="text-studio-w1 text-[13px]">{e}</li>
                  ))}
                </ul>
              </DetailBlock>
            )}

            {detail.foto_file_id && (
              <DetailBlock label={copy.photo}>
                <CheckPhoto fileId={detail.foto_file_id} />
              </DetailBlock>
            )}

            {detail.foto_befund && (
              <DetailBlock label={copy.photoFindings}>
                <p className="text-studio-w1 text-[13px] m-0 leading-relaxed">{detail.foto_befund}</p>
              </DetailBlock>
            )}

            {detail.hinweis && (
              <p className="text-studio-w3 text-[11px] m-0 border border-elaya-border rounded-[10px] px-3 py-2 bg-studio-bg-4">
                {detail.hinweis}
              </p>
            )}

            <HealingReviewForm
              check={detail}
              onSaved={(updated) => {
                setDetail(updated)
                setChecks((prev) => prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)))
              }}
            />

            <div className="flex justify-end gap-2 pt-1">
              {detail.case_id && (
                <Button size="sm" variant="secondary" onClick={() => navigate(`/studio/cases/${detail.case_id}`)}>
                  {copy.toCase}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setDetail(null)}>
                {copy.close}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Aftercare
