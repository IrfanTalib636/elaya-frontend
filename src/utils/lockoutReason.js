/**
 * Localized text for one blocking period returned by the rules engine.
 *
 * The server also ships a ready-made German sentence in `sperre.grund`, but it
 * is German only. `kategorie`, `tage` and `case_name` are the machine-readable
 * equivalents, so the dashboard renders the reason in the language the studio
 * is actually reading. Mirrors `lockoutReasonKey` in the mobile app so both
 * clients explain the same block the same way.
 */

const BASE = 'components.caseAvailability.reasons'

/** `kategorie` is absent on records written before it existed. */
const categoryOf = (sperre) => {
  if (sperre?.kategorie) return sperre.kategorie
  if (sperre?.typ === 'cross_case') return 'cross_case'
  if (sperre?.typ === 'same_case') return 'same_case'
  return 'uv'
}

/**
 * @returns {{ key: string, params: Record<string, string|number> }}
 */
export const lockoutReasonKey = (sperre) => {
  // Stored block dates only know an end date, so every category needs a
  // variant without a day count.
  const hasDays = sperre?.tage != null
  const caseName = sperre?.case_name ?? ''

  switch (categoryOf(sperre)) {
    case 'cross_case':
      return hasDays
        ? { key: `${BASE}.crossCase`, params: { days: sperre.tage, case: caseName } }
        : { key: `${BASE}.crossCaseNoDays`, params: { case: caseName } }
    case 'same_case':
      return hasDays
        ? { key: `${BASE}.sameCase`, params: { days: sperre.tage, case: caseName } }
        : { key: `${BASE}.sameCaseNoDays`, params: { case: caseName } }
    case 'medikament':
      return hasDays
        ? { key: `${BASE}.med`, params: { days: sperre.tage } }
        : { key: `${BASE}.medActive`, params: {} }
    case 'uv':
    default:
      return hasDays
        ? { key: `${BASE}.uv`, params: { days: sperre.tage } }
        : { key: `${BASE}.uvActive`, params: {} }
  }
}

/** Convenience wrapper for render sites that already have `t`. */
export const lockoutReasonText = (t, sperre) => {
  const { key, params } = lockoutReasonKey(sperre)
  return t(key, params)
}

export default lockoutReasonText
