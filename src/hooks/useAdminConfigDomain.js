import { useCallback, useState } from 'react'
import {
  getPlatformConfig,
  saveConfigDraft,
} from '../api/adminConfig'

/**
 * Shared draft/publish helpers for admin Engine / Medical / Settings panels.
 */
export default function useAdminConfigDomain() {
  const [lifecycleByDomain, setLifecycleByDomain] = useState({})
  const [panelEpoch, setPanelEpoch] = useState(0)

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

  return {
    lifecycleByDomain,
    panelEpoch,
    loadPlatformBundle,
    loadPricing,
    savePricing,
    loadSessions,
    saveSessions,
    loadMedical,
    saveMedical,
    handleLifecyclePublished,
    handleDraftDiscarded,
  }
}
