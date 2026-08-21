import { useTranslation } from 'react-i18next'
import { changeLanguage, SUPPORTED_LANGUAGES } from '../i18n/i18n.config'

/**
 * DE / EN language switch for Settings → Appearance.
 */
export default function LanguageToggle({ className = '' }) {
  const { t, i18n } = useTranslation()
  const current = (i18n.resolvedLanguage || i18n.language || 'de').slice(0, 2)

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p className="text-studio-w2 text-[12px] m-0 font-medium">{t('language.label')}</p>
      <p className="text-studio-w3 text-[11px] m-0 -mt-1">{t('language.desc')}</p>
      <div className="flex gap-2 mt-1">
        {SUPPORTED_LANGUAGES.map((code) => {
          const active = current === code
          return (
            <button
              key={code}
              type="button"
              onClick={() => changeLanguage(code)}
              className={`px-4 py-2 rounded-[10px] text-[13px] font-medium border transition-colors ${
                active
                  ? 'bg-studio-gold/15 border-studio-gold text-studio-gold-2'
                  : 'bg-studio-bg-4 border-elaya-border text-studio-w2 hover:border-studio-gold/40'
              }`}
            >
              {t(`language.${code}`)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
