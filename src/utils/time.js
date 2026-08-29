/** Convert HH:MM (24h) to h:mm AM/PM for display. */
const formatTime12 = (time24) => {
  if (!time24 || typeof time24 !== 'string') return '—'

  const match = time24.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return time24

  let hours = parseInt(match[1], 10)
  const minutes = match[2]

  if (hours < 0 || hours > 23) return time24

  const period = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12

  return `${hours}:${minutes} ${period}`
}

export const formatTimeRange12 = (von, bis) =>
  `${formatTime12(von)} – ${formatTime12(bis)}`

/** ISO date (YYYY-MM-DD) → e.g. "8. Oktober 2026" */
export const fmtDateDeLong = (iso) => fmtDateLong(iso, 'de')

/** Same, in the language the user is reading the dashboard in. */
export const fmtDateLong = (iso, language = 'de') => {
  if (!iso) return '—'
  const d = new Date(`${String(iso).split('T')[0]}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(String(language).startsWith('en') ? 'en-GB' : 'de-CH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
