import { useCallback, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Monitor, DollarSign, Activity } from 'lucide-react'
import { PageHeader } from '../../components/ui'
import AppearanceSettings from '../../components/settings/AppearanceSettings'
import PricingRulesPanel from '../../components/settings/PricingRulesPanel'
import SessionPredictionPanel from '../../components/settings/SessionPredictionPanel'
import { getPlatformConfig, updatePlatformConfig } from '../../api/adminConfig'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../constants/roles'
import useContent from '../../i18n/useContent'

const TABS = [
  { id: 'appearance', icon: Monitor, labelKey: 'settings.tabs.appearance' },
  { id: 'pricing', icon: DollarSign, labelKey: 'settings.tabs.prices' },
  { id: 'sessions', icon: Activity, labelKey: 'settings.tabs.sessionPrediction' },
]

/**
 * Super-admin settings — same appearance / pricing / session-prediction UI as
 * studio, but only SUPER_ADMIN may edit price + prediction rules.
 */
const AdminSettings = () => {
  const { t } = useTranslation()
  const { adminPages } = useContent()
  const copy = adminPages.settings
  const role = useAuthStore((s) => s.user?.role)
  const canEditRules = role === ROLES.SUPER_ADMIN

  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(
    TABS.some((tab) => tab.id === tabFromUrl) ? tabFromUrl : 'appearance'
  )

  useEffect(() => {
    if (tabFromUrl && TABS.some((tab) => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const selectTab = (id) => {
    setActiveTab(id)
    setSearchParams(id === 'appearance' ? {} : { tab: id })
  }

  const loadPricing = useCallback(async () => {
    const res = await getPlatformConfig()
    const cfg = res.data.data.platform_config || {}
    const pricing = cfg.pricing_defaults || cfg.default_pricing || {}
    return {
      pricing,
      pricing_defaults: pricing,
      coin_wert: cfg.coinWert,
    }
  }, [])

  const savePricing = useCallback(async ({ pricing }) => {
    const res = await updatePlatformConfig({ default_pricing: pricing })
    const cfg = res.data.data.platform_config || {}
    const next = cfg.pricing_defaults || {
      ...(cfg.default_pricing || {}),
      ...pricing,
    }
    return {
      pricing: next,
      pricing_defaults: next,
      coin_wert: cfg.coinWert,
    }
  }, [])

  const loadSessions = useCallback(async () => {
    const res = await getPlatformConfig()
    return {
      session_prediction: res.data.data.platform_config?.session_prediction,
      excel_plausibility: res.data.data.excel_plausibility || null,
    }
  }, [])

  const saveSessions = useCallback(async ({ session_prediction }) => {
    const res = await updatePlatformConfig({ session_prediction })
    return {
      session_prediction: res.data.data.platform_config?.session_prediction,
      excel_plausibility: res.data.data.excel_plausibility || null,
    }
  }, [])

  return (
    <div
      className={`p-6 ${
        activeTab === 'pricing' || activeTab === 'sessions' ? 'max-w-[1240px]' : 'max-w-[860px]'
      }`}
    >
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="flex gap-6">
        <nav className="flex flex-col gap-0.5 w-44 shrink-0" translate="no">
          {TABS.map(({ id, icon: Icon, labelKey }) => (
            <button
              key={id}
              type="button"
              onClick={() => selectTab(id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors w-full text-left cursor-pointer border-0 ${
                activeTab === id
                  ? 'bg-(--nav-active-bg) text-studio-gold-2'
                  : 'bg-transparent text-studio-w1 hover:text-studio-white hover:bg-studio-bg-4'
              }`}
            >
              <Icon size={14} className="shrink-0" />
              {t(labelKey)}
            </button>
          ))}
        </nav>

        <div className="flex-1 flex flex-col gap-5">
          {activeTab === 'appearance' && <AppearanceSettings />}
          {activeTab === 'pricing' && (
            <PricingRulesPanel
              canEdit={canEditRules}
              loadPricing={loadPricing}
              savePricing={canEditRules ? savePricing : undefined}
              coinWertLabel={t('settingsPage.pricing.chfPerCoin')}
            />
          )}
          {activeTab === 'sessions' && (
            <SessionPredictionPanel
              canEdit={canEditRules}
              loadConfig={loadSessions}
              saveConfig={canEditRules ? saveSessions : undefined}
              showPlausibility
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
