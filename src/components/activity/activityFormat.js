/** Human-readable timestamp for activity feed entries. */
export const fmtActivityWhen = (ts) => {
  if (!ts) return ''
  return new Date(ts).toLocaleString('de-CH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
