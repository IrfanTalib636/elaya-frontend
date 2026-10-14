import { useEffect, useRef, useState } from 'react'
import useTheme from '../hooks/useTheme'
import useContent from '../i18n/useContent'
import lightModePng from '../assets/icons/light-mode.png'
import nightModePng from '../assets/icons/night-mode.png'

const isSystemDark = () => {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return true
  }
}

/**
 * Single sun/moon control. Tap flips Light ↔ Dark.
 * Press-and-hold or right-click opens Light / Dark / Match device.
 */
const ThemeSwitcher = () => {
  const { preference, setPreference } = useTheme()
  const { t } = useContent()
  const [open, setOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const ref = useRef(null)
  const holdRef = useRef(null)
  const longPress = useRef(false)

  const syncResolved = (pref = preference) => {
    setIsDark(pref === 'dark' || (pref === 'system' && isSystemDark()))
  }

  useEffect(() => {
    syncResolved(preference)
    if (preference !== 'system') return undefined
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => syncResolved('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [preference])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const choose = (value) => {
    setPreference(value)
    setOpen(false)
  }

  const clearHold = () => {
    if (holdRef.current != null) {
      window.clearTimeout(holdRef.current)
      holdRef.current = null
    }
  }

  const icon = isDark ? lightModePng : nightModePng
  const label = preference === 'system' ? t('theme.system') : isDark ? t('theme.dark') : t('theme.light')

  return (
    <div ref={ref} className="relative font-sans">
      <button
        type="button"
        aria-label={label}
        title={`${label}. ${t('theme.holdForOptions')}`}
        onClick={() => {
          if (longPress.current) {
            longPress.current = false
            return
          }
          if (!open) choose(isDark ? 'light' : 'dark')
        }}
        onContextMenu={(e) => {
          e.preventDefault()
          setOpen(true)
        }}
        onPointerDown={() => {
          longPress.current = false
          clearHold()
          holdRef.current = window.setTimeout(() => {
            holdRef.current = null
            longPress.current = true
            setOpen(true)
          }, 450)
        }}
        onPointerUp={clearHold}
        onPointerLeave={clearHold}
        onPointerCancel={clearHold}
        className={`flex items-center justify-center w-9 h-9 rounded-[10px] border cursor-pointer transition-colors select-none
          border-elaya-border bg-studio-bg-3 hover:border-elaya-border-strong
          ${preference === 'system' ? 'ring-1 ring-studio-gold-2' : ''}`}
      >
        <img
          src={icon}
          alt=""
          className="theme-mode-png w-[18px] h-[18px] object-contain"
        />
      </button>

      {open ? (
        <div className="absolute top-full right-0 mt-1.5 w-40 rounded-xl border border-elaya-border bg-studio-bg-3 py-1 shadow-lg z-50">
          {['light', 'dark', 'system'].map((value) => {
            const active = preference === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => choose(value)}
                className={`w-full flex items-center px-3 py-2 text-[12px] font-medium cursor-pointer border-0 transition-colors
                  ${active
                    ? 'bg-studio-gold/10 text-studio-gold-2'
                    : 'bg-transparent text-studio-w3 hover:bg-studio-bg-4 hover:text-studio-white'
                  }`}
              >
                {t(`theme.${value}`)}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default ThemeSwitcher
