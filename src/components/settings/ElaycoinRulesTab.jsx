import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Card, Spinner } from '../ui'
import { getStudioConfig } from '../../api/config'

/**
 * Studio read-only Elaycoin-Regeln — platform rules from Admin (prototype Settings → Elaycoins).
 */
const ElaycoinRulesTab = () => {
  const { t, i18n } = useTranslation()
  const isDe = (i18n.language || 'en').startsWith('de')
  const [loading, setLoading] = useState(true)
  const [regeln, setRegeln] = useState(null)
  const [limits, setLimits] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getStudioConfig()
      const cfg = res.data.data.studio_config || {}
      setRegeln(cfg.elaycoin_regeln || null)
      setLimits(cfg.platform_limits || null)
    } catch {
      toast.error(t('settings.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  const byKat = useMemo(() => {
    const situations = Array.isArray(regeln?.situations) ? regeln.situations : []
    return situations.reduce((acc, s) => {
      const kat = s.kat || 'OTHER'
      if (!acc[kat]) acc[kat] = []
      acc[kat].push(s)
      return acc
    }, {})
  }, [regeln])

  const coinsToChf = (coins) => {
    const gc = Number(regeln?.geldwert_coins) || 100
    const chf = Number(regeln?.geldwert_chf) || 5
    if (!gc) return '—'
    return `CHF ${((Number(coins) || 0) / gc * chf).toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  const geldwertCoins = regeln?.geldwert_coins ?? 100
  const geldwertChf = regeln?.geldwert_chf ?? 5
  const tageslimit = regeln?.tageslimit_pro_kunde ?? 800
  const minA = regeln?.grenze_pro_aktion_min ?? 0
  const maxA = regeln?.grenze_pro_aktion_max ?? 1000
  const verfall = limits?.verfallMonate ?? 12
  const triggers = Array.isArray(regeln?.verfall_reset_trigger)
    ? regeln.verfall_reset_trigger.join(', ')
    : 'Sitzung, Nachsorge-Check, Termin, Einkauf'

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="m-0 text-[13px] font-semibold text-studio-white">
          {t('settingsPage.elaycoinRules.title', { defaultValue: 'Elaycoin rules' })}
        </p>
        <p className="m-0 mt-2 text-[12px] text-studio-w2 leading-relaxed">
          {t('settingsPage.elaycoinRules.intro', {
            defaultValue:
              'Elaycoin rules are managed centrally by Elaya and apply to every studio. Changes are only possible in Elaya Admin.',
          })}
        </p>
        <p className="m-0 mt-3 text-[12px] text-studio-gold-2 font-semibold">
          {t('settingsPage.elaycoinRules.geldwert', {
            coins: geldwertCoins,
            chf: Number(geldwertChf).toFixed(2),
            defaultValue: `Value: ${geldwertCoins} Coins = CHF ${Number(geldwertChf).toFixed(2)}`,
          })}
          {' · '}
          {t('settingsPage.elaycoinRules.tageslimit', {
            n: tageslimit,
            defaultValue: `Daily limit: ${tageslimit} Coins`,
          })}
          {' · '}
          {t('settingsPage.elaycoinRules.grenze', {
            min: minA,
            max: maxA,
            defaultValue: `Per action: ${minA}–${maxA} Coins`,
          })}
        </p>
        <p className="m-0 mt-2 text-[11px] text-studio-w3 leading-relaxed">
          {t('settingsPage.elaycoinRules.verfall', {
            months: verfall,
            triggers,
            defaultValue: `Coins expire after ${verfall} months of inactivity. Reset by: ${triggers}.`,
          })}
        </p>
      </Card>

      {Object.keys(byKat).length === 0 ? (
        <Card>
          <p className="m-0 text-[13px] text-studio-w2 text-center py-4">
            {t('settingsPage.elaycoinRules.empty', { defaultValue: 'No action catalog loaded.' })}
          </p>
        </Card>
      ) : (
        Object.entries(byKat).map(([kat, rows]) => {
          const onCount = rows.filter((r) => r.aktiv !== false).length
          return (
            <Card key={kat} padding="none">
              <div className="px-4 py-3 border-b border-elaya-border flex justify-between items-center">
                <span className="text-[11px] font-mono uppercase tracking-wide text-studio-gold-2">
                  {kat}
                </span>
                <span className="text-[11px] text-studio-w3">
                  {onCount}/{rows.length}{' '}
                  {t('settingsPage.elaycoinRules.active', { defaultValue: 'active' })}
                </span>
              </div>
              <div className="divide-y divide-elaya-border">
                {rows.map((s) => {
                  const isOn = s.aktiv !== false
                  const isMalus = !!s.istMalus
                  const hint = isMalus
                    ? t('settingsPage.elaycoinRules.malusHint', {
                        defaultValue: 'Deduction (never below 0)',
                      })
                    : s.einmalig
                      ? t('settingsPage.elaycoinRules.once', { defaultValue: 'Once' })
                      : t('settingsPage.elaycoinRules.repeatable', {
                          defaultValue: 'Repeatable',
                        })
                  return (
                    <div
                      key={s.key}
                      className="px-4 py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p
                          className={`m-0 text-[13px] font-semibold ${
                            isOn ? 'text-studio-white' : 'text-studio-w3'
                          }`}
                        >
                          {isDe ? s.label : s.label}
                        </p>
                        <p className="m-0 text-[11px] text-studio-w3">{hint}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p
                            className={`m-0 text-[13px] font-bold font-mono ${
                              isMalus ? 'text-studio-red' : 'text-studio-gold-2'
                            }`}
                          >
                            {isMalus ? '−' : '+'}
                            {s.coins}
                          </p>
                          <p className="m-0 text-[10px] text-studio-w3">
                            ≈ {coinsToChf(s.coins)}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold ${
                            isOn ? 'text-studio-teal-2' : 'text-studio-w3'
                          }`}
                        >
                          {isOn
                            ? t('settingsPage.elaycoinRules.on', { defaultValue: 'ON' })
                            : t('settingsPage.elaycoinRules.off', { defaultValue: 'OFF' })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        })
      )}
    </div>
  )
}

export default ElaycoinRulesTab
