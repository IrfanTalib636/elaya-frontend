export const CRM_TASK_TYPEN = [
  { value: 'followup', label: 'Follow-up' },
  { value: 'anruf',    label: 'Anruf'     },
  { value: 'email',    label: 'E-Mail'    },
  { value: 'termin',   label: 'Termin'    },
  { value: 'sonstiges', label: 'Sonstiges' },
]

export const CRM_TASK_PRIORITAET = [
  { value: 'niedrig', label: 'Niedrig' },
  { value: 'mittel',  label: 'Mittel'  },
  { value: 'hoch',    label: 'Hoch'    },
]

export const CRM_NOTE_TYPEN = [
  { value: 'anruf',     label: 'Anruf'     },
  { value: 'email',     label: 'E-Mail'    },
  { value: 'meeting',   label: 'Meeting'   },
  { value: 'sonstiges', label: 'Sonstiges' },
]

export const CRM_STAGE_AKTION = {
  'Neu':               'Ersten Fall anlegen',
  'Beratung geplant':  'Termin bestätigen',
  'Behandlung aktiv':  'Nächsten Termin planen',
  'Beratung erledigt': 'Follow-up senden',
}

/** Neu + existing case(s) → book consultation (matches backend getStageAktion). */
export const getStageAktion = (stage, faelleGesamt = 0) => {
  if (stage === 'Neu' && faelleGesamt > 0) return 'Beratung terminieren'
  return CRM_STAGE_AKTION[stage] ?? ''
}

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

export const fmtCrmDate = (d) =>
  d ? new Date(d).toLocaleDateString('de-CH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

export const startOfDay = (d = new Date()) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
