import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { Card } from '../ui'
import LanguageToggle from '../LanguageToggle'
import useTheme from '../../hooks/useTheme'

const THEME_OPTION_META = [
  { value: 'light', icon: Sun, labelKey: 'theme.light', descKey: 'settingsPage.appearance.themeLightDesc' },
  { value: 'dark', icon: Moon, labelKey: 'theme.dark', descKey: 'settingsPage.appearance.themeDarkDesc' },
  { value: 'system', icon: Monitor, labelKey: 'theme.system', descKey: 'settingsPage.appearance.themeSystemDesc' },
]

const ThemeOption = ({ value, icon: Icon, label, desc, active, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(value)}
    className={`flex flex-col items-start gap-2 p-4 rounded-[12px] border cursor-pointer transition-all text-left w-full ${
      active
        ? 'border-studio-gold bg-studio-gold/10 text-studio-white'
        : 'border-elaya-border bg-studio-bg-4 text-studio-w1 hover:border-elaya-border-strong hover:bg-studio-bg-5'
    }`}
  >
    <div className="flex items-center justify-between w-full">
      <Icon size={18} className={active ? 'text-studio-gold-2' : 'text-studio-w2'} />
      {active && (
        <span className="w-5 h-5 rounded-full bg-studio-gold flex items-center justify-center shrink-0">
          <Check size={11} className="text-white" />
        </span>
      )}
    </div>
    <div>
      <p className="text-[13px] font-semibold m-0">{label}</p>
      <p className={`text-[11px] m-0 mt-0.5 ${active ? 'text-studio-w2' : 'text-studio-w3'}`}>{desc}</p>
    </div>
  </button>
)

/**
 * Theme + language — client-local for both studio and admin dashboards.
 */
export default function AppearanceSettings() {
  const { t } = useTranslation()
  const { preference, setPreference } = useTheme()

  const themeOptions = useMemo(
    () =>
      THEME_OPTION_META.map((opt) => ({
        ...opt,
        label: t(opt.labelKey),
        desc: t(opt.descKey),
      })),
    [t]
  )

  return (
    <Card className="flex flex-col gap-5">
      <div className="border-b border-elaya-border pb-4">
        <h2 className="text-[15px] font-bold text-studio-white m-0">{t('theme.title')}</h2>
        <p className="text-studio-w3 text-[12px] m-0 mt-1">{t('theme.desc')}</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {themeOptions.map((opt) => (
          <ThemeOption
            key={opt.value}
            value={opt.value}
            icon={opt.icon}
            label={opt.label}
            desc={opt.desc}
            active={preference === opt.value}
            onSelect={setPreference}
          />
        ))}
      </div>
      <LanguageToggle />
      <p className="text-studio-w4 text-[11px] m-0">{t('settingsPage.appearance.deviceNote')}</p>
    </Card>
  )
}
