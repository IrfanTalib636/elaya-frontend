/**
 * Pick a bilingual API/catalog field based on the active UI language.
 * Convention: German is the primary field (`label`, `gruppe`, `name_de`);
 * English is the `_en` sibling (`label_en`, `gruppe_en`, `name_en`).
 */
export function isEnglishLang(lang) {
  return String(lang || '').toLowerCase().startsWith('en')
}

/**
 * @param {object|null|undefined} item
 * @param {string} [lang]
 * @param {{ de?: string, en?: string }} [fields]
 */
export function localizedField(item, lang, fields = {}) {
  if (!item || typeof item !== 'object') return ''
  const deKey = fields.de || 'label'
  const enKey = fields.en || 'label_en'
  const de = item[deKey]
  const en = item[enKey]
  if (isEnglishLang(lang)) {
    return String(en || de || item.label || item.name || '').trim()
  }
  return String(de || en || item.label || item.name || '').trim()
}

/** Feature catalog chip / package feature label. */
export function featureLabel(feature, lang) {
  return localizedField(feature, lang, { de: 'label', en: 'label_en' })
}

/** Feature group header (CORE / KI & ANALYSE, …). */
export function featureGroupLabel(group, lang) {
  return localizedField(group, lang, { de: 'gruppe', en: 'gruppe_en' })
}

/** Subscription package display name. */
export function packageName(pkg, lang) {
  if (!pkg) return ''
  const named = localizedField(pkg, lang, { de: 'name_de', en: 'name_en' })
  return named || String(pkg.name || '').trim()
}

/** Subscription package description (optional `_en`). */
export function packageDescription(pkg, lang) {
  if (!pkg) return ''
  return (
    localizedField(pkg, lang, { de: 'beschreibung', en: 'beschreibung_en' }) ||
    String(pkg.beschreibung || '').trim()
  )
}
