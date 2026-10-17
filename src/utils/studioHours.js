const JS_DAY_TO_KEY = ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa']

export const resolveHoursForDate = (weekly = {}, exceptions = [], iso) => {
  const key = String(iso || '').slice(0, 10)
  const exception = exceptions.find((item) => item.datum === key)
  if (exception) {
    return {
      offen: exception.offen !== false,
      von: exception.von,
      bis: exception.bis,
      notiz: exception.notiz || '',
      source: 'exception',
    }
  }

  const date = new Date(`${key}T12:00:00`)
  const weekday = weekly[JS_DAY_TO_KEY[date.getDay()]]
  // Hours always come from the studio; a missing weekday means closed.
  if (!weekday) {
    return { offen: false, von: undefined, bis: undefined, notiz: '', source: 'weekly' }
  }
  return {
    offen: weekday.offen !== false,
    von: weekday.von,
    bis: weekday.bis,
    notiz: '',
    source: 'weekly',
  }
}

const timeToMinutes = (time) => {
  const [h, m] = String(time || '').split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null
  return h * 60 + m
}

const minutesToTime = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

/** Start times from opening (inclusive) until closing (exclusive), on the studio interval. */
export const buildTimeSlots = (von, bis, intervalMinutes = 60) => {
  const start = timeToMinutes(von)
  const end = timeToMinutes(bis)
  const step = Math.max(15, Number(intervalMinutes) || 60)
  if (start == null || end == null || end <= start) return []
  const slots = []
  for (let cursor = start; cursor < end; cursor += step) slots.push(minutesToTime(cursor))
  return slots
}

/** Opening-hour slots for one day, minus times the studio has already booked. */
export const freeSlotsForDate = (schedule, isoDate, occupiedTimes = {}) => {
  if (!schedule || !isoDate) return []
  const day = String(isoDate).slice(0, 10)
  const hours = resolveHoursForDate(schedule.weekly || {}, schedule.exceptions || [], day)
  if (!hours.offen || !hours.von || !hours.bis) return []
  const taken = new Set(occupiedTimes[day] || [])
  return buildTimeSlots(hours.von, hours.bis, schedule.slot_interval_minuten).filter(
    (slot) => !taken.has(slot)
  )
}
