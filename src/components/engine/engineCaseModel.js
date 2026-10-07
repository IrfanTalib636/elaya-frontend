/** Shared Case Simulator case. Super Admin previews this case; it does not change engine rules. */

const BLACK_FAMILY = ['black', 'grey']

export const defaultEngineCase = () => ({
  sizeMode: 'lxb',
  tc_size_length: 8,
  tc_size_width: 5,
  flaeche_cm2: 40,
  skin_fitzpatrick_type: 'III',
  tc_body_location_main: 'arm',
  tc_density: 'medium',
  tc_saturation: 'medium',
  tc_coverup: 'none',
  tc_age_years: 5,
  tc_prior_treatment: false,
  tc_prior_treatment_count: 0,
  tc_type: 'professional',
  goal_target: 'full_removal',
  skin_keloid_risk: 'low',
  laser_profile_level: 'basic',
  type: 'tattoo',
  tc_colors_present: ['black'],
  tc_depth: 'normal',
  laserId: '',
  healing_history: 'normal',
  lightening_rate: 'expected',
  life_aftercare_commitment: 'medium',
  life_age: 34,
  life_height_cm: 170,
  life_weight_kg: 72,
  life_smoker: 'no',
  life_alcohol: 'never',
  life_sleep_quality: 'good',
  life_sleep_hours: '7-8',
  life_stress: 'medium',
  life_activity: 'regular',
  life_sport_freq: '1-2',
  life_hydration: 'normal',
  life_nutrition: 'good',
})

export const caseArea = (form) => {
  if (!form) return 0
  if (form.sizeMode === 'lxb') {
    const l = Number(form.tc_size_length) || 0
    const w = Number(form.tc_size_width) || 0
    return Math.max(0, Math.round(l * w * 10) / 10)
  }
  return Math.max(0, Number(form.flaeche_cm2) || 0)
}

export const ageBandFromYears = (years) => {
  const n = Number(years)
  if (!Number.isFinite(n)) return 'unknown'
  if (n < 1) return 'under_1'
  if (n <= 3) return 'age_1_3'
  if (n <= 7) return 'age_4_7'
  if (n <= 15) return 'age_8_15'
  return 'over_15'
}

export const colorCountKey = (colors = []) => {
  const extras = colors.filter((color) => color && !BLACK_FAMILY.includes(color))
  if (extras.length === 0) return 'none'
  if (extras.length <= 2) return 'one_two'
  return 'three_plus'
}

export const priorKey = (form) => {
  if (!form?.tc_prior_treatment) return 'none'
  return Number(form.tc_prior_treatment_count) >= 3 ? 'many' : 'some'
}

export const caseBmi = (form) => {
  const h = Number(form?.life_height_cm) / 100
  const w = Number(form?.life_weight_kg)
  if (!h || !w) return 0
  return w / (h * h)
}

/** Keys that belong to the current case. Missing groups stay fully editable. */
export const activeKeysForCase = (form) => {
  if (!form) return null
  const colors = form.tc_colors_present || []
  return {
    fitzpatrick: [form.skin_fitzpatrick_type],
    location: [form.tc_body_location_main],
    color: colors,
    color_count: [colorCountKey(colors)],
    density: [form.tc_density],
    saturation: [form.tc_saturation],
    coverup: [form.tc_coverup],
    age: [ageBandFromYears(form.tc_age_years)],
    depth: [form.tc_depth || 'normal'],
    prior_treatment: [priorKey(form)],
    type: [form.tc_type],
    goal: [form.goal_target],
    laser_profile: [form.laser_profile_level],
    scarring: [form.skin_keloid_risk],
    healing_history: [form.healing_history],
    lightening_rate: [form.lightening_rate],
    smoker: [form.life_smoker],
    alcohol: [form.life_alcohol],
    sleep_quality: [form.life_sleep_quality],
    sleep_hours: [form.life_sleep_hours],
    stress: [form.life_stress],
    activity: [form.life_activity],
    sport_frequency: [form.life_sport_freq],
    hydration: [form.life_hydration],
    nutrition: [form.life_nutrition],
    aftercare: [form.life_aftercare_commitment],
  }
}

export const buildEngineCaseInput = (form, laser, deltaOverride = null) => {
  if (!form) return null
  const colors = form.tc_colors_present || []
  const catalog = laser?.color_deltas && typeof laser.color_deltas === 'object' ? laser.color_deltas : {}
  const edited =
    deltaOverride && typeof deltaOverride === 'object' && Object.keys(deltaOverride).length
      ? { ...catalog, ...deltaOverride }
      : null
  const area = caseArea(form)
  return {
    type: form.type === 'pmu' ? 'pmu' : 'tattoo',
    tc_size_length: form.sizeMode === 'lxb' ? Number(form.tc_size_length) || 0 : undefined,
    tc_size_width: form.sizeMode === 'lxb' ? Number(form.tc_size_width) || 0 : undefined,
    flaeche_cm2: area,
    skin_fitzpatrick_type: form.skin_fitzpatrick_type,
    tc_body_location_main: form.tc_body_location_main,
    tc_density: form.tc_density,
    tc_saturation: form.tc_saturation,
    tc_coverup: form.tc_coverup,
    tc_age_years: Number(form.tc_age_years) || 0,
    tc_prior_treatment: !!form.tc_prior_treatment,
    tc_prior_treatment_count: form.tc_prior_treatment ? Number(form.tc_prior_treatment_count) || 1 : 0,
    tc_type: form.tc_type,
    goal_target: form.goal_target,
    skin_keloid_risk: form.skin_keloid_risk,
    laser_profile_level: form.laser_profile_level,
    tc_colors_present: colors,
    tc_depth: form.tc_depth || 'normal',
    ...(laser?.id ? { laser_device_id: laser.id } : {}),
    healing_history: form.healing_history || undefined,
    lightening_rate: form.lightening_rate || undefined,
    life_aftercare_commitment: form.life_aftercare_commitment,
    life_age: Number(form.life_age) || undefined,
    life_height_cm: Number(form.life_height_cm) || undefined,
    life_weight_kg: Number(form.life_weight_kg) || undefined,
    life_smoker: form.life_smoker,
    life_alcohol: form.life_alcohol,
    life_sleep_quality: form.life_sleep_quality,
    life_sleep_hours: form.life_sleep_hours,
    life_stress: form.life_stress,
    life_activity: form.life_activity,
    life_sport_freq: form.life_sport_freq,
    life_hydration: form.life_hydration,
    life_nutrition: form.life_nutrition,
    ...(Object.keys(catalog).length ? { laser_color_deltas: catalog } : {}),
    ...(edited ? { laser_color_deltas_edit: edited } : {}),
  }
}

const CASE_STORAGE_KEY = 'elaya_engine_case'

export const readStoredEngineCase = () => {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CASE_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    return { ...defaultEngineCase(), ...parsed }
  } catch {
    return null
  }
}

export const writeStoredEngineCase = (form) => {
  if (typeof sessionStorage === 'undefined' || !form) return
  try {
    sessionStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(form))
  } catch {
    /* the case still lives in memory for this visit */
  }
}

export const laserLabel = (laser) =>
  [laser?.manufacturer, laser?.model].filter(Boolean).join(' ') || laser?.name || ''
