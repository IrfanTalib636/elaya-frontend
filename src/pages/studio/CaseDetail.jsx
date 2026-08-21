import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Plus, ChevronRight, AlertCircle, ClipboardList, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCase, updateCase, updateEstimateConfirmation } from '../../api/cases'
import { listSessions } from '../../api/sessions'
import { listAppointments } from '../../api/appointments'
import CaseAvailabilityPanel from '../../components/case/CaseAvailabilityPanel'
import CaseIntakePhotos from '../../components/case/CaseIntakePhotos'
import CasePricingPanel from '../../components/case/CasePricingPanel'
import CaseAnamnesisPanel from '../../components/anamnesis/CaseAnamnesisPanel'
import CaseSignaturePanel from '../../components/signature/CaseSignaturePanel'
import MedicalAmpelDot from '../../components/medical/MedicalAmpelDot'
import { Card, Badge, Button, Spinner, PageHeader, Modal, Input } from '../../components/ui'
import useContent from '../../i18n/useContent'

// ── Constants ─────────────────────────────────────────────────────────────
const CASE_TYPE_LABELS  = { tattoo: 'Tattoo', pmu: 'PMU' }
const TC_TYPE_LABELS    = { amateur: 'Amateur', cosmetic: 'Kosmetisch', professional: 'Professionell', coverup: 'Cover-up' }
const GOAL_LABELS       = { full_removal: 'Vollständige Entfernung', full: 'Vollständige Entfernung', partial_fade: 'Teilweises Aufhellen', lightening_for_coverup: 'Aufhellen für Cover-up' }
const COVERUP_LABELS    = { none: 'Kein Cover-up', once: '1× überdeckt', multiple: 'Mehrfach überdeckt', unknown: 'Unbekannt' }

const APPT_TYPE_LABELS = {
  beratung:  'Beratung',
  treatment: 'Behandlung',
  first:     'Erstbehandlung',
}

const CANCELLED_APPT = new Set(['storniert', 'cancelled', 'completed'])

// ── Helpers ───────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('de-CH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const fmtCHF = (n) => (n != null ? `CHF ${Number(n).toFixed(2)}` : '—')

const pct = (n) => (n != null ? `${n} %` : '—')

const fmtTime = (t) => (t ? String(t).slice(0, 5) : '—')

const apptId = (value) => {
  if (!value) return ''
  if (typeof value === 'object') return String(value.id || value._id || '')
  return String(value)
}

const isRecordableAppointment = (appt, recordedIds) => {
  if (!appt) return false
  if (CANCELLED_APPT.has(appt.status)) return false
  if (appt.consultationOnly || appt.type === 'beratung') return false
  if (recordedIds.has(apptId(appt.id || appt._id))) return false
  return true
}

const customerId = (customer) =>
  typeof customer === 'object' && customer?.id ? customer.id : customer

const customerName = (customer) => {
  if (!customer || typeof customer !== 'object') return null
  const name = `${customer.vorname ?? ''} ${customer.nachname ?? ''}`.trim()
  return name || customer.email || null
}

// ── Sub-components ────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-studio-w3 text-[10px] font-semibold uppercase tracking-wider">{label}</span>
    <span className="text-studio-w1 text-[13px]">{value || '—'}</span>
  </div>
)

const StatChip = ({ label, value, hint }) => (
  <div className="flex flex-col gap-0.5 px-4 py-3 rounded-[10px] bg-studio-bg-4 border border-elaya-border">
    <span className="text-studio-w3 text-[10px] font-semibold uppercase tracking-wider">{label}</span>
    <span className="text-studio-white text-[16px] font-bold">{value}</span>
    {hint ? <span className="text-studio-w3 text-[10px] m-0">{hint}</span> : null}
  </div>
)

const SessionProgressBar = ({ done = 0, total = 0 }) => {
  const width = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-[5px] rounded-full bg-white/7">
        <div className="h-full rounded-full bg-studio-gold transition-all" style={{ width: `${width}%` }} />
      </div>
      <span className="text-studio-w3 text-[11px] tabular-nums shrink-0">{done}/{total}</span>
    </div>
  )
}

const PendingAppointmentRow = ({ appt, disabled, onRecord, copy, t }) => (
  <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-elaya-border last:border-0">
    <div className="min-w-0">
      <p className="text-studio-white text-[13px] font-medium m-0">
        {fmtDate(appt.date)}
        {appt.time ? ` · ${fmtTime(appt.time)}` : ''}
      </p>
      <p className="text-studio-w3 text-[11px] m-0 mt-0.5">
        {copy.apptTypes[appt.type] ?? appt.type}
        {appt.dauer_minuten != null ? ` · ${t('studioPages.caseDetail.minutes', { count: appt.dauer_minuten })}` : ''}
        {appt.status === 'gebucht' ? ` · ${copy.booked}` : ''}
      </p>
    </div>
    <Button
      size="sm"
      onClick={onRecord}
      disabled={disabled}
    >
      <ClipboardList size={13} />
      {copy.documentSession}
    </Button>
  </div>
)

const SessionRow = ({ s, onClick, copy, t }) => {
  const statusLabel = s.is_no_show ? copy.sessionStatus.noShow : s.is_draft ? copy.sessionStatus.draft : copy.sessionStatus.completed
  const statusColor = s.is_no_show
    ? 'bg-elaya-error/15 text-elaya-error'
    : s.is_draft
      ? 'bg-studio-gold/15 text-studio-gold-2'
      : 'bg-elaya-success/15 text-elaya-success'

  return (
    <tr
      className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-5 py-3 text-studio-w1 text-[12px] font-mono">#{s.session_number}</td>
      <td className="px-5 py-3 text-studio-w1 text-[12px]">{fmtDate(s.treatment_date)}</td>
      <td className="px-5 py-3 text-studio-w1 text-[12px]">
        {s.comparison_eligible === false
          ? t('studioPages.caseDetail.internalFade', { pct: pct(s.lightening_internal_pct ?? s.verblassung_prozent) })
          : pct(s.verblassung_prozent)}
      </td>
      <td className="px-5 py-3 text-studio-w1 text-[12px]">
        {s.comparison_eligible === false ? '—' : pct(s.removal_pct)}
      </td>
      <td className="px-5 py-3 text-studio-w1 text-[12px]">{fmtCHF(s.zahlung?.betragCHF)}</td>
      <td className="px-5 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor}`}>
          {statusLabel}
        </span>
      </td>
      <td className="px-5 py-3 text-studio-w3">
        <ChevronRight size={14} />
      </td>
    </tr>
  )
}

const ZoneRow = ({ z }) => (
  <tr className="border-b border-elaya-border last:border-0">
    <td className="px-5 py-3 text-studio-gold-2 text-[12px] font-mono">{z.zonen_id}</td>
    <td className="px-5 py-3 text-studio-w1 text-[12px]">{z.koerperstelle || z.bezeichnung || '—'}</td>
    <td className="px-5 py-3 text-studio-w1 text-[12px]">{z.flaeche_cm2 != null ? `${z.flaeche_cm2} cm²` : '—'}</td>
    <td className="px-5 py-3 text-studio-w1 text-[12px]">{pct(z.fortschritt_prozent)}</td>
    <td className="px-5 py-3 text-studio-w1 text-[12px]">
      {z.sitzungen_geschaetzt_min != null
        ? `${z.sitzungen_geschaetzt_min}–${z.sitzungen_geschaetzt_max}`
        : '—'}
    </td>
    <td className="px-5 py-3 text-studio-w3">
      <ChevronRight size={14} />
    </td>
  </tr>
)

// ── Estimate confirmation ─────────────────────────────────────────────────
const ESTIMATE_STATUS_CLASSES = {
  offen: 'bg-elaya-warning/15 text-elaya-warning',
  bestaetigt: 'bg-elaya-success/15 text-elaya-success',
  angepasst: 'bg-studio-blue/15 text-studio-blue',
}

const EstimateConfirmationPanel = ({ caseId, caseData, onUpdated }) => {
  const { t, studioPages } = useContent()
  const copy = studioPages.caseDetail
  const ep = copy.estimatePanel
  const confirmation = caseData.estimate_confirmation ?? { status: 'offen' }
  const status = confirmation.status ?? 'offen'
  const statusLabel =
    status === 'bestaetigt'
      ? ep.statusBestaetigt
      : status === 'angepasst'
        ? ep.statusAngepasst
        : ep.statusOffen
  const statusClasses = ESTIMATE_STATUS_CLASSES[status] ?? ESTIMATE_STATUS_CLASSES.offen

  const triggerLabel = (id) =>
    t(`studioPages.caseDetail.reviewTriggers.${id}`, { defaultValue: id })

  const [saving, setSaving] = useState(false)
  const [notiz, setNotiz] = useState('')
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [adjustForm, setAdjustForm] = useState({
    pricePerSession: '',
    sessionsMin: '',
    sessionsMax: '',
    notiz: '',
  })

  const submit = async (payload, successMessage) => {
    setSaving(true)
    try {
      const res = await updateEstimateConfirmation(caseId, payload)
      const d = res.data.data
      onUpdated(d)
      toast.success(
        d.chat_notified
          ? t('studioPages.caseDetail.estimatePanel.toastChatNotified', { message: successMessage })
          : successMessage
      )
      setNotiz('')
      setAdjustOpen(false)
      return true
    } catch (err) {
      toast.error(err?.response?.data?.message ?? copy.estimateSaveFailed)
      return false
    } finally {
      setSaving(false)
    }
  }

  const confirmEstimate = () =>
    submit(
      { status: 'bestaetigt', ...(notiz.trim() ? { notiz: notiz.trim() } : {}) },
      ep.toastConfirmed
    )

  const reopenEstimate = () => submit({ status: 'offen' }, ep.toastReopened)

  const openAdjust = () => {
    setAdjustForm({
      pricePerSession: caseData.pricePerSession != null ? String(caseData.pricePerSession) : '',
      sessionsMin: caseData.sessionsMin != null ? String(caseData.sessionsMin) : '',
      sessionsMax: caseData.sessionsMax != null ? String(caseData.sessionsMax) : '',
      notiz: '',
    })
    setAdjustOpen(true)
  }

  const submitAdjust = () => {
    const price = parseFloat(adjustForm.pricePerSession)
    const min = parseInt(adjustForm.sessionsMin, 10)
    const max = parseInt(adjustForm.sessionsMax, 10)
    if (Number.isNaN(price) || Number.isNaN(min) || Number.isNaN(max)) {
      toast.error(t('studioPages.caseDetail.estimateRequired'))
      return
    }
    submit(
      {
        status: 'angepasst',
        pricePerSession: price,
        sessionsMin: min,
        sessionsMax: max,
        ...(adjustForm.notiz.trim() ? { notiz: adjustForm.notiz.trim() } : {}),
      },
      ep.toastAdjusted
    )
  }

  const setAdjust = (field) => (e) =>
    setAdjustForm((prev) => ({ ...prev, [field]: e.target.value }))

  const confirmed = ['bestaetigt', 'angepasst'].includes(status)
  const displayPrice = confirmed
    ? (caseData.confirmed_pricePerSession ?? confirmation.pricePerSession ?? caseData.pricePerSession)
    : (caseData.calculated_pricePerSession ?? caseData.pricePerSession)
  const displayMin = confirmed
    ? (caseData.confirmed_sessionsMin ?? caseData.sessionsMin)
    : caseData.sessionsMin
  const displayMax = confirmed
    ? (caseData.confirmed_sessionsMax ?? caseData.sessionsMax)
    : caseData.sessionsMax
  const totalMin = displayPrice > 0 && displayMin != null ? displayPrice * displayMin : null
  const totalMax = displayPrice > 0 && displayMax != null ? displayPrice * displayMax : null

  const sessionsLabel = (min, max) =>
    min != null && max != null
      ? t('studioPages.caseDetail.estimatePanel.sessionsValue', { min, max })
      : null

  return (
    <>
      <Card className="flex flex-col gap-3">
        <h3 className="text-[13px] font-semibold text-studio-white m-0">
          {ep.title}
        </h3>

        <span className={`inline-flex self-start items-center px-2 py-1 rounded-full text-[10px] font-semibold ${statusClasses}`}>
          {statusLabel}
        </span>

        {status !== 'offen' && (confirmation.datum || confirmation.bestaetigt_von) && (
          <p className="text-studio-w3 text-[11px] m-0 -mt-1">
            {[fmtDate(confirmation.datum), confirmation.bestaetigt_von].filter(Boolean).join(' · ')}
          </p>
        )}

        <InfoRow
          label={ep.calculatedPrice}
          value={fmtCHF(caseData.calculated_pricePerSession ?? (!['bestaetigt', 'angepasst'].includes(status) ? caseData.pricePerSession : null))}
        />
        <InfoRow
          label={ep.confirmedPrice}
          value={
            ['bestaetigt', 'angepasst'].includes(status)
              ? fmtCHF(caseData.confirmed_pricePerSession ?? confirmation.pricePerSession ?? caseData.pricePerSession)
              : ep.notConfirmed
          }
        />
        <InfoRow
          label={ep.sessionRange}
          value={
            ['bestaetigt', 'angepasst'].includes(status) && caseData.confirmed_sessionsMin != null
              ? sessionsLabel(caseData.confirmed_sessionsMin, caseData.confirmed_sessionsMax)
              : sessionsLabel(caseData.sessionsMin, caseData.sessionsMax)
          }
        />
        {status !== 'offen' && caseData.calculated_sessionsMin != null && (
          <InfoRow
            label={ep.calculatedSessions}
            value={sessionsLabel(caseData.calculated_sessionsMin, caseData.calculated_sessionsMax)}
          />
        )}
        {totalMin != null && totalMax != null && (
          <InfoRow
            label={ep.totalCost}
            value={`${fmtCHF(totalMin)} – ${fmtCHF(totalMax)}`}
          />
        )}
        {confirmation.notiz && <InfoRow label={ep.note} value={confirmation.notiz} />}

        {status === 'offen' && caseData.estimate_needs_review && (
          <div className="rounded-[10px] border border-elaya-warning/40 bg-elaya-warning/10 px-3 py-2">
            <p className="text-elaya-warning text-[11px] font-semibold m-0 mb-1">
              {ep.reviewTitle}
            </p>
            <p className="text-studio-w2 text-[11px] m-0 leading-relaxed">
              {ep.reviewBody}
              {(caseData.estimate_review_triggers || []).length > 0
                ? ` · ${(caseData.estimate_review_triggers || []).map(triggerLabel).join(', ')}`
                : ''}
            </p>
          </div>
        )}

        <p className="text-studio-w3 text-[11px] m-0">
          {ep.transparency}
        </p>

        {!caseData.read_only && (
          status === 'offen' ? (
            <div className="flex flex-col gap-2 pt-1 border-t border-elaya-border">
              <textarea
                value={notiz}
                onChange={(e) => setNotiz(e.target.value)}
                rows={2}
                placeholder={copy.customerNotePlaceholder}
                className="w-full px-3 py-2 rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-w1 text-[12px] outline-none focus:border-studio-gold transition-colors placeholder:text-studio-w3 resize-none"
              />
              <Button size="sm" loading={saving} onClick={confirmEstimate} className="w-full">
                {ep.confirm}
              </Button>
              <Button size="sm" variant="secondary" disabled={saving} onClick={openAdjust} className="w-full">
                {ep.adjust}
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="secondary" loading={saving} onClick={reopenEstimate} className="w-full">
              {ep.reopen}
            </Button>
          )
        )}
      </Card>

      {adjustOpen && (
        <Modal title={copy.adjustEstimateTitle} onClose={() => setAdjustOpen(false)}>
          <div className="flex flex-col gap-3">
            <Input
              label={ep.pricePerSession}
              type="number"
              min={0}
              step="0.01"
              value={adjustForm.pricePerSession}
              onChange={setAdjust('pricePerSession')}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={ep.sessionsMin}
                type="number"
                min={1}
                step="1"
                value={adjustForm.sessionsMin}
                onChange={setAdjust('sessionsMin')}
              />
              <Input
                label={ep.sessionsMax}
                type="number"
                min={1}
                step="1"
                value={adjustForm.sessionsMax}
                onChange={setAdjust('sessionsMax')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="estimate-notiz" className="text-studio-white text-[12px] font-semibold">
                {ep.customerNoteLabel}
              </label>
              <textarea
                id="estimate-notiz"
                rows={3}
                value={adjustForm.notiz}
                onChange={setAdjust('notiz')}
                className="w-full px-3 py-2 rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-w1 text-[12px] outline-none focus:border-studio-gold transition-colors placeholder:text-studio-w3 resize-y"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={() => setAdjustOpen(false)} disabled={saving}>
                {ep.cancel}
              </Button>
              <Button loading={saving} onClick={submitAdjust}>
                {ep.saveAdjustment}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────
const CaseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { t, studioPages } = useContent()
  const copy = studioPages.caseDetail
  const CASE_STATUSES = [
    { value: 'draft', label: copy.statuses.draft },
    { value: 'pending', label: copy.statuses.pending },
    { value: 'active', label: copy.statuses.active },
    { value: 'completed', label: copy.statuses.completed },
    { value: 'loeschantrag_ausstehend', label: copy.statuses.loeschantrag_ausstehend },
  ]
  const SESSION_HEADERS = [
    copy.sessionHeaders.nr, copy.sessionHeaders.date, copy.sessionHeaders.fade,
    copy.sessionHeaders.removal, copy.sessionHeaders.payment, copy.sessionHeaders.status, '',
  ]
  const ZONE_HEADERS = [
    copy.zoneHeaders.id, copy.zoneHeaders.body, copy.zoneHeaders.area,
    copy.zoneHeaders.progress, copy.zoneHeaders.sessionsEst, '',
  ]

  const [caseData, setCaseData] = useState(null)
  const [sessions, setSessions] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)

  useEffect(() => {
    const msg = location.state?.createdToast
    if (!msg) return
    toast.success(msg, { id: 'case-created-flash' })
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    const load = async () => {
      try {
        const [caseRes, sessRes, apptRes] = await Promise.all([
          getCase(id),
          listSessions({ case_id: id, limit: 50 }),
          listAppointments({ case_id: id, limit: 50 }).catch(() => ({
            data: { data: { appointments: [] } },
          })),
        ])
        const c = caseRes.data.data.case
        setCaseData(c)
        setStatus(c.status)
        setSessions(sessRes.data.data.sessions)
        setAppointments(apptRes.data.data.appointments ?? [])
      } catch {
        toast.error(copy.loadError)
        navigate(-1)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate])

  const saveStatus = async () => {
    setSavingStatus(true)
    try {
      await updateCase(id, { status })
      setCaseData((prev) => ({ ...prev, status }))
      toast.success(copy.statusUpdated)
    } catch {
      toast.error(copy.saveError)
    } finally {
      setSavingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!caseData) return null

  const caseTitle = caseData.tc_title || copy.caseTypes[caseData.type] || caseData.type
  const hasSessions = sessions.length > 0
  const recordedApptIds = new Set(
    sessions.map((s) => apptId(s.appointment)).filter(Boolean)
  )
  const pendingAppointments = appointments.filter((appt) =>
    isRecordableAppointment(appt, recordedApptIds)
  )
  const hasZones = caseData.zonen_aktiv && caseData.zonen?.length > 0
  const custId = customerId(caseData.customer)
  const custName = customerName(caseData.customer)
  const headerSubtitle = [caseData.caseId, custName].filter(Boolean).join(' · ')

  return (
    <div className="p-6 max-w-[1100px]">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(custId ? `/studio/customers/${custId}` : -1)}
        className="flex items-center gap-1.5 text-studio-w2 text-[12px] mb-5 hover:text-studio-white transition-colors cursor-pointer bg-transparent border-0"
      >
        <ArrowLeft size={13} />
        {custName ? t('studioPages.caseDetail.backToCustomer', { name: custName }) : copy.back}
      </button>

      <PageHeader title={caseTitle} subtitle={headerSubtitle}>
        <MedicalAmpelDot
          level={caseData.medical_flag_level}
          pending={!caseData.anamnesis_complete}
          count={caseData.open_medical_flags_count}
          labelMode="inline"
        />
        <Badge variant="status" value={caseData.status}>{caseData.status}</Badge>
        {caseData.transferiert ? (
          <Badge variant="source" value="studio_wechsel">{copy.transferred}</Badge>
        ) : null}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => navigate(`/studio/elaya?customerId=${custId}&caseId=${id}`)}
        >
          <Sparkles size={13} />
          Elaya
        </Button>
        <Button size="sm" variant="secondary" onClick={() => navigate(`/studio/appointments?case_id=${id}&customer_id=${custId}&book=1`)} disabled={caseData.read_only}>
          {copy.bookAppointment}
        </Button>
        <Button size="sm" onClick={() => navigate(`/studio/sessions/new?case_id=${id}`)} disabled={caseData.read_only}>
          <Plus size={13} />
          {copy.newSession}
        </Button>
      </PageHeader>

      {caseData.transferiert && (
        <div className="mb-5 px-4 py-3 rounded-[12px] border border-studio-gold/30 bg-studio-gold/10">
          <p className="text-studio-gold-2 text-[13px] font-semibold m-0">
            {copy.transferBannerTitle}
          </p>
          <p className="text-studio-w2 text-[12px] m-0 mt-1">
            {copy.transferBannerBody}
          </p>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatChip
          label={copy.stats.sessions}
          value={`${caseData.sessionsDone ?? 0} / ${caseData.sessions ?? 0}`}
        />
        <StatChip
          label={copy.stats.lastSession}
          value={fmtDate(caseData.lastSessionDate)}
        />
        <StatChip
          label={copy.stats.calculatedPrice}
          value={fmtCHF(caseData.calculated_pricePerSession ?? caseData.pricePerSession)}
          hint={copy.stats.systemAi}
        />
        <StatChip
          label={copy.stats.confirmedPrice}
          value={
            ['bestaetigt', 'angepasst'].includes(caseData.estimate_confirmation?.status)
              ? fmtCHF(caseData.confirmed_pricePerSession ?? caseData.pricePerSession)
              : '—'
          }
          hint={
            ['bestaetigt', 'angepasst'].includes(caseData.estimate_confirmation?.status)
              ? copy.stats.studio
              : copy.stats.stillOpen
          }
        />
        <StatChip
          label={copy.stats.goal}
          value={copy.goals[caseData.goal_target] ?? caseData.goal_target ?? '—'}
        />
      </div>

      <div className="flex gap-5 items-start">

        {/* ── Left column ── */}
        <div className="flex flex-col gap-5 flex-1 min-w-0">

          {/* Tattoo intake */}
          <Card>
            <h2 className="text-[13px] font-semibold text-studio-white m-0 mb-4 pb-3 border-b border-elaya-border">
              {copy.tattooSection}
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <InfoRow label={copy.labels.type}            value={copy.caseTypes[caseData.type] ?? caseData.type} />
              <InfoRow label={copy.labels.body}   value={caseData.bodyLabel} />
              <InfoRow label={copy.labels.tattooType} value={copy.tcTypes[caseData.tc_type] ?? caseData.tc_type} />
              <InfoRow label={copy.labels.coverup}        value={copy.coverup[caseData.tc_coverup] ?? caseData.tc_coverup} />
              <InfoRow label={copy.labels.size}
                value={
                  caseData.tc_size_length && caseData.tc_size_width
                    ? `${caseData.tc_size_length} × ${caseData.tc_size_width} cm`
                    : null
                }
              />
              <InfoRow label={copy.labels.ageYears}  value={caseData.tc_age_years != null ? t('studioPages.caseDetail.labels.ageYearsValue', { years: caseData.tc_age_years }) : null} />
              <InfoRow label={copy.labels.colors}
                value={
                  Array.isArray(caseData.tc_colors_present) && caseData.tc_colors_present.length
                    ? caseData.tc_colors_present.join(', ')
                    : caseData.tc_colors_present ? copy.labels.yes : copy.labels.no
                }
              />
              <InfoRow label="Fitzpatrick"    value={caseData.skin_fitzpatrick ? `Typ ${caseData.skin_fitzpatrick}` : null} />
            </div>

            {/* Session progress inside anamnesis */}
            <div className="mt-5 pt-4 border-t border-elaya-border">
              <p className="text-studio-w3 text-[10px] font-semibold uppercase tracking-wider mb-2">Sitzungsfortschritt</p>
              <SessionProgressBar done={caseData.sessionsDone} total={caseData.sessions} />
              {caseData.sessionsMin != null && (
                <p className="text-studio-w3 text-[11px] mt-1.5 m-0">
                  Geschätzt: {caseData.sessionsMin}–{caseData.sessionsMax} Sitzungen
                </p>
              )}
            </div>
          </Card>

          <CaseIntakePhotos caseData={caseData} />

          {/* Medical anamnesis */}
          <CaseAnamnesisPanel
            caseId={id}
            onCaseFlagsChange={(flags) => {
              if (!flags) return
              setCaseData((prev) =>
                prev
                  ? {
                      ...prev,
                      ...(flags.medical_flag_level !== undefined
                        ? { medical_flag_level: flags.medical_flag_level }
                        : {}),
                      ...(flags.open_medical_flags_count !== undefined
                        ? { open_medical_flags_count: flags.open_medical_flags_count }
                        : {}),
                      ...(flags.studio_freigabe
                        ? { studio_freigabe: flags.studio_freigabe }
                        : {}),
                    }
                  : prev
              )
            }}
          />

          {/* TC_08–09 Merkblatt & signature */}
          <CaseSignaturePanel
            caseId={id}
            caseData={caseData}
            onUpdated={async () => {
              const res = await getCase(id)
              setCaseData(res.data.data.case)
            }}
          />

          {/* Sessions log */}
          <Card padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-elaya-border">
              <h2 className="text-[14px] font-semibold text-studio-white m-0">
                {copy.sessionsTitle}
                <span className="ml-2 text-studio-w3 text-[12px] font-normal">({sessions.length})</span>
              </h2>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate(`/studio/sessions/new?case_id=${id}`)}
                disabled={caseData.read_only}
              >
                <Plus size={13} />
                {copy.newSession}
              </Button>
            </div>

            {pendingAppointments.length > 0 && (
              <div className="border-b border-elaya-border bg-studio-gold/5">
                <p className="px-5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-studio-gold-2 m-0">
                  {copy.pendingApptsTitle}
                </p>
                {pendingAppointments.map((appt) => (
                  <PendingAppointmentRow
                    key={appt.id || appt._id}
                    appt={appt}
                    copy={copy}
                    t={t}
                    disabled={caseData.read_only}
                    onRecord={() =>
                      navigate(
                        `/studio/sessions/new?case_id=${id}&appointment_id=${appt.id || appt._id}`
                      )
                    }
                  />
                ))}
              </div>
            )}

            {!hasSessions ? (
              <div className="py-10 text-center">
                <p className="text-studio-w2 text-[13px] m-0">
                  {pendingAppointments.length
                    ? copy.emptySessionsPending
                    : copy.emptySessions}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-elaya-border">
                      {SESSION_HEADERS.map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-studio-w3 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <SessionRow
                        key={s.id}
                        s={s}
                        copy={copy}
                        t={t}
                        onClick={() => navigate(`/studio/sessions/${s.id}`)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Zones (only if active) */}
          {hasZones && (
            <Card padding="none">
              <div className="px-5 py-4 border-b border-elaya-border">
                <h2 className="text-[14px] font-semibold text-studio-white m-0">
                  {copy.zonesTitle}
                  <span className="ml-2 text-studio-w3 text-[12px] font-normal">({caseData.zonen.length})</span>
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-elaya-border">
                      {ZONE_HEADERS.map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-studio-w3 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {caseData.zonen.map((z) => (
                      <ZoneRow key={z.id} z={z} />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="flex flex-col gap-5 w-[260px] shrink-0">

          {/* Status */}
          <Card className="flex flex-col gap-4">
            <h3 className="text-[13px] font-semibold text-studio-white m-0">{copy.statusTitle}</h3>
            <div className="flex flex-col gap-1.5">
              {CASE_STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[12px] text-left cursor-pointer border transition-colors w-full
                    ${status === s.value
                      ? 'border-studio-gold/40 bg-studio-gold/10 text-studio-white font-semibold'
                      : 'border-elaya-border bg-transparent text-studio-w2 hover:border-elaya-border-strong hover:text-studio-white'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status === s.value ? 'bg-studio-gold' : 'bg-studio-w4'}`} />
                  {s.label}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              variant="secondary"
              loading={savingStatus}
              disabled={status === caseData.status}
              onClick={saveStatus}
              className="w-full"
            >
              {copy.saveStatus}
            </Button>
          </Card>

          {/* Pricing from rules engine */}
          <CasePricingPanel caseId={id} />

          {/* Lockout / availability from rules engine */}
          <CaseAvailabilityPanel caseId={id} customerId={custId} />

          {/* Legacy UV / med dates on case record */}
          {(caseData.uvBlockDate || caseData.medicationBlockDate) && (
            <Card className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={13} className="text-elaya-warning shrink-0" />
                <h3 className="text-[13px] font-semibold text-studio-white m-0">Fall-Sperren (Daten)</h3>
              </div>
              {caseData.uvBlockDate && (
                <InfoRow label="UV-Sperre bis" value={fmtDate(caseData.uvBlockDate)} />
              )}
              {caseData.medicationBlockDate && (
                <InfoRow label="Medikamenten-Sperre" value={fmtDate(caseData.medicationBlockDate)} />
              )}
            </Card>
          )}

          {/* AI estimate + studio confirmation */}
          <EstimateConfirmationPanel
            caseId={id}
            caseData={caseData}
            onUpdated={(d) =>
              setCaseData((prev) =>
                prev
                  ? {
                      ...prev,
                      pricePerSession: d.pricePerSession,
                      sessionsMin: d.sessionsMin,
                      sessionsMax: d.sessionsMax,
                      calculated_pricePerSession: d.calculated_pricePerSession,
                      calculated_sessionsMin: d.calculated_sessionsMin,
                      calculated_sessionsMax: d.calculated_sessionsMax,
                      confirmed_pricePerSession: d.confirmed_pricePerSession,
                      confirmed_sessionsMin: d.confirmed_sessionsMin,
                      confirmed_sessionsMax: d.confirmed_sessionsMax,
                      estimate_confirmation: d.estimate_confirmation,
                    }
                  : prev
              )
            }
          />

        </div>
      </div>
    </div>
  )
}

export default CaseDetail
