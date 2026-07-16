import { caseForm } from '../content'

export const CASE_TYPES = caseForm.caseTypes
export const WIZARD_STEPS = caseForm.wizardSteps
export const BODY_LOCATIONS = caseForm.bodyLocations
export const TC_SIDES = caseForm.tcSides
export const TC_AGE_BUCKETS = caseForm.tcAgeBuckets
export const TC_TYPES = caseForm.tcTypes
export const TC_COVERUP = caseForm.tcCoverup
export const QUALITY_LEVEL = caseForm.qualityLevel
export const SHADING_LEVEL = caseForm.shadingLevel
export const LINEWORK_LEVEL = caseForm.lineworkLevel
export const INK_COLORS = caseForm.inkColors
export const FITZPATRICK = caseForm.fitzpatrick
export const RISK_LEVEL = caseForm.riskLevel
export const SUN_EXPOSURE = caseForm.sunExposure
export const LIFE_SMOKER = caseForm.lifeSmoker
export const LIFE_ALCOHOL = caseForm.lifeAlcohol
export const LIFE_ACTIVITY = caseForm.lifeActivity
export const LIFE_SLEEP_HOURS = caseForm.lifeSleepHours
export const LIFE_SLEEP_QUALITY = caseForm.lifeSleepQuality
export const LIFE_STRESS = caseForm.lifeStress
export const LIFE_HYDRATION = caseForm.lifeHydration
export const LIFE_NUTRITION = caseForm.lifeNutrition
export const GOAL_TARGETS = caseForm.goalTargets
export const ZONE_DICHTE = caseForm.zoneDichte
export const ZONE_FLAECHEN = caseForm.zoneFlaechen
export const PHOTO_STD_CHECKLIST = caseForm.photoChecklist

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
  photo_intake_main: '',
  photo_intake_detail: '',
  photo_marker: '',
  photo_std_intake: {
    photo_full_visible: false,
    photo_good_light: false,
    photo_focus: false,
    photo_distance: false,
    photo_no_filter: false,
  },
}

export const labelFor = (options, value) => {
  const found = options.find(([v]) => v === value)
  return found ? found[1] : value || '—'
}

export const bodyLocationLabel = (value) => labelFor(BODY_LOCATIONS, value)
