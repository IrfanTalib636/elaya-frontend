import { useEffect } from 'react'
import useThemeStore from '../store/themeStore'

const isSystemDark = () => {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return true
  }
}

export const applyTheme = (preference) => {
  const isDark = preference === 'dark' || (preference === 'system' && isSystemDark())
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
}

const useTheme = () => {
  const { preference, setPreference } = useThemeStore()

  useEffect(() => {
    applyTheme(preference)

    if (preference !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [preference])

  return { preference, setPreference }
}

export default useTheme
