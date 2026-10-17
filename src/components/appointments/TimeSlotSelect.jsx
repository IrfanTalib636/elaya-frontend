import { useEffect, useRef, useState } from 'react'
import { getCaseAvailability } from '../../api/cases'
import { Select } from '../ui'
import useContent from '../../i18n/useContent'
import { freeSlotsForDate } from '../../utils/studioHours'

/**
 * Time choices that the booking API will accept: opening-hour slots for the
 * selected day, with times that are already taken removed.
 */
const TimeSlotSelect = ({ caseId, date, value, onChange, consultationOnly = false }) => {
  const { studioPages } = useContent()
  const copy = studioPages.appointments
  const [slots, setSlots] = useState([])
  const [state, setState] = useState('idle')
  const valueRef = useRef(value)
  const onChangeRef = useRef(onChange)
  valueRef.current = value
  onChangeRef.current = onChange

  useEffect(() => {
    if (!caseId || !date) {
      setSlots([])
      setState('idle')
      return undefined
    }
    let cancelled = false
    setState('loading')
    getCaseAvailability(caseId, {
      from: date,
      to: date,
      ...(consultationOnly ? { consultationOnly: true } : {}),
    })
      .then((res) => {
        if (cancelled) return
        const data = res.data?.data || {}
        const blocked = (data.blocked_dates || []).includes(date)
        const next = blocked
          ? []
          : freeSlotsForDate(data.studio_schedule, date, data.occupied_times)
        setSlots(next)
        setState('ready')
        if (!next.includes(valueRef.current)) onChangeRef.current(next[0] || '')
      })
      .catch(() => {
        if (cancelled) return
        setSlots([])
        setState('error')
        onChangeRef.current('')
      })
    return () => {
      cancelled = true
    }
  }, [caseId, date, consultationOnly])

  const placeholder = !date
    ? copy.selectDateFirst
    : !caseId
      ? copy.selectCase
      : state === 'loading'
        ? copy.slotsLoading
        : state === 'error'
          ? copy.availabilityLoadError
          : slots.length
            ? copy.selectTime
            : copy.noSlots

  return (
    <Select
      label={copy.timeRequired}
      value={slots.includes(value) ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={!caseId || !date || state !== 'ready' || slots.length === 0}
    >
      <option value="">{placeholder}</option>
      {slots.map((slot) => (
        <option key={slot} value={slot}>{slot}</option>
      ))}
    </Select>
  )
}

export default TimeSlotSelect
