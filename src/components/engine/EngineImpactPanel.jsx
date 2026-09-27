import { useEffect, useRef, useState } from 'react'
import { Gauge, AlertTriangle } from 'lucide-react'
import { previewPricing, previewSessionPrediction } from '../../api/config'
import { Spinner } from '../ui'
import useContent from '../../i18n/useContent'

/**
 * Shared "sample case" for the Impact preview — reuses the same Excel
 * plausibility preset (`example_2`, medium colourful tattoo, 40 cm²) that the
 * pricing/session-prediction live calculators already use. This keeps the
 * comparison apples-to-apples without duplicating EngineCaseSimulator's form.
 */
const PRESET_ID = 'example_2'

const fmtChf = (n) =>
  n == null
    ? '—'
    : `CHF ${Number(n).toLocaleString('de-CH', { maximumFractionDigits: 0 })}`

const fmtRange = (min, max) => (min == null || max == null ? '—' : `${min}–${max}`)

/**
 * Row comparing LIVE (published) vs DRAFT (unpublished) for one metric.
 * Highlights when the two differ, matching the prototype's `.pe-cmp-changed`.
 */
const CompareRow = ({ label, liveValue, draftValue, liveLabel, draftLabel }) => {
  const changed = String(liveValue) !== String(draftValue)
  return (
    <div
      className={`rounded-[10px] border px-3 py-2.5 mb-2 ${
        changed
          ? 'border-studio-gold/40 bg-studio-gold/5'
          : 'border-elaya-border bg-studio-bg-4'
      }`}
    >
      <p className="text-[11px] text-studio-w3 m-0 mb-1.5">{label}</p>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-wide text-studio-w3">{liveLabel}</span>
          <p className="text-[14px] font-semibold text-studio-white m-0 leading-tight">
            {liveValue}
          </p>
        </div>
        <div className="min-w-0 text-right">
          <span
            className={`text-[10px] uppercase tracking-wide ${
              changed ? 'text-studio-gold-2' : 'text-studio-w3'
            }`}
          >
            {draftLabel}
          </span>
          <p
            className={`text-[14px] font-semibold m-0 leading-tight ${
              changed ? 'text-studio-gold-2' : 'text-studio-white'
            }`}
          >
            {draftValue}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Sticky right-column Impact preview — prototype parity: shows LIVE
 * (published) vs DRAFT (unpublished) price/session, predicted sessions and
 * estimated total for a shared sample case, across both engine domains.
 *
 * `draftPricing` / `draftSessions` are the pending draft payloads for
 * `default_pricing` / `session_prediction` (from `lifecycleByDomain`); pass
 * `null` when there is no draft for that domain. `refreshKey` (panelEpoch)
 * forces a refetch after publish / discard.
 */
const EngineImpactPanel = ({
  draftPricing = null,
  draftSessions = null,
  hasPricingDraft = false,
  hasSessionsDraft = false,
  refreshKey = 0,
}) => {
  const { adminPages } = useContent()
  const copy = adminPages.engine?.impact || {}

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pricing, setPricing] = useState(null)
  const [sessions, setSessions] = useState(null)
  const reqSeq = useRef(0)

  useEffect(() => {
    const seq = ++reqSeq.current
    setLoading(true)
    setError('')
    ;(async () => {
      try {
        const [priceRes, sessRes] = await Promise.all([
          previewPricing({
            preset_id: PRESET_ID,
            ...(hasPricingDraft && draftPricing ? { studio_pricing: draftPricing } : {}),
          }),
          previewSessionPrediction({
            preset_id: PRESET_ID,
            ...(hasSessionsDraft && draftSessions
              ? { session_prediction: draftSessions }
              : {}),
          }),
        ])
        if (seq !== reqSeq.current) return
        setPricing(priceRes.data?.data || null)
        setSessions(sessRes.data?.data || null)
      } catch (err) {
        if (seq !== reqSeq.current) return
        setError(err?.response?.data?.message || copy.loadFailed || 'Could not load impact preview')
      } finally {
        if (seq === reqSeq.current) setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- copy.loadFailed is static i18n text
  }, [draftPricing, draftSessions, hasPricingDraft, hasSessionsDraft, refreshKey])

  // `baseline` is always computed from the currently *published* config
  // (never affected by the request body) → LIVE. `live` is computed with the
  // draft overrides merged in when present → DRAFT. See configController.js
  // previewPricingHandler / previewSessionPredictionHandler.
  const livePrice = pricing?.baseline?.pricePerSession
  const draftPrice = pricing?.live?.pricePerSession
  const liveSessions = sessions?.baseline
  const draftSessionsResult = sessions?.live

  const liveTotalMin =
    livePrice != null && liveSessions?.min != null ? livePrice * liveSessions.min : null
  const liveTotalMax =
    livePrice != null && liveSessions?.max != null ? livePrice * liveSessions.max : null
  const draftTotalMin =
    draftPrice != null && draftSessionsResult?.min != null
      ? draftPrice * draftSessionsResult.min
      : null
  const draftTotalMax =
    draftPrice != null && draftSessionsResult?.max != null
      ? draftPrice * draftSessionsResult.max
      : null

  const anyDraft = hasPricingDraft || hasSessionsDraft

  return (
    <div className="rounded-2xl border border-elaya-border bg-studio-bg-3 p-5">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="flex items-center gap-2 text-studio-white text-[14px] font-semibold m-0">
          <Gauge size={16} className="text-studio-gold-2" />
          {copy.title || 'Impact preview'}
        </h3>
        {loading ? <Spinner size="sm" /> : null}
      </div>

      <p className="text-[11px] text-studio-w3 m-0 mb-4">
        {copy.sampleCase || 'Sample case'}: {copy.sampleCaseName || 'Medium colourful tattoo (40 cm²)'}
      </p>

      {error ? (
        <p className="text-studio-amber text-[12px] m-0 mb-3 flex items-start gap-2">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          {error}
        </p>
      ) : null}

      <p
        className={`text-[11px] m-0 mb-3 rounded-[8px] px-2.5 py-1.5 ${
          anyDraft
            ? 'bg-studio-gold/10 text-studio-gold-2'
            : 'bg-studio-bg-4 text-studio-w3'
        }`}
      >
        {anyDraft
          ? copy.hasDraft || 'Pending draft — not yet published'
          : copy.noChanges || 'No pending draft — showing published rules for both domains.'}
      </p>

      <CompareRow
        label={copy.pricePerSession || 'Price / session'}
        liveLabel={copy.live || 'Live'}
        draftLabel={copy.draft || 'Draft'}
        liveValue={fmtChf(livePrice)}
        draftValue={fmtChf(draftPrice)}
      />
      <CompareRow
        label={copy.sessions || 'Predicted sessions'}
        liveLabel={copy.live || 'Live'}
        draftLabel={copy.draft || 'Draft'}
        liveValue={fmtRange(liveSessions?.min, liveSessions?.max)}
        draftValue={fmtRange(draftSessionsResult?.min, draftSessionsResult?.max)}
      />
      <CompareRow
        label={copy.total || 'Estimated total'}
        liveLabel={copy.live || 'Live'}
        draftLabel={copy.draft || 'Draft'}
        liveValue={
          liveTotalMin != null && liveTotalMax != null
            ? `${fmtChf(liveTotalMin)}–${fmtChf(liveTotalMax)}`
            : '—'
        }
        draftValue={
          draftTotalMin != null && draftTotalMax != null
            ? `${fmtChf(draftTotalMin)}–${fmtChf(draftTotalMax)}`
            : '—'
        }
      />

      <p className="text-[11px] text-studio-w3 m-0 mt-3 border-t border-elaya-border pt-3">
        {copy.sharedInputsHint ||
          'Same sample case as the pricing / session-prediction live calculators, so pricing and session-prediction drafts compare like-for-like.'}
      </p>
    </div>
  )
}

export default EngineImpactPanel
