import {
  AFTERCARE_FIELDS,
  DEFAULT_BMI_FLOORS,
  LIFESTYLE_FACTOR_WEIGHTS,
  LIFESTYLE_SCORE_GROUPS,
  SESSION_BASE_FIELDS,
  TATTOO_DELTA_GROUPS,
  TATTOO_GROUP_SECTION,
} from '../sessionPrediction/sessionPredictionFields'

export const getIn = (obj, path) => path.reduce((node, key) => (node == null ? undefined : node[key]), obj)

export const setIn = (obj, [key, ...rest], value) => {
  const base = Array.isArray(obj) ? [...obj] : { ...(obj || {}) }
  base[key] = rest.length ? setIn(base[key] ?? (typeof rest[0] === 'number' ? [] : {}), rest, value) : value
  return base
}

const tattooGroups = (section, copy) =>
  TATTOO_DELTA_GROUPS.filter((g) => TATTOO_GROUP_SECTION[g.key] === section).map((g) => ({
    key: g.key,
    title: copy.tattooGroupTitles?.[g.key] || g.key,
    rows: g.fields.map((f) => ({
      path: ['tattoo_deltas', g.key, f.key],
      label: copy.tattooFields?.[g.key]?.[f.key] || f.key,
    })),
  }))

const bandRows = (values, copy) =>
  (values?.lifestyle_bands || []).flatMap((band, i) => [
    { path: ['lifestyle_bands', i, 'max_avg'], label: `#${i + 1} · ${copy.avgUpTo}`, step: '0.1' },
    { path: ['lifestyle_bands', i, 'score'], label: `#${i + 1} · ${copy.score}` },
    { path: ['lifestyle_bands', i, 'multiplier'], label: `#${i + 1} · ${copy.multiplier}`, step: '0.05' },
  ])

const bmiRows = (values, copy) =>
  (values?.lifestyle_bmi_floors?.length ? values.lifestyle_bmi_floors : DEFAULT_BMI_FLOORS).flatMap((_row, i) => [
    { path: ['lifestyle_bmi_floors', i, 'min_bmi'], label: `#${i + 1} · ${copy.bmiFloorMinBmi}`, step: '0.5' },
    { path: ['lifestyle_bmi_floors', i, 'min_score'], label: `#${i + 1} · ${copy.bmiFloorMinScore}` },
  ])

/**
 * Master-data sections. Every row is a path into session_prediction — the same object the
 * Prediction Engine edits — so both screens show one LIVE value and one shared DRAFT.
 */
export const buildMasterDataSections = (copy, values) => [
  {
    id: 'base',
    engineSection: 'base',
    groups: [
      {
        key: 'base',
        title: null,
        rows: SESSION_BASE_FIELDS.map((f) => ({ path: [f.key], label: copy.base?.[f.key] || f.key })),
      },
    ],
  },
  { id: 'fitzpatrick', engineSection: 'fitzpatrick', groups: tattooGroups('fitzpatrick', copy) },
  { id: 'colors', engineSection: 'colors', groups: tattooGroups('colors', copy) },
  {
    id: 'lifestyle',
    engineSection: 'lifestyle',
    groups: [
      {
        key: 'weights',
        title: copy.factorWeightsTitle,
        rows: LIFESTYLE_FACTOR_WEIGHTS.map((f) => ({
          path: ['lifestyle_factor_weights', f.key],
          label: copy.factorWeightLabels?.[f.key] || f.key,
          step: '0.1',
        })),
      },
      ...LIFESTYLE_SCORE_GROUPS.map((g) => ({
        key: g.key,
        title: copy.lifestyleGroupTitles?.[g.key] || g.key,
        rows: g.fields.map((f) => ({
          path: ['lifestyle_scores', g.key, f.key],
          label: copy.lifestyleFields?.[g.key]?.[f.key] || f.key,
        })),
      })),
      { key: 'bands', title: copy.lifestyleMultipliers, rows: bandRows(values, copy) },
      { key: 'bmi', title: copy.bmiFloorsTitle, rows: bmiRows(values, copy) },
      {
        key: 'aftercare',
        title: copy.aftercareSection,
        rows: AFTERCARE_FIELDS.map((f) => ({
          path: ['aftercare_extra_max', f.key],
          label: copy.aftercareFields?.[f.key] || f.key,
        })),
      },
    ],
  },
  { id: 'healing', engineSection: 'healing', groups: tattooGroups('healing', copy) },
]
