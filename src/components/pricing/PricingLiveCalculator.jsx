import { useEffect, useMemo, useRef, useState } from 'react'
import { Calculator, AlertTriangle } from 'lucide-react'
import { previewPricing } from '../../api/config'
import { buildStudioPricing, PRICING_LABELS } from './pricingFields'
import { Select, Spinner } from '../ui'
import useContent from '../../i18n/useContent'

const PRESET_IDS = ['example_1', 'example_2', 'example_3']

const fmtChf = (n) =>
  n == null ? '—' : n.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

const fmtMult = (n) => (n == null ? '—' : `× ${n}`)

/**
 * Live price calculator for the pricing settings.
 *
 * Uses POST /config/pricing/preview, which runs the same pricingEngine as case
 * creation, so the preview can never drift from the real quote. `values` is the
 * unsaved form draft; `savedBaseline` is what is currently stored, so the panel
 * can show saved → draft while the studio edits.
 */
const PricingLiveCalculator = ({ values, savedBaseline = null, studioId = null }) => {
  const { components } = useContent()
  const copy = components.pricing
  const liveCopy = copy.live
  const [presetId, setPresetId] = useState('example_2')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const reqSeq = useRef(0)

  const payloadPricing = useMemo(() => {
    if (!values) return null
    try {
      return buildStudioPricing(values)
    } catch {
      return null
    }
  }, [values])

  useEffect(() => {
    if (!payloadPricing) return undefined
    const seq = ++reqSeq.current
    const timer = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await previewPricing({
          preset_id: presetId,
          studio_pricing: payloadPricing,
          ...(studioId ? { studio_id: studioId } : {}),
        })
        if (seq !== reqSeq.current) return
        setResult(res.data.data)
      } catch (err) {
        if (seq !== reqSeq.current) return
        setError(err?.response?.data?.message || liveCopy.previewFailed)
      } finally {
        if (seq === reqSeq.current) setLoading(false)
      }
    }, 280)
    return () => clearTimeout(timer)
  }, [payloadPricing, presetId, studioId, liveCopy.previewFailed])

  const live = result?.live
  const baseline = result?.baseline
  const delta = result?.delta
  const breakdown = live?.breakdown
  const check = result?.config_check

  const differsFromSaved = useMemo(() => {
    if (!savedBaseline || !payloadPricing) return false
    try {
      return JSON.stringify(buildStudioPricing(savedBaseline)) !== JSON.stringify(payloadPricing)
    } catch {
      return false
    }
  }, [savedBaseline, payloadPricing])

  const labelFor = (key) => (key ? copy.fields?.[key] || PRICING_LABELS[key] || key : null)

  return (
    <div className="border border-studio-gold/30 rounded-[12px] px-4 py-4 bg-studio-gold/5 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-studio-gold shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-studio-white m-0">{liveCopy.title}</p>
            <p className="text-[11px] text-studio-w3 m-0">{liveCopy.subtitle}</p>
          </div>
        </div>
        {loading && <Spinner size="sm" />}
      </div>

      <Select
        label={liveCopy.exampleCase}
        value={presetId}
        onChange={(e) => setPresetId(e.target.value)}
      >
        {PRESET_IDS.map((id) => (
          <option key={id} value={id}>
            {liveCopy.presets[id]}
          </option>
        ))}
      </Select>

      {error ? <p className="text-elaya-error text-[12px] m-0">{error}</p> : null}

      {/* Values that would break the calculation — e.g. a multiplier of 0 wipes
          out every price it touches, which is easy to type and hard to notice. */}
      {check?.issues?.length ? (
        <div className="flex flex-col gap-1.5">
          {check.issues.map((issue) => (
            <p
              key={`${issue.key}-${issue.code}`}
              className={`flex items-start gap-1.5 text-[11px] m-0 rounded-[8px] border px-2.5 py-2 ${
                issue.severity === 'error'
                  ? 'border-elaya-error/40 bg-elaya-error/10 text-elaya-error'
                  : 'border-elaya-warning/40 bg-elaya-warning/10 text-elaya-warning'
              }`}
            >
              <AlertTriangle size={13} className="shrink-0 mt-px" />
              <span>
                <strong>{labelFor(issue.key)}</strong>
                {` (${issue.value}) — `}
                {liveCopy.issues[issue.code]}
              </span>
            </p>
          ))}
        </div>
      ) : null}

      {live ? (
        <>
          <div className="flex flex-wrap items-end gap-3">
            {baseline && differsFromSaved ? (
              <>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-studio-w3 font-semibold">
                    {liveCopy.saved}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-[8px] border text-[13px] font-bold tabular-nums bg-studio-bg-4 border-elaya-border text-studio-w2">
                    {liveCopy.chf} {fmtChf(baseline.pricePerSession)}
                  </span>
                </div>
                <span className="text-studio-w3 text-[16px] pb-1">→</span>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-studio-gold-2 font-semibold">
                    {liveCopy.draft}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-[8px] border text-[14px] font-bold tabular-nums bg-studio-gold/10 border-studio-gold/35 text-studio-gold-2">
                    {liveCopy.chf} {fmtChf(live.pricePerSession)}
                  </span>
                </div>
                {delta?.pricePerSession ? (
                  <span
                    className={`text-[12px] pb-1.5 tabular-nums ${
                      delta.pricePerSession > 0 ? 'text-elaya-warning' : 'text-elaya-success'
                    }`}
                  >
                    {delta.pricePerSession > 0 ? '+' : ''}
                    {fmtChf(delta.pricePerSession)}
                  </span>
                ) : null}
              </>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-studio-gold-2 font-semibold">
                  {liveCopy.calculatedPrice}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-[8px] border text-[14px] font-bold tabular-nums bg-studio-gold/10 border-studio-gold/35 text-studio-gold-2">
                  {liveCopy.chf} {fmtChf(live.pricePerSession)}
                </span>
              </div>
            )}
          </div>

          {/* Base price → each applied multiplier → final price. Neutral factors
              (× 1) are dimmed so the ones that actually move the price stand out. */}
          {breakdown?.steps?.length ? (
            <div className="rounded-[10px] border border-elaya-border bg-studio-bg-4 overflow-hidden">
              {breakdown.area != null ? (
                <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-elaya-border">
                  <span className="text-[11px] text-studio-w2">
                    {liveCopy.areaLabel}
                    <span className="text-studio-w3">
                      {` · ${breakdown.area} cm² × ${liveCopy.chf} ${fmtChf(breakdown.basePricePerCm2)}`}
                    </span>
                  </span>
                  <span className="text-[12px] text-studio-white font-semibold tabular-nums">
                    {liveCopy.chf} {fmtChf(breakdown.steps[0].running)}
                  </span>
                </div>
              ) : null}

              {breakdown.steps.slice(breakdown.area != null ? 1 : 0).map((step) => {
                const neutral = step.value === 1
                return (
                  <div
                    key={step.id}
                    className={`flex items-center justify-between gap-3 px-3 py-1.5 border-b border-elaya-border ${
                      neutral ? 'opacity-45' : ''
                    }`}
                  >
                    <span className="text-[11px] text-studio-w2 truncate">
                      <span className="text-studio-w3">{copy.groups?.[step.id] || step.id}</span>
                      {labelFor(step.config_key) ? ` · ${labelFor(step.config_key)}` : ''}
                    </span>
                    <span className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[11px] tabular-nums ${
                          neutral ? 'text-studio-w3' : 'text-studio-gold-2 font-semibold'
                        }`}
                      >
                        {fmtMult(step.value)}
                      </span>
                      <span className="text-[12px] text-studio-white tabular-nums w-[92px] text-right">
                        {liveCopy.chf} {fmtChf(step.running)}
                      </span>
                    </span>
                  </div>
                )
              })}

              <div className="flex items-center justify-between gap-3 px-3 py-2 bg-studio-gold/10">
                <span className="text-[11px] text-studio-w2">
                  {breakdown.minPriceApplied ? liveCopy.minPriceApplied : liveCopy.roundedTo5}
                </span>
                <span className="text-[13px] text-studio-gold-2 font-bold tabular-nums">
                  {liveCopy.chf} {fmtChf(breakdown.pricePerSession)}
                </span>
              </div>
            </div>
          ) : null}

          <p className="text-[11px] text-studio-w3 m-0">{liveCopy.perSessionHint}</p>
        </>
      ) : null}
    </div>
  )
}

export default PricingLiveCalculator
