import { useCallback, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Monitor, DollarSign, Activity, ShieldAlert } from 'lucide-react'
import { PageHeader } from '../../components/ui'
import AppearanceSettings from '../../components/settings/AppearanceSettings'
import PricingRulesPanel from '../../components/settings/PricingRulesPanel'
import SessionPredictionPanel from '../../components/settings/SessionPredictionPanel'
import MedicalLockoutsPanel from '../../components/settings/MedicalLockoutsPanel'
import ConfigLifecycleBar from '../../components/settings/ConfigLifecycleBar'
import {
  getPlatformConfig,
  saveConfigDraft,
} from '../../api/adminConfig'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../constants/roles'
import useContent from '../../i18n/useContent'

const TABS = [
  { id: 'appearance', icon: Monitor, labelKey: 'settings.tabs.appearance' },
  { id: 'pricing', icon: DollarSign, labelKey: 'settings.tabs.prices' },
  { id: 'sessions', icon: Activity, labelKey: 'settings.tabs.sessionPrediction' },
  { id: 'medical', icon: ShieldAlert, labelKey: 'settings.tabs.medicalLockouts' },
]

const DOMAIN_BY_TAB = {
  pricing: 'default_pricing',
  sessions: 'session_prediction',
  medical: 'sperrfristen',
}

/**
 * Super-admin settings — appearance plus versioned medical / pricing / prediction
 * rules (draft → publish → history / rollback).
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
  const [lifecycleByDomain, setLifecycleByDomain] = useState({})
  const [panelEpoch, setPanelEpoch] = useState(0)

  useEffect(() => {
    if (tabFromUrl && TABS.some((tab) => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const selectTab = (id) => {
    setActiveTab(id)
    setSearchParams(id === 'appearance' ? {} : { tab: id })
  }

  const applyLifecycle = useCallback((domain, lifecycle) => {
    if (!domain || !lifecycle) return
    setLifecycleByDomain((prev) => ({ ...prev, [domain]: lifecycle }))
  }, [])

  const bumpPanels = useCallback(() => {
    setPanelEpoch((n) => n + 1)
  }, [])

  const loadPlatformBundle = useCallback(async () => {
    const res = await getPlatformConfig()
    const cfg = res.data.data.platform_config || {}
    const lifecycle = res.data.data.config_lifecycle || {}
    setLifecycleByDomain(lifecycle)
    return { cfg, lifecycle, excel_plausibility: res.data.data.excel_plausibility }
  }, [])

  const loadPricing = useCallback(async () => {
    const { cfg, lifecycle } = await loadPlatformBundle()
    const published = cfg.pricing_defaults || cfg.default_pricing || {}
    const draftData = lifecycle.default_pricing?.draft?.data
    const pricing = draftData || published
    return {
      pricing,
      pricing_defaults: published,
      coin_wert: cfg.coinWert,
      has_draft: Boolean(lifecycle.default_pricing?.has_draft),
    }
  }, [loadPlatformBundle])

  const savePricing = useCallback(
    async ({ pricing }) => {
      const res = await saveConfigDraft('default_pricing', pricing)
      const life = res.data.data
      applyLifecycle('default_pricing', life)
      const published = life.published || {}
      const next = life.draft?.data || pricing
      return {
        pricing: next,
        pricing_defaults: published,
        has_draft: true,
      }
    },
    [applyLifecycle]
  )

  const loadSessions = useCallback(async () => {
    const { cfg, lifecycle, excel_plausibility } = await loadPlatformBundle()
    const published = cfg.session_prediction
    const draftData = lifecycle.session_prediction?.draft?.data
    return {
      session_prediction: draftData || published,
      excel_plausibility,
      has_draft: Boolean(lifecycle.session_prediction?.has_draft),
    }
  }, [loadPlatformBundle])

  const saveSessions = useCallback(
    async ({ session_prediction }) => {
      const res = await saveConfigDraft('session_prediction', session_prediction)
      const life = res.data.data
      applyLifecycle('session_prediction', life)
      return {
        session_prediction: life.draft?.data || session_prediction,
        has_draft: true,
      }
    },
    [applyLifecycle]
  )

  const loadMedical = useCallback(async () => {
    const { cfg, lifecycle } = await loadPlatformBundle()
    const published = cfg.sperrfristen || {}
    const draftData = lifecycle.sperrfristen?.draft?.data
    return {
      sperrfristen: draftData || published,
      has_draft: Boolean(lifecycle.sperrfristen?.has_draft),
    }
  }, [loadPlatformBundle])

  const saveMedical = useCallback(
    async ({ sperrfristen }) => {
      const res = await saveConfigDraft('sperrfristen', sperrfristen)
      const life = res.data.data
      applyLifecycle('sperrfristen', life)
      return {
        sperrfristen: life.draft?.data || sperrfristen,
        has_draft: true,
      }
    },
    [applyLifecycle]
  )

  const handleLifecyclePublished = useCallback(
    async (domain) => {
      const { lifecycle } = await loadPlatformBundle()
      applyLifecycle(domain, lifecycle[domain])
      bumpPanels()
    },
    [loadPlatformBundle, applyLifecycle, bumpPanels]
  )

  const handleDraftDiscarded = useCallback(
    (domain, life) => {
      applyLifecycle(domain, life)
      bumpPanels()
    },
    [applyLifecycle, bumpPanels]
  )

  const activeDomain = DOMAIN_BY_TAB[activeTab]
  const activeLifecycle = activeDomain ? lifecycleByDomain[activeDomain] : null

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
          {activeTab === 'medical' && (
            <>
              {canEditRules ? (
                <ConfigLifecycleBar
                  domain="sperrfristen"
                  canEdit={canEditRules}
                  hasDraft={Boolean(activeLifecycle?.has_draft)}
                  currentVersion={activeLifecycle?.current_version || 0}
                  onPublished={() => void handleLifecyclePublished('sperrfristen')}
                  onDraftDiscarded={(life) => handleDraftDiscarded('sperrfristen', life)}
                />
              ) : null}
              <MedicalLockoutsPanel
                key={`medical-${panelEpoch}`}
                canEdit={canEditRules}
                loadConfig={loadMedical}
                saveConfig={canEditRules ? saveMedical : undefined}
                saveLabel={t('adminPages.settings.saveDraft', {
                  defaultValue: 'Save draft',
                })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
