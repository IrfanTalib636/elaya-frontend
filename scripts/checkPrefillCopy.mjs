/**
 * The web case wizard reads `caseForm.ui.prefill` through useContent(), which
 * returns the i18next resource bundle. Keys that live only in src/content/
 * therefore resolve to undefined at runtime and crash the step, so assert both
 * locales carry every key the component touches.
 *
 * Run: npx vite-node scripts/checkPrefillCopy.mjs
 */
import de from '../src/i18n/locales/de.ts'
import en from '../src/i18n/locales/en.ts'

const REQUIRED = ['previousAnswer', 'change', 'cigsPerDay', 'notice', 'noticeWithSource']

let failures = 0
for (const [name, bundle] of [
  ['de', de],
  ['en', en],
]) {
  const prefill = bundle?.caseForm?.ui?.prefill
  if (!prefill) {
    console.log(`FAIL  ${name}: caseForm.ui.prefill is missing`)
    failures += 1
    continue
  }
  const missing = REQUIRED.filter((key) => typeof prefill[key] !== 'string')
  if (missing.length) {
    console.log(`FAIL  ${name}: missing ${missing.join(', ')}`)
    failures += 1
  } else {
    console.log(`PASS  ${name}: ${REQUIRED.length} prefill keys present`)
  }
}

console.log(failures === 0 ? '\nPrefill copy OK.' : `\n${failures} locale(s) incomplete.`)
process.exit(failures === 0 ? 0 : 1)
