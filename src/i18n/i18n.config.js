import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en'
import de from './locales/de'

export const LANGUAGE_STORAGE_KEY = 'elaya_language'
export const SUPPORTED_LANGUAGES = ['de', 'en']
export const DEFAULT_LANGUAGE = 'de'

const resources = {
  en: { translation: en },
  de: { translation: de },
}

const readStoredLanguage = () => {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored
  } catch {
    // ignore
  }
  const fromEnv = import.meta.env.VITE_APP_LOCALE
  if (fromEnv && SUPPORTED_LANGUAGES.includes(fromEnv)) return fromEnv
  return DEFAULT_LANGUAGE
}

const initialLng = typeof window !== 'undefined' ? readStoredLanguage() : DEFAULT_LANGUAGE

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLng,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: [...SUPPORTED_LANGUAGES],
  defaultNS: 'translation',
  interpolation: { escapeValue: false },
  returnNull: false,
})

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language || DEFAULT_LANGUAGE
  i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng
  })
}

export const changeLanguage = async (lang) => {
  if (!SUPPORTED_LANGUAGES.includes(lang)) return
  await i18n.changeLanguage(lang)
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
  } catch {
    // ignore
  }
}

export default i18n
