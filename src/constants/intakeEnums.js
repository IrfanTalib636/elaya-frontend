/**
 * Intake option values shared by Studio case creation, both Case Simulators,
 * and the Prediction Engine editor. Keep in sync with
 * elaya-backend/config/caseIntakeEnums.js — stored keys must match so session
 * deltas resolve to the same Prediction Engine rows.
 */

/** Labels: Poor / Medium / Good (DE: Schlecht / Mittel / Gut). */
export const LIFE_NUTRITION = ['poor', 'fair', 'good']

const LIFE_NUTRITION_ALIASES = {
  very_good: 'good',
  balanced: 'good',
  very_poor: 'poor',
  very_bad: 'poor',
}

export const canonicalizeNutrition = (value) => {
  if (value == null || value === '') return value
  if (LIFE_NUTRITION.includes(value)) return value
  return LIFE_NUTRITION_ALIASES[value] || value
}
