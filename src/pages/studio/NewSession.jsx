import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Camera, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCase } from '../../api/cases'
import { createSession } from '../../api/sessions'
import { getAppointment } from '../../api/appointments'
import { uploadSessionProgressPhoto } from '../../api/files'
import { analyzeVerblassung } from '../../api/verblassung'
import { Card, Button, Input, Select, Spinner, PageHeader } from '../../components/ui'

// ── Constants ─────────────────────────────────────────────────────────────
const toDateInput = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const toTimeInput = (appt) => {
  if (appt?.time) return String(appt.time).slice(0, 5)
  if (!appt?.date) return ''
  const d = new Date(appt.date)
  if (Number.isNaN(d.getTime())) return ''
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const appointmentCaseId = (appt) => {
  const value = appt?.case
  if (!value) return ''
  if (typeof value === 'object') return String(value.id || value._id || '')
  return String(value)
}

const INITIAL = {
  treatment_date:      '',
  treatment_time:      '',
  dauer_minuten:       '',
  mitarbeiter_name:    '',
  raum_name:           '',
  is_no_show:          false,
  studio_laser_brand:  '',
  studio_laser_model:  '',
  laser_typ:           '',
  wavelength_nm:       '',
  fluence_j_cm2:       '',
  spot_size_mm:        '',
  frequency_hz:        '',
  pass_count:          '',
  cooling_used:        false,
  verblassung_prozent: 0,
  removal_pct:         0,
  pain_score_0_10:     0,
  endpoint_reaction:   '',
  adverse_event_flag:  false,
  adverse_event_type:  '',
  special_notes:       '',
  zahlung_betragCHF:   '',
  zahlung_zahlungsart: '',
  zahlung_rabatt:      '',
}

// ── Sub-components ────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <Card className="flex flex-col gap-4">
    <h2 className="text-[13px] font-semibold text-studio-white m-0 pb-3 border-b border-elaya-border">
      {title}
    </h2>
    {children}
  </Card>
)

const SliderField = ({ label, value = 0, onChange, min = 0, max = 100, unit = '%' }) => {
  const inputRef = useRef(null)
  const [display, setDisplay] = useState(value)

  // Only sync from parent when value changes externally (e.g. form reset), not on every drag
  useEffect(() => {
    if (inputRef.current && Number(inputRef.current.value) !== value) {
      inputRef.current.value = value
      setDisplay(value)
    }
  }, [value])

  const handleInput = (e) => {
    const n = Number(e.target.value)
    setDisplay(n)
    onChange(n)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-studio-white text-[12px] font-semibold">{label}</span>
        <span translate="no" className="text-studio-gold-2 text-[14px] font-bold tabular-nums">
          {display}{unit}
        </span>
      </div>
      <input
        ref={inputRef}
        type="range"
        min={min}
        max={max}
        defaultValue={value}
        onInput={handleInput}
        className="w-full cursor-pointer accent-[#1E6FD9]"
      />
      <div className="flex justify-between text-studio-w4 text-[10px]">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

const Toggle = ({ label, checked, onChange, hint }) => (
  <div className="flex items-center justify-between py-1">
    <div>
      <span className="text-studio-w1 text-[13px]">{label}</span>
      {hint && <p className="text-studio-w3 text-[11px] m-0 mt-0.5">{hint}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors cursor-pointer border-0 relative shrink-0 ${
        checked ? 'bg-studio-gold' : 'bg-studio-w4'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
)

// ── Page ──────────────────────────────────────────────────────────────────
const NewSession = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const caseId = searchParams.get('case_id')
  const appointmentId = searchParams.get('appointment_id')

  const [caseData, setCaseData] = useState(null)
  const [linkedAppointment, setLinkedAppointment] = useState(null)
  const [loadingCase, setLoadingCase] = useState(true)
  const [form, setForm] = useState(INITIAL)
  const [savingDraft, setSavingDraft] = useState(false)
  const [savingFinal, setSavingFinal] = useState(false)

  const photoInputRef = useRef(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [autoAnalyze, setAutoAnalyze] = useState(true)

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
  }, [photoPreview])

  const saving = savingDraft || savingFinal
  const nextSession = (caseData?.sessionsDone ?? 0) + 1
  const kiAvailable = nextSession >= 2

  useEffect(() => {
    if (!caseId) {
      toast.error('Kein Fall ausgewählt.')
      navigate('/studio/customers')
      return
    }
    const load = async () => {
      try {
        const res = await getCase(caseId)
        setCaseData(res.data.data.case)
      } catch {
        toast.error('Fall konnte nicht geladen werden.')
        navigate(-1)
        return
      } finally {
        setLoadingCase(false)
      }

      if (!appointmentId) return
      try {
        const apptRes = await getAppointment(appointmentId)
        const appt = apptRes.data.data.appointment
        const linkedCase = appointmentCaseId(appt)
        if (linkedCase && linkedCase !== String(caseId)) {
          toast.error('Dieser Termin gehört nicht zu diesem Fall.')
          return
        }
        setLinkedAppointment(appt)
        setForm((prev) => ({
          ...prev,
          treatment_date: toDateInput(appt.date),
          treatment_time: toTimeInput(appt),
          dauer_minuten: appt.dauer_minuten != null ? String(appt.dauer_minuten) : prev.dauer_minuten,
          mitarbeiter_name: appt.mitarbeiter_name || prev.mitarbeiter_name,
          raum_name: appt.raum_name || prev.raum_name,
        }))
      } catch {
        toast.error('Termin konnte nicht geladen werden. Bitte Datum und Uhrzeit prüfen.')
      }
    }
    load()
  }, [caseId, appointmentId, navigate])

  const set = useCallback(
    (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value })),
    []
  )

  const setVerblassung = useCallback((v) => setForm((p) => ({ ...p, verblassung_prozent: v })), [])
  const setRemoval     = useCallback((v) => setForm((p) => ({ ...p, removal_pct: v })),         [])
  const setPain        = useCallback((v) => setForm((p) => ({ ...p, pain_score_0_10: v })),     [])
  const setVal = useCallback(
    (field) => (val) => setForm((p) => ({ ...p, [field]: val })),
    []
  )

  const buildPayload = (isDraft) => {
    const wavelengths = form.wavelength_nm
      ? form.wavelength_nm.split(',').flatMap((n) => { const v = Number(n.trim()); return v ? [v] : [] })
      : []

    const hasPayment = form.zahlung_betragCHF || form.zahlung_zahlungsart

    return {
      case_id:             caseId,
      appointment_id:      appointmentId || undefined,
      treatment_date:      form.treatment_date,
      treatment_time:      form.treatment_time   || undefined,
      dauer_minuten:       form.dauer_minuten     ? Number(form.dauer_minuten)    : undefined,
      mitarbeiter_name:    form.mitarbeiter_name  || undefined,
      raum_name:           form.raum_name         || undefined,
      is_draft:            isDraft,
      is_no_show:          form.is_no_show,
      // Laser (skipped on no-show)
      ...(!form.is_no_show && {
        studio_laser_brand: form.studio_laser_brand || undefined,
        studio_laser_model: form.studio_laser_model || undefined,
        laser_typ:          form.laser_typ          || undefined,
        wavelength_nm:      wavelengths.length ? wavelengths : undefined,
        fluence_j_cm2:      form.fluence_j_cm2  ? Number(form.fluence_j_cm2)  : undefined,
        spot_size_mm:       form.spot_size_mm   ? Number(form.spot_size_mm)   : undefined,
        frequency_hz:       form.frequency_hz   ? Number(form.frequency_hz)   : undefined,
        pass_count:         form.pass_count     ? Number(form.pass_count)     : undefined,
        cooling_used:       form.cooling_used,
        // Results
        verblassung_prozent: Number(form.verblassung_prozent) > 0 ? Number(form.verblassung_prozent) : undefined,
        removal_pct:         Number(form.removal_pct) > 0 ? Number(form.removal_pct) : undefined,
        pain_score_0_10:     form.pain_score_0_10,
        endpoint_reaction:   form.endpoint_reaction || undefined,
        adverse_event_flag:  form.adverse_event_flag,
        adverse_event_type:  form.adverse_event_flag ? form.adverse_event_type : undefined,
      }),
      special_notes: form.special_notes || undefined,
      ...(hasPayment && {
        zahlung: {
          betragCHF:   form.zahlung_betragCHF   ? Number(form.zahlung_betragCHF)  : 0,
          betrag:      form.zahlung_betragCHF   ? Number(form.zahlung_betragCHF)  : 0,
          zahlungsart: form.zahlung_zahlungsart || undefined,
          rabatt:      form.zahlung_rabatt      ? Number(form.zahlung_rabatt)     : 0,
          waehrung:    'CHF',
        },
      }),
    }
  }

  const selectPhoto = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return ''
    })
  }

  const handleSave = async (isDraft) => {
    if (!form.treatment_date) {
      toast.error('Behandlungsdatum ist erforderlich.')
      return
    }
    isDraft ? setSavingDraft(true) : setSavingFinal(true)
    try {
      const res = await createSession(buildPayload(isDraft))
      const sessionId = res.data.data.session?.id

      const wantsPhoto = !form.is_no_show && photoFile && sessionId

      if (wantsPhoto) {
        const flowToast = toast.loading('Foto wird hochgeladen…')
        let uploaded = false
        try {
          await uploadSessionProgressPhoto(sessionId, photoFile)
          uploaded = true
        } catch {
          toast.error('Sitzung gespeichert, aber das Foto konnte nicht hochgeladen werden.', { id: flowToast })
        }

        if (uploaded && autoAnalyze && kiAvailable && !isDraft) {
          toast.loading('KI analysiert…', { id: flowToast })
          try {
            await analyzeVerblassung({ session_id: sessionId, persist: true })
            toast.success('Sitzung abgeschlossen — KI-Verblassungsanalyse gespeichert.', { id: flowToast })
          } catch {
            toast.error('Sitzung gespeichert, aber die KI-Analyse ist fehlgeschlagen.', { id: flowToast })
          }
        } else if (uploaded) {
          toast.success(isDraft ? 'Entwurf mit Foto gespeichert.' : 'Sitzung erfolgreich abgeschlossen.', { id: flowToast })
        }
      } else {
        toast.success(isDraft ? 'Entwurf gespeichert.' : 'Sitzung erfolgreich abgeschlossen.')
      }

      navigate(sessionId ? `/studio/sessions/${sessionId}` : `/studio/cases/${caseId}`)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Fehler beim Speichern.')
    } finally {
      isDraft ? setSavingDraft(false) : setSavingFinal(false)
    }
  }

  if (loadingCase) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  const caseTitle   = caseData?.tc_title || caseData?.bodyLabel || 'Fall'

  return (
    <div className="p-6 max-w-[860px]">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(`/studio/cases/${caseId}`)}
        className="flex items-center gap-1.5 text-studio-w2 text-[12px] mb-5 hover:text-studio-white transition-colors cursor-pointer bg-transparent border-0"
      >
        <ArrowLeft size={13} />
        Zum Fall
      </button>

      <PageHeader
        title={`Sitzung #${nextSession}`}
        subtitle={`${caseTitle} · ${caseData?.caseId ?? ''}${linkedAppointment ? ' · vom Termin übernommen' : ''}`}
      >
        <Button variant="ghost" onClick={() => navigate(`/studio/cases/${caseId}`)} disabled={saving}>
          Abbrechen
        </Button>
        <Button variant="secondary" loading={savingDraft} disabled={saving} onClick={() => handleSave(true)}>
          Als Entwurf speichern
        </Button>
        <Button loading={savingFinal} disabled={saving} onClick={() => handleSave(false)}>
          Sitzung abschliessen
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-5">

        {/* ── Section 1: General ── */}
        <Section title="Allgemein">
          {linkedAppointment ? (
            <p className="text-studio-gold-2 text-[12px] m-0 -mt-1">
              Datum, Uhrzeit und Fall stammen vom gebuchten Termin
              {linkedAppointment.time ? ` (${toDateInput(linkedAppointment.date)} · ${toTimeInput(linkedAppointment)})` : ''}.
              Laserparameter bitte ergänzen.
            </p>
          ) : null}
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Datum *"
              type="date"
              value={form.treatment_date}
              onChange={set('treatment_date')}
            />
            <Input
              label="Uhrzeit"
              type="time"
              value={form.treatment_time}
              onChange={set('treatment_time')}
            />
            <Input
              label="Dauer (Min.)"
              type="number"
              min="0"
              value={form.dauer_minuten}
              onChange={set('dauer_minuten')}
              placeholder="45"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mitarbeiter"
              value={form.mitarbeiter_name}
              onChange={set('mitarbeiter_name')}
              placeholder="Dr. Muster"
            />
            <Input
              label="Raum"
              value={form.raum_name}
              onChange={set('raum_name')}
              placeholder="Raum 1"
            />
          </div>
          <Toggle
            label="No-Show"
            hint="Kunde ist zum Termin nicht erschienen"
            checked={form.is_no_show}
            onChange={setVal('is_no_show')}
          />
        </Section>

        {/* ── Section 2: Laser (hidden on no-show) ── */}
        {!form.is_no_show && (
          <Section title="Laser-Parameter">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Marke"  value={form.studio_laser_brand} onChange={set('studio_laser_brand')} placeholder="Fotona" />
              <Input label="Modell" value={form.studio_laser_model} onChange={set('studio_laser_model')} placeholder="StarWalker MaQX" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Laser-Typ"         value={form.laser_typ}      onChange={set('laser_typ')}      placeholder="Nd:YAG" />
              <Input
                label="Wellenlängen (nm)"
                value={form.wavelength_nm}
                onChange={set('wavelength_nm')}
                placeholder="1064, 532"
                hint="Kommagetrennt"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Input label="Fluence J/cm²" type="number" min="0" step="0.1" value={form.fluence_j_cm2} onChange={set('fluence_j_cm2')} placeholder="3.5" />
              <Input label="Spot (mm)"     type="number" min="0" step="0.1" value={form.spot_size_mm}  onChange={set('spot_size_mm')}  placeholder="6" />
              <Input label="Frequenz (Hz)" type="number" min="0"            value={form.frequency_hz}  onChange={set('frequency_hz')}  placeholder="2" />
              <Input label="Passes"        type="number" min="0"            value={form.pass_count}    onChange={set('pass_count')}    placeholder="3" />
            </div>
            <Toggle label="Kühlung verwendet" checked={form.cooling_used} onChange={setVal('cooling_used')} />
          </Section>
        )}

        {/* ── Section 3: Results (hidden on no-show) ── */}
        {!form.is_no_show && (
          <Section title="Behandlungsergebnis">
            <SliderField label="Verblassung (Studio-Schätzung)"  value={form.verblassung_prozent} onChange={setVerblassung} />
            <SliderField label="Entfernung"   value={form.removal_pct}         onChange={setRemoval} />
            <SliderField label="Schmerzskala" value={form.pain_score_0_10}     onChange={setPain} min={0} max={10} unit="/10" />
            <Input
              label="Endpoint-Reaktion"
              value={form.endpoint_reaction}
              onChange={set('endpoint_reaction')}
              placeholder="Frosting, Rötung, Schwellung…"
            />
            <Toggle
              label="Unerwünschtes Ereignis"
              hint="Komplikation oder unerwartete Reaktion aufgetreten"
              checked={form.adverse_event_flag}
              onChange={setVal('adverse_event_flag')}
            />
            {form.adverse_event_flag && (
              <Input
                label="Art des Ereignisses"
                value={form.adverse_event_type}
                onChange={set('adverse_event_type')}
                placeholder="Blasenbildung, Hyperpigmentierung…"
              />
            )}
          </Section>
        )}

        {/* ── Section 3b: Progress photo (hidden on no-show) ── */}
        {!form.is_no_show && (
          <Section title="Fortschritts-Foto">
            {photoPreview ? (
              <div className="relative rounded-[12px] border border-elaya-border bg-studio-bg-4 overflow-hidden max-w-[280px]">
                <img src={photoPreview} alt="Fortschritts-Foto" className="w-full aspect-square object-cover" />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer border-0 hover:bg-black/80"
                  aria-label="Foto entfernen"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="w-full max-w-[280px] flex flex-col items-center justify-center gap-2 py-8 cursor-pointer bg-studio-bg-4/50 border border-dashed border-elaya-border rounded-[12px] text-studio-w3 hover:text-studio-w2 transition-colors"
              >
                <Camera size={24} strokeWidth={1.5} />
                <span className="text-[11px]">Foto auswählen</span>
              </button>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={selectPhoto}
            />
            <p className="text-studio-w3 text-[11px] m-0">
              {kiAvailable
                ? 'Aktuelles Foto der behandelten Stelle — Grundlage für die KI-Verblassungsanalyse im Vergleich zur vorherigen Sitzung.'
                : 'Vorher-Foto der behandelten Stelle. Bitte immer vor der ersten Behandlung speichern — ab der zweiten Sitzung wird es für den Fortschrittsvergleich benötigt. Eine KI-Analyse gibt es bei der ersten Sitzung nicht.'}
            </p>
            {photoFile && kiAvailable && (
              <Toggle
                label="KI-Verblassungsanalyse automatisch starten"
                hint="Vergleicht dieses Foto mit dem Foto der vorherigen Sitzung (nicht bei Entwürfen)"
                checked={autoAnalyze}
                onChange={setAutoAnalyze}
              />
            )}
          </Section>
        )}

        {/* ── Section 4: Payment ── */}
        <Section title="Zahlung">
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Betrag (CHF)"
              type="number"
              min="0"
              step="0.01"
              value={form.zahlung_betragCHF}
              onChange={set('zahlung_betragCHF')}
              placeholder="120.00"
            />
            <Select label="Zahlungsart" value={form.zahlung_zahlungsart} onChange={set('zahlung_zahlungsart')}>
              <option value="">— Auswählen —</option>
              <option value="bar">Bar</option>
              <option value="karte">Karte</option>
              <option value="twint">TWINT</option>
            </Select>
            <Input
              label="Rabatt (CHF)"
              type="number"
              min="0"
              step="0.01"
              value={form.zahlung_rabatt}
              onChange={set('zahlung_rabatt')}
              placeholder="0.00"
            />
          </div>
        </Section>

        {/* ── Section 5: Notes ── */}
        <Section title="Notizen">
          <div className="flex flex-col gap-1.5">
            <label className="text-studio-white text-[12px] font-semibold">Besondere Hinweise</label>
            <textarea
              value={form.special_notes}
              onChange={(e) => setForm((p) => ({ ...p, special_notes: e.target.value }))}
              rows={3}
              placeholder="Interne Anmerkungen zur Sitzung…"
              className="w-full px-3 py-2.5 rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-w1 text-[12px] outline-none focus:border-studio-gold transition-colors placeholder:text-studio-w3 resize-none"
            />
          </div>
        </Section>

        {/* ── Bottom actions ── */}
        <div className="flex justify-end gap-3 pb-4">
          <Button variant="ghost" onClick={() => navigate(`/studio/cases/${caseId}`)} disabled={saving}>
            Abbrechen
          </Button>
          <Button variant="secondary" loading={savingDraft} disabled={saving} onClick={() => handleSave(true)}>
            Als Entwurf speichern
          </Button>
          <Button loading={savingFinal} disabled={saving} onClick={() => handleSave(false)}>
            Sitzung abschliessen
          </Button>
        </div>

      </div>
    </div>
  )
}

export default NewSession
