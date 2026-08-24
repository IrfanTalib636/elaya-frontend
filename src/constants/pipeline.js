/** API pipeline stage values (unchanged keys). Translate labels via `t('pipeline.<value>')`. */
export const PIPELINE_VALUES = [
  'Neu',
  'Beratung geplant',
  'Behandlung aktiv',
  'Beratung erledigt',
]

export const PIPELINE_STAGES = PIPELINE_VALUES.map((value) => ({ value }))
