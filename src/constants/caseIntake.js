export const CASE_TYPES = [
  { value: 'tattoo', label: 'Tattoo-Entfernung' },
  { value: 'pmu', label: 'PMU-Entfernung' },
]

export const WIZARD_STEPS = [
  { id: 'basics', code: 'TC_01', title: 'Basics', subtitle: 'Grundangaben' },
  { id: 'properties', code: 'TC_02', title: 'Eigenschaften', subtitle: 'Farben & Grösse' },
  { id: 'skin', code: 'TC_03', title: 'Haut & Risiko', subtitle: 'Sicherheit' },
  { id: 'lifestyle', code: 'TC_04', title: 'Lifestyle', subtitle: 'Regeneration' },
  { id: 'goal', code: 'TC_05', title: 'Ziel', subtitle: 'Erwartung' },
  { id: 'photos', code: 'TC_06', title: 'Fotos', subtitle: 'Optional' },
  { id: 'pricing', code: 'KI', title: 'Analyse', subtitle: 'Preisschätzung' },
  { id: 'review', code: '✓', title: 'Übersicht', subtitle: 'Prüfen & speichern' },
]

export const BODY_LOCATIONS = [
  ['arm', 'Arm'],
  ['leg', 'Bein'],
  ['chest', 'Brust'],
  ['back', 'Rücken'],
  ['shoulder', 'Schulter'],
  ['neck', 'Hals'],
  ['face', 'Gesicht'],
  ['abdomen', 'Bauch'],
  ['hip', 'Hüfte'],
  ['hand', 'Hand'],
  ['foot', 'Fuss'],
  ['other', 'Andere'],
]

export const TC_SIDES = [
  ['left', 'Links'],
  ['right', 'Rechts'],
  ['center', 'Mitte'],
]

export const TC_AGE_BUCKETS = [
  ['under_1', '< 1 Jahr'],
  ['age_1_3', '1–3 Jahre'],
  ['age_4_7', '4–7 Jahre'],
  ['age_8_15', '8–15 Jahre'],
  ['over_15', '> 15 Jahre'],
  ['unknown', 'Unbekannt'],
]

export const TC_TYPES = [
  ['professional', 'Professionell'],
  ['amateur', 'Amateur'],
  ['cosmetic', 'Kosmetisch'],
  ['coverup', 'Cover-up'],
  ['mixed', 'Gemischt'],
]

export const TC_COVERUP = [
  ['none', 'Kein Cover-up'],
  ['once', '1× überdeckt'],
  ['multiple', 'Mehrfach überdeckt'],
  ['unknown', 'Unbekannt'],
]

export const QUALITY_LEVEL = [
  ['low', 'Niedrig'],
  ['medium', 'Mittel'],
  ['high', 'Hoch'],
  ['very_high', 'Sehr hoch'],
]

export const SHADING_LEVEL = [
  ['none', 'Kein'],
  ['low', 'Wenig'],
  ['medium', 'Mittel'],
  ['high', 'Viel'],
]

export const LINEWORK_LEVEL = [
  ['fine', 'Fein'],
  ['medium', 'Mittel'],
  ['bold', 'Kräftig'],
  ['mixed', 'Gemischt'],
]

export const INK_COLORS = [
  { id: 'black', color: '#1a1a1a', label: 'Schwarz' },
  { id: 'grey', color: '#888888', label: 'Grau' },
  { id: 'red', color: '#cc2233', label: 'Rot' },
  { id: 'orange', color: '#e67300', label: 'Orange' },
  { id: 'yellow', color: '#e6cc00', label: 'Gelb' },
  { id: 'green', color: '#1a8833', label: 'Grün' },
  { id: 'blue', color: '#1a3366', label: 'Blau' },
  { id: 'purple', color: '#7733aa', label: 'Lila' },
  { id: 'white', color: '#f0f0f0', label: 'Weiss' },
  { id: 'skin_tone', color: '#d4a574', label: 'Hautton' },
]

export const FITZPATRICK = [
  { id: 'I', color: '#f5dcc3', desc: 'Sehr hell' },
  { id: 'II', color: '#e8c8a0', desc: 'Hell' },
  { id: 'III', color: '#c8a878', desc: 'Mittel' },
  { id: 'IV', color: '#a08060', desc: 'Olive' },
  { id: 'V', color: '#6a4a30', desc: 'Braun' },
  { id: 'VI', color: '#3a2a1a', desc: 'Dunkel' },
  { id: 'unsicher', color: 'linear-gradient(135deg,#f5dcc3,#3a2a1a)', desc: 'Unsicher' },
]

export const RISK_LEVEL = [
  ['low', 'Gering'],
  ['medium', 'Mittel'],
  ['high', 'Hoch'],
  ['unsure', 'Unsicher'],
]

export const SUN_EXPOSURE = [
  ['low', 'Gering'],
  ['medium', 'Mittel'],
  ['high', 'Hoch'],
]

export const LIFE_SMOKER = [
  ['no', 'Nein'],
  ['occasionally', 'Gelegentlich'],
  ['daily_light', 'Täglich leicht'],
  ['daily_heavy', 'Täglich stark'],
]

export const LIFE_ALCOHOL = [
  ['never', 'Nie'],
  ['rarely', 'Selten'],
  ['1-2x_week', '1–2×/Wo'],
  ['3-4x_week', '3–4×/Wo'],
  ['5+x_week', '5+×/Wo'],
]

export const LIFE_ACTIVITY = [
  ['low', 'Wenig'],
  ['light', 'Leicht'],
  ['regular', 'Regelmässig'],
  ['high', 'Intensiv'],
]

export const LIFE_SLEEP_HOURS = [
  ['under_5', '< 5h'],
  ['5-6', '5–6h'],
  ['6-7', '6–7h'],
  ['7-8', '7–8h'],
  ['8+', '8+h'],
]

export const LIFE_SLEEP_QUALITY = [
  ['poor', 'Schlecht'],
  ['fair', 'Mässig'],
  ['good', 'Gut'],
  ['excellent', 'Sehr gut'],
]

export const LIFE_STRESS = [
  ['low', 'Niedrig'],
  ['medium', 'Mittel'],
  ['high', 'Hoch'],
  ['very_high', 'Sehr hoch'],
]

export const LIFE_HYDRATION = [
  ['low', 'Wenig'],
  ['normal', 'Normal'],
  ['good', 'Gut'],
]

export const LIFE_NUTRITION = [
  ['poor', 'Unausgewogen'],
  ['fair', 'Mässig'],
  ['good', 'Gut'],
]

export const GOAL_TARGETS = [
  ['full_removal', 'Komplette Entfernung', 'Das Tattoo soll vollständig verschwinden.'],
  ['lightening_for_coverup', 'Aufhellen für Cover-Up', 'Aufhellung für ein neues Tattoo darüber.'],
  ['partial_fade', 'Teilweise verblassen', 'Nur ein Teil soll entfernt oder aufgehellt werden.'],
]

export const ZONE_DICHTE = [
  ['low', 'Niedrig'],
  ['medium', 'Mittel'],
  ['high', 'Hoch'],
  ['very_high', 'Sehr hoch'],
]

export const ZONE_FLAECHEN = [
  { value: 'xs', label: 'Sehr klein', cm2: 3 },
  { value: 'sm', label: 'Klein', cm2: 8 },
  { value: 'md', label: 'Mittel', cm2: 13.5 },
  { value: 'lg', label: 'Gross', cm2: 21 },
  { value: 'xl', label: 'Sehr gross', cm2: 33 },
  { value: 'xxl', label: 'Extra gross', cm2: 45 },
]

export const INITIAL_CASE_FORM = {
  type: 'tattoo',
  tc_title: '',
  tc_body_location_main: '',
  tc_body_location_detail: '',
  tc_side: '',
  zonen_aktiv: false,
  zonen: [],
  tc_age_bucket: '',
  tc_type: '',
  tc_coverup: 'none',
  tc_prior_treatment: null,
  tc_prior_treatment_count: '',
  tc_colors_present: [],
  tc_density: '',
  tc_saturation: '',
  tc_shading: '',
  tc_linework: '',
  tc_size_length: '',
  tc_size_width: '',
  skin_fitzpatrick_type: '',
  skin_hyperpig_risk: '',
  skin_keloid_risk: '',
  skin_sun_zone: '',
  life_smoker: '',
  life_cig_per_day: '',
  life_alcohol: '',
  life_activity: '',
  life_sleep_hours: '',
  life_sleep_quality: '',
  life_stress: '',
  life_height_cm: '',
  life_weight_kg: '',
  life_hydration: '',
  life_nutrition: '',
  goal_target: '',
  goal_notes: '',
}

export const labelFor = (options, value) => {
  const found = options.find(([v]) => v === value)
  return found ? found[1] : value || '—'
}

export const bodyLocationLabel = (value) => labelFor(BODY_LOCATIONS, value)
