import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Camera, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCase } from '../../api/cases'
import { createSession } from '../../api/sessions'
import { getAppointment } from '../../api/appointments'
import { getStudioSettings, listStudioLasers } from '../../api/studio'
import {
  uploadSessionProgressPhoto,
  uploadSessionPostTreatmentPhoto,
  uploadSessionUnusualReactionPhoto,
} from '../../api/files'
import { analyzeVerblassung } from '../../api/verblassung'
import { Card, Button, Input, Select, Spinner, PageHeader } from '../../components/ui'
import useContent from '../../i18n/useContent'
import useAuthStore from '../../store/authStore'

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

const zoneLabel = (zone) =>
  [zone.zonen_id, zone.bezeichnung || zone.koerperstelle].filter(Boolean).join(' · ')

const INITIAL = {
  zonen_id:            '',
  treatment_date:      '',
  treatment_time:      '',
  dauer_minuten:       '',
  mitarbeiter_id:      '',
  mitarbeiter_name:    '',
  raum_id:             '',
  raum_name:           '',
  is_no_show:          false,
  laser_device_id:     '',
  studio_laser_brand:  '',
  studio_laser_model:  '',
  laser_typ:           '',
  wavelength_entries:  [{ wavelength_nm: '', fluence_j_cm2: '', spot_size_mm: '', frequency_hz: '', pass_count: '' }],
  cooling_used:        false,
  endpoint_reactions:  [],
  endpoint_reaction_note: '',
  unusual_immediate_reaction: false,
  unusual_reaction_type: '',
  unusual_reaction_description: '',
  unusual_reaction_action_taken: '',
  unusual_reaction_treatment_stopped: false,
  special_notes:       '',
  zahlung_betragCHF:   '',
  zahlung_zahlungsart: '',
  zahlung_rabatt:      '',
}

const ENDPOINT_REACTION_KEYS = [
  'frosting',
  'redness',
  'swelling',
  'pinpoint_bleeding',
  'none',
  'other',
]

// ── Sub-components ────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <Card className="flex flex-col gap-4">
    <h2 className="text-[13px] font-semibold text-studio-white m-0 pb-3 border-b border-elaya-border">
      {title}
    </h2>
    {children}
  </Card>
)

const Chip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-2.5 py-1 rounded-[7px] text-[11px] border transition-colors cursor-pointer
      ${active
        ? 'border-studio-teal-2 bg-studio-teal-2/15 text-studio-teal-2'
        : 'border-elaya-border bg-transparent text-studio-w2 hover:text-studio-white'}`}
  >
    {children}
  </button>
)

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
  const { t, studioPages } = useContent()
  const copy = studioPages.newSession
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const caseId = searchParams.get('case_id')
  const appointmentId = searchParams.get('appointment_id')
  const presetZoneId = searchParams.get('zonen_id')
  const authUser = useAuthStore((s) => s.user)

  const [caseData, setCaseData] = useState(null)
  const [linkedAppointment, setLinkedAppointment] = useState(null)
  const [loadingCase, setLoadingCase] = useState(true)
  const [staffRoster, setStaffRoster] = useState([])
  const [rooms, setRooms] = useState([])
  const [laserInventory, setLaserInventory] = useState([])
  const [form, setForm] = useState(INITIAL)
  const [savingDraft, setSavingDraft] = useState(false)
  const [savingFinal, setSavingFinal] = useState(false)

  const prePhotoInputRef = useRef(null)
  const [prePhotoFile, setPrePhotoFile] = useState(null)
  const [prePhotoPreview, setPrePhotoPreview] = useState('')
  const [autoAnalyze, setAutoAnalyze] = useState(true)
  const postPhotoInputRef = useRef(null)
  const [postPhotoFile, setPostPhotoFile] = useState(null)
  const [postPhotoPreview, setPostPhotoPreview] = useState('')
  const unusualPhotoInputRef = useRef(null)
  const [unusualPhotoFile, setUnusualPhotoFile] = useState(null)
  const [unusualPhotoPreview, setUnusualPhotoPreview] = useState('')

  useEffect(() => () => {
    if (prePhotoPreview) URL.revokeObjectURL(prePhotoPreview)
  }, [prePhotoPreview])

  useEffect(() => () => {
    if (postPhotoPreview) URL.revokeObjectURL(postPhotoPreview)
  }, [postPhotoPreview])

  const saving = savingDraft || savingFinal
  const zones = caseData?.zonen_aktiv ? (caseData.zonen ?? []) : []
  const selectedZone = zones.find((z) => z.zonen_id === form.zonen_id) ?? null
  const nextSession = zones.length
    ? (selectedZone?.sitzungen_erledigt ?? 0) + 1
    : (caseData?.sessionsDone ?? 0) + 1
  const kiAvailable = nextSession >= 2
  const zoneMissing = zones.length > 0 && !form.zonen_id

  useEffect(() => {
    if (!caseId) {
      toast.error(copy.noCase)
      navigate('/studio/customers')
      return
    }
    const load = async () => {
      try {
        const res = await getCase(caseId)
        const loaded = res.data.data.case
        setCaseData(loaded)
        const caseZones = loaded?.zonen_aktiv ? (loaded.zonen ?? []) : []
        const preset =
          caseZones.find((z) => z.zonen_id === presetZoneId) ??
          (caseZones.length === 1 ? caseZones[0] : null)
        if (preset) {
          setForm((prev) => ({ ...prev, zonen_id: preset.zonen_id }))
        }
      } catch {
        toast.error(copy.caseLoadError)
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
          toast.error(copy.apptWrongCase)
          return
        }
        setLinkedAppointment(appt)
        setForm((prev) => ({
          ...prev,
          treatment_date: toDateInput(appt.date),
          treatment_time: toTimeInput(appt),
          dauer_minuten: appt.dauer_minuten != null ? String(appt.dauer_minuten) : prev.dauer_minuten,
          mitarbeiter_id: appt.mitarbeiter_id || prev.mitarbeiter_id,
          mitarbeiter_name: appt.mitarbeiter_name || prev.mitarbeiter_name,
          raum_name: appt.raum_name || prev.raum_name,
        }))
      } catch {
        toast.error(copy.apptLoadError)
      }
    }
    load()
    void getStudioSettings()
      .then((res) => {
        const settings = res.data.data.settings || {}
        setStaffRoster((settings.mitarbeiter || []).filter((m) => m.aktiv !== false))
        setRooms((settings.behandlungsraeume || []).filter((r) => r.aktiv !== false))
      })
      .catch(() => {})
    void listStudioLasers()
      .then((res) => setLaserInventory(res.data?.data?.devices || []))
      .catch(() => setLaserInventory([]))
  }, [
    caseId,
    appointmentId,
    presetZoneId,
    navigate,
    copy.caseLoadError,
    copy.apptWrongCase,
    copy.apptLoadError,
    copy.noCase,
  ])

  const set = useCallback(
    (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value })),
    []
  )

  const setVal = useCallback(
    (field) => (val) => setForm((p) => ({ ...p, [field]: val })),
    []
  )

  const toggleEndpointReaction = useCallback((key) => {
    setForm((p) => {
      const current = Array.isArray(p.endpoint_reactions) ? p.endpoint_reactions : []
      if (key === 'none') {
        const next = current.includes('none') ? [] : ['none']
        return { ...p, endpoint_reactions: next, endpoint_reaction_note: next.includes('other') ? p.endpoint_reaction_note : '' }
      }
      const withoutNone = current.filter((k) => k !== 'none')
      const next = withoutNone.includes(key)
        ? withoutNone.filter((k) => k !== key)
        : [...withoutNone, key]
      return {
        ...p,
        endpoint_reactions: next,
        endpoint_reaction_note: next.includes('other') ? p.endpoint_reaction_note : '',
      }
    })
  }, [])

  const selectedLaser = laserInventory.find((d) => d.id === form.laser_device_id) || null
  const lasersForRoom = form.raum_id
    ? (() => {
        const room = rooms.find((r) => r.id === form.raum_id)
        const roomIds = Array.isArray(room?.laser_device_ids) && room.laser_device_ids.length
          ? room.laser_device_ids.map(String)
          : room?.laser_device_id
            ? [String(room.laser_device_id)]
            : []
        if (roomIds.length) {
          return laserInventory.filter((d) => roomIds.includes(String(d.id)))
        }
        return laserInventory
      })()
    : laserInventory
  const approvedWavelengths = selectedLaser?.wavelengths_nm || []

  const buildPayload = (isDraft) => {
    const wavelength_entries = (form.wavelength_entries || [])
      .filter((e) => e.wavelength_nm !== '' && e.wavelength_nm != null)
      .map((e) => ({
        wavelength_nm: Number(e.wavelength_nm),
        fluence_j_cm2: e.fluence_j_cm2 !== '' ? Number(e.fluence_j_cm2) : null,
        spot_size_mm: e.spot_size_mm !== '' ? Number(e.spot_size_mm) : null,
        frequency_hz: e.frequency_hz !== '' ? Number(e.frequency_hz) : null,
        pass_count: e.pass_count !== '' ? Number(e.pass_count) : null,
      }))

    const hasPayment = form.zahlung_betragCHF || form.zahlung_zahlungsart

    return {
      case_id:             caseId,
      appointment_id:      appointmentId || undefined,
      zonen_id:            form.zonen_id || undefined,
      treatment_date:      form.treatment_date,
      treatment_time:      form.treatment_time   || undefined,
      dauer_minuten:       form.dauer_minuten     ? Number(form.dauer_minuten)    : undefined,
      mitarbeiter_id:      form.mitarbeiter_id    || undefined,
      mitarbeiter_name:    form.mitarbeiter_name  || undefined,
      raum_id:             form.raum_id           || undefined,
      raum_name:           form.raum_name         || undefined,
      is_draft:            isDraft,
      is_no_show:          form.is_no_show,
      // Laser (skipped on no-show)
      ...(!form.is_no_show && {
        laser_device_id:    form.laser_device_id || undefined,
        studio_laser_brand: form.studio_laser_brand || undefined,
        studio_laser_model: form.studio_laser_model || undefined,
        laser_typ:          form.laser_typ          || undefined,
        wavelength_entries: wavelength_entries.length ? wavelength_entries : undefined,
        cooling_used:       form.cooling_used,
        endpoint_reactions: form.endpoint_reactions || [],
        endpoint_reaction_note: form.endpoint_reactions?.includes('other')
          ? (form.endpoint_reaction_note || undefined)
          : undefined,
        unusual_immediate_reaction: form.unusual_immediate_reaction,
        unusual_reaction_type: form.unusual_immediate_reaction
          ? (form.unusual_reaction_type || undefined)
          : undefined,
        unusual_reaction_description: form.unusual_immediate_reaction
          ? (form.unusual_reaction_description || undefined)
          : undefined,
        unusual_reaction_action_taken: form.unusual_immediate_reaction
          ? (form.unusual_reaction_action_taken || undefined)
          : undefined,
        unusual_reaction_treatment_stopped: form.unusual_immediate_reaction
          ? !!form.unusual_reaction_treatment_stopped
          : false,
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

  const selectPrePhoto = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPrePhotoFile(file)
    setPrePhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const removePrePhoto = () => {
    setPrePhotoFile(null)
    setPrePhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return ''
    })
  }

  const selectPostPhoto = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPostPhotoFile(file)
    setPostPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const removePostPhoto = () => {
    setPostPhotoFile(null)
    setPostPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return ''
    })
  }

  const selectUnusualPhoto = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUnusualPhotoFile(file)
    setUnusualPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const removeUnusualPhoto = () => {
    setUnusualPhotoFile(null)
    setUnusualPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return ''
    })
  }

  const handleSave = async (isDraft) => {
    if (!form.treatment_date) {
      toast.error(copy.dateRequired)
      return
    }
    if (zoneMissing) {
      toast.error(copy.zoneRequired)
      return
    }
    isDraft ? setSavingDraft(true) : setSavingFinal(true)
    try {
      const res = await createSession(buildPayload(isDraft))
      const sessionId = res.data.data.session?.id

      const wantsPrePhoto = !form.is_no_show && prePhotoFile && sessionId
      const wantsPostPhoto = !form.is_no_show && postPhotoFile && sessionId
      const wantsUnusualPhoto =
        !form.is_no_show && form.unusual_immediate_reaction && unusualPhotoFile && sessionId

      if (wantsPrePhoto || wantsPostPhoto || wantsUnusualPhoto) {
        const flowToast = toast.loading(copy.photoUploading)
        let uploaded = false
        try {
          if (wantsPrePhoto) {
            await uploadSessionProgressPhoto(sessionId, prePhotoFile)
            uploaded = true
          }
          if (wantsPostPhoto) {
            await uploadSessionPostTreatmentPhoto(sessionId, postPhotoFile)
            uploaded = true
          }
          if (wantsUnusualPhoto) {
            await uploadSessionUnusualReactionPhoto(sessionId, unusualPhotoFile)
            uploaded = true
          }
        } catch {
          toast.error(copy.photoFailed, { id: flowToast })
        }

        if (uploaded && wantsPrePhoto && autoAnalyze && kiAvailable && !isDraft) {
          toast.loading(copy.aiAnalyzing, { id: flowToast })
          try {
            await analyzeVerblassung({ session_id: sessionId, persist: true })
            toast.success(copy.aiSaved, { id: flowToast })
          } catch {
            toast.error(copy.aiFailed, { id: flowToast })
          }
        } else if (uploaded) {
          toast.success(isDraft ? copy.draftWithPhoto : copy.sessionDone, { id: flowToast })
        }
      } else {
        toast.success(isDraft ? copy.draftSaved : copy.sessionDone)
      }

      navigate(sessionId ? `/studio/sessions/${sessionId}` : `/studio/cases/${caseId}`)
    } catch (err) {
      toast.error(err.response?.data?.message ?? copy.saveError)
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

  const caseTitle   = caseData?.tc_title || caseData?.bodyLabel || copy.caseFallback

  return (
    <div className="p-6 max-w-[860px]">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(`/studio/cases/${caseId}`)}
        className="flex items-center gap-1.5 text-studio-w2 text-[12px] mb-5 hover:text-studio-white transition-colors cursor-pointer bg-transparent border-0"
      >
        <ArrowLeft size={13} />
        {copy.backToCase}
      </button>

      <PageHeader
        title={t('studioPages.newSession.title', { number: nextSession })}
        subtitle={`${caseTitle} · ${caseData?.caseId ?? ''}${selectedZone ? ` · ${zoneLabel(selectedZone)}` : ''}${linkedAppointment ? copy.fromAppointment : ''}`}
      >
        <Button variant="ghost" onClick={() => navigate(`/studio/cases/${caseId}`)} disabled={saving}>
          {copy.cancel}
        </Button>
        <Button variant="secondary" loading={savingDraft} disabled={saving} onClick={() => handleSave(true)}>
          {copy.saveDraft}
        </Button>
        <Button loading={savingFinal} disabled={saving} onClick={() => handleSave(false)}>
          {copy.complete}
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-5">

        {/* ── Section 1: General ── */}
        <Section title={copy.general}>
          {linkedAppointment ? (
            <p className="text-studio-gold-2 text-[12px] m-0 -mt-1">
              {t('studioPages.newSession.linkedApptHint', {
                when: linkedAppointment.time
                  ? ` (${toDateInput(linkedAppointment.date)} · ${toTimeInput(linkedAppointment)})`
                  : '',
              })}
            </p>
          ) : null}
          {zones.length ? (
            <div className="flex flex-col gap-1.5">
              <Select
                label={copy.zoneLabel}
                value={form.zonen_id}
                onChange={set('zonen_id')}
                hint={copy.zoneHint}
              >
                <option value="">{copy.zonePlaceholder}</option>
                {zones.map((z) => (
                  <option key={z.zonen_id} value={z.zonen_id}>
                    {zoneLabel(z)}
                  </option>
                ))}
              </Select>
              {selectedZone ? (
                <p className="text-studio-gold-2 text-[11px] m-0">
                  {t('studioPages.newSession.zoneProgress', {
                    done: selectedZone.sitzungen_erledigt ?? 0,
                    percent: selectedZone.fortschritt_prozent ?? 0,
                  })}
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="grid grid-cols-3 gap-4">
            <Input
              label={copy.dateRequiredLabel}
              type="date"
              value={form.treatment_date}
              onChange={set('treatment_date')}
            />
            <Input
              label={copy.time}
              type="time"
              value={form.treatment_time}
              onChange={set('treatment_time')}
            />
            <Input
              label={copy.durationMin}
              type="number"
              min="0"
              value={form.dauer_minuten}
              onChange={set('dauer_minuten')}
              placeholder="45"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label={copy.performedBy || copy.staff || 'Treatment performed by'}
              value={form.mitarbeiter_id}
              onChange={(e) => {
                const id = e.target.value
                const m = staffRoster.find((s) => s.id === id)
                setForm((p) => ({
                  ...p,
                  mitarbeiter_id: id,
                  mitarbeiter_name: m
                    ? `${m.vorname || ''} ${m.nachname || ''}`.trim()
                    : '',
                }))
              }}
            >
              <option value="">{copy.staffPh || 'Select staff profile…'}</option>
              {staffRoster.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.vorname} {m.nachname}
                  {m.rolle ? ` (${m.rolle})` : ''}
                </option>
              ))}
            </Select>
            <Select
              label={copy.room}
              value={form.raum_id}
              onChange={(e) => {
                const id = e.target.value
                const room = rooms.find((r) => r.id === id)
                setForm((p) => {
                  const roomIds = Array.isArray(room?.laser_device_ids) && room.laser_device_ids.length
                    ? room.laser_device_ids.map(String)
                    : room?.laser_device_id
                      ? [String(room.laser_device_id)]
                      : []
                  const nextLaserId =
                    p.laser_device_id && roomIds.includes(String(p.laser_device_id))
                      ? p.laser_device_id
                      : roomIds.find((rid) => laserInventory.some((d) => String(d.id) === rid)) ||
                        ''
                  const device = laserInventory.find((d) => d.id === nextLaserId)
                  return {
                    ...p,
                    raum_id: id,
                    raum_name: room?.name || '',
                    laser_device_id: nextLaserId || '',
                    studio_laser_brand: device?.manufacturer || '',
                    studio_laser_model: device?.model || '',
                    laser_typ: device?.laser_type || '',
                    wavelength_entries: [
                      {
                        wavelength_nm: '',
                        fluence_j_cm2: '',
                        spot_size_mm: '',
                        frequency_hz: '',
                        pass_count: '',
                      },
                    ],
                  }
                })
              }}
            >
              <option value="">{copy.roomPh || 'Select room…'}</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </div>
          <p className="m-0 text-[11px] text-studio-w3">
            {copy.documentedBy || 'Documented by'}:{' '}
            <span className="text-studio-white">
              {authUser?.name || authUser?.email || '—'}
            </span>
          </p>
          <Toggle
            label={copy.noShow}
            hint={copy.noShowHint}
            checked={form.is_no_show}
            onChange={setVal('is_no_show')}
          />
        </Section>

        {!form.is_no_show && (
          <Section title={copy.prePhotoTitle}>
            <p className="text-studio-w3 text-[11px] m-0 -mt-1">
              {kiAvailable ? copy.prePhotoHintNext : copy.prePhotoHintFirst}
            </p>
            {prePhotoPreview ? (
              <div className="relative rounded-[12px] border border-elaya-border bg-studio-bg-4 overflow-hidden max-w-[280px]">
                <img
                  src={prePhotoPreview}
                  alt={copy.prePhotoAlt}
                  className="w-full aspect-square object-cover"
                />
                <button
                  type="button"
                  onClick={removePrePhoto}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer border-0 hover:bg-black/80"
                  aria-label={copy.photoRemoveAria}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => prePhotoInputRef.current?.click()}
                className="w-full max-w-[280px] flex flex-col items-center justify-center gap-2 py-8 cursor-pointer bg-studio-bg-4/50 border border-dashed border-elaya-border rounded-[12px] text-studio-w3 hover:text-studio-w2 transition-colors"
              >
                <Camera size={24} strokeWidth={1.5} />
                <span className="text-[11px]">{copy.photoSelect}</span>
              </button>
            )}
            <input
              ref={prePhotoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={selectPrePhoto}
            />
            {prePhotoFile && kiAvailable && (
              <Toggle
                label={copy.aiAuto}
                hint={copy.aiAutoHint}
                checked={autoAnalyze}
                onChange={setAutoAnalyze}
              />
            )}
          </Section>
        )}

        {/* ── Section 2: Laser (hidden on no-show) ── */}
        {!form.is_no_show && (
          <Section title={copy.laserParams}>
            <Select
              label={copy.laserDevice || 'Laser'}
              value={form.laser_device_id}
              onChange={(e) => {
                const id = e.target.value
                const device = laserInventory.find((d) => d.id === id)
                setForm((p) => ({
                  ...p,
                  laser_device_id: id,
                  studio_laser_brand: device?.manufacturer || '',
                  studio_laser_model: device?.model || '',
                  laser_typ: device?.laser_type || '',
                  wavelength_entries: [
                    {
                      wavelength_nm: '',
                      fluence_j_cm2: '',
                      spot_size_mm: '',
                      frequency_hz: '',
                      pass_count: '',
                    },
                  ],
                }))
              }}
            >
              <option value="">{copy.laserDevicePh || 'Select laser…'}</option>
              {lasersForRoom.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Input label={copy.brand} value={form.studio_laser_brand} readOnly disabled />
              <Input label={copy.model} value={form.studio_laser_model} readOnly disabled />
            </div>
            <Input label={copy.laserType} value={form.laser_typ} readOnly disabled />
            <p className="m-0 text-[11px] text-studio-w3">{copy.laserCatalogHint}</p>

            {(form.wavelength_entries || []).map((entry, index) => (
              <div
                key={`wl-${index}`}
                className="flex flex-col gap-3 p-3 rounded-[10px] border border-elaya-border bg-studio-bg-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="m-0 text-[12px] font-semibold text-studio-white">
                    {copy.wavelengthN || 'Wavelength'} {index + 1}
                  </p>
                  {form.wavelength_entries.length > 1 ? (
                    <button
                      type="button"
                      className="text-[11px] text-studio-red border-0 bg-transparent cursor-pointer"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          wavelength_entries: p.wavelength_entries.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      {copy.removeWavelength || 'Remove'}
                    </button>
                  ) : null}
                </div>
                <Select
                  label={copy.wavelengths}
                  value={entry.wavelength_nm}
                  onChange={(e) => {
                    const value = e.target.value
                    setForm((p) => ({
                      ...p,
                      wavelength_entries: p.wavelength_entries.map((row, i) =>
                        i === index ? { ...row, wavelength_nm: value } : row
                      ),
                    }))
                  }}
                  disabled={!form.laser_device_id}
                >
                  <option value="">{copy.wavelengthPh || 'Select wavelength…'}</option>
                  {approvedWavelengths
                    .filter((nm) => {
                      const used = (form.wavelength_entries || [])
                        .filter((_, i) => i !== index)
                        .map((row) => Number(row.wavelength_nm))
                      return (
                        Number(entry.wavelength_nm) === Number(nm) ||
                        !used.includes(Number(nm))
                      )
                    })
                    .map((nm) => (
                      <option key={nm} value={nm}>
                        {nm} nm
                      </option>
                    ))}
                </Select>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Input
                    label={copy.fluence}
                    type="number"
                    min="0"
                    step="0.1"
                    value={entry.fluence_j_cm2}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        wavelength_entries: p.wavelength_entries.map((row, i) =>
                          i === index ? { ...row, fluence_j_cm2: e.target.value } : row
                        ),
                      }))
                    }
                    placeholder="3.5"
                  />
                  <Input
                    label={copy.spotMm}
                    type="number"
                    min="0"
                    step="0.1"
                    value={entry.spot_size_mm}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        wavelength_entries: p.wavelength_entries.map((row, i) =>
                          i === index ? { ...row, spot_size_mm: e.target.value } : row
                        ),
                      }))
                    }
                    placeholder="6"
                  />
                  <Input
                    label={copy.freqHz}
                    type="number"
                    min="0"
                    value={entry.frequency_hz}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        wavelength_entries: p.wavelength_entries.map((row, i) =>
                          i === index ? { ...row, frequency_hz: e.target.value } : row
                        ),
                      }))
                    }
                    placeholder="2"
                  />
                  <Input
                    label={copy.passes}
                    type="number"
                    min="0"
                    value={entry.pass_count}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        wavelength_entries: p.wavelength_entries.map((row, i) =>
                          i === index ? { ...row, pass_count: e.target.value } : row
                        ),
                      }))
                    }
                    placeholder="3"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!form.laser_device_id || approvedWavelengths.length === 0}
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  wavelength_entries: [
                    ...p.wavelength_entries,
                    {
                      wavelength_nm: '',
                      fluence_j_cm2: '',
                      spot_size_mm: '',
                      frequency_hz: '',
                      pass_count: '',
                    },
                  ],
                }))
              }
            >
              {copy.addWavelength || '+ Add wavelength / parameters'}
            </Button>
            <Toggle label={copy.cooling} checked={form.cooling_used} onChange={setVal('cooling_used')} />
          </Section>
        )}

        {/* ── Section 3: Immediate outcome (hidden on no-show) ── */}
        {!form.is_no_show && (
          <Section title={copy.outcome}>
            <p className="text-studio-w3 text-[11px] m-0 -mt-1">{copy.outcomeHint}</p>

            <div className="flex flex-col gap-2">
              <span className="text-studio-white text-[12px] font-semibold">{copy.endpoint}</span>
              <div className="flex flex-wrap gap-1.5">
                {ENDPOINT_REACTION_KEYS.map((key) => (
                  <Chip
                    key={key}
                    active={(form.endpoint_reactions || []).includes(key)}
                    onClick={() => toggleEndpointReaction(key)}
                  >
                    {copy.endpointOptions?.[key] || key}
                  </Chip>
                ))}
              </div>
              {(form.endpoint_reactions || []).includes('other') && (
                <Input
                  label={copy.endpointOtherNote}
                  value={form.endpoint_reaction_note}
                  onChange={set('endpoint_reaction_note')}
                  placeholder={copy.endpointOtherNotePh}
                />
              )}
            </div>

            <div className="flex flex-col gap-2 pt-1 border-t border-elaya-border">
              <span className="text-studio-white text-[12px] font-semibold">{copy.photoTitle}</span>
              {postPhotoPreview ? (
                <div className="relative rounded-[12px] border border-elaya-border bg-studio-bg-4 overflow-hidden max-w-[280px]">
                  <img
                    src={postPhotoPreview}
                    alt={copy.photoAlt}
                    className="w-full aspect-square object-cover"
                  />
                  <button
                    type="button"
                    onClick={removePostPhoto}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer border-0 hover:bg-black/80"
                    aria-label={copy.photoRemoveAria}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => postPhotoInputRef.current?.click()}
                  className="w-full max-w-[280px] flex flex-col items-center justify-center gap-2 py-8 cursor-pointer bg-studio-bg-4/50 border border-dashed border-elaya-border rounded-[12px] text-studio-w3 hover:text-studio-w2 transition-colors"
                >
                  <Camera size={24} strokeWidth={1.5} />
                  <span className="text-[11px]">{copy.photoSelect}</span>
                </button>
              )}
              <input
                ref={postPhotoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={selectPostPhoto}
              />
              <p className="text-studio-w3 text-[11px] m-0">{copy.postPhotoHint}</p>
            </div>

            <div className="flex flex-col gap-3 pt-1 border-t border-elaya-border">
              <Toggle
                label={copy.unusual}
                hint={copy.unusualHint}
                checked={form.unusual_immediate_reaction}
                onChange={(val) => {
                  setVal('unusual_immediate_reaction')(val)
                  if (!val) removeUnusualPhoto()
                }}
              />
              {form.unusual_immediate_reaction && (
                <>
                  <Input
                    label={copy.unusualType}
                    value={form.unusual_reaction_type}
                    onChange={set('unusual_reaction_type')}
                    placeholder={copy.unusualTypePh}
                  />
                  <Input
                    label={copy.unusualDescription}
                    value={form.unusual_reaction_description}
                    onChange={set('unusual_reaction_description')}
                    placeholder={copy.unusualDescriptionPh}
                  />
                  <div className="flex flex-col gap-2">
                    <span className="text-studio-w1 text-[12px] font-semibold">{copy.unusualPhoto}</span>
                    {unusualPhotoPreview ? (
                      <div className="relative rounded-[12px] border border-elaya-border bg-studio-bg-4 overflow-hidden max-w-[220px]">
                        <img
                          src={unusualPhotoPreview}
                          alt={copy.unusualPhotoAlt}
                          className="w-full aspect-square object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeUnusualPhoto}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer border-0 hover:bg-black/80"
                          aria-label={copy.photoRemoveAria}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => unusualPhotoInputRef.current?.click()}
                        className="w-full max-w-[220px] flex flex-col items-center justify-center gap-2 py-6 cursor-pointer bg-studio-bg-4/50 border border-dashed border-elaya-border rounded-[12px] text-studio-w3 hover:text-studio-w2 transition-colors"
                      >
                        <Camera size={20} strokeWidth={1.5} />
                        <span className="text-[11px]">{copy.photoSelect}</span>
                      </button>
                    )}
                    <input
                      ref={unusualPhotoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={selectUnusualPhoto}
                    />
                  </div>
                  <Input
                    label={copy.unusualAction}
                    value={form.unusual_reaction_action_taken}
                    onChange={set('unusual_reaction_action_taken')}
                    placeholder={copy.unusualActionPh}
                  />
                  <Toggle
                    label={copy.unusualStopped}
                    checked={form.unusual_reaction_treatment_stopped}
                    onChange={setVal('unusual_reaction_treatment_stopped')}
                  />
                </>
              )}
            </div>
          </Section>
        )}

        {/* ── Section 4: Payment ── */}
        <Section title={copy.payment}>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label={copy.amountChf}
              type="number"
              min="0"
              step="0.01"
              value={form.zahlung_betragCHF}
              onChange={set('zahlung_betragCHF')}
              placeholder="120.00"
            />
            <Select label={copy.paymentMethod} value={form.zahlung_zahlungsart} onChange={set('zahlung_zahlungsart')}>
              <option value="">{copy.selectOption}</option>
              <option value="bar">{copy.cash}</option>
              <option value="karte">{copy.card}</option>
              <option value="twint">{copy.twint}</option>
            </Select>
            <Input
              label={copy.discountChf}
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
        <Section title={copy.notes}>
          <div className="flex flex-col gap-1.5">
            <label className="text-studio-white text-[12px] font-semibold">{copy.specialNotes}</label>
            <textarea
              value={form.special_notes}
              onChange={(e) => setForm((p) => ({ ...p, special_notes: e.target.value }))}
              rows={3}
              placeholder={copy.notesPh}
              className="w-full px-3 py-2.5 rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-w1 text-[12px] outline-none focus:border-studio-gold transition-colors placeholder:text-studio-w3 resize-none"
            />
          </div>
        </Section>

        {/* ── Bottom actions ── */}
        <div className="flex justify-end gap-3 pb-4">
          <Button variant="ghost" onClick={() => navigate(`/studio/cases/${caseId}`)} disabled={saving}>
            {copy.cancel}
          </Button>
          <Button variant="secondary" loading={savingDraft} disabled={saving} onClick={() => handleSave(true)}>
            {copy.saveDraft}
          </Button>
          <Button loading={savingFinal} disabled={saving} onClick={() => handleSave(false)}>
            {copy.complete}
          </Button>
        </div>

      </div>
    </div>
  )
}

export default NewSession
