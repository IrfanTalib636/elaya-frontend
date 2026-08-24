import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Plus, Pencil, Calendar, ArrowLeftRight, MessageCircle, ScrollText, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCustomer, updateCustomer } from '../../api/customers'
import { createCase } from '../../api/cases'
import { getApiErrorMessage } from '../../lib/apiError'
import { listAppointments } from '../../api/appointments'
import { Card, Badge, Button, Input, Spinner, PageHeader, Modal } from '../../components/ui'
import CaseForm from '../../components/forms/CaseForm'
import CustomerAvatar from '../../components/CustomerAvatar'
import MedicalAmpelDot from '../../components/medical/MedicalAmpelDot'
import ActivityFeed from '../../components/activity/ActivityFeed'
import useContent from '../../i18n/useContent'
import { PIPELINE_VALUES } from '../../constants/pipeline'

// ── Helpers (labels from useContent in page) ─────────────────────────────

// ── Helpers ───────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

const fmtShortDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('de-CH', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

// ── Sub-components ────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-studio-w3 text-[10px] font-semibold uppercase tracking-wider">{label}</span>
    <span className="text-studio-w1 text-[13px]">{value || '—'}</span>
  </div>
)

const SessionBar = ({ done = 0, total = 0 }) => {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-[5px] rounded-full bg-white/7">
        <div className="h-full rounded-full bg-studio-gold transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-studio-w3 text-[11px] shrink-0 tabular-nums">{done}/{total}</span>
    </div>
  )
}

const StudioTimeline = ({ timeline = [], copy }) => {
  if (!timeline.length) return null

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ArrowLeftRight size={14} className="text-studio-gold-2 shrink-0" />
        <h3 className="text-[13px] font-semibold text-studio-white m-0">{copy.studioTimeline}</h3>
      </div>

      <ol className="m-0 p-0 list-none flex flex-col">
        {timeline.map((entry, index) => {
          const isLast = index === timeline.length - 1
          const grundLabel = copy.firmaGrund[entry.grund] ?? entry.grund ?? '—'

          return (
            <li key={`${entry.firma_id}-${entry.von}`} className="relative flex gap-3 pb-4 last:pb-0">
              {!isLast && (
                <span
                  className="absolute left-[5px] top-3 bottom-0 w-px bg-elaya-border"
                  aria-hidden="true"
                />
              )}

              <span
                className={`relative z-1 mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-studio-bg-3
                  ${entry.is_current ? 'bg-studio-gold' : 'bg-studio-w4'}`}
                aria-hidden="true"
              />

              <div className="min-w-0 flex-1">
                <p className={`text-[12px] font-semibold m-0 leading-snug ${entry.is_current ? 'text-studio-white' : 'text-studio-w1'}`}>
                  {entry.firma_name}
                  {entry.is_current ? (
                    <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-studio-gold-2">
                      {copy.current}
                    </span>
                  ) : null}
                </p>
                <p className="text-studio-w3 text-[11px] m-0 mt-0.5 tabular-nums">
                  {fmtShortDate(entry.von)}
                  {' – '}
                  {entry.is_current ? copy.untilToday : fmtShortDate(entry.bis)}
                </p>
                <p className="text-studio-w2 text-[11px] m-0 mt-1">{grundLabel}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}

const ApptRow = ({ appt, onClick, copy }) => {
  const date = new Date(appt.date)
  const fmtD = date.toLocaleDateString('de-CH', { day: 'numeric', month: 'short', year: 'numeric' })
  const isPast = date < new Date()

  return (
    <tr
      className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className={`px-5 py-3 text-[12px] ${isPast ? 'text-studio-w2' : 'text-studio-white font-medium'}`}>{fmtD}</td>
      <td className="px-5 py-3 text-studio-w1 text-[12px] font-mono">{appt.time ?? '—'}</td>
      <td className="px-5 py-3 text-studio-gold-2 text-[12px] font-mono">{appt.case?.caseId ?? '—'}</td>
      <td className="px-5 py-3 text-studio-w2 text-[12px]">{copy.apptTypes[appt.type] ?? appt.type}</td>
      <td className="px-5 py-3">
        <Badge variant="status" value={appt.status}>{copy.apptStatuses[appt.status] ?? appt.status}</Badge>
      </td>
    </tr>
  )
}

const CaseRow = ({ c, onClick, copy }) => (
  <tr
    className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4 cursor-pointer transition-colors"
    onClick={onClick}
  >
    <td className="px-5 py-3">
      <MedicalAmpelDot
        level={c.medical_flag_level}
        pending={!c.anamnesis_complete}
        count={c.open_medical_flags_count}
        size="sm"
      />
    </td>
    <td className="px-5 py-3 text-studio-gold-2 text-[12px] font-mono">{c.caseId}</td>
    <td className="px-5 py-3 text-studio-w1 text-[13px]">
      <span className="inline-flex items-center gap-2 flex-wrap">
        {c.tc_title || copy.caseTypes[c.type] || c.type}
        {c.transferiert ? (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-studio-gold-2 bg-studio-gold/10 px-1.5 py-0.5 rounded">
            {copy.transferred}
          </span>
        ) : null}
      </span>
    </td>
    <td className="px-5 py-3">
      <Badge variant="status" value={c.status}>{c.status}</Badge>
    </td>
    <td className="px-5 py-3">
      <SessionBar done={c.sessionsDone} total={c.sessions} />
    </td>
    <td className="px-5 py-3 text-studio-w2 text-[12px]">{fmtDate(c.lastSessionDate)}</td>
    <td className="px-5 py-3 text-studio-w3">
      <ChevronRight size={14} />
    </td>
  </tr>
)

// ── Page ──────────────────────────────────────────────────────────────────
const CustomerDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, studioPages, studioActivity: activityCopy } = useContent()
  const copy = studioPages.customerDetail
  const PIPELINE_STAGES = PIPELINE_VALUES
  const CASE_TABLE_HEADERS = [
    copy.caseHeaders.ampel, copy.caseHeaders.caseId, copy.caseHeaders.label,
    copy.caseHeaders.status, copy.caseHeaders.progress, copy.caseHeaders.lastSession, '',
  ]
  const APPT_TABLE_HEADERS = [
    copy.apptHeaders.date, copy.apptHeaders.time, copy.apptHeaders.case,
    copy.apptHeaders.type, copy.apptHeaders.status,
  ]


  const [customer, setCustomer]     = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]       = useState(true)
  const [pipeline, setPipeline]     = useState('')
  const [notes, setNotes]           = useState('')
  const [savingPipeline, setSavingPipeline] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [showCaseModal,  setShowCaseModal]  = useState(false)
  const [caseFormStep, setCaseFormStep]     = useState(0)
  const [creatingCase,   setCreatingCase]   = useState(false)
  const [showEditModal,  setShowEditModal]  = useState(false)
  const [editForm,       setEditForm]       = useState({})
  const [savingEdit,     setSavingEdit]     = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [custRes, apptRes] = await Promise.all([
          getCustomer(id),
          listAppointments({ customer_id: id, limit: 100 }),
        ])
        const c = custRes.data.data.customer
        setCustomer(c)
        setPipeline(c.pipeline_stufe ?? '')
        setNotes(c.notizen ?? '')
        const appts = apptRes.data.data.appointments ?? []
        setAppointments(appts.sort((a, b) => new Date(b.date) - new Date(a.date)))
      } catch {
        toast.error(copy.loadError)
        navigate('/studio/customers')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate])

  const savePipeline = async () => {
    setSavingPipeline(true)
    try {
      await updateCustomer(id, { pipeline_stufe: pipeline })
      setCustomer((prev) => ({ ...prev, pipeline_stufe: pipeline }))
      toast.success(copy.pipelineUpdated)
    } catch {
      toast.error(copy.saveError)
    } finally {
      setSavingPipeline(false)
    }
  }

  const saveNotes = async () => {
    setSavingNotes(true)
    try {
      await updateCustomer(id, { notizen: notes })
      setCustomer((prev) => ({ ...prev, notizen: notes }))
      toast.success(copy.notesSaved)
    } catch {
      toast.error(copy.saveError)
    } finally {
      setSavingNotes(false)
    }
  }

  const handleCreateCase = async (form) => {
    if (creatingCase) return
    setCreatingCase(true)
    try {
      const res = await createCase({ ...form, customer_id: id })
      const caseId = res.data?.data?.case?.id
      if (!caseId) {
        throw new Error('Fall wurde angelegt, aber die Antwort war unvollständig.')
      }
      // Navigate away in one step — avoids modal close + toast + navigate race (React 19 removeChild)
      navigate(`/studio/cases/${caseId}`, {
        state: { createdToast: 'Fall erfolgreich angelegt.' },
      })
    } catch (err) {
      setCreatingCase(false)
      toast.error(getApiErrorMessage(err, copy.caseCreateError))
    }
  }

  const openEdit = () => {
    setEditForm({
      vorname:      customer.vorname      ?? '',
      nachname:     customer.nachname     ?? '',
      email:        customer.email        ?? '',
      telefon:      customer.telefon      ?? '',
      geburtsdatum: customer.geburtsdatum ? customer.geburtsdatum.slice(0, 10) : '',
      strasse:      customer.strasse      ?? '',
      plz:          customer.plz          ?? '',
      ort:          customer.ort          ?? '',
      land:         customer.land         ?? '',
    })
    setShowEditModal(true)
  }

  const saveEdit = async () => {
    setSavingEdit(true)
    try {
      await updateCustomer(id, editForm)
      setCustomer((prev) => ({ ...prev, ...editForm }))
      setShowEditModal(false)
      toast.success(copy.customerUpdated)
    } catch (err) {
      toast.error(err.response?.data?.message ?? copy.saveError)
    } finally {
      setSavingEdit(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!customer) return null

  const fullName   = `${customer.vorname} ${customer.nachname}`
  const address    = [customer.strasse, customer.plz, customer.ort, customer.land].filter(Boolean).join(', ')
  const caseCount  = customer.cases?.length ?? 0

  return (
    <div className="p-6 max-w-[1100px]">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/studio/customers')}
        className="flex items-center gap-1.5 text-studio-w2 text-[12px] mb-5 hover:text-studio-white transition-colors cursor-pointer bg-transparent border-0"
      >
        <ArrowLeft size={13} />
        {copy.backToCustomers}
      </button>

      <PageHeader title={fullName} subtitle={customer.email}>
        <MedicalAmpelDot
          level={customer.worst_medical_flag_level}
          pending={!customer.worst_medical_flag_level && (customer.pending_anamnesis_count ?? 0) > 0}
          count={customer.open_medical_flags_count}
          labelMode="inline"
        />
        <Badge variant="pipeline" value={customer.pipeline_stufe}>{customer.pipeline_stufe}</Badge>
        <Badge variant="source"   value={customer.akquise_quelle}>
          {copy.sources[customer.akquise_quelle] ?? customer.akquise_quelle}
        </Badge>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/studio/elaya?customerId=${id}`)}
        >
          <Sparkles size={14} />
          Elaya
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/studio/chat?customerId=${id}`)}
        >
          <MessageCircle size={14} />
          Chat
        </Button>
      </PageHeader>

      {customer.wechsel_status === 'transferiert_ein' && (
        <div className="mb-5 px-4 py-3 rounded-[12px] border border-studio-gold/30 bg-studio-gold/10">
          <p className="text-studio-gold-2 text-[13px] font-semibold m-0 mb-1">
            {copy.transferInTitle}
          </p>
          <p className="text-studio-w2 text-[12px] m-0 leading-relaxed">
            {t('studioPages.customerDetail.transferInBody', {
              prev: customer.vorheriges_studio_name
                ? t('studioPages.customerDetail.transferInPrev', { name: customer.vorheriges_studio_name })
                : '',
              since: customer.transferiert_am
                ? t('studioPages.customerDetail.transferInSince', { date: fmtDate(customer.transferiert_am) })
                : '',
            })}
          </p>
          <p className="text-studio-teal-2 text-[12px] font-mono font-semibold m-0 mt-2">
            {t('studioPages.customerDetail.elaycoins', { count: customer.elaycoins_balance ?? customer.elaycoins?.balance ?? 0 })}
          </p>
        </div>
      )}

      {customer.wechsel_status === 'transferiert_aus' && (
        <div className="mb-5 px-4 py-3 rounded-[12px] border border-[#ff9a3c]/35 bg-[#ff9a3c]/10">
          <p className="text-[#ff9a3c] text-[13px] font-semibold m-0 mb-1">
            {t('studioPages.customerDetail.transferOutTitle', {
              studio: customer.aktuelle_firma_name || copy.transferOutStudioFallback,
            })}
          </p>
          <p className="text-studio-w2 text-[12px] m-0 leading-relaxed">
            {copy.transferOutBody}
          </p>
        </div>
      )}

      <div className="flex gap-5 items-start">

        {/* ── Left column ── */}
        <div className="flex flex-col gap-5 flex-1 min-w-0">

          {/* Personal info */}
          <Card>
            <div className="flex items-center justify-between mb-5 pb-5 border-b border-elaya-border">
              <div className="flex items-center gap-4" translate="no">
                <CustomerAvatar vorname={customer.vorname} nachname={customer.nachname} size="lg" />
                <div>
                  <p className="text-studio-white text-[16px] font-bold m-0">{fullName}</p>
                  <p className="text-studio-w3 text-[12px] m-0 mt-0.5">
                    {t('studioPages.customerDetail.sinceAccount', {
                      date: fmtDate(customer.stufe_seit),
                      status: customer.user?.status ?? '—',
                    })}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={openEdit} disabled={customer.read_only}>
                <Pencil size={12} />
                {copy.edit}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <InfoRow label={copy.labels.email}         value={customer.email} />
              <InfoRow label={copy.labels.phone}        value={customer.telefon} />
              <InfoRow label={copy.labels.birthDate}   value={fmtDate(customer.geburtsdatum)} />
              <InfoRow label={copy.labels.address}        value={address} />
              <InfoRow label={copy.labels.lastLogin}  value={fmtDate(customer.user?.last_login)} />
              <InfoRow label={copy.labels.accountStatus}   value={customer.user?.status} />
            </div>
          </Card>

          {/* Cases */}
          <Card padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-elaya-border">
              <h2 className="text-[14px] font-semibold text-studio-white m-0">
                {copy.casesTitle}
                <span className="ml-2 text-studio-w3 text-[12px] font-normal">({caseCount})</span>
              </h2>
              <Button size="sm" variant="secondary" onClick={() => setShowCaseModal(true)} disabled={customer.read_only}>
                <Plus size={13} />
                {copy.newCase}
              </Button>
            </div>

            {caseCount === 0 ? (
              <div className="py-10 text-center">
                <p className="text-studio-w2 text-[13px] m-0">{copy.noCases}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-elaya-border">
                      {CASE_TABLE_HEADERS.map((h, i) => (
                        <th
                          key={`${h}-${i}`}
                          className="px-5 py-3 text-left text-[10px] font-semibold text-studio-w3 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customer.cases.map((c) => (
                      <CaseRow
                        key={c._id}
                        c={c}
                        copy={copy}
                        onClick={() => navigate(`/studio/cases/${c._id}`)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
          {/* Appointments */}
          <Card padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-elaya-border">
              <h2 className="text-[14px] font-semibold text-studio-white m-0">
                {copy.appointmentsTitle}
                <span className="ml-2 text-studio-w3 text-[12px] font-normal">({appointments.length})</span>
              </h2>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('/studio/appointments')}
              >
                <Calendar size={13} />
                {copy.calendar}
              </Button>
            </div>

            {appointments.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-studio-w2 text-[13px] m-0">{copy.noAppointments}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-elaya-border">
                      {APPT_TABLE_HEADERS.map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-studio-w3 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <ApptRow
                        key={a.id ?? a._id}
                        appt={a}
                        copy={copy}
                        onClick={() => {
                          const caseId = a.case?._id ?? a.case
                          if (caseId) navigate(`/studio/cases/${caseId}`)
                        }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

        </div>

        {/* ── Right sidebar ── */}
        <div className="flex flex-col gap-5 w-[260px] shrink-0">

          <StudioTimeline timeline={customer.firma_timeline} copy={copy} />

          {/* Pipeline stage */}
          <Card className="flex flex-col gap-4">
            <h3 className="text-[13px] font-semibold text-studio-white m-0">{copy.pipelineStage}</h3>
            <div className="flex flex-col gap-1.5">
              {PIPELINE_STAGES.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setPipeline(stage)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[12px] text-left cursor-pointer border transition-colors w-full
                    ${pipeline === stage
                      ? 'border-studio-gold/40 bg-studio-gold/10 text-studio-white font-semibold'
                      : 'border-elaya-border bg-transparent text-studio-w2 hover:border-elaya-border-strong hover:text-studio-white'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${pipeline === stage ? 'bg-studio-gold' : 'bg-studio-w4'}`} />
                  {t(`pipeline.${stage}`)}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              variant="secondary"
              loading={savingPipeline}
              disabled={pipeline === customer.pipeline_stufe}
              onClick={savePipeline}
              className="w-full"
            >
              {copy.saveStage}
            </Button>
          </Card>

          {/* Notes */}
          <Card className="flex flex-col gap-3">
            <h3 className="text-[13px] font-semibold text-studio-white m-0">{copy.notesTitle}</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder={copy.notesPlaceholder}
              className="w-full px-3 py-2.5 rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-w1 text-[12px] outline-none focus:border-studio-gold transition-colors placeholder:text-studio-w3 resize-none"
            />
            <Button
              size="sm"
              variant="secondary"
              loading={savingNotes}
              disabled={notes === (customer.notizen ?? '')}
              onClick={saveNotes}
              className="w-full"
            >
              {copy.saveNotes}
            </Button>
          </Card>

        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <ScrollText size={16} className="text-studio-gold-2" />
          <h2 className="text-[16px] font-bold text-studio-white m-0 tracking-wide uppercase">
            {activityCopy.customerTitle}
          </h2>
        </div>
        <ActivityFeed customerId={id} showCustomer={false} defaultRange="all" />
      </div>

      {showCaseModal && (
        <Modal
          title={copy.newCaseModal}
          onClose={() => {
            setShowCaseModal(false)
            setCaseFormStep(0)
          }}
          width="max-w-3xl"
          scrollResetKey={caseFormStep}
        >
          <CaseForm
            customerId={id}
            onSubmit={handleCreateCase}
            loading={creatingCase}
            onStepChange={setCaseFormStep}
            onCancel={() => {
              setShowCaseModal(false)
              setCaseFormStep(0)
            }}
          />
        </Modal>
      )}

      {showEditModal && (
        <Modal title={copy.editModal} onClose={() => setShowEditModal(false)} width="max-w-xl">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label={copy.editFields.firstName}  value={editForm.vorname}  onChange={(e) => setEditForm((p) => ({ ...p, vorname:  e.target.value }))} />
              <Input label={copy.editFields.lastName} value={editForm.nachname} onChange={(e) => setEditForm((p) => ({ ...p, nachname: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label={copy.editFields.email}  type="email" value={editForm.email}   onChange={(e) => setEditForm((p) => ({ ...p, email:   e.target.value }))} />
              <Input label={copy.editFields.phone} type="tel"   value={editForm.telefon} onChange={(e) => setEditForm((p) => ({ ...p, telefon: e.target.value }))} />
            </div>
            <Input
              label={copy.editFields.birthDate}
              type="date"
              value={editForm.geburtsdatum}
              onChange={(e) => setEditForm((p) => ({ ...p, geburtsdatum: e.target.value }))}
            />
            <Input label={copy.editFields.street} value={editForm.strasse} onChange={(e) => setEditForm((p) => ({ ...p, strasse: e.target.value }))} />
            <div className="grid grid-cols-3 gap-4">
              <Input label={copy.editFields.postalCode} value={editForm.plz}  onChange={(e) => setEditForm((p) => ({ ...p, plz:  e.target.value }))} />
              <Input label={copy.editFields.city} value={editForm.ort}  onChange={(e) => setEditForm((p) => ({ ...p, ort:  e.target.value }))} />
              <Input label={copy.editFields.country} value={editForm.land} onChange={(e) => setEditForm((p) => ({ ...p, land: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowEditModal(false)} disabled={savingEdit}>
                Abbrechen
              </Button>
              <Button loading={savingEdit} onClick={saveEdit}>
                Speichern
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default CustomerDetail
