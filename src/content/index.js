/**
 * Compatibility shim — prefer `useContent()` / `useTranslation()` in components
 * so the UI re-renders when the language changes.
 *
 * Static imports from this module read the *current* language at access time via
 * getters, but will not trigger React re-renders by themselves.
 */
import i18n from '../i18n/i18n.config'

const bundle = () =>
  i18n.getResourceBundle(i18n.resolvedLanguage || i18n.language, 'translation') || {}

export const common = new Proxy(
  {},
  { get: (_t, prop) => bundle().common?.[prop] }
)
export const toast = new Proxy(
  {},
  { get: (_t, prop) => bundle().toast?.[prop] }
)
export const landing = new Proxy(
  {},
  { get: (_t, prop) => bundle().landing?.[prop] }
)
export const studioAuth = new Proxy(
  {},
  { get: (_t, prop) => bundle().studioAuth?.[prop] }
)
export const adminAuth = new Proxy(
  {},
  { get: (_t, prop) => bundle().adminAuth?.[prop] }
)
export const notFound = new Proxy(
  {},
  { get: (_t, prop) => bundle().notFound?.[prop] }
)
export const studioNav = new Proxy(
  {},
  { get: (_t, prop) => bundle().studioNav?.[prop] }
)
export const studioActivity = new Proxy(
  {},
  { get: (_t, prop) => bundle().studioActivity?.[prop] }
)
export const studioElayaChat = new Proxy(
  {},
  { get: (_t, prop) => bundle().studioElayaChat?.[prop] }
)
export const adminNav = new Proxy(
  {},
  {
    get: (_t, prop) => {
      const nav = bundle().adminNav
      if (prop === 'items') return nav?.items ?? []
      return nav?.[prop]
    },
  }
)
export const caseForm = new Proxy(
  {},
  {
    get: (_t, prop) => bundle().caseForm?.[prop],
  }
)
