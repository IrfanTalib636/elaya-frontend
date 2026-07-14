import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Plus, Pencil, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCustomer, updateCustomer } from '../../api/customers'
import { createCase } from '../../api/cases'
import { listAppointments } from '../../api/appointments'
import { Card, Badge, Button, Input, Spinner, PageHeader, Modal } from '../../components/ui'
import CaseForm from '../../components/forms/CaseForm'
import CustomerAvatar from '../../components/CustomerAvatar'

// ── Constants ─────────────────────────────────────────────────────────────
const PIPELINE_STAGES = [
  'Neu',
  'Beratung geplant',
  'Behandlung aktiv',
  'Beratung erledigt',
]

const SOURCE_LABELS = {
  studio_eigen:         'Studio',
  plattform_vermittelt: 'Plattform',
  studio_wechsel:       'Wechsel',
}

const CASE_TYPE_LABELS = { tattoo: 'Tattoo', pmu: 'PMU' }

const CASE_TABLE_HEADERS = ['Fall-ID', 'Bezeichnung', 'Status', 'Fortschritt', 'Letzte Sitzung', '']

const APPT_TYPE_LABELS = {
  beratung:  'Beratung',
  treatment: 'Behandlung',
  first:     'Erstbehandlung',
}

const APPT_STATUS_LABELS = {
  gebucht:   'Gebucht',
  storniert: 'Storniert',
  cancelled: 'Abgesagt',
  completed: 'Abgeschlossen',
}

const APPT_TABLE_HEADERS = ['Datum', 'Zeit', 'Fall', 'Art', 'Status']

// ── Helpers ───────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' })
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

const ApptRow = ({ appt, onClick }) => {
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
      <td className="px-5 py-3 text-studio-w2 text-[12px]">{APPT_TYPE_LABELS[appt.type] ?? appt.type}</td>
      <td className="px-5 py-3">
        <Badge variant="status" value={appt.status}>{APPT_STATUS_LABELS[appt.status] ?? appt.status}</Badge>
      </td>
    </tr>
  )
}

const CaseRow = ({ c, onClick }) => (
  <tr
    className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4 cursor-pointer transition-colors"
    onClick={onClick}
  >
    <td className="px-5 py-3 text-studio-gold-2 text-[12px] font-mono">{c.caseId}</td>
    <td className="px-5 py-3 text-studio-w1 text-[13px]">
      {c.tc_title || CASE_TYPE_LABELS[c.type] || c.type}
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

  const [customer, setCustomer]     = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]       = useState(true)
  const [pipeline, setPipeline]     = useState('')
  const [notes, setNotes]           = useState('')
  const [savingPipeline, setSavingPipeline] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [showCaseModal,  setShowCaseModal]  = useState(false)
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
        toast.error('Kunde konnte nicht geladen werden.')
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
      toast.success('Pipeline aktualisiert.')
    } catch {
      toast.error('Fehler beim Speichern.')
    } finally {
      setSavingPipeline(false)
    }
  }

  const saveNotes = async () => {
    setSavingNotes(true)
    try {
      await updateCustomer(id, { notizen: notes })
      setCustomer((prev) => ({ ...prev, notizen: notes }))
      toast.success('Notizen gespeichert.')
    } catch {
      toast.error('Fehler beim Speichern.')
    } finally {
      setSavingNotes(false)
    }
  }

  const handleCreateCase = async (form) => {
    setCreatingCase(true)
    try {
      const res = await createCase({ ...form, customer_id: id })
      toast.success('Fall erfolgreich angelegt.')
      setShowCaseModal(false)
      navigate(`/studio/cases/${res.data.data.case.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Fehler beim Anlegen des Falls.')
    } finally {
      setCreatingCase(false)
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
      toast.success('Kundendaten aktualisiert.')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Fehler beim Speichern.')
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
        Alle Kunden
      </button>

      <PageHeader title={fullName} subtitle={customer.email}>
        <Badge variant="pipeline" value={customer.pipeline_stufe}>{customer.pipeline_stufe}</Badge>
        <Badge variant="source"   value={customer.akquise_quelle}>
          {SOURCE_LABELS[customer.akquise_quelle] ?? customer.akquise_quelle}
        </Badge>
      </PageHeader>

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
                    Seit {fmtDate(customer.stufe_seit)} · Konto: {customer.user?.status ?? '—'}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={openEdit}>
                <Pencil size={12} />
                Bearbeiten
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <InfoRow label="E-Mail"         value={customer.email} />
              <InfoRow label="Telefon"        value={customer.telefon} />
              <InfoRow label="Geburtsdatum"   value={fmtDate(customer.geburtsdatum)} />
              <InfoRow label="Adresse"        value={address} />
              <InfoRow label="Letzter Login"  value={fmtDate(customer.user?.last_login)} />
              <InfoRow label="Konto-Status"   value={customer.user?.status} />
            </div>
          </Card>

          {/* Cases */}
          <Card padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-elaya-border">
              <h2 className="text-[14px] font-semibold text-studio-white m-0">
                Fälle
                <span className="ml-2 text-studio-w3 text-[12px] font-normal">({caseCount})</span>
              </h2>
              <Button size="sm" variant="secondary" onClick={() => setShowCaseModal(true)}>
                <Plus size={13} />
                Neuer Fall
              </Button>
            </div>

            {caseCount === 0 ? (
              <div className="py-10 text-center">
                <p className="text-studio-w2 text-[13px] m-0">Noch keine Fälle vorhanden.</p>
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
                Termine
                <span className="ml-2 text-studio-w3 text-[12px] font-normal">({appointments.length})</span>
              </h2>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('/studio/appointments')}
              >
                <Calendar size={13} />
                Kalender
              </Button>
            </div>

            {appointments.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-studio-w2 text-[13px] m-0">Noch keine Termine vorhanden.</p>
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

          {/* Pipeline stage */}
          <Card className="flex flex-col gap-4">
            <h3 className="text-[13px] font-semibold text-studio-white m-0">Pipeline-Stufe</h3>
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
                  {stage}
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
              Stufe speichern
            </Button>
          </Card>

          {/* Notes */}
          <Card className="flex flex-col gap-3">
            <h3 className="text-[13px] font-semibold text-studio-white m-0">Interne Notizen</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Interne Anmerkungen…"
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
              Notizen speichern
            </Button>
          </Card>

        </div>
      </div>

      {showCaseModal && (
        <Modal title="Neuen Fall anlegen" onClose={() => setShowCaseModal(false)} width="max-w-3xl">
          <CaseForm
            onSubmit={handleCreateCase}
            loading={creatingCase}
            onCancel={() => setShowCaseModal(false)}
          />
        </Modal>
      )}

      {showEditModal && (
        <Modal title="Kundendaten bearbeiten" onClose={() => setShowEditModal(false)} width="max-w-xl">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Vorname *"  value={editForm.vorname}  onChange={(e) => setEditForm((p) => ({ ...p, vorname:  e.target.value }))} />
              <Input label="Nachname *" value={editForm.nachname} onChange={(e) => setEditForm((p) => ({ ...p, nachname: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="E-Mail"  type="email" value={editForm.email}   onChange={(e) => setEditForm((p) => ({ ...p, email:   e.target.value }))} />
              <Input label="Telefon" type="tel"   value={editForm.telefon} onChange={(e) => setEditForm((p) => ({ ...p, telefon: e.target.value }))} />
            </div>
            <Input
              label="Geburtsdatum"
              type="date"
              value={editForm.geburtsdatum}
              onChange={(e) => setEditForm((p) => ({ ...p, geburtsdatum: e.target.value }))}
            />
            <Input label="Strasse" value={editForm.strasse} onChange={(e) => setEditForm((p) => ({ ...p, strasse: e.target.value }))} />
            <div className="grid grid-cols-3 gap-4">
              <Input label="PLZ" value={editForm.plz}  onChange={(e) => setEditForm((p) => ({ ...p, plz:  e.target.value }))} />
              <Input label="Ort" value={editForm.ort}  onChange={(e) => setEditForm((p) => ({ ...p, ort:  e.target.value }))} />
              <Input label="Land" value={editForm.land} onChange={(e) => setEditForm((p) => ({ ...p, land: e.target.value }))} />
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
