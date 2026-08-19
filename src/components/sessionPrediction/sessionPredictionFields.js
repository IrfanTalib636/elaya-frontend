export const SESSION_BASE_FIELDS = [
  { key: 'base_sessions', label: 'Basis-Sitzungen', step: '1', hint: 'Standardtattoo = 8' },
  { key: 'min_sessions', label: 'Minimum', step: '1' },
  { key: 'max_sessions', label: 'Maximum', step: '1' },
  { key: 'range_minus', label: 'Range −', step: '1', hint: 'Min = Mitte − dieser Wert' },
  { key: 'range_plus', label: 'Range +', step: '1', hint: 'Max = Mitte + dieser Wert' },
]

export const TATTOO_DELTA_GROUPS = [
  {
    key: 'fitzpatrick',
    title: 'Fitzpatrick (Delta)',
    fields: [
      { key: 'I', label: 'Typ I' },
      { key: 'II', label: 'Typ II' },
      { key: 'III', label: 'Typ III' },
      { key: 'IV', label: 'Typ IV' },
      { key: 'V', label: 'Typ V' },
      { key: 'VI', label: 'Typ VI' },
      { key: 'unsicher', label: 'Unsicher' },
    ],
  },
  {
    key: 'location',
    title: 'Körperstelle (Delta)',
    fields: [
      { key: 'arm', label: 'Arm' },
      { key: 'leg', label: 'Bein' },
      { key: 'chest', label: 'Brust' },
      { key: 'back', label: 'Rücken' },
      { key: 'shoulder', label: 'Schulter' },
      { key: 'abdomen', label: 'Bauch' },
      { key: 'hip', label: 'Hüfte' },
      { key: 'neck', label: 'Hals' },
      { key: 'face', label: 'Gesicht' },
      { key: 'hand', label: 'Hand' },
      { key: 'foot', label: 'Fuss' },
      { key: 'other', label: 'Andere' },
    ],
  },
  {
    key: 'color',
    title: 'Farben — schwierigste Farbe zählt (Delta)',
    fields: [
      { key: 'black', label: 'Schwarz' },
      { key: 'grey', label: 'Grau' },
      { key: 'red', label: 'Rot' },
      { key: 'orange', label: 'Orange' },
      { key: 'blue', label: 'Blau' },
      { key: 'green', label: 'Grün' },
      { key: 'purple', label: 'Lila' },
      { key: 'yellow', label: 'Gelb' },
      { key: 'white', label: 'Weiss' },
      { key: 'skin_tone', label: 'Hautfarbe' },
    ],
  },
  {
    key: 'color_count',
    title: 'Farbanzahl (Delta, falls höher als schwierigste Farbe)',
    fields: [
      { key: 'none', label: 'Nur Schwarz/Grau' },
      { key: 'one_two', label: 'Schwarz + 1–2 Farben' },
      { key: 'three_plus', label: 'Bunt 3+ Farben' },
    ],
  },
  {
    key: 'scarring',
    title: 'Narben / Keloid-Risiko (Delta)',
    fields: [
      { key: 'low', label: 'Niedrig' },
      { key: 'medium', label: 'Mittel' },
      { key: 'high', label: 'Hoch' },
      { key: 'unsure', label: 'Unsicher' },
    ],
  },
  {
    key: 'density',
    title: 'Dichte (Delta)',
    fields: [
      { key: 'low', label: 'Niedrig' },
      { key: 'medium', label: 'Mittel' },
      { key: 'high', label: 'Hoch' },
      { key: 'very_high', label: 'Sehr hoch' },
    ],
  },
  {
    key: 'saturation',
    title: 'Sättigung (Delta)',
    fields: [
      { key: 'low', label: 'Niedrig' },
      { key: 'medium', label: 'Mittel' },
      { key: 'high', label: 'Hoch' },
      { key: 'very_high', label: 'Sehr hoch' },
    ],
  },
  {
    key: 'coverup',
    title: 'Cover-up / Layering (Delta)',
    fields: [
      { key: 'none', label: 'Kein' },
      { key: 'once', label: '1× überdeckt' },
      { key: 'multiple', label: 'Mehrfach' },
      { key: 'unknown', label: 'Unbekannt' },
    ],
  },
  {
    key: 'age',
    title: 'Tattoo-Alter (Delta)',
    fields: [
      { key: 'under_1', label: 'unter 1 Jahr' },
      { key: 'age_1_3', label: '1–3 Jahre' },
      { key: 'age_4_7', label: '4–7 Jahre' },
      { key: 'age_8_15', label: '8–15 Jahre' },
      { key: 'over_15', label: 'über 15 Jahre' },
      { key: 'unknown', label: 'Unbekannt' },
    ],
  },
  {
    key: 'prior_treatment',
    title: 'Vorbehandlung (Delta)',
    fields: [
      { key: 'none', label: 'Keine' },
      { key: 'some', label: '1–2 Sitzungen' },
      { key: 'many', label: '3+ Sitzungen' },
    ],
  },
  {
    key: 'type',
    title: 'Tattoo-Art (Delta)',
    fields: [
      { key: 'amateur', label: 'Amateur' },
      { key: 'professional', label: 'Professionell' },
      { key: 'cosmetic', label: 'Kosmetisch' },
      { key: 'coverup', label: 'Cover-up' },
      { key: 'mixed', label: 'Gemischt' },
    ],
  },
  {
    key: 'goal',
    title: 'Entfernungsziel (Delta)',
    fields: [
      { key: 'full_removal', label: 'Komplett' },
      { key: 'partial_fade', label: 'Teilweise' },
      { key: 'lightening_for_coverup', label: 'Aufhellen für Cover-up' },
    ],
  },
  {
    key: 'laser_profile',
    title: 'Laser-/Studioqualität (Delta)',
    fields: [
      { key: 'basic', label: 'Basic' },
      { key: 'unknown', label: 'Unbekannt' },
      { key: 'advanced', label: 'Advanced' },
      { key: 'premium', label: 'Premium' },
      { key: 'elite', label: 'Elite' },
    ],
  },
  {
    key: 'healing_history',
    title: 'Heilungsverlauf (Delta, sobald Verlauf da ist)',
    fields: [
      { key: 'normal', label: 'Normal' },
      { key: 'mixed', label: 'Gemischt' },
      { key: 'problematic', label: 'Problematisch' },
    ],
  },
  {
    key: 'lightening_rate',
    title: 'Hellungsrate (Delta, ab 2 Vergleichsfotos)',
    fields: [
      { key: 'fast', label: 'Schnell' },
      { key: 'expected', label: 'Erwartet' },
      { key: 'slow', label: 'Langsam' },
      { key: 'stagnant', label: 'Stagnierend' },
    ],
  },
]

export const LIFESTYLE_SCORE_GROUPS = [
  {
    key: 'smoker',
    title: 'Rauchen (Score 1–5)',
    fields: [
      { key: 'no', label: 'Nein' },
      { key: 'occasionally', label: 'Gelegentlich' },
      { key: 'daily_light', label: 'Täglich leicht' },
      { key: 'daily_heavy', label: 'Täglich stark' },
    ],
  },
  {
    key: 'alcohol',
    title: 'Alkohol (Score 1–5)',
    fields: [
      { key: 'never', label: 'Nie' },
      { key: 'rarely', label: 'Selten' },
      { key: '1-2x_week', label: '1–2× / Woche' },
      { key: '3-4x_week', label: '3–4× / Woche' },
      { key: '5+x_week', label: '5+× / Woche' },
    ],
  },
  {
    key: 'sleep_quality',
    title: 'Schlafqualität (Score 1–5)',
    fields: [
      { key: 'excellent', label: 'Sehr gut' },
      { key: 'good', label: 'Gut' },
      { key: 'fair', label: 'Mittel' },
      { key: 'poor', label: 'Schlecht' },
    ],
  },
  {
    key: 'sleep_hours',
    title: 'Schlafstunden (Score 1–5)',
    fields: [
      { key: '8+', label: '8+ h' },
      { key: '7-8', label: '7–8 h' },
      { key: '6-7', label: '6–7 h' },
      { key: '5-6', label: '5–6 h' },
      { key: 'under_5', label: '< 5 h' },
    ],
  },
  {
    key: 'stress',
    title: 'Stress (Score 1–5)',
    fields: [
      { key: 'low', label: 'Niedrig' },
      { key: 'medium', label: 'Mittel' },
      { key: 'high', label: 'Hoch' },
      { key: 'very_high', label: 'Sehr hoch' },
    ],
  },
  {
    key: 'activity',
    title: 'Aktivität (Score 1–5, niedriger = besser)',
    fields: [
      { key: 'high', label: 'Hoch' },
      { key: 'regular', label: 'Regelmässig' },
      { key: 'light', label: 'Leicht' },
      { key: 'low', label: 'Niedrig' },
    ],
  },
  {
    key: 'sport_frequency',
    title: 'Sport pro Woche (Score 1–5, wird mit Aktivität gemittelt)',
    fields: [
      { key: '5+', label: '5+' },
      { key: '3-4', label: '3–4×' },
      { key: '1-2', label: '1–2×' },
      { key: '0', label: 'Kein Sport' },
    ],
  },
  {
    key: 'hydration',
    title: 'Hydration (Score 1–5)',
    fields: [
      { key: 'good', label: 'Gut' },
      { key: 'normal', label: 'Normal' },
      { key: 'low', label: 'Niedrig' },
    ],
  },
  {
    key: 'nutrition',
    title: 'Ernährung (Score 1–5)',
    fields: [
      { key: 'very_good', label: 'Sehr gut' },
      { key: 'good', label: 'Gut' },
      { key: 'fair', label: 'Mittel' },
      { key: 'poor', label: 'Schlecht' },
      { key: 'very_poor', label: 'Sehr schlecht' },
    ],
  },
]

export const AFTERCARE_FIELDS = [
  { key: 'low', label: 'Niedrig (+ Max-Sitzungen)' },
  { key: 'medium', label: 'Mittel' },
  { key: 'high', label: 'Hoch' },
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
