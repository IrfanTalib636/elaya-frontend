import { useState, useEffect, useMemo } from 'react'
import { Users, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { createAppointment } from '../../api/appointments'
import { listCustomers } from '../../api/customers'
import { listCases, getCase, getCasePricing, getCaseAvailability } from '../../api/cases'
import { getPublicConfig } from '../../api/config'
import { fmtDateDeLong } from '../../utils/time'
import { Button, Spinner, Modal, Input, Select } from '../ui'
import useContent from '../../i18n/useContent'
import {
  DEFAULT_GRUPPEN_CONFIG,
  isGroupEligibleCase,
  caseGroesse,
  calcGroupPricing,
  totalPunkte,
  canToggleCase,
  fmtCHF,
  normalizeGruppenConfig,
} from '../../utils/groupBooking'

const addDaysISO = (iso, n) => {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const bookingErrorMessage = (err, copy) => {
  const msg = err.response?.data?.message
  const fruehestes = err.response?.data?.errors?.fruehestes ?? err.response?.data?.fruehestes
  if (fruehestes) {
    return `${msg ?? copy.notAllowed} ${copy.earliest.replace('{{date}}', fmtDateDeLong(fruehestes))}`
  }
  return msg ?? copy.bookError
}

const SIZE_BADGE = {
  klein: 'bg-elaya-success/15 text-elaya-success',
  mittelgross: 'bg-studio-gold/15 text-studio-gold-2',
  gross: 'bg-elaya-warning/15 text-elaya-warning',
}

const GroupBookingModal = ({ defaultDate, defaultTime, onClose, onCreated }) => {
  const { t, components } = useContent()
  const copy = components.groupBooking
  const [customerId, setCustomerId] = useState('')
  const [customers, setCustomers] = useState([])
  const [cases, setCases] = useState([])
  const [loadingCases, setLoadingCases] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [date, setDate] = useState(defaultDate ?? '')
  const [time, setTime] = useState(defaultTime ?? '09:00')
  const [dauer, setDauer] = useState(90)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState(DEFAULT_GRUPPEN_CONFIG)
  const [hint, setHint] = useState('')
  const [fruehestes, setFruehestes] = useState(null)
  const [loadingLockout, setLoadingLockout] = useState(false)

  useEffect(() => {
    listCustomers({ limit: 100 })
      .then((r) => setCustomers(r.data.data.customers ?? []))
      .catch(() => {})

    getPublicConfig()
      .then((r) => {
        const gg = r.data?.data?.config?.gruppen_groessen
        if (gg) setConfig(normalizeGruppenConfig(gg))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!customerId) {
      setCases([])
      setSelectedIds([])
      return
    }

    let cancelled = false
    setLoadingCases(true)
    setSelectedIds([])
    setFruehestes(null)

    ;(async () => {
      try {
        const res = await listCases({ customer_id: customerId, limit: 50 })
        const raw = (res.data.data.cases ?? []).filter(isGroupEligibleCase)

        const enriched = await Promise.all(
          raw.map(async (c) => {
            let next = c

            if (c.zonen_aktiv) {
              try {
                const detail = await getCase(c.id)
                next = detail.data.data.case ?? c
              } catch {
                /* keep list row */
              }
            }

            if (!(Number(next.pricePerSession) > 0)) {
              try {
                const priceRes = await getCasePricing(c.id)
                const pps = priceRes.data?.data?.pricePerSession
                if (Number(pps) > 0) {
                  next = { ...next, pricePerSession: pps }
                }
              } catch {
                /* leave 0 */
              }
            }

            return next
          })
        )

        if (!cancelled) setCases(enriched)
      } catch {
        if (!cancelled) setCases([])
      } finally {
        if (!cancelled) setLoadingCases(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [customerId])

  // Strictest lockout across selected cases (max fruehestes)
  useEffect(() => {
    if (selectedIds.length < 2) {
      setFruehestes(null)
      return
    }

    let cancelled = false
    setLoadingLockout(true)

    const from = date || new Date().toISOString().slice(0, 10)
    const to = addDaysISO(from, 120)

    ;(async () => {
      try {
        const results = await Promise.all(
          selectedIds.map((id) =>
            getCaseAvailability(id, { from, to })
              .then((r) => r.data?.data?.fruehestes)
              .catch(() => null)
          )
        )
        if (cancelled) return
        const dates = results.filter(Boolean).sort()
        const latest = dates.length ? dates[dates.length - 1] : null
        setFruehestes(latest)
        if (latest) {
          setDate((prev) => (!prev || prev < latest ? latest : prev))
        }
      } catch {
        if (!cancelled) setFruehestes(null)
      } finally {
        if (!cancelled) setLoadingLockout(false)
      }
    })()

    return () => {
      cancelled = true
    }
    // Only when selection changes — avoid date loop
  }, [selectedIds]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedCases = useMemo(
    () => cases.filter((c) => selectedIds.includes(String(c.id ?? c._id))),
    [cases, selectedIds]
  )

  const pricing = useMemo(() => calcGroupPricing(selectedCases, config), [selectedCases, config])
  const punkte = useMemo(() => totalPunkte(selectedCases, config), [selectedCases, config])
  const rabattPctLabel = Math.round((config.gruppen_rabatt ?? 0.15) * 100)

  const toggleCase = (caseDoc) => {
    const result = canToggleCase(caseDoc, selectedIds, cases, config)
    if (!result.ok) {
      setHint(result.reason)
      return
    }
    setHint('')
    setSelectedIds(result.next)
  }

  const handleSubmit = async () => {
    if (selectedIds.length < 2) {
      toast.error(copy.minCases)
      return
    }
    if (!date || !time) {
      toast.error(copy.dateTimeRequired)
      return
    }
    if (fruehestes && date < fruehestes) {
      toast.error(t('components.groupBooking.tooEarly', { date: fmtDateDeLong(fruehestes) }))
      return
    }

    setSaving(true)
    try {
      await createAppointment({
        case_id: selectedIds[0],
        date,
        time,
        type: 'treatment',
        dauer_minuten: Number(dauer) || 90,
        consultationOnly: false,
        gruppen_termin: true,
        gruppen_cases: selectedIds.slice(1),
        gruppen_rabatt: config.gruppen_rabatt ?? 0.15,
        gruppen_preis_total: pricing.gesamt,
      })
      toast.success(t('components.groupBooking.bookSuccess', { count: selectedIds.length }))
      onCreated()
    } catch (err) {
      toast.error(bookingErrorMessage(err, copy))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={copy.title} onClose={onClose} width="max-w-lg">
      <div className="flex flex-col gap-4">
        <p className="text-studio-w2 text-[12px] m-0 leading-relaxed">
          {t('components.groupBooking.intro', { pct: rabattPctLabel, max: config.max_punkte })}
        </p>

        <Select
          label={copy.customer}
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        >
          <option value="">{copy.selectCustomer}</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.vorname} {c.nachname}
            </option>
          ))}
        </Select>

        <div>
          <p className="text-studio-w3 text-[10px] font-semibold uppercase tracking-wider m-0 mb-2">
            {t('components.groupBooking.selectCases', { count: selectedIds.length, points: punkte, max: config.max_punkte })}
          </p>

          {!customerId ? (
            <p className="text-studio-w3 text-[12px] m-0">{copy.selectCustomerFirst}</p>
          ) : loadingCases ? (
            <div className="flex justify-center py-6">
              <Spinner size="sm" />
            </div>
          ) : cases.length === 0 ? (
            <p className="text-studio-w3 text-[12px] m-0">{copy.noEligible}</p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto">
              {cases.map((c) => {
                const id = String(c.id ?? c._id)
                const g = caseGroesse(c, config)
                const isSel = selectedIds.includes(id)
                const probe = canToggleCase(c, selectedIds, cases, config)
                const disabled = !isSel && !probe.ok

                return (
                  <button
                    key={id}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleCase(c)}
                    className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-[8px] border cursor-pointer transition-colors
                      ${isSel
                        ? 'border-studio-gold/40 bg-studio-gold/8'
                        : 'border-elaya-border bg-studio-bg-4 hover:border-studio-w3/30'}
                      ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`w-4 h-4 rounded-[4px] border shrink-0 flex items-center justify-center text-[10px]
                        ${isSel ? 'bg-studio-gold border-studio-gold text-studio-bg' : 'border-studio-w3'}`}
                    >
                      {isSel ? '✓' : ''}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-studio-white text-[12px] font-medium m-0 truncate">
                        {c.caseId} · {c.tc_title || c.bodyLabel || 'Tattoo'}
                      </p>
                      <p className="text-studio-w3 text-[10px] m-0 mt-0.5">
                        {g.cm2 > 0 ? `${g.cm2.toFixed(0)} cm²` : copy.areaNa} · {fmtCHF(c.pricePerSession)}{copy.perSession}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${SIZE_BADGE[g.kategorie]}`}
                    >
                      {g.label} · {g.punkte}P
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {hint && (
            <p className="text-elaya-warning text-[11px] m-0 mt-2">{hint}</p>
          )}
        </div>

        {selectedIds.length >= 2 && (
          <div className="rounded-[10px] border border-studio-gold/25 bg-studio-gold/5 px-3 py-3">
            <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0 mb-2">
              {t('components.groupBooking.priceOverview', { pct: rabattPctLabel })}
            </p>
            <div className="flex flex-col gap-1">
              {pricing.einzel.map((row) => (
                <div key={row.id} className="flex justify-between text-[12px]">
                  <span className="text-studio-w2 truncate mr-2">{row.label}</span>
                  <span className="text-studio-w1 tabular-nums shrink-0">{fmtCHF(row.preis)}</span>
                </div>
              ))}
              <div className="border-t border-elaya-border mt-1.5 pt-1.5 flex justify-between text-[12px]">
                <span className="text-studio-w2">{copy.subtotal}</span>
                <span className="text-studio-w1 tabular-nums">{fmtCHF(pricing.zwischensumme)}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-studio-gold-2">{t('components.groupBooking.discount', { pct: rabattPctLabel })}</span>
                <span className="text-studio-gold-2 tabular-nums">−{fmtCHF(pricing.rabatt)}</span>
              </div>
              <div className="flex justify-between text-[13px] font-semibold mt-0.5">
                <span className="text-studio-white">{copy.total}</span>
                <span className="text-studio-white tabular-nums">{fmtCHF(pricing.gesamt)}</span>
              </div>
            </div>
          </div>
        )}

        {selectedIds.length >= 2 && (
          <div className="rounded-[10px] border border-elaya-border bg-studio-bg-4 px-3 py-2.5">
            {loadingLockout ? (
              <p className="text-studio-w3 text-[11px] m-0">{copy.lockoutLoading}</p>
            ) : fruehestes ? (
              <>
                <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0 mb-1 flex items-center gap-1">
                  <Lock size={10} className="text-elaya-warning" />
                  {copy.lockoutTitle}
                </p>
                <p className="text-studio-white text-[12px] font-semibold m-0">
                  {t('components.groupBooking.earliest', { date: fmtDateDeLong(fruehestes) })}
                </p>
              </>
            ) : (
              <p className="text-studio-w3 text-[11px] m-0">{copy.noLockout}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={copy.dateRequired}
            type="date"
            value={date}
            min={fruehestes || undefined}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input label={copy.timeRequired} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        <Input
          label={copy.durationMin}
          type="number"
          min={30}
          step={15}
          value={dauer}
          onChange={(e) => setDauer(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            {copy.cancel}
          </Button>
          <Button
            loading={saving}
            disabled={selectedIds.length < 2 || !date || !time}
            onClick={handleSubmit}
          >
            <Users size={14} />
            {copy.book}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default GroupBookingModal
