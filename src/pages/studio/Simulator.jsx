import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../../components/ui'
import PricingRulesPanel from '../../components/settings/PricingRulesPanel'
import SessionPredictionPanel from '../../components/settings/SessionPredictionPanel'
import { getStudioConfig } from '../../api/config'
import useContent from '../../i18n/useContent'

/**
 * Studio Tattoo Case Simulator — live pricing + session prediction.
 * Read-only: calculation parameters are owned by Super Admin (Engine).
 */
const StudioSimulator = () => {
  const { t } = useTranslation()
  const { studioPages } = useContent()
  const copy = studioPages?.simulator || {}

  const loadPricing = useCallback(async () => {
    const res = await getStudioConfig()
    const cfg = res.data.data
    const pricing = {
      ...(cfg.pricing_defaults || {}),
      ...(cfg.studio_pricing || {}),
    }
    return {
      pricing,
      pricing_defaults: cfg.pricing_defaults || {},
      coin_wert: cfg.coin_wert ?? cfg.coinWert,
    }
  }, [])

  const loadSessions = useCallback(async () => {
    const res = await getStudioConfig()
    return {
      session_prediction: res.data.data.studio_config?.session_prediction,
    }
  }, [])

  return (
    <div className="p-6 max-w-[1240px]">
      <PageHeader
        title={copy.title || t('studioNav.simulator', { defaultValue: 'Case Simulator' })}
        subtitle={
          copy.subtitle ||
          'Simulate prices and session forecasts with live platform rules. You cannot change the underlying calculation logic — only Elaya Super Admin can.'
        }
      />

      <div className="mb-4 rounded-[12px] border border-studio-gold/25 bg-studio-gold/5 px-4 py-3 text-[12px] text-studio-w1">
        {copy.readOnlyBanner ||
          'Simulator only — pricing and prediction parameters are controlled centrally by Elaya Admin.'}
      </div>

      <div className="flex flex-col gap-8">
        <section>
          <h2 className="m-0 mb-3 text-[15px] font-semibold text-studio-white">
            {copy.pricingHeading || t('settings.tabs.prices', { defaultValue: 'Prices' })}
          </h2>
          <PricingRulesPanel canEdit={false} loadPricing={loadPricing} />
        </section>

        <section>
          <h2 className="m-0 mb-3 text-[15px] font-semibold text-studio-white">
            {copy.sessionsHeading ||
              t('settings.tabs.sessionPrediction', { defaultValue: 'Session prediction' })}
          </h2>
          <SessionPredictionPanel canEdit={false} loadConfig={loadSessions} />
        </section>
      </div>
    </div>
  )
}

export default StudioSimulator
