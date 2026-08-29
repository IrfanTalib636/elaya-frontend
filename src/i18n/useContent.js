import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Reactive locale bundle (full translation tree for current language).
 * Prefer `t('key')` for simple strings; use this for nested objects/arrays
 * (caseForm, adminNav.items, prompts, …).
 */
export function useContent() {
  const { i18n, t } = useTranslation()
  const activeLanguage = i18n.resolvedLanguage || i18n.language
  const bundle = useMemo(
    () => i18n.getResourceBundle(activeLanguage, 'translation') || {},
    [i18n, activeLanguage]
  )
  return { ...bundle, t, i18n, language: i18n.language }
}

export default useContent
