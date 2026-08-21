import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react'
import useTheme from '../hooks/useTheme'
import useContent from '../i18n/useContent'

/**
 * fullWidth — sidebar variant: full-width row, dropdown opens upward
 * default   — nav variant: compact button, dropdown opens downward
 */
const ThemeSwitcher = ({ fullWidth = false }) => {
  const { preference, setPreference } = useTheme()
  const { t } = useContent()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const OPTIONS = [
    { value: 'light',  icon: Sun,     label: t('theme.light') },
    { value: 'system', icon: Monitor, label: t('theme.system') },
    { value: 'dark',   icon: Moon,    label: t('theme.dark') },
  ]

  const current = OPTIONS.find((o) => o.value === preference) ?? OPTIONS[1]
  const Icon = current.icon

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const dropdown = (
    <div
      className={`absolute ${fullWidth ? 'bottom-full mb-1.5 left-0 right-0' : 'top-full right-0 mt-1.5 w-36'} rounded-xl border border-elaya-border bg-studio-bg-3 py-1 shadow-lg z-50`}
    >
      {OPTIONS.map(({ value, icon: ItemIcon, label }) => {
        const active = preference === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => { setPreference(value); setOpen(false) }}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-[12px] font-medium cursor-pointer border-0 transition-colors
              ${active
                ? 'bg-studio-gold/10 text-studio-gold-2'
                : 'bg-transparent text-studio-w3 hover:bg-studio-bg-4 hover:text-studio-white'
              }`}
          >
            <span className="flex items-center gap-2">
              <ItemIcon size={13} />
              {label}
            </span>
            {active && <Check size={11} />}
          </button>
        )
      })}
    </div>
  )

  return (
    <div ref={ref} className={`relative font-sans ${fullWidth ? 'w-full' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-[10px] border border-elaya-border bg-studio-bg-3 text-studio-w2 text-[12px] font-semibold cursor-pointer transition-colors hover:border-elaya-border-strong hover:text-studio-white select-none focus-visible:outline-2 focus-visible:outline-studio-gold focus-visible:outline-offset-2
          ${fullWidth ? 'w-full px-3 py-2 justify-between' : 'px-3 py-1.5'}`}
      >
        <span className="flex items-center gap-1.5">
          <Icon size={13} />
          <span>{current.label}</span>
        </span>
        <ChevronDown
          size={11}
          className="transition-transform duration-150"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {open && dropdown}
    </div>
  )
}

export default ThemeSwitcher
