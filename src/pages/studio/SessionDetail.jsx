import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Camera, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { getSession, updateSession } from '../../api/sessions'
import {
  fetchPhotoBlobUrl,
  uploadSessionProgressPhoto,
  uploadSessionPostTreatmentPhoto,
} from '../../api/files'
import { analyzeVerblassung } from '../../api/verblassung'
import { Card, Badge, Button, Spinner, PageHeader } from '../../components/ui'
import useContent from '../../i18n/useContent'

// ── Helpers ───────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

const fmtCHF = (n) => (n != null && n > 0 ? `CHF ${Number(n).toFixed(2)}` : '—')

// ── Sub-components ────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-studio-w3 text-[10px] font-semibold uppercase tracking-wider">{label}</span>
    <span className="text-studio-w1 text-[13px]">{value || '—'}</span>
  </div>
)

const Section = ({ title, children }) => (
  <Card className="flex flex-col gap-4">
    <h2 className="text-[13px] font-semibold text-studio-white m-0 pb-3 border-b border-elaya-border">
      {title}
    </h2>
    {children}
  </Card>
)

const ResultBar = ({ label, value = 0, max = 100, unit = '%' }) => {
  const width = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-studio-w2 text-[12px]">{label}</span>
        <span className="text-studio-gold-2 text-[13px] font-bold tabular-nums">{value}{unit}</span>
      </div>
      <div className="h-[5px] rounded-full bg-white/7">
        <div
          className="h-full rounded-full bg-studio-gold transition-all"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

const UnusualReactionPhoto = ({ fileId, alt }) => {
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (!fileId) {
      setUrl('')
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
        setUrl(objectUrl)
      } catch {
        if (!cancelled) setUrl('')
      }
    })()
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [fileId])

  if (!url) return null
  return (
    <div className="rounded-[10px] border border-elaya-border overflow-hidden max-w-[220px] mt-1">
      <img src={url} alt={alt || ''} className="w-full object-cover" />
    </div>
  )
}

// ── Pre-treatment photo (AI fading) ───────────────────────────────────────
const ProgressPhotoSection = ({ session, onUploaded }) => {
  const { studioPages } = useContent()
  const copy = studioPages.sessionDetail
  const inputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const fileId = session.fortschritt_foto_file_id

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

  const handleSelect = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      await uploadSessionProgressPhoto(session.id, file)
      toast.success(copy.photoSaved)
      onUploaded()
    } catch (err) {
      toast.error(err.response?.data?.message ?? copy.photoError)
    } finally {
      setUploading(false)
    }
  }

  const beforeId =
    session.verblassung_ki?.foto_vorher_file_id ||
    session.foto_vorher_file_id ||
    null
  const afterId =
    session.verblassung_ki?.foto_aktuell_file_id ||
    session.foto_aktuell_file_id ||
    fileId ||
    null

  return (
    <Section title={copy.prePhotoTitle || copy.photoTitle}>
      <p className="text-studio-w3 text-[11px] m-0 -mt-1">
        {copy.prePhotoHint || ''}
      </p>
      {previewUrl ? (
        <div className="rounded-[12px] border border-elaya-border bg-studio-bg-4 overflow-hidden max-w-[320px]">
          <img src={previewUrl} alt={copy.prePhotoAlt || copy.photoAlt} className="w-full object-cover" />
        </div>
      ) : (
        <p className="text-studio-w2 text-[13px] m-0">
          {fileId ? '…' : (copy.prePhotoEmpty || copy.photoEmpty)}
        </p>
      )}
      {(beforeId || afterId) && beforeId !== afterId ? (
        <div className="flex flex-col gap-2 pt-2 border-t border-elaya-border">
          <span className="text-studio-w3 text-[11px] font-semibold uppercase tracking-wider">
            {copy.photoCompareTitle || 'Visual comparison'}
          </span>
          <div className="grid grid-cols-2 gap-3 max-w-[420px]">
            <div className="flex flex-col gap-1">
              <span className="text-studio-w3 text-[10px]">{copy.photoBefore || 'Before'}</span>
              {beforeId ? (
                <UnusualReactionPhoto fileId={beforeId} alt={copy.photoBefore} />
              ) : (
                <span className="text-studio-w4 text-[11px]">—</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-studio-w3 text-[10px]">{copy.photoAfter || 'After'}</span>
              {afterId ? (
                <UnusualReactionPhoto fileId={afterId} alt={copy.photoAfter} />
              ) : previewUrl ? (
                <div className="rounded-[10px] border border-elaya-border overflow-hidden max-w-[220px]">
                  <img src={previewUrl} alt={copy.photoAfter || ''} className="w-full object-cover" />
                </div>
              ) : (
                <span className="text-studio-w4 text-[11px]">—</span>
              )}
            </div>
          </div>
        </div>
      ) : null}
      <div>
        <Button
          size="sm"
          variant="secondary"
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Camera size={13} />
          {fileId ? copy.photoReplace : copy.photoUpload}
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleSelect}
      />
    </Section>
  )
}

// ── Post-treatment reaction photo (not used for AI) ───────────────────────
const PostTreatmentPhotoSection = ({ session, onUploaded }) => {
  const { studioPages } = useContent()
  const copy = studioPages.sessionDetail
  const inputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileId = session.post_treatment_foto_file_id

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

  const handleSelect = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      await uploadSessionPostTreatmentPhoto(session.id, file)
      toast.success(copy.postPhotoSaved || copy.photoSaved)
      onUploaded()
    } catch (err) {
      toast.error(err.response?.data?.message ?? copy.photoError)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Section title={copy.postPhotoTitle || 'Post-treatment photo'}>
      <p className="text-studio-w3 text-[11px] m-0 -mt-1">
        {copy.postPhotoHint || ''}
      </p>
      {previewUrl ? (
        <div className="rounded-[12px] border border-elaya-border bg-studio-bg-4 overflow-hidden max-w-[320px]">
          <img src={previewUrl} alt={copy.postPhotoAlt || ''} className="w-full object-cover" />
        </div>
      ) : (
        <p className="text-studio-w2 text-[13px] m-0">
          {fileId ? '…' : (copy.postPhotoEmpty || '—')}
        </p>
      )}
      <div>
        <Button
          size="sm"
          variant="secondary"
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Camera size={13} />
          {fileId ? (copy.postPhotoReplace || copy.photoReplace) : (copy.postPhotoUpload || copy.photoUpload)}
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleSelect}
      />
    </Section>
  )
}

const FlagToggle = ({ label, value, onChange }) => (
  <label className="flex items-center gap-2 text-[12px] text-studio-w1 cursor-pointer">
    <input
      type="checkbox"
      checked={value === true}
      onChange={(e) => onChange(e.target.checked)}
    />
    {label}
  </label>
)

const LighteningLogicSection = ({ session, onSaved }) => {
  const { t, studioPages } = useContent()
  const copy = studioPages.sessionDetail
  const [saving, setSaving] = useState(false)
  const [quality, setQuality] = useState(session.image_quality_ok === true)
  const [angle, setAngle] = useState(session.photo_same_angle === true)
  const [distance, setDistance] = useState(session.photo_same_distance === true)
  const [light, setLight] = useState(session.photo_comparable_light === true)
  const [reviewPct, setReviewPct] = useState(session.lightening_studio_pct ?? '')
  const [notes, setNotes] = useState(session.lightening_studio_notes || '')

  useEffect(() => {
    setQuality(session.image_quality_ok === true)
    setAngle(session.photo_same_angle === true)
    setDistance(session.photo_same_distance === true)
    setLight(session.photo_comparable_light === true)
    setReviewPct(session.lightening_studio_pct ?? '')
    setNotes(session.lightening_studio_notes || '')
  }, [
    session.image_quality_ok,
    session.photo_same_angle,
    session.photo_same_distance,
    session.photo_comparable_light,
    session.lightening_studio_pct,
    session.lightening_studio_notes,
  ])

  const save = async () => {
    setSaving(true)
    try {
      const res = await updateSession(session.id, {
        image_quality_ok: quality,
        photo_same_angle: angle,
        photo_same_distance: distance,
        photo_comparable_light: light,
        lightening_studio_pct: reviewPct === '' ? null : Number(reviewPct),
        lightening_studio_notes: notes,
      })
      toast.success(copy.lighteningSaved)
      onSaved?.(res.data.data.session)
    } catch (err) {
      toast.error(err.response?.data?.message ?? copy.lighteningSaveError)
    } finally {
      setSaving(false)
    }
  }

  const eligible = session.comparison_eligible === true
  const direction = copy.directions[session.progress_direction] || session.progress_direction || '—'

  return (
    <Section title={copy.lighteningTitle}>
      <p className="text-studio-w3 text-[12px] m-0 leading-relaxed">
        {copy.lighteningHint}
      </p>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        <InfoRow label={copy.comparisonPossible} value={session.comparison_eligible == null ? '—' : eligible ? copy.yes : copy.no} />
        <InfoRow label={copy.uncertainty} value={session.uncertainty_level || '—'} />
        <InfoRow label={copy.direction} value={direction} />
        <InfoRow label={copy.confidence} value={session.lightening_confidence || '—'} />
        <InfoRow
          label={copy.customerValue}
          value={eligible && session.percent_estimate != null ? `${session.percent_estimate}%` : copy.notShown}
        />
        <InfoRow
          label={copy.internalEstimate}
          value={session.lightening_internal_pct != null ? `${session.lightening_internal_pct}%` : '—'}
        />
        <InfoRow
          label={copy.lighteningScore}
          value={session.lightening_score != null ? String(session.lightening_score) : '—'}
        />
        <InfoRow label={copy.humanReview} value={session.needs_human_review ? copy.yes : copy.no} />
      </div>
      {(session.comparison_reasons || []).length > 0 && (
        <p className="text-studio-w3 text-[11px] m-0">
          {t('studioPages.sessionDetail.reasons', { list: session.comparison_reasons.join(', ') })}
        </p>
      )}
      <div className="flex flex-col gap-2 pt-1">
        <span className="text-studio-w3 text-[10px] font-semibold uppercase tracking-wider">{copy.photoComparability}</span>
        <FlagToggle label={copy.flagQuality} value={quality} onChange={setQuality} />
        <FlagToggle label={copy.flagAngle} value={angle} onChange={setAngle} />
        <FlagToggle label={copy.flagDistance} value={distance} onChange={setDistance} />
        <FlagToggle label={copy.flagLight} value={light} onChange={setLight} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-studio-w3 text-[10px] font-semibold uppercase tracking-wider">{copy.studioCorrectionPct}</span>
          <input
            type="number"
            min="0"
            max="100"
            className="bg-studio-bg-4 border border-elaya-border rounded-[8px] px-3 py-2 text-[13px] text-studio-w1"
            value={reviewPct}
            onChange={(e) => setReviewPct(e.target.value)}
            placeholder={copy.optional}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-studio-w3 text-[10px] font-semibold uppercase tracking-wider">{copy.reviewNote}</span>
          <input
            type="text"
            className="bg-studio-bg-4 border border-elaya-border rounded-[8px] px-3 py-2 text-[13px] text-studio-w1"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={copy.optional}
          />
        </label>
      </div>
      <div>
        <Button size="sm" variant="secondary" loading={saving} onClick={save}>
          {copy.saveComparisonReview}
        </Button>
      </div>
    </Section>
  )
}
const VerblassungKiSection = ({ session, onAnalyzed }) => {
  const { t, studioPages } = useContent()
  const copy = studioPages.sessionDetail
  const [analyzing, setAnalyzing] = useState(false)
  const ki = session.verblassung_ki
  const hasPhoto = !!session.fortschritt_foto_file_id
  const kiAvailable = session.ki_analysis_available !== false && Number(session.session_number) >= 2

  if (!kiAvailable) {
    return (
      <Section title={copy.aiTitle}>
        <p className="text-studio-w2 text-[13px] m-0 leading-relaxed">
          {copy.aiFirstSession}
        </p>
      </Section>
    )
  }

  const runAnalysis = async () => {
    setAnalyzing(true)
    try {
      await analyzeVerblassung({ session_id: session.id, persist: true })
      toast.success(copy.aiSaved)
      onAnalyzed()
    } catch (err) {
      toast.error(err.response?.data?.message ?? copy.aiError)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <Section title={copy.aiTitle}>
      {!ki ? (
        <p className="text-studio-w2 text-[13px] m-0">
          {copy.aiNoneYet}
          {!hasPhoto && copy.aiUploadFirst}
        </p>
      ) : (
        <>
          {session.comparison_eligible === false && (
            <div className="flex flex-col gap-1 px-3 py-2 rounded-[8px] bg-elaya-warning/10 border border-elaya-warning/20">
              <span className="text-elaya-warning text-[11px] font-semibold uppercase tracking-wider">{copy.noReliableComparison}</span>
              <span className="text-studio-w1 text-[13px]">
                {copy.customersNoSafePct}
                {session.lightening_internal_pct != null
                  ? t('studioPages.sessionDetail.internalEstimatePct', { pct: session.lightening_internal_pct })
                  : ''}
                {session.uncertainty_level
                  ? t('studioPages.sessionDetail.uncertaintyValue', { level: session.uncertainty_level })
                  : ''}
                {(session.comparison_reasons || []).length
                  ? t('studioPages.sessionDetail.reasonsInline', { list: session.comparison_reasons.join(', ') })
                  : ''}
              </span>
            </div>
          )}
          {session.verblassung_prozent != null && session.comparison_eligible !== false && (
            <ResultBar label={copy.fadeCustomer} value={session.verblassung_prozent} />
          )}
          {session.lightening_internal_pct != null && session.comparison_eligible === false && (
            <ResultBar label={copy.fadeInternal} value={session.lightening_internal_pct} />
          )}
          {session.progress_direction && (
            <InfoRow label={copy.progressDirection} value={copy.directions[session.progress_direction] || session.progress_direction} />
          )}
          <div className="grid grid-cols-1 gap-4">
            <InfoRow label={copy.assessment}        value={ki.beurteilung} />
            <InfoRow label={copy.progress}        value={ki.fortschritt} />
            <InfoRow label={copy.recCustomer}   value={ki.empfehlung_kunde} />
            <InfoRow label={copy.recStudio}  value={ki.empfehlung_studio} />
            <InfoRow label={copy.lifestyleTips}    value={ki.lifestyle_tipps} />
          </div>
          {ki.wichtiger_hinweis && (
            <div className="flex flex-col gap-1 px-3 py-2 rounded-[8px] bg-elaya-warning/10 border border-elaya-warning/20">
              <span className="text-elaya-warning text-[11px] font-semibold uppercase tracking-wider">{copy.importantNote}</span>
              <span className="text-studio-w1 text-[13px]">{ki.wichtiger_hinweis}</span>
            </div>
          )}
          {ki.analysed_at && (
            <p className="text-studio-w3 text-[11px] m-0">
              {t('studioPages.sessionDetail.analyzedAt', { date: fmtDate(ki.analysed_at) })}
            </p>
          )}
        </>
      )}
      <div>
        <Button
          size="sm"
          variant={ki ? 'secondary' : 'primary'}
          loading={analyzing}
          disabled={!hasPhoto}
          onClick={runAnalysis}
        >
          <Sparkles size={13} />
          {ki ? copy.runAi : copy.runAi}
        </Button>
      </div>
    </Section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────
const SessionDetail = () => {
  const { t, studioPages } = useContent()
  const copy = studioPages.sessionDetail
  const { id } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [finalizing, setFinalizing] = useState(false)

  const reload = useCallback(async () => {
    try {
      const res = await getSession(id)
      setSession(res.data.data.session)
    } catch {
      toast.error(copy.loadError)
    }
  }, [id, copy.loadError])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSession(id)
        setSession(res.data.data.session)
      } catch {
        toast.error(copy.loadError)
        navigate(-1)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate, copy.loadError])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  const finalizeDraft = async () => {
    setFinalizing(true)
    try {
      const res = await updateSession(id, { is_draft: false })
      setSession(res.data.data.session)
      toast.success(copy.finalizeSuccess)
    } catch (err) {
      toast.error(err.response?.data?.message ?? copy.finalizeError)
    } finally {
      setFinalizing(false)
    }
  }

  if (!session) return null

  const statusLabel = session.is_no_show ? copy.noShowBadge : session.is_draft ? copy.draftBadge : t('components.badge.completed')
  const statusValue = session.is_no_show ? 'storniert' : session.is_draft ? 'ausstehend' : 'aktiv'

  const hasLaser =
    session.studio_laser_brand ||
    session.studio_laser_model ||
    session.laser_typ ||
    session.laser_device_id ||
    (session.wavelength_entries || []).length
  const endpointReactions = Array.isArray(session.endpoint_reactions)
    ? session.endpoint_reactions
    : []
  const hasResults = !session.is_no_show && (
    session.verblassung_prozent != null
    || session.removal_pct != null
    || session.lightening_internal_pct != null
    || endpointReactions.length > 0
    || session.endpoint_reaction
    || session.unusual_immediate_reaction
    || session.adverse_event_flag
  )
  const hasPayment = session.zahlung?.betragCHF > 0 || session.zahlung?.zahlungsart

  const wavelengthEntries = Array.isArray(session.wavelength_entries)
    ? session.wavelength_entries
    : []
  const wavelengths = session.wavelength_nm?.length
    ? session.wavelength_nm.join(', ') + ' nm'
    : null

  return (
    <div className="p-6 max-w-[1100px]">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(`/studio/cases/${session.case}`)}
        className="flex items-center gap-1.5 text-studio-w2 text-[12px] mb-5 hover:text-studio-white transition-colors cursor-pointer bg-transparent border-0"
      >
        <ArrowLeft size={13} />
        {t('studioPages.aftercare.toCase')}
      </button>

      <PageHeader
        title={t('studioPages.sessionDetail.title', { number: session.session_number })}
        subtitle={`${fmtDate(session.treatment_date)}${session.treatment_time ? ` · ${session.treatment_time}` : ''}${session.zonen_id ? ` · ${copy.zone} ${session.zonen_id}` : ''}`}
      >
        <Badge variant="status" value={statusValue}>{statusLabel}</Badge>
        {session.is_draft && (
          <Button
            size="sm"
            loading={finalizing}
            onClick={finalizeDraft}
          >
            <Pencil size={13} />
            {copy.finalize}
          </Button>
        )}
      </PageHeader>

      <div className="flex gap-5 items-start">

        {/* ── Left column ── */}
        <div className="flex flex-col gap-5 flex-1 min-w-0">

          {/* General info */}
          <Section title={copy.general}>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <InfoRow label={copy.date}        value={fmtDate(session.treatment_date)} />
              <InfoRow label={copy.time}      value={session.treatment_time} />
              <InfoRow label={copy.durationMin} value={session.dauer_minuten != null ? t('studioPages.sessionDetail.minutesShort', { count: session.dauer_minuten }) : null} />
              <InfoRow label={copy.sessionId}  value={session.session_id} />
              <InfoRow
                label={copy.performedBy || copy.staff || 'Treatment performed by'}
                value={session.mitarbeiter_name}
              />
              <InfoRow
                label={copy.documentedBy || 'Documented by'}
                value={
                  session.documented_by_name ||
                  session.documented_by_email ||
                  '—'
                }
              />
              <InfoRow label={copy.room}         value={session.raum_name} />
            </div>
            {session.is_no_show && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-elaya-error/10 border border-elaya-error/20 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-elaya-error shrink-0" />
                <span className="text-elaya-error text-[12px] font-medium">{copy.noShowBanner}</span>
              </div>
            )}
          </Section>

          {/* Laser params */}
          {hasLaser && (
            <Section title={copy.laserParams}>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <InfoRow label={copy.brand}          value={session.studio_laser_brand} />
                <InfoRow label={copy.model}         value={session.studio_laser_model} />
                <InfoRow label={copy.laserType}      value={session.laser_typ} />
                {!wavelengthEntries.length ? (
                  <>
                    <InfoRow label={copy.wavelengths}   value={wavelengths} />
                    <InfoRow label={copy.fluence}  value={session.fluence_j_cm2 != null ? `${session.fluence_j_cm2} J/cm²` : null} />
                    <InfoRow label={copy.spotSize}     value={session.spot_size_mm != null ? `${session.spot_size_mm} mm` : null} />
                    <InfoRow label={copy.frequency}       value={session.frequency_hz != null ? `${session.frequency_hz} Hz` : null} />
                    <InfoRow label={copy.passes}         value={session.pass_count != null ? String(session.pass_count) : null} />
                  </>
                ) : null}
              </div>
              {wavelengthEntries.length ? (
                <div className="flex flex-col gap-3 mt-2">
                  {wavelengthEntries.map((entry, index) => (
                    <div
                      key={`${entry.wavelength_nm}-${index}`}
                      className="grid grid-cols-2 gap-x-8 gap-y-2 p-3 rounded-[8px] border border-elaya-border"
                    >
                      <InfoRow
                        label={`${copy.wavelengths || 'Wavelength'} ${index + 1}`}
                        value={entry.wavelength_nm != null ? `${entry.wavelength_nm} nm` : null}
                      />
                      <InfoRow
                        label={copy.fluence}
                        value={entry.fluence_j_cm2 != null ? `${entry.fluence_j_cm2} J/cm²` : null}
                      />
                      <InfoRow
                        label={copy.spotSize || copy.spotMm}
                        value={entry.spot_size_mm != null ? `${entry.spot_size_mm} mm` : null}
                      />
                      <InfoRow
                        label={copy.frequency || copy.freqHz}
                        value={entry.frequency_hz != null ? `${entry.frequency_hz} Hz` : null}
                      />
                      <InfoRow
                        label={copy.passes}
                        value={entry.pass_count != null ? String(entry.pass_count) : null}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
              {session.cooling_used && (
                <div className="flex items-center gap-2 text-studio-w2 text-[12px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-elaya-success shrink-0" />
                  {copy.coolingUsed}
                </div>
              )}
            </Section>
          )}

          {/* Treatment results — immediate reaction (fade % stays AI/legacy display when present) */}
          {hasResults && (
            <Section title={copy.outcome}>
              {session.comparison_eligible !== false && session.verblassung_prozent != null ? (
                <ResultBar label={copy.fadeCustomer} value={session.verblassung_prozent} />
              ) : session.lightening_internal_pct != null ? (
                <ResultBar label={copy.fadeInternal} value={session.lightening_internal_pct} />
              ) : null}
              {session.comparison_eligible !== false && session.removal_pct != null && (
                <ResultBar label={copy.removal} value={session.removal_pct} />
              )}
              {endpointReactions.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-studio-w3 text-[10px] font-semibold uppercase tracking-wider">
                    {copy.endpoint}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {endpointReactions.map((key) => (
                      <span
                        key={key}
                        className="px-2.5 py-1 rounded-[7px] text-[11px] border border-studio-teal-2/40 bg-studio-teal-2/10 text-studio-teal-2"
                      >
                        {copy.endpointOptions?.[key] || key}
                      </span>
                    ))}
                  </div>
                  {endpointReactions.includes('other') && session.endpoint_reaction_note ? (
                    <span className="text-studio-w1 text-[13px]">{session.endpoint_reaction_note}</span>
                  ) : null}
                </div>
              ) : session.endpoint_reaction ? (
                <InfoRow label={copy.endpoint} value={session.endpoint_reaction} />
              ) : null}
              {(session.unusual_immediate_reaction || session.adverse_event_flag) && (
                <div className="flex flex-col gap-2 px-3 py-2 rounded-[8px] bg-elaya-error/10 border border-elaya-error/20">
                  <span className="text-elaya-error text-[11px] font-semibold uppercase tracking-wider">
                    {copy.unusual || copy.adverseEvent}
                  </span>
                  {(session.unusual_reaction_type || session.adverse_event_type) && (
                    <InfoRow
                      label={copy.unusualType || copy.adverseEvent}
                      value={session.unusual_reaction_type || session.adverse_event_type}
                    />
                  )}
                  {session.unusual_reaction_description && (
                    <InfoRow label={copy.unusualDescription} value={session.unusual_reaction_description} />
                  )}
                  {session.unusual_reaction_action_taken && (
                    <InfoRow label={copy.unusualAction} value={session.unusual_reaction_action_taken} />
                  )}
                  <InfoRow
                    label={copy.unusualStopped}
                    value={session.unusual_reaction_treatment_stopped ? copy.yes : copy.no}
                  />
                  {session.unusual_reaction_photo_file_id && (
                    <UnusualReactionPhoto fileId={session.unusual_reaction_photo_file_id} alt={copy.unusualPhotoAlt} />
                  )}
                </div>
              )}
            </Section>
          )}

          {/* Progress photo + AI fading analysis */}
          {!session.is_no_show && (
            <>
              <ProgressPhotoSection session={session} onUploaded={reload} />
              <PostTreatmentPhotoSection session={session} onUploaded={reload} />
              <LighteningLogicSection session={session} onSaved={setSession} />
              <VerblassungKiSection session={session} onAnalyzed={reload} />
            </>
          )}

        </div>

        {/* ── Right sidebar ── */}
        <div className="flex flex-col gap-5 w-[260px] shrink-0">

          {/* Payment */}
          {hasPayment && (
            <Card className="flex flex-col gap-4">
              <h3 className="text-[13px] font-semibold text-studio-white m-0">{copy.payment}</h3>
              <InfoRow label={copy.amount}      value={fmtCHF(session.zahlung?.betragCHF)} />
              <InfoRow label={copy.method}     value={copy.payments[session.zahlung?.zahlungsart] ?? session.zahlung?.zahlungsart} />
              {session.zahlung?.rabatt > 0 && (
                <InfoRow label={copy.discount} value={fmtCHF(session.zahlung.rabatt)} />
              )}
            </Card>
          )}

          {/* Notes */}
          {session.special_notes && (
            <Card className="flex flex-col gap-3">
              <h3 className="text-[13px] font-semibold text-studio-white m-0">{copy.notes}</h3>
              <p className="text-studio-w1 text-[13px] m-0 leading-relaxed">{session.special_notes}</p>
            </Card>
          )}

          {/* Meta */}
          <Card className="flex flex-col gap-3">
            <h3 className="text-[13px] font-semibold text-studio-white m-0">{copy.details}</h3>
            <InfoRow label={copy.createdAt} value={fmtDate(session.createdAt)} />
            {session.session_id && <InfoRow label={copy.sessionId} value={session.session_id} />}
          </Card>

        </div>
      </div>
    </div>
  )
}

export default SessionDetail
