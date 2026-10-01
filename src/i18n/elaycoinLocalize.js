const ELAYCOIN_TRIGGER_EN = {
  Sitzung: 'Session',
  'Nachsorge-Check': 'Aftercare check',
  Termin: 'Appointment',
  Einkauf: 'Purchase',
}

const ELAYCOIN_TRIGGER_DE = Object.fromEntries(
  Object.entries(ELAYCOIN_TRIGGER_EN).map(([de, en]) => [en, de])
)

export function localizeElaycoinTriggers(raw, lang, triggerLabels = {}) {
  const isEn = String(lang || '').toLowerCase().startsWith('en')
  const parts = Array.isArray(raw)
    ? raw
    : String(raw || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
  if (!parts.length) return ''
  return parts
    .map((p) => {
      if (!isEn) return triggerLabels[p] || p
      return triggerLabels[p] || ELAYCOIN_TRIGGER_EN[p] || p
    })
    .join(', ')
}

export function canonicalizeElaycoinTriggers(raw) {
  return String(raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => ELAYCOIN_TRIGGER_DE[p] || p)
}

export function situationLabel(situation, lang) {
  if (!situation) return ''
  const isEn = String(lang || '').toLowerCase().startsWith('en')
  if (isEn) return situation.label_en || situation.label || situation.key || ''
  return situation.label || situation.label_en || situation.key || ''
}
