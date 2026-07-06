export const PIPELINE_STAGES = [
  { value: 'Neu',               label: 'Neu'               },
  { value: 'Beratung geplant',  label: 'Beratung geplant'  },
  { value: 'Behandlung aktiv',  label: 'Behandlung aktiv'  },
  { value: 'Beratung erledigt', label: 'Beratung erledigt' },
]

export const PIPELINE_VALUES = PIPELINE_STAGES.map((s) => s.value)
