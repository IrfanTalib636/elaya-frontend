/** Prototype-aligned PMU intake (PMU_01–PMU_05) — exact API values. */

import { caseForm } from '../content'

export const PMU_WIZARD_STEPS = caseForm.pmuWizardSteps

export const PMU_TYPES = caseForm.pmuTypes
export const PMU_SIDES = caseForm.pmuSides
export const PMU_AGE_RANGES = caseForm.pmuAgeRanges
export const PMU_TECHNIQUES = caseForm.pmuTechniques
export const PMU_PIGMENTS = caseForm.pmuPigments
export const PMU_STITCH_DEPTHS = caseForm.pmuStitchDepths
export const PMU_COLORS = caseForm.pmuColors
export const PMU_COLOR_DENSITY = caseForm.pmuColorDensity
export const PMU_COLOR_SATURATION = caseForm.pmuColorSaturation
export const PMU_LIFE_SMOKER = caseForm.pmuLifeSmoker
export const PMU_LIFE_ALCOHOL = caseForm.pmuLifeAlcohol
export const PMU_LIFE_ACTIVITY = caseForm.pmuLifeActivity
export const PMU_LIFE_HYDRATION = caseForm.pmuLifeHydration
export const PMU_LIFE_AFTERCARE = caseForm.pmuLifeAftercare

export const PMU_TYPE_LABELS = Object.fromEntries(PMU_TYPES)

export const INITIAL_PMU_FIELDS = {
  pmu_type: '',
  pmu_side: '',
  pmu_age_range: '',
  pmu_technique: '',
  pigment_type: '',
  stitch_depth: '',
  previously_lasered: null,
  lasered_notes: '',
  colors: [],
  color_density: '',
  color_saturation: '',
  has_shading: null,
  has_linework: null,
  paradox_darkening_acknowledged: false,
  life_aftercare_commitment: '',
}

export const buildPmuBodyLabel = (pmuType, title) => {
  const base = PMU_TYPE_LABELS[pmuType] || 'PMU'
  const trimmed = title?.trim()
  return trimmed ? `${base} — ${trimmed}` : base
}
