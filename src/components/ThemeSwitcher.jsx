import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react'
import useTheme from '../hooks/useTheme'

const OPTIONS = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'system', icon: Monitor, label: 'System' },
  { value: 'dark', icon: Moon, label: 'Dark' },
]

const ThemeSwitcher = () => {
  const { preference, setPreference } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const current = OPTIONS.find((o) => o.value === preference) ?? OPTIONS[1]
  const Icon = current.icon

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative font-sans">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-elaya-border bg-studio-bg-3 text-studio-w2 text-[12px] font-semibold cursor-pointer transition-colors hover:border-elaya-border-strong hover:text-studio-white select-none"
        style={{ outline: 'none' }}
      >
        <Icon size={13} />
        <span>{current.label}</span>
        <ChevronDown
          size={11}
          className="transition-transform duration-150"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-36 rounded-xl border border-elaya-border bg-studio-bg-3 py-1 shadow-lg z-50">
          {OPTIONS.map(({ value, icon: ItemIcon, label }) => {
            const active = preference === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setPreference(value)
                  setOpen(false)
                }}
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
      )}
    </div>
  )
}

export default ThemeSwitcher
