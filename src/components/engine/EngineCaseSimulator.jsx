import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FlaskConical,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { listLasers } from '../../api/adminPhase4'
import { previewPricing, previewSessionPrediction, getStudioConfig } from '../../api/config'
import { getPlatformConfig } from '../../api/adminConfig'
import { Spinner } from '../ui'
import NumberStepper from '../ui/NumberStepper'
import useContent from '../../i18n/useContent'
import { useEngineCaseOptional } from './EngineCaseContext'
import { buildEngineCaseInput, defaultEngineCase } from './engineCaseModel'
import { LIFE_NUTRITION } from '../../constants/intakeEnums'

const COLORS = [
  'black',
  'grey',
  'red',
  'orange',
  'blue',
  'green',
  'purple',
  'yellow',
  'white',
  'skin_tone',
]

const FITZ = ['I', 'II', 'III', 'IV', 'V', 'VI']
const LOCATIONS = [
  'arm',
  'leg',
  'chest',
  'back',
  'shoulder',
  'abdomen',
  'hip',
  'neck',
  'face',
  'hand',
  'foot',
  'other',
]
const LEVELS = ['low', 'medium', 'high', 'very_high', 'unknown']
const SHADING = ['none', 'low', 'medium', 'high', 'unknown']
const LINEWORK = ['fine', 'medium', 'bold', 'mixed', 'unknown']
const DEPTHS = ['shallow', 'normal', 'deep', 'very_deep', 'unknown']
const COVERUP = ['none', 'once', 'multiple', 'unknown']
const TC_TYPES = ['amateur', 'professional', 'cosmetic', 'coverup', 'mixed', 'unknown']
const GOALS = ['full_removal', 'partial_fade', 'lightening_for_coverup']
const LASER_LEVELS = ['basic', 'unknown', 'advanced', 'premium', 'elite']
const HEALING = ['normal', 'mixed', 'problematic']
const LIGHTENING = ['fast', 'expected', 'slow', 'stagnant']
const AFTERCARE = ['high', 'medium', 'low']
const SMOKER = ['no', 'occasionally', 'daily_light', 'daily_heavy']
const ALCOHOL = ['never', 'rarely', '1-2x_week', '3-4x_week', '5+x_week']
const SLEEP_Q = ['excellent', 'good', 'fair', 'poor']
const SLEEP_H = ['8+', '7-8', '6-7', '5-6', 'under_5']
const STRESS = ['low', 'medium', 'high', 'very_high']
const ACTIVITY = ['high', 'regular', 'light', 'low']
const SPORT = ['5+', '3-4', '1-2', '0']
const HYDRATION = ['good', 'normal', 'low']

const fieldClass =
  'w-full rounded-[10px] border border-elaya-border bg-studio-bg-4 text-studio-white text-[13px] px-3 py-2 outline-none focus:border-studio-gold/50'
const labelClass = 'block text-studio-w2 text-[12px] mb-1.5'

const defaultForm = defaultEngineCase

const fmtChf = (n) =>
  n == null
    ? '—'
    : `CHF ${Number(n).toLocaleString('de-CH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`

const SelectField = ({ label, hint, value, onChange, options, optionLabel }) => (
  <div>
    <label className={labelClass}>{label}</label>
    {hint ? <p className="text-studio-w3 text-[11px] leading-snug mb-1.5 -mt-0.5">{hint}</p> : null}
    <select className={fieldClass} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {optionLabel ? optionLabel(opt) : opt}
        </option>
      ))}
    </select>
  </div>
)

const NumField = ({ label, value, onChange, step = 1, min, className = '' }) => (
  <NumberStepper
    label={label}
    className={className}
    step={step === 'any' ? 1 : step}
    min={min}
    value={value}
    onChange={(raw) => onChange(raw === '' ? '' : Number(raw))}
  />
)

const EngineCaseSimulator = ({
  mode = 'admin',
  draftPricing = null,
  draftSessions = null,
}) => {
  const { adminPages, t } = useContent()
  const copy = adminPages.engineSimulator || {}

  const sharedCase = useEngineCaseOptional()
  const [localForm, setLocalForm] = useState(defaultForm)
  const [localLasers, setLocalLasers] = useState([])
  const form = sharedCase?.form ?? localForm
  const setForm = sharedCase?.setForm ?? setLocalForm
  const lasers = sharedCase ? sharedCase.lasers : localLasers
  const setLasers = sharedCase?.setLasers ?? setLocalLasers
  const [colorDeltas, setColorDeltas] = useState({})
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [error, setError] = useState('')
  const [priceResult, setPriceResult] = useState(null)
  const [sessionResult, setSessionResult] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const reqSeq = useRef(0)

  const set = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const area = useMemo(() => {
    if (form.sizeMode === 'lxb') {
      const l = Number(form.tc_size_length) || 0
      const w = Number(form.tc_size_width) || 0
      return Math.max(0, Math.round(l * w * 10) / 10)
    }
    return Math.max(0, Number(form.flaeche_cm2) || 0)
  }, [form])

  const selectedLaser = useMemo(
    () => lasers.find((l) => l.id === form.laserId) || lasers[0],
    [lasers, form.laserId]
  )
  const activeColorDeltas = selectedLaser?.color_deltas || colorDeltas

  const caseInput = useMemo(
    () => buildEngineCaseInput(form, selectedLaser),
    [form, selectedLaser]
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadingMeta(true)
      try {
        const laserPromise = listLasers().catch(() => ({ data: { data: { devices: [] } } }))
        const cfgPromise =
          mode === 'studio'
            ? getStudioConfig()
            : getPlatformConfig()

        const [laserRes, cfgRes] = await Promise.all([laserPromise, cfgPromise])
        if (cancelled) return

        const devices = (laserRes.data?.data?.devices || []).filter((d) => d.active !== false)
        setLasers(devices)
        if (devices.length && !form.laserId) {
          setForm((p) => ({ ...p, laserId: devices[0].id }))
        }

        const data = cfgRes.data?.data || {}
        const sessions =
          data.platform_config?.session_prediction ||
          data.session_prediction ||
          data.studio_config?.session_prediction ||
          {}
        setColorDeltas(sessions.tattoo_deltas?.color || {})
      } catch {
        if (!cancelled) setColorDeltas({})
      } finally {
        if (!cancelled) setLoadingMeta(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [mode])

  useEffect(() => {
    const seq = ++reqSeq.current
    const timer = setTimeout(async () => {
      setLoadingPreview(true)
      setError('')
      try {
        const pricingBody = {
          case_input: caseInput,
          ...(draftPricing ? { studio_pricing: draftPricing } : {}),
        }
        const sessionBody = {
          case_input: caseInput,
          ...(draftSessions ? { session_prediction: draftSessions } : {}),
        }
        const [priceRes, sessionRes] = await Promise.all([
          previewPricing(pricingBody),
          previewSessionPrediction(sessionBody),
        ])
        if (seq !== reqSeq.current) return
        setPriceResult(priceRes.data?.data || null)
        setSessionResult(sessionRes.data?.data || null)
      } catch (err) {
        if (seq !== reqSeq.current) return
        setError(err?.response?.data?.message || copy.previewFailed || 'Preview failed')
        setPriceResult(null)
        setSessionResult(null)
      } finally {
        if (seq === reqSeq.current) setLoadingPreview(false)
      }
    }, 280)
    return () => clearTimeout(timer)
  }, [caseInput, draftPricing, draftSessions, copy.previewFailed])

  const laserStrengths = useMemo(() => {
    const strong = []
    const weak = []
    for (const c of COLORS) {
      const d = Number(activeColorDeltas[c] ?? 0)
      if (d <= 1) strong.push(c)
      if (d >= 2) weak.push({ key: c, delta: d })
    }
    return { strong, weak }
  }, [activeColorDeltas])

  const toggleColor = (c) => {
    setForm((prev) => {
      const setCols = new Set(prev.tc_colors_present || [])
      if (setCols.has(c)) setCols.delete(c)
      else setCols.add(c)
      const next = [...setCols]
      return { ...prev, tc_colors_present: next.length ? next : ['black'] }
    })
  }

  const colorLabel = (c) => copy.colors?.[c] || c
  const levelLabel = (k) => copy.levels?.[k] || k

  const livePrice = priceResult?.live
  const liveSession = sessionResult?.live
  const price = livePrice?.pricePerSession
  const sMin = liveSession?.min
  const sMax = liveSession?.max
  const totalMin = price != null && sMin != null ? price * sMin : null
  const totalMax = price != null && sMax != null ? price * sMax : null

  const lifestyleScore = liveSession?.lifestyle_score
  const lifestyleAvg = liveSession?.lifestyle_average
  const lifestyleEffective =
    liveSession?.lifestyle_effective_average ?? lifestyleAvg
  // Prototype meter: composite 1 → 0, composite 5 → 30. Not a sum of six factors.
  const lifestyleIndex =
    lifestyleEffective == null || !Number.isFinite(Number(lifestyleEffective))
      ? null
      : Math.round(
          Math.max(0, Math.min(30, ((Number(lifestyleEffective) - 1) / 4) * 30))
        )
  const lifestyleAmpel =
    lifestyleIndex == null
      ? null
      : lifestyleIndex < 10
        ? 'green'
        : lifestyleIndex < 20
          ? 'orange'
          : 'red'

  const colorImpact = useMemo(() => {
    const colors = form.tc_colors_present || []
    let hardest = 0
    for (const c of colors) {
      hardest = Math.max(hardest, Number(activeColorDeltas[c] ?? 0))
    }
    const extras = colors.filter((c) => c !== 'black' && c !== 'grey')
    const countDelta = extras.length === 0 ? 0 : extras.length <= 2 ? 1 : 3
    return Math.max(hardest, countDelta)
  }, [form.tc_colors_present, activeColorDeltas])

  const colorDifficulty =
    colorImpact <= 0 ? 'low' : colorImpact <= 2 ? 'medium' : 'high'

  const opt = (key) => (v) => copy[key]?.[v] || v

  const coverupLabel = opt('coverupOpts')
  const smokerLabel = opt('smokerOpts')
  const alcoholLabel = opt('alcoholOpts')
  const sleepQLabel = opt('sleepQualityOpts')
  const sleepHLabel = opt('sleepHoursOpts')
  const stressLabel = opt('stressOpts')
  const activityLabel = opt('activityOpts')
  const sportLabel = opt('sportOpts')
  const hydrationLabel = opt('hydrationOpts')
  const nutritionLabel = opt('nutritionOpts')
  const aftercareLabel = opt('aftercareOpts')
  const healingLabel = opt('healingOpts')

  if (loadingMeta) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
      <div className="flex flex-col gap-6">
        {/* Laser */}
        <section className="rounded-2xl border border-elaya-border bg-studio-bg-3 p-5">
          <h3 className="text-studio-white text-[14px] font-semibold m-0 mb-4 flex items-center gap-2">
            <FlaskConical size={16} className="text-studio-gold-2" />
            {copy.secLaser || 'Laser'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{copy.laserDevice || 'Laser'}</label>
              <select
                className={fieldClass}
                value={form.laserId || selectedLaser?.id || ''}
                onChange={(e) => set('laserId', e.target.value)}
              >
                {lasers.length === 0 ? (
                  <option value="">{copy.noLasers || 'No lasers in catalog'}</option>
                ) : (
                  lasers.map((l) => (
                    <option key={l.id} value={l.id}>
                      {[l.manufacturer, l.model].filter(Boolean).join(' ')}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className={labelClass}>{copy.wavelengths || 'Wavelengths'}</label>
              <input
                className={`${fieldClass} opacity-80`}
                readOnly
                value={
                  (selectedLaser?.wavelengths_nm || []).length
                    ? `${(selectedLaser.wavelengths_nm || []).join(' / ')} nm`
                    : '—'
                }
              />
            </div>
            <SelectField
              label={copy.laserProfile || 'Laser profile (engine)'}
              value={form.laser_profile_level}
              onChange={(v) => set('laser_profile_level', v)}
              options={LASER_LEVELS}
              optionLabel={opt('laserLevels')}
            />
          </div>
          <div className="mt-4 rounded-[12px] border border-elaya-border bg-studio-bg-4 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-studio-gold-2 m-0 mb-2">
              {copy.yourStudioLaser || 'Your studio laser'}
            </p>
            <p className="text-[12px] text-studio-w1 m-0 mb-1">
              <span className="text-studio-teal font-semibold">
                {copy.strengths || 'Strengths'}:
              </span>{' '}
              {laserStrengths.strong.map(colorLabel).join(', ') || '—'}
            </p>
            <p className="text-[12px] text-studio-w1 m-0">
              <span className="text-studio-amber font-semibold">
                {copy.weaknesses || 'Weaknesses / limitations'}:
              </span>{' '}
              {laserStrengths.weak.length
                ? laserStrengths.weak
                    .map((w) => `${colorLabel(w.key)} (+${w.delta})`)
                    .join(', ')
                : '—'}
            </p>
            {selectedLaser?.notes ? (
              <p className="text-[11px] text-studio-w3 m-0 mt-2">{selectedLaser.notes}</p>
            ) : null}
          </div>
        </section>

        {/* Tattoo */}
        <section className="rounded-2xl border border-elaya-border bg-studio-bg-3 p-5">
          <h3 className="text-studio-white text-[14px] font-semibold m-0 mb-4">
            {copy.secTattoo || 'Tattoo'}
          </h3>

          <div className="mb-4">
            <label className={labelClass}>{copy.size || 'Size'}</label>
            <div className="flex gap-2 mb-2">
              {[
                { id: 'lxb', label: copy.sizeLxb || 'Length × Width' },
                { id: 'direkt', label: copy.sizeDirect || 'Direct cm²' },
              ].map((optMode) => (
                <button
                  key={optMode.id}
                  type="button"
                  onClick={() => {
                    if (optMode.id === 'direkt') {
                      setForm((p) => ({ ...p, sizeMode: 'direkt', flaeche_cm2: area }))
                    } else {
                      set('sizeMode', 'lxb')
                    }
                  }}
                  className={`rounded-[8px] px-3 py-1.5 text-[12px] font-semibold border cursor-pointer ${
                    form.sizeMode === optMode.id
                      ? 'bg-studio-gold/20 border-studio-gold text-studio-gold-2'
                      : 'bg-transparent border-elaya-border text-studio-w2'
                  }`}
                >
                  {optMode.label}
                </button>
              ))}
            </div>
            {form.sizeMode === 'lxb' ? (
              <div className="flex items-center gap-2 flex-wrap">
                <NumField
                  className="w-[120px]"
                  step="1"
                  min={0}
                  value={form.tc_size_length}
                  onChange={(v) => set('tc_size_length', v)}
                />
                <span className="text-studio-w3">×</span>
                <NumField
                  className="w-[120px]"
                  step="1"
                  min={0}
                  value={form.tc_size_width}
                  onChange={(v) => set('tc_size_width', v)}
                />
                <span className="text-studio-w3 text-[12px]">cm =</span>
                <span className="text-studio-teal font-semibold text-[13px]">
                  {area.toFixed(1)} cm²
                </span>
              </div>
            ) : (
              <NumField
                className="max-w-[180px]"
                step="1"
                min={0}
                value={form.flaeche_cm2}
                onChange={(v) => set('flaeche_cm2', v)}
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              label={copy.fitzpatrick || 'Fitzpatrick'}
              value={form.skin_fitzpatrick_type}
              onChange={(v) => set('skin_fitzpatrick_type', v)}
              options={FITZ}
              optionLabel={(v) => t('adminPages.engineSimulator.fitzType', { type: v, defaultValue: `Type ${v}` })}
            />
            <SelectField
              label={copy.bodyLocation || 'Body location'}
              value={form.tc_body_location_main}
              onChange={(v) => set('tc_body_location_main', v)}
              options={LOCATIONS}
              optionLabel={opt('locations')}
            />
            <SelectField
              label={copy.density || 'Density'}
              hint={copy.densityHint}
              value={form.tc_density}
              onChange={(v) => set('tc_density', v)}
              options={LEVELS}
              optionLabel={levelLabel}
            />
            <SelectField
              label={copy.saturation || 'Saturation'}
              hint={copy.saturationHint}
              value={form.tc_saturation}
              onChange={(v) => set('tc_saturation', v)}
              options={LEVELS}
              optionLabel={levelLabel}
            />
            <SelectField
              label={copy.shading || 'Shading'}
              hint={copy.shadingHint}
              value={form.tc_shading}
              onChange={(v) => set('tc_shading', v)}
              options={SHADING}
              optionLabel={(v) => copy.shadingOptions?.[v] || levelLabel(v)}
            />
            <SelectField
              label={copy.linework || 'Line style'}
              hint={copy.lineworkHint}
              value={form.tc_linework}
              onChange={(v) => set('tc_linework', v)}
              options={LINEWORK}
              optionLabel={(v) => copy.lineworkOptions?.[v] || levelLabel(v)}
            />
            <SelectField
              label={copy.coverup || 'Cover-up'}
              value={form.tc_coverup}
              onChange={(v) => set('tc_coverup', v)}
              options={COVERUP}
              optionLabel={coverupLabel}
            />
            <NumField
              label={copy.tattooAge || 'Tattoo age (years)'}
              value={form.tc_age_years}
              onChange={(v) => set('tc_age_years', v)}
              step="1"
              min={0}
            />
            <SelectField
              label={copy.depth || 'Ink depth'}
              value={form.tc_depth || 'normal'}
              onChange={(v) => set('tc_depth', v)}
              options={DEPTHS}
              optionLabel={(v) => copy.depthOptions?.[v] || levelLabel(v)}
            />
            <SelectField
              label={copy.tattooType || 'Tattoo type'}
              value={form.tc_type}
              onChange={(v) => set('tc_type', v)}
              options={TC_TYPES}
              optionLabel={opt('tcTypes')}
            />
            <SelectField
              label={copy.goal || 'Treatment goal'}
              value={form.goal_target}
              onChange={(v) => set('goal_target', v)}
              options={GOALS}
              optionLabel={opt('goals')}
            />
            <SelectField
              label={copy.scarRisk || 'Scar / keloid risk'}
              value={form.skin_keloid_risk}
              onChange={(v) => set('skin_keloid_risk', v)}
              options={['low', 'medium', 'high']}
              optionLabel={levelLabel}
            />
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-[13px] text-studio-w1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.tc_prior_treatment}
                  onChange={(e) => set('tc_prior_treatment', e.target.checked)}
                />
                {copy.priorTreatment || 'Prior laser treatment'}
              </label>
            </div>
            {form.tc_prior_treatment ? (
              <NumField
                label={copy.priorCount || 'Prior sessions'}
                value={form.tc_prior_treatment_count}
                onChange={(v) => set('tc_prior_treatment_count', v)}
                step="1"
                min={1}
              />
            ) : null}
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-[13px] text-studio-w1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.type === 'pmu'}
                  onChange={(e) => set('type', e.target.checked ? 'pmu' : 'tattoo')}
                />
                {copy.pmu || 'PMU (flat price)'}
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label className={labelClass}>{copy.colorsTitle || 'Colors'}</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => {
                const on = (form.tc_colors_present || []).includes(c)
                const d = Number(activeColorDeltas[c] ?? 0)
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleColor(c)}
                    className={`rounded-[10px] px-3 py-1.5 text-[12px] font-semibold border cursor-pointer transition-colors ${
                      on
                        ? 'bg-studio-gold/20 border-studio-gold text-studio-white'
                        : 'bg-transparent border-elaya-border text-studio-w2 hover:border-studio-gold/40'
                    }`}
                  >
                    {colorLabel(c)}{' '}
                    <span className="text-studio-w3 font-normal">
                      Δ {d >= 0 ? `+${d}` : d}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-elaya-border bg-studio-bg-3 p-5">
          <h3 className="text-studio-white text-[14px] font-semibold m-0 mb-4">
            {copy.secLifestyle || 'Lifestyle'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <NumField
              label={copy.age || 'Age'}
              value={form.life_age}
              onChange={(v) => set('life_age', v)}
              step="1"
            />
            <NumField
              label={copy.height || 'Height (cm)'}
              value={form.life_height_cm}
              onChange={(v) => set('life_height_cm', v)}
              step="1"
            />
            <NumField
              label={copy.weight || 'Weight (kg)'}
              value={form.life_weight_kg}
              onChange={(v) => set('life_weight_kg', v)}
              step="1"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              label={copy.smoker || 'Smoking'}
              value={form.life_smoker}
              onChange={(v) => set('life_smoker', v)}
              options={SMOKER}
              optionLabel={smokerLabel}
            />
            <SelectField
              label={copy.alcohol || 'Alcohol'}
              value={form.life_alcohol}
              onChange={(v) => set('life_alcohol', v)}
              options={ALCOHOL}
              optionLabel={alcoholLabel}
            />
            <SelectField
              label={copy.sleepQuality || 'Sleep quality'}
              value={form.life_sleep_quality}
              onChange={(v) => set('life_sleep_quality', v)}
              options={SLEEP_Q}
              optionLabel={sleepQLabel}
            />
            <SelectField
              label={copy.sleepHours || 'Sleep hours'}
              value={form.life_sleep_hours}
              onChange={(v) => set('life_sleep_hours', v)}
              options={SLEEP_H}
              optionLabel={sleepHLabel}
            />
            <SelectField
              label={copy.stress || 'Stress'}
              value={form.life_stress}
              onChange={(v) => set('life_stress', v)}
              options={STRESS}
              optionLabel={stressLabel}
            />
            <SelectField
              label={copy.activity || 'Activity'}
              value={form.life_activity}
              onChange={(v) => set('life_activity', v)}
              options={ACTIVITY}
              optionLabel={activityLabel}
            />
            <SelectField
              label={copy.sport || 'Sport'}
              value={form.life_sport_freq}
              onChange={(v) => set('life_sport_freq', v)}
              options={SPORT}
              optionLabel={sportLabel}
            />
            <SelectField
              label={copy.hydration || 'Hydration'}
              value={form.life_hydration}
              onChange={(v) => set('life_hydration', v)}
              options={HYDRATION}
              optionLabel={hydrationLabel}
            />
            <SelectField
              label={copy.nutrition || 'Nutrition'}
              value={form.life_nutrition}
              onChange={(v) => set('life_nutrition', v)}
              options={LIFE_NUTRITION}
              optionLabel={nutritionLabel}
            />
            <SelectField
              label={copy.aftercare || 'Aftercare commitment'}
              value={form.life_aftercare_commitment}
              onChange={(v) => set('life_aftercare_commitment', v)}
              options={AFTERCARE}
              optionLabel={aftercareLabel}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-elaya-border bg-studio-bg-3 p-5">
          <h3 className="text-studio-white text-[14px] font-semibold m-0 mb-4">
            {copy.secHealing || 'Healing & response'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              label={copy.healing || 'Healing history'}
              value={form.healing_history}
              onChange={(v) => set('healing_history', v)}
              options={HEALING}
              optionLabel={healingLabel}
            />
            <div>
              <label className={labelClass}>{copy.lightening || 'Lightening rate'}</label>
              <select
                className={fieldClass}
                value={form.lightening_rate}
                onChange={(e) => set('lightening_rate', e.target.value)}
              >
                <option value="">{copy.lighteningAuto || 'Auto / unknown'}</option>
                {LIGHTENING.map((k) => (
                  <option key={k} value={k}>
                    {copy.lighteningOpts?.[k] || k}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      </div>

      {/* Result card */}
      <aside className="lg:sticky lg:top-4 rounded-2xl border border-elaya-border bg-studio-bg-3 p-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-studio-white text-[14px] font-semibold m-0">
            {copy.resultTitle || 'Live result'}
          </h3>
          {loadingPreview ? <Spinner size="sm" /> : null}
        </div>

        {error ? (
          <p className="text-studio-amber text-[12px] m-0 flex items-start gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            {error}
          </p>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-studio-w2 text-[11px] uppercase tracking-wide m-0 mb-1">
                {copy.pricePerSession || 'Price / session'}
              </p>
              <p className="text-[28px] font-bold text-studio-white m-0 leading-none">
                {fmtChf(price)}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-studio-w2 text-[11px] uppercase tracking-wide m-0 mb-1">
                {copy.predictedSessions || 'Predicted sessions'}
              </p>
              <p className="text-[22px] font-bold text-studio-white m-0 leading-none">
                {sMin != null && sMax != null ? `${sMin}–${sMax}` : '—'}
              </p>
            </div>
            <div className="mb-5">
              <p className="text-studio-w2 text-[11px] uppercase tracking-wide m-0 mb-1">
                {copy.estimatedTotal || 'Estimated total'}
              </p>
              <p className="text-[15px] font-semibold text-studio-gold-2 m-0">
                {totalMin != null && totalMax != null
                  ? `${fmtChf(totalMin)}–${fmtChf(totalMax)}`
                  : '—'}
              </p>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="text-studio-w2">{copy.lifestyleIndex || 'Lifestyle index'}</span>
                <span
                  className={
                    lifestyleAmpel === 'green'
                      ? 'text-studio-teal'
                      : lifestyleAmpel === 'orange'
                        ? 'text-studio-amber'
                        : lifestyleAmpel === 'red'
                          ? 'text-studio-red'
                          : 'text-studio-w2'
                  }
                >
                  {lifestyleIndex != null ? `${lifestyleIndex} / 30` : '—'}
                  {lifestyleAmpel
                    ? ` · ${copy.ampel?.[lifestyleAmpel] || lifestyleAmpel}`
                    : ''}
                </span>
              </div>
              <p className="text-[10px] text-studio-w3 m-0 mb-1.5">
                {copy.lifestyleIndexHint ||
                  '0 is an average of 1 and 30 is an average of 5. The multiplier uses the average.'}
              </p>
              <div className="h-2 rounded-full bg-studio-bg-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    lifestyleAmpel === 'green'
                      ? 'bg-studio-teal'
                      : lifestyleAmpel === 'orange'
                        ? 'bg-studio-amber'
                        : 'bg-studio-red'
                  }`}
                  style={{
                    width: `${Math.min(100, ((lifestyleIndex || 0) / 30) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="mb-4 flex justify-between text-[12px]">
              <span className="text-studio-w2">{copy.colorDifficulty || 'Color difficulty'}</span>
              <span
                className={
                  colorDifficulty === 'low'
                    ? 'text-studio-teal font-semibold'
                    : colorDifficulty === 'medium'
                      ? 'text-studio-amber font-semibold'
                      : 'text-studio-red font-semibold'
                }
              >
                {copy.difficulty?.[colorDifficulty] || colorDifficulty}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-studio-gold-2 bg-transparent border-0 cursor-pointer p-0"
            >
              {showDetails ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {copy.showDetails || 'Show calculation details'}
            </button>

            {showDetails ? (
              <div className="mt-3 space-y-1.5 border-t border-elaya-border pt-3">
                {(livePrice?.breakdown?.steps || []).map((step) => (
                  <div
                    key={step.id}
                    className="flex justify-between text-[11px] text-studio-w2 gap-2"
                  >
                    <span>{step.id}</span>
                    <span className="text-studio-white shrink-0">
                      {step.value != null && step.id !== 'base'
                        ? `× ${step.value}`
                        : ''}{' '}
                      → {fmtChf(step.running)}
                    </span>
                  </div>
                ))}
                {liveSession?.factors?.length ? (
                  <>
                    <p className="text-[11px] font-semibold text-studio-w3 uppercase m-0 mt-3 mb-1">
                      {copy.sessionFactors || 'Session factors'}
                    </p>
                    {liveSession.factors.map((f) => (
                      <div
                        key={f.id}
                        className="flex justify-between text-[11px] text-studio-w2"
                      >
                        <span>{f.label}</span>
                        <span className="text-studio-white">
                          {f.delta >= 0 ? `+${f.delta}` : f.delta}
                        </span>
                      </div>
                    ))}
                  </>
                ) : null}
                {liveSession ? (
                  <>
                    <p className="text-[11px] font-semibold text-studio-w3 uppercase m-0 mt-3 mb-1">
                      {copy.lifestyleBreakdown || 'Lifestyle'}
                    </p>
                    <p className="text-[11px] text-studio-w3 m-0 mb-1.5 leading-relaxed">
                      {copy.lifestyleAverageNote ||
                        'Sleep quality and sleep hours are one factor. Activity and sport are one factor. The band uses this average.'}
                    </p>
                    {[
                      [
                        copy.lifestyleIndex || 'Lifestyle index',
                        lifestyleIndex != null ? `${lifestyleIndex} / 30` : '—',
                      ],
                      [
                        copy.lifestyleAverage || 'Effective lifestyle average',
                        lifestyleEffective != null
                          ? t('adminPages.engineSimulator.lifestyleAverageValue', {
                              average: Number(lifestyleEffective).toFixed(2),
                              count: liveSession.lifestyle_factor_count ?? 0,
                              defaultValue: `${Number(lifestyleEffective).toFixed(2)} · ${liveSession.lifestyle_factor_count ?? 0} factors`,
                            })
                          : '—',
                      ],
                      [
                        copy.lifestyleScoreLabel || 'Lifestyle score',
                        lifestyleScore != null ? String(lifestyleScore) : '—',
                      ],
                      [
                        copy.lifestyleApplied || 'Applied multiplier',
                        liveSession.lifestyle_multiplier != null
                          ? `× ${Number(liveSession.lifestyle_multiplier).toFixed(2)}`
                          : '—',
                      ],
                      [
                        copy.sessionsBeforeLifestyle || 'Raw sessions before lifestyle',
                        liveSession.formula?.sum_before_lifestyle ?? '—',
                      ],
                      [
                        copy.sessionsAfterLifestyle || 'Raw sessions after lifestyle',
                        liveSession.formula?.mid ?? '—',
                      ],
                      [
                        copy.roundedMidpoint || 'Rounded midpoint',
                        liveSession.formula?.center ?? liveSession.base ?? '—',
                      ],
                      [
                        copy.finalRange || 'Final session range',
                        sMin != null && sMax != null ? `${sMin}–${sMax}` : '—',
                      ],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex justify-between text-[11px] text-studio-w2 gap-2"
                      >
                        <span>{label}</span>
                        <span className="text-studio-white shrink-0 tabular-nums">{value}</span>
                      </div>
                    ))}
                    {liveSession.lifestyle_factors
                      ? Object.entries(liveSession.lifestyle_factors)
                          .filter(([, value]) => value != null)
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between text-[11px] text-studio-w3 gap-2"
                            >
                              <span>
                                {copy.lifestyleFactors?.[key] || key}
                              </span>
                              <span className="shrink-0 tabular-nums">{Number(value).toFixed(2)}</span>
                            </div>
                          ))
                      : null}
                  </>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </aside>
    </div>
  )
}

export default EngineCaseSimulator
