import { useEffect, useMemo, useRef, useState } from 'react'
import { Calculator, RefreshCw } from 'lucide-react'
import { previewSessionPrediction } from '../../api/config'
import { buildSessionPredictionPayload } from './sessionPredictionFields'
import { Button, Select, Spinner } from '../ui'

const PRESET_OPTIONS = [
  { id: 'example_1', label: 'Excel §7 · Kleines schwarzes Tattoo (6–8)' },
  { id: 'example_2', label: 'Excel §7 · Buntes Tattoo (10–14)' },
  { id: 'example_3', label: 'Excel §7 · Cover-up Hand (12–16)' },
]

const fmtDelta = (n) => {
  if (n == null || n === 0) return '±0'
  return n > 0 ? `+${n}` : String(n)
}

const RangeBadge = ({ min, max, tone = 'live' }) => {
  const classes =
    tone === 'baseline'
      ? 'bg-studio-bg-4 border-elaya-border text-studio-w2'
      : 'bg-studio-gold/10 border-studio-gold/35 text-studio-gold-2'
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-[8px] border text-[13px] font-bold tabular-nums ${classes}`}>
      {min != null && max != null ? `${min}–${max}` : '—'} Sitzungen
    </span>
  )
}

/**
 * Live Sitzungsprognose calculator.
 * Uses POST /config/session-prediction/preview — same engine as case create.
 * `values` = current form draft (admin) or saved params (studio).
 */
const SessionPredictionLiveCalculator = ({ values, savedBaseline = null }) => {
  const [presetId, setPresetId] = useState('example_1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const reqSeq = useRef(0)

  const payloadPrediction = useMemo(() => {
    if (!values) return null
    try {
      return buildSessionPredictionPayload(values)
    } catch {
      return null
    }
  }, [values])

  useEffect(() => {
    if (!payloadPrediction) return undefined
    const seq = ++reqSeq.current
    const timer = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await previewSessionPrediction({
          preset_id: presetId,
          session_prediction: payloadPrediction,
        })
        if (seq !== reqSeq.current) return
        setResult(res.data.data)
      } catch (err) {
        if (seq !== reqSeq.current) return
        setError(err?.response?.data?.message || 'Vorschau fehlgeschlagen')
      } finally {
        if (seq === reqSeq.current) setLoading(false)
      }
    }, 280)
    return () => clearTimeout(timer)
  }, [payloadPrediction, presetId])

  const live = result?.live
  const baseline = result?.baseline
  const delta = result?.delta
  const formula = live?.formula

  const paramsDifferFromSaved = useMemo(() => {
    if (!savedBaseline || !payloadPrediction) return false
    try {
      return JSON.stringify(buildSessionPredictionPayload(savedBaseline)) !== JSON.stringify(payloadPrediction)
    } catch {
      return false
    }
  }, [savedBaseline, payloadPrediction])

  return (
    <div className="border border-studio-gold/30 rounded-[12px] px-4 py-4 bg-studio-gold/5 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-studio-gold shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-studio-white m-0">Live-Rechner · Sitzungsprognose</p>
            <p className="text-[11px] text-studio-w3 m-0">
              Parameter ändern → Prognose aktualisiert sofort (ohne Speichern). Gleiche Engine wie bei Case-Erstellung.
            </p>
          </div>
        </div>
        {loading && <Spinner size="sm" />}
      </div>

      <Select
        label="Beispiel-Fall"
        value={presetId}
        onChange={(e) => setPresetId(e.target.value)}
      >
        {PRESET_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>{opt.label}</option>
        ))}
      </Select>

      {error ? (
        <p className="text-elaya-error text-[12px] m-0">{error}</p>
      ) : null}

      {live ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            {baseline && paramsDifferFromSaved ? (
              <>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-studio-w3 font-semibold">Gespeichert</span>
                  <RangeBadge min={baseline.min} max={baseline.max} tone="baseline" />
                </div>
                <span className="text-studio-w3 text-[16px] self-end pb-1">→</span>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-studio-gold-2 font-semibold">Live (Entwurf)</span>
                  <RangeBadge min={live.min} max={live.max} tone="live" />
                </div>
                {delta ? (
                  <span className="text-[12px] text-studio-w2 self-end pb-1.5">
                    Änderung {fmtDelta(delta.sessions_min)} / {fmtDelta(delta.sessions_max)} Sitzungen
                  </span>
                ) : null}
              </>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-studio-gold-2 font-semibold">Aktuelle Prognose</span>
                <RangeBadge min={live.min} max={live.max} tone="live" />
              </div>
            )}
          </div>

          {formula ? (
            <p className="text-[12px] text-studio-w1 m-0 font-mono leading-relaxed">
              ({formula.base_sessions} + {fmtDelta(formula.tattoo_delta).replace('±', '')}) × {formula.lifestyle_multiplier}
              {' = '}
              {formula.mid}
              {' → '}
              −{formula.spread_low}/+{formula.spread_high}
              {formula.aftercare_extra_max ? ` +${formula.aftercare_extra_max} Nachsorge` : ''}
              {' → '}
              <strong className="text-studio-gold-2">{live.min}–{live.max}</strong>
            </p>
          ) : null}

          <div className="grid sm:grid-cols-3 gap-2 text-[11px]">
            <div className="rounded-[8px] border border-elaya-border bg-studio-bg-4 px-2.5 py-2">
              <p className="text-studio-w3 m-0 mb-0.5">Tattoo-Delta</p>
              <p className="text-studio-white font-semibold m-0 tabular-nums">{fmtDelta(live.tattoo_delta)}</p>
            </div>
            <div className="rounded-[8px] border border-elaya-border bg-studio-bg-4 px-2.5 py-2">
              <p className="text-studio-w3 m-0 mb-0.5">Lifestyle</p>
              <p className="text-studio-white font-semibold m-0 tabular-nums">
                Score {live.lifestyle_score} · ×{live.lifestyle_multiplier}
              </p>
            </div>
            <div className="rounded-[8px] border border-elaya-border bg-studio-bg-4 px-2.5 py-2">
              <p className="text-studio-w3 m-0 mb-0.5">Mitte / Konfidenz</p>
              <p className="text-studio-white font-semibold m-0 tabular-nums">
                {live.base} · {live.confidence_score}%
              </p>
            </div>
          </div>

          {(live.factors || []).filter((f) => f.delta !== 0).length > 0 ? (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-studio-w3 font-semibold m-0 mb-1.5">
                Wirksame Tattoo-Faktoren
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(live.factors || [])
                  .filter((f) => f.delta !== 0)
                  .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
                  .map((f) => (
                    <span
                      key={f.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border border-elaya-border bg-studio-bg-4 text-studio-w1"
                    >
                      {f.label}
                      <span className={f.delta > 0 ? 'text-elaya-warning' : 'text-elaya-success'}>
                        {fmtDelta(f.delta)}
                      </span>
                    </span>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-studio-w3 m-0">
              Keine Tattoo-Deltas ≠ 0 — einfache Prognose (±1 Sitzung um die Mitte).
            </p>
          )}
        </>
      ) : (
        !loading && (
          <Button size="sm" variant="secondary" onClick={() => setPresetId((p) => p)}>
            <RefreshCw size={12} className="mr-1" />
            Vorschau laden
          </Button>
        )
      )}
    </div>
  )
}

export default SessionPredictionLiveCalculator
