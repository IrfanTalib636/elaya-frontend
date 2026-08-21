/** CRM option values (API keys). Translate labels via `t('crm.*')`. */

export const CRM_TASK_TYPEN = [
  { value: 'followup' },
  { value: 'anruf' },
  { value: 'email' },
  { value: 'termin' },
  { value: 'sonstiges' },
]

export const CRM_TASK_PRIORITAET = [
  { value: 'niedrig' },
  { value: 'mittel' },
  { value: 'hoch' },
]

export const CRM_NOTE_TYPEN = [
  { value: 'anruf' },
  { value: 'email' },
  { value: 'meeting' },
  { value: 'sonstiges' },
]

export const CRM_STAGE_AKTION_KEYS = {
  Neu: 'Neu',
  'Beratung geplant': 'Beratung geplant',
  'Behandlung aktiv': 'Behandlung aktiv',
  'Beratung erledigt': 'Beratung erledigt',
}

/** Neu + existing case(s) → book consultation (matches backend getStageAktion). */
export const getStageAktionKey = (stage, faelleGesamt = 0) => {
  if (stage === 'Neu' && faelleGesamt > 0) return 'bookConsultation'
  return CRM_STAGE_AKTION_KEYS[stage] ?? ''
}

/** @deprecated Prefer getStageAktionKey + t('crm.stageActions.*') */
export const getStageAktion = (stage, faelleGesamt = 0) => getStageAktionKey(stage, faelleGesamt)

export const PRIORITY_ICON = {
  hoch: '🔴',
  mittel: '🟡',
  niedrig: '⚪',
}

export const defaultDueDate = () => {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().slice(0, 10)
}

export const fmtCrmDate = (d, locale = 'de-CH') =>
  d ? new Date(d).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

export const startOfDay = (d = new Date()) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
