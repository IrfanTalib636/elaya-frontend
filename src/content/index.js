import * as de from './de'
import * as en from './en'

const locales = { de, en }

const locale = import.meta.env.VITE_APP_LOCALE || 'de'
const active = locales[locale] ?? locales.de

export const { common, toast, landing, studioAuth, adminAuth, notFound, studioNav, studioActivity, studioElayaChat, adminNav, caseForm } = active
