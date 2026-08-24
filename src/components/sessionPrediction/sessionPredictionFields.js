/** Field keys only — labels live in i18n (`components.sessionPrediction`). */

export const SESSION_BASE_FIELDS = [
  { key: 'base_sessions', step: '1', hintKey: 'base_sessions' },
  { key: 'min_sessions', step: '1' },
  { key: 'max_sessions', step: '1' },
  { key: 'range_minus', step: '1', hintKey: 'range_minus' },
  { key: 'range_plus', step: '1', hintKey: 'range_plus' },
]

export const TATTOO_DELTA_GROUPS = [
  {
    key: 'fitzpatrick',
    fields: [
      { key: 'I' },
      { key: 'II' },
      { key: 'III' },
      { key: 'IV' },
      { key: 'V' },
      { key: 'VI' },
      { key: 'unsicher' },
    ],
  },
  {
    key: 'location',
    fields: [
      { key: 'arm' },
      { key: 'leg' },
      { key: 'chest' },
      { key: 'back' },
      { key: 'shoulder' },
      { key: 'abdomen' },
      { key: 'hip' },
      { key: 'neck' },
      { key: 'face' },
      { key: 'hand' },
      { key: 'foot' },
      { key: 'other' },
    ],
  },
  {
    key: 'color',
    fields: [
      { key: 'black' },
      { key: 'grey' },
      { key: 'red' },
      { key: 'orange' },
      { key: 'blue' },
      { key: 'green' },
      { key: 'purple' },
      { key: 'yellow' },
      { key: 'white' },
      { key: 'skin_tone' },
    ],
  },
  {
    key: 'color_count',
    fields: [
      { key: 'none' },
      { key: 'one_two' },
      { key: 'three_plus' },
    ],
  },
  {
    key: 'scarring',
    fields: [
      { key: 'low' },
      { key: 'medium' },
      { key: 'high' },
      { key: 'unsure' },
    ],
  },
  {
    key: 'density',
    fields: [
      { key: 'low' },
      { key: 'medium' },
      { key: 'high' },
      { key: 'very_high' },
    ],
  },
  {
    key: 'saturation',
    fields: [
      { key: 'low' },
      { key: 'medium' },
      { key: 'high' },
      { key: 'very_high' },
    ],
  },
  {
    key: 'coverup',
    fields: [
      { key: 'none' },
      { key: 'once' },
      { key: 'multiple' },
      { key: 'unknown' },
    ],
  },
  {
    key: 'age',
    fields: [
      { key: 'under_1' },
      { key: 'age_1_3' },
      { key: 'age_4_7' },
      { key: 'age_8_15' },
      { key: 'over_15' },
      { key: 'unknown' },
    ],
  },
  {
    key: 'prior_treatment',
    fields: [
      { key: 'none' },
      { key: 'some' },
      { key: 'many' },
    ],
  },
  {
    key: 'type',
    fields: [
      { key: 'amateur' },
      { key: 'professional' },
      { key: 'cosmetic' },
      { key: 'coverup' },
      { key: 'mixed' },
    ],
  },
  {
    key: 'goal',
    fields: [
      { key: 'full_removal' },
      { key: 'partial_fade' },
      { key: 'lightening_for_coverup' },
    ],
  },
  {
    key: 'laser_profile',
    fields: [
      { key: 'basic' },
      { key: 'unknown' },
      { key: 'advanced' },
      { key: 'premium' },
      { key: 'elite' },
    ],
  },
  {
    key: 'healing_history',
    fields: [
      { key: 'normal' },
      { key: 'mixed' },
      { key: 'problematic' },
    ],
  },
  {
    key: 'lightening_rate',
    fields: [
      { key: 'fast' },
      { key: 'expected' },
      { key: 'slow' },
      { key: 'stagnant' },
    ],
  },
]

export const LIFESTYLE_SCORE_GROUPS = [
  {
    key: 'smoker',
    fields: [
      { key: 'no' },
      { key: 'occasionally' },
      { key: 'daily_light' },
      { key: 'daily_heavy' },
    ],
  },
  {
    key: 'alcohol',
    fields: [
      { key: 'never' },
      { key: 'rarely' },
      { key: '1-2x_week' },
      { key: '3-4x_week' },
      { key: '5+x_week' },
    ],
  },
  {
    key: 'sleep_quality',
    fields: [
      { key: 'excellent' },
      { key: 'good' },
      { key: 'fair' },
      { key: 'poor' },
    ],
  },
  {
    key: 'sleep_hours',
    fields: [
      { key: '8+' },
      { key: '7-8' },
      { key: '6-7' },
      { key: '5-6' },
      { key: 'under_5' },
    ],
  },
  {
    key: 'stress',
    fields: [
      { key: 'low' },
      { key: 'medium' },
      { key: 'high' },
      { key: 'very_high' },
    ],
  },
  {
    key: 'activity',
    fields: [
      { key: 'high' },
      { key: 'regular' },
      { key: 'light' },
      { key: 'low' },
    ],
  },
  {
    key: 'sport_frequency',
    fields: [
      { key: '5+' },
      { key: '3-4' },
      { key: '1-2' },
      { key: '0' },
    ],
  },
  {
    key: 'hydration',
    fields: [
      { key: 'good' },
      { key: 'normal' },
      { key: 'low' },
    ],
  },
  {
    key: 'nutrition',
    fields: [
      { key: 'very_good' },
      { key: 'good' },
      { key: 'fair' },
      { key: 'poor' },
      { key: 'very_poor' },
    ],
  },
]

export const AFTERCARE_FIELDS = [
  { key: 'low' },
  { key: 'medium' },
  { key: 'high' },
]

export const cloneSessionPrediction = (source = {}) =>
  JSON.parse(JSON.stringify(source || {}))

const toNumber = (value, fallback = 0) => {
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : fallback
}

/** Build a PATCH-ready payload (all numbers) from form state. */
export const buildSessionPredictionPayload = (values = {}) => ({
  base_sessions: toNumber(values.base_sessions, 8),
  min_sessions: toNumber(values.min_sessions, 3),
  max_sessions: toNumber(values.max_sessions, 20),
  range_minus: toNumber(values.range_minus, 2),
  range_plus: toNumber(values.range_plus, 2),
  tattoo_deltas: Object.fromEntries(
    Object.entries(values.tattoo_deltas || {}).map(([group, map]) => [
      group,
      Object.fromEntries(
        Object.entries(map || {}).map(([key, val]) => [key, toNumber(val, 0)])
      ),
    ])
  ),
  lifestyle_scores: Object.fromEntries(
    Object.entries(values.lifestyle_scores || {}).map(([group, map]) => [
      group,
      Object.fromEntries(
        Object.entries(map || {}).map(([key, val]) => [key, toNumber(val, 1)])
      ),
    ])
  ),
  lifestyle_bands: (values.lifestyle_bands || []).map((band) => ({
    max_avg: toNumber(band.max_avg, 0),
    score: toNumber(band.score, 0),
    multiplier: toNumber(band.multiplier, 1),
  })),
  aftercare_extra_max: Object.fromEntries(
    Object.entries(values.aftercare_extra_max || {}).map(([key, val]) => [
      key,
      toNumber(val, 0),
    ])
  ),
})
