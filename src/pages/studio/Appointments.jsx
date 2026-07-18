import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Lock, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { listAppointments, createAppointment } from '../../api/appointments'
import { listCustomers } from '../../api/customers'
import { listCases, getCaseAvailability } from '../../api/cases'
import { fmtDateDeLong } from '../../utils/time'
import PreSessionCheck, { EMPTY_PRE_SESSION, preSessionToParams, preSessionToBody } from '../../components/case/PreSessionCheck'
import GroupBookingModal from '../../components/appointments/GroupBookingModal'
import GroupDetailModal from '../../components/appointments/GroupDetailModal'
import { Button, Spinner, Modal, Input, Select } from '../../components/ui'

// ── Constants ──────────────────────────────────────────────────────────────
const HOUR_H    = 64
const DAY_START = 7
const DAY_END   = 21
const HOURS     = Array.from({ length: DAY_END - DAY_START }, (_, i) => DAY_START + i)
const DAYS_DE   = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONTHS_DE = ['Jan', 'Feb', 'März', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

const TYPE_STYLE = {
  beratung:  'border-studio-amber  bg-studio-amber/10  text-studio-amber',
  treatment: 'border-studio-gold-2 bg-studio-gold/10   text-studio-gold-2',
  first:     'border-elaya-success bg-elaya-success/10 text-elaya-success',
}

const TYPE_LABELS = {
  beratung:  'Beratung',
  treatment: 'Behandlung',
  first:     'Erstbehandlung',
}

const EMPTY_FORM = {
  customer_id:   '',
  case_id:       '',
  date:          '',
  time:          '',
  type:          'treatment',
  dauer_minuten: 60,
}

// ── Helpers ────────────────────────────────────────────────────────────────
const getMondayOf = (date) => {
  const d = new Date(date)
  d.setDate(d.getDate() + (d.getDay() === 0 ? -6 : 1 - d.getDay()))
  d.setHours(0, 0, 0, 0)
  return d
}

const addDays = (date, n) => {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

// Uses local date parts to avoid UTC-offset day shift
const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const getWeekNum = (date) => {
  const d      = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

const fmtWeekRange = (monday) => {
  const sunday    = addDays(monday, 6)
  const sameMonth = monday.getMonth() === sunday.getMonth()
  if (sameMonth) {
    return `${monday.getDate()}. – ${sunday.getDate()}. ${MONTHS_DE[sunday.getMonth()]} ${sunday.getFullYear()}`
  }
  return `${monday.getDate()}. ${MONTHS_DE[monday.getMonth()]} – ${sunday.getDate()}. ${MONTHS_DE[sunday.getMonth()]} ${sunday.getFullYear()}`
}

const toMinutes = (time) => {
  const [h = 0, m = 0] = (time ?? '00:00').split(':').map(Number)
  return h * 60 + m
}

const snapTime = (yPx) => {
  const totalMin = Math.round((yPx / HOUR_H * 60) / 15) * 15 + DAY_START * 60
  const clamped  = Math.max(DAY_START * 60, Math.min((DAY_END - 1) * 60 + 45, totalMin))
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`
}

const bookingErrorMessage = (err) => {
  const msg = err.response?.data?.message
  const fruehestes = err.response?.data?.errors?.fruehestes ?? err.response?.data?.fruehestes
  if (fruehestes) {
    return `${msg ?? 'Termin nicht erlaubt.'} Frühestens: ${fmtDateDeLong(fruehestes)}.`
  }
  return msg ?? 'Fehler beim Buchen.'
}

// ── CurrentTimeLine ────────────────────────────────────────────────────────
const CurrentTimeLine = () => {
  const [top, setTop] = useState(null)

  useEffect(() => {
    const calc = () => {
      const now = new Date()
      const h   = now.getHours()
      const m   = now.getMinutes()
      setTop(h < DAY_START || h >= DAY_END ? null : ((h - DAY_START) + m / 60) * HOUR_H)
    }
    calc()
    const id = setInterval(calc, 60_000)
    return () => clearInterval(id)
  }, [])

  // Always renders a DOM node so React has a stable insertion reference
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {top !== null && (
        <div className="absolute left-0 right-0 z-10 flex items-center pointer-events-none" style={{ top }}>
          <div className="w-2 h-2 rounded-full bg-elaya-error shrink-0" />
          <div className="flex-1 h-px bg-elaya-error" />
        </div>
      )}
    </div>
  )
}

// ── ApptBlock ──────────────────────────────────────────────────────────────
const ApptBlock = memo(({ appt, onClick }) => {
  const startMin = toMinutes(appt.time)
  const dur      = appt.dauer_minuten ?? 60
  const top      = (startMin - DAY_START * 60) / 60 * HOUR_H
  const height   = Math.max(dur / 60 * HOUR_H, 24)
  const faded    = appt.status === 'storniert' || appt.status === 'cancelled'
  const style    = TYPE_STYLE[appt.type] ?? TYPE_STYLE.treatment
  const isGroup  = !!appt.gruppen_termin
  const groupN   = appt.gruppen_cases?.length
    ? appt.gruppen_cases.length
    : (appt._groupCount ?? 0)

  const name = appt.customer
    ? `${appt.customer.vorname ?? ''} ${appt.customer.nachname ?? ''}`.trim()
    : '—'

  return (
    <button
      type="button"
      style={{ top, height, left: 3, right: 3, position: 'absolute' }}
      className={`rounded-[6px] px-2 py-1 overflow-hidden z-5 cursor-pointer pointer-events-auto
        border-0 border-l-[3px] text-left ${style}
        ${faded ? 'opacity-40' : 'hover:brightness-125 active:brightness-90'}
        transition-[filter]`}
      onClick={(e) => { e.stopPropagation(); onClick(appt) }}
      title={`${name} · ${TYPE_LABELS[appt.type] ?? appt.type}${isGroup ? ` · Gruppen (${groupN})` : ''}`}
    >
      <p className="text-[11px] font-bold truncate m-0 leading-snug">{name}</p>
      {height > 36 && (
        <p className="text-[10px] opacity-75 truncate m-0 leading-snug">
          {isGroup
            ? `Gruppen (${groupN}) · ${TYPE_LABELS[appt.type] ?? appt.type}`
            : `${appt.case?.caseId ?? '—'} · ${TYPE_LABELS[appt.type] ?? appt.type}`}
        </p>
      )}
      {height > 56 && (
        <p className="text-[10px] opacity-50 truncate m-0 leading-snug">
          {appt.time}{appt.dauer_minuten ? ` · ${appt.dauer_minuten} min` : ''}
          {isGroup && appt.gruppen_preis_total != null ? ` · CHF ${appt.gruppen_preis_total}` : ''}
        </p>
      )}
    </button>
  )
})

/** Collapse sibling group appointments into one calendar block */
const collapseGroupAppointments = (appointments) => {
  const seen = new Set()
  const result = []

  for (const a of appointments) {
    if (a.gruppen_termin && a.gruppen_id) {
      if (seen.has(a.gruppen_id)) continue
      seen.add(a.gruppen_id)
      const siblings = appointments.filter((x) => x.gruppen_id === a.gruppen_id)
      result.push({
        ...a,
        _groupCount: siblings.length || a.gruppen_cases?.length || 2,
        _siblings: siblings,
      })
    } else {
      result.push(a)
    }
  }

  return result
}

// ── DayCol ─────────────────────────────────────────────────────────────────
const DayCol = memo(({ dateISO, isToday, appointments, onApptClick, onCellClick }) => {
  const handleClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    onCellClick(dateISO, snapTime(e.clientY - rect.top))
  }, [dateISO, onCellClick])

  return (
    <div className={`flex-1 relative border-l border-elaya-border ${isToday ? 'bg-studio-gold/1.5' : ''}`}>
      <div className="absolute inset-0 cursor-pointer" onClick={handleClick}>
        {HOURS.map((h) => (
          <div
            key={h}
            style={{ height: HOUR_H }}
            className="border-b border-elaya-border/30 hover:bg-studio-gold/3 transition-colors"
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {collapseGroupAppointments(appointments).map((a) => (
          <ApptBlock key={a.gruppen_id || a.id || a._id} appt={a} onClick={onApptClick} />
        ))}
      </div>

      {isToday && <CurrentTimeLine />}
    </div>
  )
})

// ── DayHeaders ─────────────────────────────────────────────────────────────
const DayHeaders = memo(({ weekDays, todayISO }) => (
  <div className="flex shrink-0 border-b border-elaya-border bg-studio-bg">
    <div className="w-14 shrink-0" />
    {weekDays.map(({ date, iso }) => {
      const isToday = iso === todayISO
      const dayIdx  = date.getDay() === 0 ? 6 : date.getDay() - 1
      return (
        <div key={iso} className="flex-1 flex flex-col items-center py-2.5 border-l border-elaya-border">
          <span
            translate="no"
            className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${isToday ? 'text-studio-gold-2' : 'text-studio-w3'}`}
          >
            {DAYS_DE[dayIdx]}
          </span>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold ${isToday ? 'bg-studio-gold text-studio-bg' : 'text-studio-w1'}`}>
            {date.getDate()}
          </div>
        </div>
      )
    })}
  </div>
))

// ── NewApptModal ───────────────────────────────────────────────────────────
const NewApptModal = ({
  defaultDate,
  defaultTime,
  defaultCustomerId = '',
  defaultCaseId = '',
  onClose,
  onCreated,
}) => {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    customer_id: defaultCustomerId,
    case_id: defaultCaseId,
    date: defaultDate ?? '',
    time: defaultTime ?? '',
  })
  const [customers, setCustomers] = useState([])
  const [cases, setCases] = useState([])
  const [loadingCases, setLoadingCases] = useState(false)
  const [saving, setSaving] = useState(false)
  const [availability, setAvailability] = useState(null)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [preSession, setPreSession] = useState({ ...EMPTY_PRE_SESSION })

  useEffect(() => {
    listCustomers({ limit: 100 })
      .then((r) => setCustomers(r.data.data.customers ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!form.customer_id) {
      setCases([])
      return
    }
    setLoadingCases(true)
    listCases({ customer_id: form.customer_id, limit: 50 })
      .then((r) => setCases(r.data.data.cases ?? []))
      .catch(() => {})
      .finally(() => setLoadingCases(false))
  }, [form.customer_id])

  useEffect(() => {
    if (!form.case_id || form.type === 'beratung') {
      setAvailability(null)
      return
    }

    let cancelled = false
    setLoadingAvailability(true)

    const from = form.date || toISO(new Date())
    const toDate = addDays(new Date(`${from}T12:00:00`), 120)
    const to = toISO(toDate)

    getCaseAvailability(form.case_id, { from, to, ...preSessionToParams(preSession) })
      .then((res) => {
        if (!cancelled) setAvailability(res.data.data)
      })
      .catch(() => {
        if (!cancelled) setAvailability(null)
      })
      .finally(() => {
        if (!cancelled) setLoadingAvailability(false)
      })

    return () => { cancelled = true }
  }, [form.case_id, form.type, form.date, preSession])

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))
  const onCustomerChange = (e) => {
    setCases([])
    setAvailability(null)
    setForm((p) => ({ ...p, customer_id: e.target.value, case_id: '' }))
  }

  const onCaseChange = (e) => {
    setAvailability(null)
    setForm((p) => ({ ...p, case_id: e.target.value }))
  }

  const onTypeChange = (e) => {
    const type = e.target.value
    setForm((p) => ({ ...p, type }))
    if (type === 'beratung') {
      setAvailability(null)
      setPreSession({ ...EMPTY_PRE_SESSION })
    }
  }

  const handleSubmit = async () => {
    if (!form.case_id || !form.date || !form.time) {
      toast.error('Fall, Datum und Uhrzeit sind Pflichtfelder.')
      return
    }

    if (
      availability?.fruehestes &&
      form.type !== 'beratung' &&
      form.date < availability.fruehestes
    ) {
      toast.error(`Termin zu früh. Frühestens buchbar ab ${fmtDateDeLong(availability.fruehestes)}.`)
      return
    }

    setSaving(true)
    try {
      await createAppointment({
        case_id:          form.case_id,
        date:             form.date,
        time:             form.time,
        type:             form.type,
        dauer_minuten:    Number(form.dauer_minuten) || null,
        consultationOnly: form.type === 'beratung',
        preSessionCheck:  form.type === 'beratung' ? undefined : preSessionToBody(preSession),
      })
      toast.success('Termin erfolgreich gebucht.')
      onCreated()
    } catch (err) {
      toast.error(bookingErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const casePlaceholder = !form.customer_id
    ? 'Zuerst Kunden auswählen…'
    : loadingCases
    ? 'Lädt…'
    : cases.length === 0
    ? 'Kein Fall vorhanden — zuerst Fall anlegen'
    : 'Fall auswählen…'

  const showLockoutHint = form.case_id && form.type !== 'beratung'

  return (
    <Modal title="Neuen Termin buchen" onClose={onClose} width="max-w-lg">
      <div className="flex flex-col gap-4">
        <Select label="Kunde *" value={form.customer_id} onChange={onCustomerChange}>
          <option value="">Kunden auswählen…</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>{c.vorname} {c.nachname}</option>
          ))}
        </Select>

        <Select
          label="Fall *"
          value={form.case_id}
          onChange={onCaseChange}
          disabled={!form.customer_id || loadingCases || cases.length === 0}
        >
          <option value="">{casePlaceholder}</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>{c.caseId} · {c.tc_title || c.bodyLabel || c.type}</option>
          ))}
        </Select>

        {showLockoutHint && (
          <>
            <PreSessionCheck value={preSession} onChange={setPreSession} compact />

            <div className="rounded-[10px] border border-elaya-border bg-studio-bg-4 px-3 py-2.5">
            {loadingAvailability ? (
              <p className="text-studio-w3 text-[11px] m-0">Sperrfristen werden geladen…</p>
            ) : availability ? (
              <>
                <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0 mb-1">
                  Intelligente Buchung
                </p>
                <p translate="no" className="text-studio-white text-[12px] font-semibold m-0">
                  Frühestens: {fmtDateDeLong(availability.fruehestes)}
                </p>
                {availability.sperren?.length > 0 && (
                  <ul className="mt-2 mb-0 pl-0 list-none flex flex-col gap-1">
                    {availability.sperren.slice(0, 3).map((s, i) => (
                      <li key={i} className="flex gap-1.5 text-[10px] text-studio-w2 leading-snug">
                        <Lock size={10} className="shrink-0 mt-0.5 text-elaya-warning" />
                        <span>{s.grund}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="text-studio-w3 text-[11px] m-0">Verfügbarkeit konnte nicht geladen werden.</p>
            )}
          </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Datum *"
            type="date"
            value={form.date}
            min={showLockoutHint && availability?.fruehestes ? availability.fruehestes : undefined}
            onChange={set('date')}
          />
          <Input label="Uhrzeit *" type="time" value={form.time} onChange={set('time')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Art" value={form.type} onChange={onTypeChange}>
            <option value="treatment">Behandlung</option>
            <option value="beratung">Beratung</option>
            <option value="first">Erstbehandlung</option>
          </Select>
          <Input label="Dauer (Min.)" type="number" min={15} step={15} value={form.dauer_minuten} onChange={set('dauer_minuten')} />
        </div>

        {form.type === 'beratung' && (
          <p className="text-studio-w3 text-[11px] m-0">
            Beratungstermine sind von Behandlungs-Sperrfristen ausgenommen.
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Abbrechen</Button>
          <Button loading={saving} disabled={cases.length === 0} onClick={handleSubmit}>
            <Plus size={14} />
            Buchen
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
const StudioAppointments = () => {
  const navigate  = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const scrollRef = useRef(null)

  const [weekStart, setWeekStart]   = useState(() => getMondayOf(new Date()))
  const [apptsByDay, setApptsByDay] = useState({})
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [groupDetail, setGroupDetail] = useState(null)
  const [prefill, setPrefill]       = useState({ date: '', time: '' })
  const [modalDefaults, setModalDefaults] = useState({ customerId: '', caseId: '' })

  const urlCaseId = searchParams.get('case_id') ?? ''
  const urlCustomerId = searchParams.get('customer_id') ?? ''
  const urlBook = searchParams.get('book') === '1'

  // Compute todayISO once per render (cheap, but avoids 7+ calls in DayHeaders)
  const todayISO = toISO(new Date())

  // Memoize weekDays to avoid 7 new Date objects per render
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i)
      return { date, iso: toISO(date) }
    }),
    [weekStart],
  )

  const load = useCallback(async (from) => {
    setLoading(true)
    try {
      const to           = addDays(from, 6)
      const res          = await listAppointments({ from: toISO(from), to: toISO(to), limit: 100 })
      const appointments = res.data.data.appointments ?? []
      const grouped      = {}
      for (const a of appointments) {
        const key = toISO(new Date(a.date))
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(a)
      }
      setApptsByDay(grouped)
    } catch {
      toast.error('Termine konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(weekStart) }, [weekStart, load])

  useEffect(() => {
    if (!urlBook) return
    setModalDefaults({ customerId: urlCustomerId, caseId: urlCaseId })
    setPrefill({ date: todayISO, time: '09:00' })
    setShowModal(true)
    setSearchParams({}, { replace: true })
  }, [urlBook, urlCaseId, urlCustomerId, todayISO, setSearchParams])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (8 - DAY_START) * HOUR_H - 8
    }
  }, [])

  const goToWeek  = useCallback((dir) => setWeekStart((prev) => addDays(prev, dir * 7)), [])
  const goToToday = useCallback(() => setWeekStart(getMondayOf(new Date())), [])
  const openModal = useCallback((date, time) => { setPrefill({ date, time }); setShowModal(true) }, [])

  const handleApptClick = useCallback((appt) => {
    if (appt.gruppen_termin) {
      setGroupDetail({
        appt,
        siblings: appt._siblings?.length
          ? appt._siblings
          : Object.values(apptsByDay)
              .flat()
              .filter((x) => x.gruppen_id && x.gruppen_id === appt.gruppen_id),
      })
      return
    }
    const caseId = appt.case?._id ?? appt.case
    if (caseId) navigate(`/studio/cases/${caseId}`)
  }, [navigate, apptsByDay])

  const openCaseFromGroup = useCallback((caseId) => {
    setGroupDetail(null)
    navigate(`/studio/cases/${caseId}`)
  }, [navigate])

  const totalCount = Object.values(apptsByDay).reduce((s, arr) => s + arr.length, 0)
  const weekNum    = getWeekNum(weekStart)

  return (
    <div className="flex flex-col" style={{ height: '100vh' }}>

      {/* Header */}
      <div className="px-6 pt-5 pb-3 border-b border-elaya-border bg-studio-bg shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[20px] font-bold text-studio-white m-0 leading-none">Termine</h1>
            <p className="text-studio-w2 text-[12px] m-0 mt-1">
              KW {weekNum} · {totalCount} Termin{totalCount !== 1 ? 'e' : ''} diese Woche
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={goToToday}>Heute</Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setPrefill({ date: todayISO, time: '09:00' })
                setShowGroupModal(true)
              }}
            >
              <Users size={14} />
              Gruppen-Termin
            </Button>
            <Button size="sm" onClick={() => openModal(todayISO, '09:00')}>
              <Plus size={14} />
              Neuer Termin
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToWeek(-1)}
            className="p-1.5 rounded-[7px] text-studio-w2 hover:text-studio-white hover:bg-studio-bg-4 transition-colors cursor-pointer"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-studio-white text-[13px] font-semibold min-w-[210px]">
            {fmtWeekRange(weekStart)}
          </span>
          <button
            type="button"
            onClick={() => goToWeek(1)}
            className="p-1.5 rounded-[7px] text-studio-w2 hover:text-studio-white hover:bg-studio-bg-4 transition-colors cursor-pointer"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Day-name header */}
      <DayHeaders weekDays={weekDays} todayISO={todayISO} />

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 bg-studio-bg">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="flex" style={{ height: HOURS.length * HOUR_H }}>

            {/* Time labels */}
            <div className="w-14 shrink-0 bg-studio-bg">
              {HOURS.map((h) => (
                <div
                  key={h}
                  style={{ height: HOUR_H }}
                  className="flex items-start justify-end pr-2 pt-1 border-b border-elaya-border/20"
                >
                  <span className="text-[10px] text-studio-w3 font-mono">
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map(({ iso }) => (
              <DayCol
                key={iso}
                dateISO={iso}
                isToday={iso === todayISO}
                appointments={apptsByDay[iso] ?? []}
                onApptClick={handleApptClick}
                onCellClick={openModal}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <NewApptModal
          defaultDate={prefill.date}
          defaultTime={prefill.time}
          defaultCustomerId={modalDefaults.customerId}
          defaultCaseId={modalDefaults.caseId}
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); load(weekStart) }}
        />
      )}

      {showGroupModal && (
        <GroupBookingModal
          defaultDate={prefill.date || todayISO}
          defaultTime={prefill.time || '09:00'}
          onClose={() => setShowGroupModal(false)}
          onCreated={() => { setShowGroupModal(false); load(weekStart) }}
        />
      )}

      {groupDetail && (
        <GroupDetailModal
          appt={groupDetail.appt}
          siblings={groupDetail.siblings}
          onClose={() => setGroupDetail(null)}
          onOpenCase={openCaseFromGroup}
        />
      )}
    </div>
  )
}

export default StudioAppointments
