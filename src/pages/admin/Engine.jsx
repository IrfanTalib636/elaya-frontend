import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DollarSign, Activity } from 'lucide-react'
import { PageHeader } from '../../components/ui'
import PricingRulesPanel from '../../components/settings/PricingRulesPanel'
import SessionPredictionPanel from '../../components/settings/SessionPredictionPanel'
import ConfigLifecycleBar from '../../components/settings/ConfigLifecycleBar'
import useAdminConfigDomain from '../../hooks/useAdminConfigDomain'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../constants/roles'
import useContent from '../../i18n/useContent'

const TABS = [
  { id: 'pricing', icon: DollarSign, labelKey: 'settings.tabs.prices' },
  { id: 'sessions', icon: Activity, labelKey: 'settings.tabs.sessionPrediction' },
]

const DOMAIN_BY_TAB = {
  pricing: 'default_pricing',
  sessions: 'session_prediction',
}

/**
 * Prediction Engine — central Super Admin control of pricing + session prediction.
 * Studios may only simulate (read-only); they cannot change calculation logic here.
 */
const AdminEngine = () => {
  const { t } = useTranslation()
  const { adminPages } = useContent()
  const copy = adminPages.engine || {}
  const role = useAuthStore((s) => s.user?.role)
  const canEditRules = role === ROLES.SUPER_ADMIN

  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(
    TABS.some((tab) => tab.id === tabFromUrl) ? tabFromUrl : 'pricing'
  )

  const {
    lifecycleByDomain,
    panelEpoch,
    loadPricing,
    savePricing,
    loadSessions,
    saveSessions,
    handleLifecyclePublished,
    handleDraftDiscarded,
  } = useAdminConfigDomain()

  useEffect(() => {
    if (tabFromUrl && TABS.some((tab) => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const selectTab = (id) => {
    setActiveTab(id)
    setSearchParams(id === 'pricing' ? {} : { tab: id })
  }

  const activeDomain = DOMAIN_BY_TAB[activeTab]
  const activeLifecycle = activeDomain ? lifecycleByDomain[activeDomain] : null

  return (
    <div className="p-6 max-w-[1240px]">
      <PageHeader
        title={copy.title || 'Prediction Engine'}
        subtitle={
          copy.subtitle ||
          'Central control of pricing and session prediction. Only Super Admin can edit calculation rules. Studios use the simulator read-only.'
        }
      />

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
          {activeTab === 'pricing' && (
            <>
              {canEditRules ? (
                <ConfigLifecycleBar
                  domain="default_pricing"
                  canEdit={canEditRules}
                  hasDraft={Boolean(activeLifecycle?.has_draft)}
                  currentVersion={activeLifecycle?.current_version || 0}
                  onPublished={() => void handleLifecyclePublished('default_pricing')}
                  onDraftDiscarded={(life) => handleDraftDiscarded('default_pricing', life)}
                />
              ) : null}
              <PricingRulesPanel
                key={`pricing-${panelEpoch}`}
                canEdit={canEditRules}
                loadPricing={loadPricing}
                savePricing={canEditRules ? savePricing : undefined}
                saveLabel={t('adminPages.settings.saveDraft', {
                  defaultValue: 'Save draft',
                })}
                coinWertLabel={t('settingsPage.pricing.chfPerCoin')}
              />
            </>
          )}
          {activeTab === 'sessions' && (
            <>
              {canEditRules ? (
                <ConfigLifecycleBar
                  domain="session_prediction"
                  canEdit={canEditRules}
                  hasDraft={Boolean(activeLifecycle?.has_draft)}
                  currentVersion={activeLifecycle?.current_version || 0}
                  onPublished={() => void handleLifecyclePublished('session_prediction')}
                  onDraftDiscarded={(life) =>
                    handleDraftDiscarded('session_prediction', life)
                  }
                />
              ) : null}
              <SessionPredictionPanel
                key={`sessions-${panelEpoch}`}
                canEdit={canEditRules}
                loadConfig={loadSessions}
                saveConfig={canEditRules ? saveSessions : undefined}
                saveLabel={t('adminPages.settings.saveDraft', {
                  defaultValue: 'Save draft',
                })}
                showPlausibility
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminEngine
