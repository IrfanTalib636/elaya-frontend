import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  SlidersHorizontal,
  DollarSign,
  Palette,
  Fingerprint,
  Activity,
  HeartPulse,
  History,
  FlaskConical,
  Settings2,
} from 'lucide-react'
import { PageHeader } from '../../components/ui'
import PricingRulesPanel from '../../components/settings/PricingRulesPanel'
import SessionPredictionPanel from '../../components/settings/SessionPredictionPanel'
import ConfigLifecycleBar from '../../components/settings/ConfigLifecycleBar'
import EngineCaseSimulator from '../../components/engine/EngineCaseSimulator'
import EngineHowItWorks from '../../components/engine/EngineHowItWorks'
import EngineImpactPanel from '../../components/engine/EngineImpactPanel'
import useAdminConfigDomain from '../../hooks/useAdminConfigDomain'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../constants/roles'
import useContent from '../../i18n/useContent'

const VIEWS = [
  { id: 'studio', icon: FlaskConical, labelKey: 'adminPages.engine.viewStudio' },
  { id: 'admin', icon: Settings2, labelKey: 'adminPages.engine.viewAdmin' },
]

/**
 * Super Admin Engine — 8 left-nav sections (prototype `ENG_SEC_NAV` parity,
 * inkderm-prototype/public/admin/index.html ~L8362).
 */
const ENGINE_SECTIONS = [
  { id: 'how', icon: BookOpen, labelKey: 'adminPages.engine.sections.how' },
  { id: 'base', icon: SlidersHorizontal, labelKey: 'adminPages.engine.sections.base' },
  { id: 'pricing', icon: DollarSign, labelKey: 'adminPages.engine.sections.pricing' },
  { id: 'colors', icon: Palette, labelKey: 'adminPages.engine.sections.colors' },
  { id: 'fitzpatrick', icon: Fingerprint, labelKey: 'adminPages.engine.sections.fitzpatrick' },
  { id: 'lifestyle', icon: Activity, labelKey: 'adminPages.engine.sections.lifestyle' },
  { id: 'healing', icon: HeartPulse, labelKey: 'adminPages.engine.sections.healing' },
  { id: 'versions', icon: History, labelKey: 'adminPages.engine.sections.versions' },
]

const SECTION_IDS = ENGINE_SECTIONS.map((s) => s.id)

/**
 * These 5 sections all edit `session_prediction` and are rendered through the
 * SAME mounted `SessionPredictionPanel` instance (only the `section` prop
 * changes) — switching between them never re-fetches or drops unsaved edits.
 * Only leaving this group (e.g. to "how" / "pricing" / "versions") and coming
 * back remounts it, same as the previous tab behaviour.
 */
const SESSION_FORM_SECTIONS = ['base', 'colors', 'fitzpatrick', 'lifestyle', 'healing']

/** Legacy `?tab=pricing|sessions` deep links from the old 2-tab layout. */
const LEGACY_TAB_SECTION = { pricing: 'pricing', sessions: 'base' }

/**
 * Prediction Engine — Studio simulator (published/live only) + Super Admin
 * 3-column rule editor (sections | editor | sticky Impact preview).
 * Language / theme stay in Settings — not here.
 */
const AdminEngine = () => {
  const { t } = useTranslation()
  const { adminPages } = useContent()
  const copy = adminPages.engine || {}
  const role = useAuthStore((s) => s.user?.role)
  const canEditRules = role === ROLES.SUPER_ADMIN

  const [searchParams, setSearchParams] = useSearchParams()
  const viewFromUrl = searchParams.get('view')
  const sectionFromUrl = searchParams.get('section')
  const tabFromUrl = searchParams.get('tab') // legacy

  const [view, setView] = useState(
    viewFromUrl === 'admin' || sectionFromUrl || tabFromUrl ? 'admin' : 'studio'
  )
  const [activeSection, setActiveSection] = useState(() => {
    if (SECTION_IDS.includes(sectionFromUrl)) return sectionFromUrl
    if (tabFromUrl && LEGACY_TAB_SECTION[tabFromUrl]) return LEGACY_TAB_SECTION[tabFromUrl]
    return 'how'
  })

  const {
    lifecycleByDomain,
    panelEpoch,
    loadPlatformBundle,
    loadPricing,
    savePricing,
    loadSessions,
    saveSessions,
    handleLifecyclePublished,
    handleDraftDiscarded,
  } = useAdminConfigDomain()

  useEffect(() => {
    if (viewFromUrl === 'admin' || viewFromUrl === 'studio') {
      setView(viewFromUrl)
    } else if (sectionFromUrl || tabFromUrl) {
      setView('admin')
    }
    if (SECTION_IDS.includes(sectionFromUrl)) {
      setActiveSection(sectionFromUrl)
    } else if (tabFromUrl && LEGACY_TAB_SECTION[tabFromUrl]) {
      setActiveSection(LEGACY_TAB_SECTION[tabFromUrl])
    }
  }, [viewFromUrl, sectionFromUrl, tabFromUrl])

  // The Impact panel compares both domains regardless of which section panel
  // happens to be mounted, so keep `lifecycleByDomain` fresh independently —
  // on entering the admin view, and again after any publish/discard.
  useEffect(() => {
    if (view !== 'admin') return
    void loadPlatformBundle()
  }, [view, panelEpoch, loadPlatformBundle])

  const selectView = (id) => {
    setView(id)
    if (id === 'studio') {
      setSearchParams({})
    } else {
      setSearchParams({
        view: 'admin',
        ...(activeSection !== 'how' ? { section: activeSection } : {}),
      })
    }
  }

  const selectSection = (id) => {
    setActiveSection(id)
    setSearchParams({
      view: 'admin',
      ...(id !== 'how' ? { section: id } : {}),
    })
  }

  const pricingLifecycle = lifecycleByDomain.default_pricing
  const sessionsLifecycle = lifecycleByDomain.session_prediction

  return (
    <div className="p-6 max-w-[1440px]">
      <PageHeader
        title={copy.title || 'Prediction Engine'}
        subtitle={
          copy.subtitle ||
          'Central control of pricing and session prediction. Only Super Admin can edit calculation rules. Studios use the simulator read-only.'
        }
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {VIEWS.map(({ id, icon: Icon, labelKey }) => {
          const active = view === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => selectView(id)}
              className={`inline-flex items-center gap-2 rounded-[12px] px-4 py-2.5 text-[13px] font-semibold border cursor-pointer transition-colors ${
                active
                  ? 'bg-studio-gold border-studio-gold text-white'
                  : 'bg-transparent border-elaya-border text-studio-w1 hover:border-studio-gold/40'
              }`}
            >
              <Icon size={15} />
              {t(labelKey, {
                defaultValue: id === 'studio' ? 'Studio view' : 'Super Admin / Engine',
              })}
            </button>
          )
        })}
      </div>

      {view === 'studio' ? (
        <>
          <p className="text-studio-w2 text-[13px] m-0 mb-5 max-w-[720px]">
            {copy.studioHint ||
              'Tattoo case simulator — computes live against the published engine. To compare against unpublished draft rules, use the Impact preview under Super Admin / Engine → Versions & audit.'}
          </p>
          <EngineCaseSimulator mode="admin" />
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)_340px] gap-6 items-start">
          <nav className="flex flex-col gap-0.5 lg:sticky lg:top-4" translate="no">
            <p className="text-studio-w3 text-[11px] font-semibold uppercase tracking-wide m-0 mb-2 px-3">
              {t('adminPages.engine.navSections', { defaultValue: 'Sections' })}
            </p>
            {ENGINE_SECTIONS.map(({ id, icon: Icon, labelKey }) => (
              <button
                key={id}
                type="button"
                onClick={() => selectSection(id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors w-full text-left cursor-pointer border-0 ${
                  activeSection === id
                    ? 'bg-(--nav-active-bg) text-studio-gold-2'
                    : 'bg-transparent text-studio-w1 hover:text-studio-white hover:bg-studio-bg-4'
                }`}
              >
                <Icon size={14} className="shrink-0" />
                {t(labelKey)}
              </button>
            ))}
          </nav>

          <div className="min-w-0 flex flex-col gap-5">
            {activeSection === 'how' ? <EngineHowItWorks /> : null}

            {activeSection === 'pricing' ? (
              <>
                {canEditRules ? (
                  <ConfigLifecycleBar
                    domain="default_pricing"
                    canEdit={canEditRules}
                    hasDraft={Boolean(pricingLifecycle?.has_draft)}
                    currentVersion={pricingLifecycle?.current_version || 0}
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
            ) : null}

            {SESSION_FORM_SECTIONS.includes(activeSection) ? (
              <>
                {canEditRules ? (
                  <ConfigLifecycleBar
                    domain="session_prediction"
                    canEdit={canEditRules}
                    hasDraft={Boolean(sessionsLifecycle?.has_draft)}
                    currentVersion={sessionsLifecycle?.current_version || 0}
                    onPublished={() => void handleLifecyclePublished('session_prediction')}
                    onDraftDiscarded={(life) =>
                      handleDraftDiscarded('session_prediction', life)
                    }
                  />
                ) : null}
                <SessionPredictionPanel
                  key={`sessions-${panelEpoch}`}
                  section={activeSection}
                  title={t(`adminPages.engine.sections.${activeSection}`)}
                  description={t(`adminPages.engine.sectionHints.${activeSection}`, {
                    defaultValue: t('settingsPage.sessions.desc'),
                  })}
                  canEdit={canEditRules}
                  loadConfig={loadSessions}
                  saveConfig={canEditRules ? saveSessions : undefined}
                  saveLabel={t('adminPages.settings.saveDraft', {
                    defaultValue: 'Save draft',
                  })}
                  showPlausibility={activeSection === 'base'}
                />
              </>
            ) : null}

            {activeSection === 'versions' ? (
              <div className="rounded-2xl border border-elaya-border bg-studio-bg-3 p-5 flex flex-col gap-5">
                <h3 className="flex items-center gap-2 text-studio-white text-[14px] font-semibold m-0">
                  <History size={16} className="text-studio-gold-2" />
                  {t('adminPages.engine.sections.versions')}
                </h3>
                <p className="text-[11px] text-studio-w3 m-0 border border-elaya-border rounded-[10px] px-3 py-2 bg-studio-bg-4">
                  {copy.versionsHint ||
                    "Pricing and session prediction publish independently today — publishing one domain's draft does not affect the other's."}
                </p>
                <div>
                  <p className="text-[12px] font-semibold text-studio-w1 m-0 mb-2">
                    {t('settings.tabs.prices')}
                  </p>
                  <ConfigLifecycleBar
                    domain="default_pricing"
                    canEdit={canEditRules}
                    hasDraft={Boolean(pricingLifecycle?.has_draft)}
                    currentVersion={pricingLifecycle?.current_version || 0}
                    onPublished={() => void handleLifecyclePublished('default_pricing')}
                    onDraftDiscarded={(life) => handleDraftDiscarded('default_pricing', life)}
                  />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-studio-w1 m-0 mb-2">
                    {t('settings.tabs.sessionPrediction')}
                  </p>
                  <ConfigLifecycleBar
                    domain="session_prediction"
                    canEdit={canEditRules}
                    hasDraft={Boolean(sessionsLifecycle?.has_draft)}
                    currentVersion={sessionsLifecycle?.current_version || 0}
                    onPublished={() => void handleLifecyclePublished('session_prediction')}
                    onDraftDiscarded={(life) =>
                      handleDraftDiscarded('session_prediction', life)
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-4">
            <EngineImpactPanel
              draftPricing={pricingLifecycle?.draft?.data || null}
              hasPricingDraft={Boolean(pricingLifecycle?.has_draft)}
              draftSessions={sessionsLifecycle?.draft?.data || null}
              hasSessionsDraft={Boolean(sessionsLifecycle?.has_draft)}
              refreshKey={panelEpoch}
            />
          </aside>
        </div>
      )}
    </div>
  )
}

export default AdminEngine
