import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, Sparkles } from 'lucide-react'
import { Input, Select, Button, Spinner } from '../ui'
import CaseWizardProgress from './CaseWizardProgress'
import PhotoUploadField from './PhotoUploadField'
import { previewCasePricing } from '../../api/cases'
import { caseForm } from '../../content'
import {
  CASE_TYPES,
  WIZARD_STEPS,
  BODY_LOCATIONS,
  TC_SIDES,
  TC_AGE_BUCKETS,
  TC_TYPES,
  TC_COVERUP,
  QUALITY_LEVEL,
  SHADING_LEVEL,
  LINEWORK_LEVEL,
  INK_COLORS,
  FITZPATRICK,
  RISK_LEVEL,
  SUN_EXPOSURE,
  LIFE_SMOKER,
  LIFE_ALCOHOL,
  LIFE_ACTIVITY,
  LIFE_SLEEP_HOURS,
  LIFE_SLEEP_QUALITY,
  LIFE_STRESS,
  LIFE_HYDRATION,
  LIFE_NUTRITION,
  GOAL_TARGETS,
  ZONE_DICHTE,
  ZONE_FLAECHEN,
  INITIAL_CASE_FORM,
  PHOTO_STD_CHECKLIST,
  labelFor,
  bodyLocationLabel,
} from '../../constants/caseIntake'

// ── Shared UI bits ────────────────────────────────────────────────────────
const ui = caseForm.ui

const FieldLabel = ({ children, hint, optional }) => (
  <div className="mb-2">
    <p className="text-studio-white text-[12px] font-semibold m-0">
      {children}
      {optional && <span className="text-studio-w4 font-normal ml-1">{ui.optional}</span>}
    </p>
    {hint && <p className="text-studio-w3 text-[11px] m-0 mt-0.5 leading-snug">{hint}</p>}
  </div>
)

const SELECTED_CHIP =
  'border-studio-gold-2 bg-studio-gold/30 text-studio-white font-semibold ring-2 ring-studio-gold/40 shadow-[0_0_14px_rgba(74,154,255,0.35)]'
const SELECTED_SWATCH_BORDER = '#4a9aff'
const SELECTED_SWATCH_GLOW = '0 0 0 3px rgba(74,154,255,0.45), 0 0 12px rgba(74,154,255,0.35)'

const Opt = ({ active, onClick, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-2 rounded-[10px] text-[12px] border cursor-pointer transition-all
      ${active
        ? SELECTED_CHIP
        : 'border-elaya-border bg-studio-bg-4 text-studio-w2 hover:border-elaya-border-strong hover:text-studio-white'
      } ${className}`}
  >
    {children}
  </button>
)

const OptGrid = ({ children }) => (
  <div className="flex flex-wrap gap-2">{children}</div>
)

const StepError = ({ message }) =>
  message ? (
    <div className="rounded-[10px] border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
      {message}
    </div>
  ) : null

const num = (v) => (v !== '' && v != null && !Number.isNaN(Number(v)) ? Number(v) : undefined)

const newZone = () => ({
  _id: `z-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  bezeichnung: '',
  koerperstelle: '',
  farben: [],
  dichte: '',
  flaeche_cm2: null,
  flaeche_template: '',
  flaeche_modus: 'template',
  flaeche_manuell: '',
  foto_url: '',
})

const zoneFlaeche = (z) => {
  if (z.flaeche_modus === 'manuell') return num(z.flaeche_manuell) ?? 0
  const t = ZONE_FLAECHEN.find((x) => x.value === z.flaeche_template)
  return t?.cm2 ?? 0
}

const zoneValid = (z) =>
  !!(z.bezeichnung?.trim() && z.koerperstelle && z.farben?.length && z.dichte && zoneFlaeche(z) > 0)

const PRICING_STEP = WIZARD_STEPS.findIndex((s) => s.id === 'pricing')

const fmtCHF = (n) => (n != null && !Number.isNaN(Number(n))
  ? `CHF ${Number(n).toLocaleString('de-CH')}`
  : '—')

const confidenceColor = (pct) => {
  if (pct >= 80) return 'text-studio-teal-2'
  if (pct >= 60) return 'text-studio-amber'
  return 'text-studio-red'
}

// ── CaseForm wizard ───────────────────────────────────────────────────────
const CaseForm = ({ onSubmit, loading, onCancel, customerId, onStepChange }) => {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(INITIAL_CASE_FORM)
  const [error, setError] = useState('')
  const [pricingPreview, setPricingPreview] = useState(null)
  const [pricingLoading, setPricingLoading] = useState(false)
  const [pricingError, setPricingError] = useState('')

  useEffect(() => {
    onStepChange?.(step)
  }, [step, onStepChange])

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }))
  const setZone = (id, patch) =>
    setForm((p) => ({
      ...p,
      zonen: p.zonen.map((z) => (z._id === id ? { ...z, ...patch } : z)),
    }))

  const toggleColor = (id) =>
    setForm((p) => ({
      ...p,
      tc_colors_present: p.tc_colors_present.includes(id)
        ? p.tc_colors_present.filter((c) => c !== id)
        : [...p.tc_colors_present, id],
    }))

  const toggleZoneColor = (zoneId, colorId) =>
    setForm((p) => ({
      ...p,
      zonen: p.zonen.map((z) => {
        if (z._id !== zoneId) return z
        const arr = z.farben.includes(colorId)
          ? z.farben.filter((c) => c !== colorId)
          : [...z.farben, colorId]
        return { ...z, farben: arr }
      }),
    }))

  const setZonenModus = (active) => {
    setForm((p) => ({
      ...p,
      zonen_aktiv: active,
      zonen: active && p.zonen.length < 2 ? [newZone(), newZone()] : active ? p.zonen : [],
    }))
  }

  const validateStep = (s) => {
    const v = ui.validation
    if (form.type === 'pmu') {
      if (!form.tc_title?.trim()) return v.titleRequired
      if (!form.tc_body_location_main) return v.bodyRequired
      return ''
    }

    switch (s) {
      case 0:
        if (!form.tc_title?.trim()) return v.titleRequired
        if (!form.tc_body_location_main) return v.bodyRequired
        if (!form.tc_age_bucket) return v.ageRequired
        if (!form.tc_type) return v.typeRequired
        if (form.tc_prior_treatment === null) return v.priorRequired
        return ''
      case 1:
        if (form.zonen_aktiv) {
          if (form.zonen.length < 2) return v.zonesMin
          if (!form.zonen.every(zoneValid)) return v.zonesIncomplete
          return ''
        }
        if (!form.tc_colors_present.length) return v.colorsRequired
        if (!form.tc_density || !form.tc_saturation || !form.tc_shading || !form.tc_linework) {
          return v.propertiesRequired
        }
        if (!form.tc_size_length || !form.tc_size_width) return v.sizeRequired
        return ''
      case 2:
        if (!form.skin_fitzpatrick_type) return v.fitzRequired
        if (!form.skin_sun_zone) return v.sunRequired
        return ''
      case 3:
        if (!form.life_smoker || !form.life_alcohol || !form.life_activity) return v.lifestyleRequired
        if (!form.life_sleep_hours || !form.life_sleep_quality || !form.life_stress) return v.sleepRequired
        if (!form.life_height_cm || !form.life_weight_kg) return v.bodyMassRequired
        if (!form.life_hydration || !form.life_nutrition) return v.hydrationRequired
        return ''
      case 4:
        if (!form.goal_target) return v.goalRequired
        return ''
      default:
        return ''
    }
  }

  const goNext = () => {
    const err = validateStep(step)
    if (err) { setError(err); return }
    setError('')
    setStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1))
  }

  const goBack = () => {
    setError('')
    setStep((s) => Math.max(s - 1, 0))
  }

  const buildPayload = () => {
    const zonen = form.zonen_aktiv
      ? form.zonen.map(({ _id, ...z }) => ({
          bezeichnung: z.bezeichnung.trim(),
          koerperstelle: z.koerperstelle,
          farben: z.farben,
          dichte: z.dichte,
          flaeche_cm2: zoneFlaeche(z),
          flaeche_template: z.flaeche_template || undefined,
          flaeche_modus: z.flaeche_modus || undefined,
          flaeche_manuell: num(z.flaeche_manuell),
          foto_url: z.foto_url || '',
        }))
      : []

    const bodyLabel =
      form.bodyLabel?.trim() ||
      bodyLocationLabel(form.tc_body_location_main) ||
      undefined

    if (form.type === 'pmu') {
      return {
        type: 'pmu',
        tc_title: form.tc_title.trim(),
        tc_body_location_main: form.tc_body_location_main || undefined,
        bodyLabel,
        zonen_aktiv: false,
        zonen: [],
      }
    }

    return {
      type: 'tattoo',
      tc_title: form.tc_title.trim(),
      bodyLabel,
      tc_body_location_main: form.tc_body_location_main || undefined,
      tc_body_location_detail: form.tc_body_location_detail?.trim() || undefined,
      tc_side: form.tc_side || undefined,
      zonen_aktiv: form.zonen_aktiv,
      zonen,
      tc_age_bucket: form.tc_age_bucket || undefined,
      tc_type: form.tc_type || undefined,
      tc_coverup: form.tc_coverup || 'none',
      tc_prior_treatment: form.tc_prior_treatment,
      tc_prior_treatment_count: form.tc_prior_treatment === true ? num(form.tc_prior_treatment_count) : undefined,
      tc_colors_present: form.zonen_aktiv ? [] : form.tc_colors_present,
      tc_density: form.zonen_aktiv ? undefined : form.tc_density || undefined,
      tc_saturation: form.zonen_aktiv ? undefined : form.tc_saturation || undefined,
      tc_shading: form.zonen_aktiv ? undefined : form.tc_shading || undefined,
      tc_linework: form.zonen_aktiv ? undefined : form.tc_linework || undefined,
      tc_size_length: form.zonen_aktiv ? undefined : num(form.tc_size_length),
      tc_size_width: form.zonen_aktiv ? undefined : num(form.tc_size_width),
      skin_fitzpatrick_type: form.skin_fitzpatrick_type || undefined,
      skin_hyperpig_risk: form.skin_hyperpig_risk || undefined,
      skin_keloid_risk: form.skin_keloid_risk || undefined,
      skin_sun_zone: form.skin_sun_zone || undefined,
      life_smoker: form.life_smoker || undefined,
      life_cig_per_day: ['daily_light', 'daily_heavy'].includes(form.life_smoker)
        ? num(form.life_cig_per_day)
        : undefined,
      life_alcohol: form.life_alcohol || undefined,
      life_activity: form.life_activity || undefined,
      life_sleep_hours: form.life_sleep_hours || undefined,
      life_sleep_quality: form.life_sleep_quality || undefined,
      life_stress: form.life_stress || undefined,
      life_height_cm: num(form.life_height_cm),
      life_weight_kg: num(form.life_weight_kg),
      life_hydration: form.life_hydration || undefined,
      life_nutrition: form.life_nutrition || undefined,
      goal_target: form.goal_target || undefined,
      goal_notes: form.goal_notes?.trim() || undefined,
      photo_intake_main: form.photo_intake_main || undefined,
      photo_intake_detail: form.photo_intake_detail || undefined,
      photo_marker: form.photo_marker || undefined,
      photo_std_intake: form.photo_std_intake,
      status: 'pending',
    }
  }

  useEffect(() => {
    if (form.type === 'pmu' || step !== PRICING_STEP) return undefined

    let cancelled = false
    setPricingLoading(true)
    setPricingError('')
    setPricingPreview(null)

    previewCasePricing(buildPayload())
      .then((res) => {
        if (!cancelled) setPricingPreview(res.data.data)
      })
      .catch(() => {
        if (!cancelled) setPricingError(ui.validation.pricingFailed)
      })
      .finally(() => {
        if (!cancelled) setPricingLoading(false)
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch when entering pricing step only
  }, [step, form.type])

  const handleSubmit = () => {
    for (let i = 0; i < WIZARD_STEPS.length - 1; i += 1) {
      const err = validateStep(i)
      if (err) { setError(err); setStep(i); return }
    }
    setError('')
    onSubmit(buildPayload())
  }

  const areaCm2 =
    form.tc_size_length && form.tc_size_width
      ? (Number(form.tc_size_length) * Number(form.tc_size_width)).toFixed(0)
      : null

  // ── Step 0: Basics ──────────────────────────────────────────────────────
  const renderBasics = () => (
    <div className="flex flex-col gap-4">
      <FieldLabel>{ui.basics.caseType}</FieldLabel>
      <OptGrid>
        {CASE_TYPES.map((t) => (
          <Opt key={t.value} active={form.type === t.value} onClick={() => set('type', t.value)} className="flex-1 min-w-[120px]">
            {t.label}
          </Opt>
        ))}
      </OptGrid>

      {form.type === 'pmu' && (
        <div className="rounded-[12px] border border-studio-gold/20 bg-studio-gold/5 p-4 text-[12px] text-studio-w2 leading-relaxed">
          {ui.basics.pmuNotice}
        </div>
      )}

      <Input
        label={ui.basics.title}
        value={form.tc_title}
        onChange={(e) => set('tc_title', e.target.value)}
        placeholder={ui.basics.titlePlaceholder}
      />

      <div>
        <FieldLabel hint={ui.basics.bodyHint}>{ui.basics.bodyRegion}</FieldLabel>
        <OptGrid>
          {BODY_LOCATIONS.map(([v, l]) => (
            <Opt key={v} active={form.tc_body_location_main === v} onClick={() => set('tc_body_location_main', v)}>{l}</Opt>
          ))}
        </OptGrid>
      </div>

      {form.type === 'tattoo' && (
        <>
          <div>
            <FieldLabel hint={ui.basics.zoneHint}>{ui.basics.zoneMode}</FieldLabel>
            <OptGrid>
              <Opt active={!form.zonen_aktiv} onClick={() => setZonenModus(false)}>{ui.basics.singleTattoo}</Opt>
              <Opt active={form.zonen_aktiv} onClick={() => setZonenModus(true)}>{ui.basics.splitZones}</Opt>
            </OptGrid>
          </div>

          <div>
            <FieldLabel optional>{ui.basics.side}</FieldLabel>
            <OptGrid>
              {TC_SIDES.map(([v, l]) => (
                <Opt key={v} active={form.tc_side === v} onClick={() => set('tc_side', form.tc_side === v ? '' : v)}>{l}</Opt>
              ))}
            </OptGrid>
          </div>

          <div>
            <FieldLabel>{ui.basics.tattooAge}</FieldLabel>
            <OptGrid>
              {TC_AGE_BUCKETS.map(([v, l]) => (
                <Opt key={v} active={form.tc_age_bucket === v} onClick={() => set('tc_age_bucket', v)}>{l}</Opt>
              ))}
            </OptGrid>
          </div>

          <div>
            <FieldLabel>{ui.basics.tattooType}</FieldLabel>
            <OptGrid>
              {TC_TYPES.map(([v, l]) => (
                <Opt key={v} active={form.tc_type === v} onClick={() => set('tc_type', v)}>{l}</Opt>
              ))}
            </OptGrid>
          </div>

          <div>
            <FieldLabel hint={ui.basics.coverupHint}>{ui.basics.coverup}</FieldLabel>
            <OptGrid>
              {TC_COVERUP.map(([v, l]) => (
                <Opt key={v} active={form.tc_coverup === v} onClick={() => set('tc_coverup', v)}>{l}</Opt>
              ))}
            </OptGrid>
          </div>

          <div>
            <FieldLabel hint={ui.basics.priorHint}>{ui.basics.priorTreatment}</FieldLabel>
            <OptGrid>
              <Opt active={form.tc_prior_treatment === false} onClick={() => set('tc_prior_treatment', false)}>{ui.no}</Opt>
              <Opt active={form.tc_prior_treatment === true} onClick={() => set('tc_prior_treatment', true)}>{ui.yes}</Opt>
            </OptGrid>
            {form.tc_prior_treatment === true && (
              <div className="mt-2">
                <Input
                  label={ui.basics.priorCount}
                  type="number"
                  min="0"
                  max="99"
                  value={form.tc_prior_treatment_count}
                  onChange={(e) => set('tc_prior_treatment_count', e.target.value)}
                  placeholder={ui.basics.priorCountPlaceholder}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )

  // ── Step 1: Properties / Zones ──────────────────────────────────────────
  const renderProperties = () => {
    if (form.zonen_aktiv) {
      return (
        <div className="flex flex-col gap-4">
          <FieldLabel hint={ui.properties.zonesHint}>
            {ui.properties.zonesTitle}
          </FieldLabel>
          {form.zonen.map((z, i) => (
            <div key={z._id} className={`rounded-[14px] border p-4 flex flex-col gap-3 transition-colors ${zoneValid(z) ? 'border-studio-teal/30 bg-studio-teal/5' : 'border-elaya-border bg-studio-bg-4'}`}>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-studio-gold-2">{ui.properties.zone} {i + 1}{zoneValid(z) ? ' ✓' : ''}</span>
                {form.zonen.length > 2 && (
                  <button type="button" onClick={() => setForm((p) => ({ ...p, zonen: p.zonen.filter((x) => x._id !== z._id) }))} className="text-studio-w4 hover:text-red-400 bg-transparent border-0 cursor-pointer p-1">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <Input label={ui.properties.zoneLabel} value={z.bezeichnung} onChange={(e) => setZone(z._id, { bezeichnung: e.target.value })} placeholder={ui.properties.zoneLabelPlaceholder} />
              <Select label={ui.properties.bodyPart} value={z.koerperstelle} onChange={(e) => setZone(z._id, { koerperstelle: e.target.value })}>
                <option value="">{ui.choose}</option>
                {BODY_LOCATIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
              <div>
                <FieldLabel>{ui.properties.colors}</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {INK_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      title={c.label}
                      onClick={() => toggleZoneColor(z._id, c.id)}
                      className="w-8 h-8 rounded-full border-2 cursor-pointer transition-transform hover:scale-110"
                      style={{
                        background: c.color,
                        borderColor: z.farben.includes(c.id) ? SELECTED_SWATCH_BORDER : 'rgba(255,255,255,0.1)',
                        boxShadow: z.farben.includes(c.id) ? SELECTED_SWATCH_GLOW : undefined,
                        transform: z.farben.includes(c.id) ? 'scale(1.15)' : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>{ui.properties.density}</FieldLabel>
                <OptGrid>
                  {ZONE_DICHTE.map(([v, l]) => (
                    <Opt key={v} active={z.dichte === v} onClick={() => setZone(z._id, { dichte: v })}>{l}</Opt>
                  ))}
                </OptGrid>
              </div>
              <Select
                label={ui.properties.area}
                value={z.flaeche_modus === 'manuell' ? 'manuell' : z.flaeche_template}
                onChange={(e) => {
                  if (e.target.value === 'manuell') {
                    setZone(z._id, { flaeche_modus: 'manuell', flaeche_template: '' })
                  } else {
                    const t = ZONE_FLAECHEN.find((x) => x.value === e.target.value)
                    setZone(z._id, { flaeche_modus: 'template', flaeche_template: e.target.value, flaeche_cm2: t?.cm2 })
                  }
                }}
              >
                <option value="">{ui.choose}</option>
                {ZONE_FLAECHEN.map((t) => (
                  <option key={t.value} value={t.value}>{t.label} (~{t.cm2} cm²)</option>
                ))}
                <option value="manuell">{ui.properties.customArea}</option>
              </Select>
              {z.flaeche_modus === 'manuell' && (
                <Input type="number" min="0" label={ui.properties.areaCm2} value={z.flaeche_manuell} onChange={(e) => setZone(z._id, { flaeche_manuell: e.target.value })} />
              )}
            </div>
          ))}
          {form.zonen.length < 8 && (
            <Button type="button" variant="secondary" onClick={() => setForm((p) => ({ ...p, zonen: [...p.zonen, newZone()] }))} className="w-full">
              <Plus size={14} className="mr-1 inline" /> {ui.properties.addZone}
            </Button>
          )}
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel>{ui.properties.colors}</FieldLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {INK_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                title={c.label}
                onClick={() => toggleColor(c.id)}
                className="w-9 h-9 rounded-full border-2 cursor-pointer transition-all hover:scale-110"
                style={{
                  background: c.color,
                  borderColor: form.tc_colors_present.includes(c.id) ? SELECTED_SWATCH_BORDER : 'rgba(255,255,255,0.1)',
                  boxShadow: form.tc_colors_present.includes(c.id) ? SELECTED_SWATCH_GLOW : undefined,
                  transform: form.tc_colors_present.includes(c.id) ? 'scale(1.15)' : undefined,
                }}
              />
            ))}
          </div>
          {form.tc_colors_present.length > 0 && (
            <p className="text-[10px] text-studio-gold-2 m-0">
              {form.tc_colors_present.map((id) => INK_COLORS.find((c) => c.id === id)?.label).filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        {[
          ['tc_density', ui.properties.colorDensity, QUALITY_LEVEL],
          ['tc_saturation', ui.properties.saturation, QUALITY_LEVEL],
          ['tc_shading', ui.properties.shading, SHADING_LEVEL],
          ['tc_linework', ui.properties.linework, LINEWORK_LEVEL],
        ].map(([field, label, opts]) => (
          <div key={field}>
            <FieldLabel>{label} *</FieldLabel>
            <OptGrid>
              {opts.map(([v, l]) => (
                <Opt key={v} active={form[field] === v} onClick={() => set(field, v)}>{l}</Opt>
              ))}
            </OptGrid>
          </div>
        ))}

        <div>
          <FieldLabel hint={ui.properties.dimensionsHint}>{ui.properties.dimensions}</FieldLabel>
          <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-end">
            <Input label={ui.properties.length} type="number" min="0" step="0.1" value={form.tc_size_length} onChange={(e) => set('tc_size_length', e.target.value)} placeholder="8" />
            <span className="text-studio-w4 pb-2.5">×</span>
            <Input label={ui.properties.width} type="number" min="0" step="0.1" value={form.tc_size_width} onChange={(e) => set('tc_size_width', e.target.value)} placeholder="5" />
            <span className="text-studio-gold-2 text-[13px] font-mono font-bold pb-2.5 whitespace-nowrap">
              {areaCm2 ? `= ${areaCm2} cm²` : '= ?'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 2: Skin ────────────────────────────────────────────────────────
  const renderSkin = () => (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel hint={ui.skin.fitzHint}>{ui.skin.fitzpatrick}</FieldLabel>
        <div className="flex gap-1.5">
          {FITZPATRICK.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => set('skin_fitzpatrick_type', t.id)}
              title={t.desc}
              className={`flex-1 h-12 rounded-[10px] border-2 cursor-pointer transition-all text-[10px] font-bold flex items-end justify-center pb-1
                ${form.skin_fitzpatrick_type === t.id
                  ? 'border-studio-gold-2 ring-4 ring-studio-gold/45 scale-105 shadow-[0_0_16px_rgba(74,154,255,0.45)]'
                  : 'border-elaya-border opacity-80 hover:opacity-100'
                }`}
              style={{ background: t.color, color: 'rgba(255,255,255,0.85)' }}
            >
              {t.id}
            </button>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel optional>{ui.skin.hyperpig}</FieldLabel>
        <OptGrid>
          {RISK_LEVEL.map(([v, l]) => (
            <Opt key={v} active={form.skin_hyperpig_risk === v} onClick={() => set('skin_hyperpig_risk', form.skin_hyperpig_risk === v ? '' : v)}>{l}</Opt>
          ))}
        </OptGrid>
      </div>
      <div>
        <FieldLabel optional>{ui.skin.keloid}</FieldLabel>
        <OptGrid>
          {RISK_LEVEL.map(([v, l]) => (
            <Opt key={v} active={form.skin_keloid_risk === v} onClick={() => set('skin_keloid_risk', form.skin_keloid_risk === v ? '' : v)}>{l}</Opt>
          ))}
        </OptGrid>
      </div>
      <div>
        <FieldLabel hint={ui.skin.sunHint}>{ui.skin.sunZone}</FieldLabel>
        <OptGrid>
          {SUN_EXPOSURE.map(([v, l]) => (
            <Opt key={v} active={form.skin_sun_zone === v} onClick={() => set('skin_sun_zone', v)}>{l}</Opt>
          ))}
        </OptGrid>
      </div>
    </div>
  )

  // ── Step 3: Lifestyle ───────────────────────────────────────────────────
  const renderLifestyle = () => (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel hint={ui.lifestyle.smokingHint}>{ui.lifestyle.smoking}</FieldLabel>
        <OptGrid>
          {LIFE_SMOKER.map(([v, l]) => (
            <Opt key={v} active={form.life_smoker === v} onClick={() => set('life_smoker', v)}>{l}</Opt>
          ))}
        </OptGrid>
        {['daily_light', 'daily_heavy'].includes(form.life_smoker) && (
          <div className="mt-2">
            <Input type="number" label={ui.lifestyle.cigarettesPerDay} value={form.life_cig_per_day} onChange={(e) => set('life_cig_per_day', e.target.value)} />
          </div>
        )}
      </div>
      {[
        ['life_alcohol', ui.lifestyle.alcohol, LIFE_ALCOHOL],
        ['life_activity', ui.lifestyle.activity, LIFE_ACTIVITY],
        ['life_sleep_hours', ui.lifestyle.sleepHours, LIFE_SLEEP_HOURS],
        ['life_sleep_quality', ui.lifestyle.sleepQuality, LIFE_SLEEP_QUALITY],
        ['life_stress', ui.lifestyle.stress, LIFE_STRESS],
        ['life_hydration', ui.lifestyle.hydration, LIFE_HYDRATION],
        ['life_nutrition', ui.lifestyle.nutrition, LIFE_NUTRITION],
      ].map(([field, label, opts]) => (
        <div key={field}>
          <FieldLabel>{label}</FieldLabel>
          <OptGrid>
            {opts.map(([v, l]) => (
              <Opt key={v} active={form[field] === v} onClick={() => set(field, v)}>{l}</Opt>
            ))}
          </OptGrid>
        </div>
      ))}
      <div>
        <FieldLabel>{ui.lifestyle.bodyMass}</FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          <Input label={ui.lifestyle.height} type="number" value={form.life_height_cm} onChange={(e) => set('life_height_cm', e.target.value)} placeholder="172" />
          <Input label={ui.lifestyle.weight} type="number" value={form.life_weight_kg} onChange={(e) => set('life_weight_kg', e.target.value)} placeholder="70" />
        </div>
      </div>
    </div>
  )

  // ── Step 4: Goal ────────────────────────────────────────────────────────
  const renderGoal = () => (
    <div className="flex flex-col gap-4">
      <FieldLabel>{ui.goal.title}</FieldLabel>
      <div className="flex flex-col gap-2">
        {GOAL_TARGETS.map(([v, title, desc]) => (
          <button
            key={v}
            type="button"
            onClick={() => set('goal_target', v)}
            className={`text-left rounded-[12px] border p-4 cursor-pointer transition-all
              ${form.goal_target === v
                ? `${SELECTED_CHIP} ring-offset-1 ring-offset-studio-bg-3`
                : 'border-elaya-border bg-studio-bg-4 hover:border-elaya-border-strong'
              }`}
          >
            <p className={`text-[13px] font-semibold m-0 ${form.goal_target === v ? 'text-studio-gold-3' : 'text-studio-white'}`}>{title}</p>
            <p className="text-[11px] text-studio-w3 m-0 mt-1">{desc}</p>
          </button>
        ))}
      </div>
      <div>
        <FieldLabel optional>{ui.goal.notes}</FieldLabel>
        <textarea
          className="w-full min-h-[80px] px-3 py-2.5 rounded-[10px] border border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[12px] outline-none focus:border-studio-gold resize-none"
          placeholder={ui.goal.notesPlaceholder}
          value={form.goal_notes}
          onChange={(e) => set('goal_notes', e.target.value)}
        />
      </div>
    </div>
  )

  const setPhotoCheck = (key, value) => {
    setForm((prev) => ({
      ...prev,
      photo_std_intake: { ...prev.photo_std_intake, [key]: value },
    }))
  }

  // ── Step 5: Photos (optional) ───────────────────────────────────────────
  const renderPhotos = () => (
    <div className="flex flex-col gap-5">
      <div className="rounded-[12px] border border-studio-teal/20 bg-studio-teal/5 p-4 text-[12px] text-studio-w2 leading-relaxed">
        <p className="m-0 font-semibold text-studio-teal-2 mb-1">📸 {ui.photos.title}</p>
        <p className="m-0">{ui.photos.intro}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PhotoUploadField
          label={ui.photos.main}
          hint={ui.photos.mainHint}
          slot="main"
          customerId={customerId}
          fileId={form.photo_intake_main}
          onChange={(id) => set('photo_intake_main', id)}
          disabled={loading}
        />
        <PhotoUploadField
          label={ui.photos.detail}
          hint={ui.photos.detailHint}
          slot="detail"
          customerId={customerId}
          fileId={form.photo_intake_detail}
          onChange={(id) => set('photo_intake_detail', id)}
          disabled={loading}
        />
        <PhotoUploadField
          label={ui.photos.marker}
          hint={ui.photos.markerHint}
          slot="marker"
          customerId={customerId}
          fileId={form.photo_marker}
          onChange={(id) => set('photo_marker', id)}
          disabled={loading}
        />
      </div>

      <div>
        <FieldLabel optional>{ui.photos.checklist}</FieldLabel>
        <div className="flex flex-col gap-2">
          {PHOTO_STD_CHECKLIST.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-3 rounded-[10px] border border-elaya-border bg-studio-bg-4 px-3 py-2.5 cursor-pointer hover:border-elaya-border-strong"
            >
              <input
                type="checkbox"
                checked={!!form.photo_std_intake[key]}
                onChange={(e) => setPhotoCheck(key, e.target.checked)}
                className="accent-studio-gold-2"
              />
              <span className="text-[12px] text-studio-w2">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  // ── Step 6: KI / Pricing preview ────────────────────────────────────────
  const renderPricing = () => {
    const sessions = pricingPreview?.sessions
    const confidence = pricingPreview?.confidence_pct ?? sessions?.confidence_pct
    const sessionPct = sessions?.base ? Math.min(100, Math.round((sessions.base / 14) * 100)) : 0

    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-[14px] border border-studio-gold/20 bg-linear-to-br from-studio-gold/10 to-studio-teal/5 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-studio-gold-2 shrink-0" />
              <p className="text-[13px] font-bold text-studio-gold-2 m-0">{ui.pricing.title}</p>
            </div>
            {confidence != null && (
              <span className={`text-[11px] font-semibold ${confidenceColor(confidence)}`}>
                {ui.pricing.confidence} {confidence}%
              </span>
            )}
          </div>

          <p className="text-[11px] text-studio-w3 m-0 mb-3">
            {bodyLocationLabel(form.tc_body_location_main)} · {form.tc_title || '—'}
          </p>

          {pricingLoading ? (
            <div className="flex justify-center py-8"><Spinner size="sm" /></div>
          ) : pricingError ? (
            <p className="text-[12px] text-studio-red m-0">{pricingError}</p>
          ) : pricingPreview ? (
            <>
              {sessions && (
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] text-studio-w3 mb-1.5">
                    <span>{ui.pricing.estimatedSessions}</span>
                    <span className="text-studio-teal-2 font-bold">{sessions.min} – {sessions.max}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-studio-teal to-studio-teal-2 transition-all duration-500"
                      style={{ width: `${sessionPct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-studio-w4 m-0 mt-2">
                    {ui.pricing.timeframe} {sessions.min * 2} – {sessions.max * 2} {ui.pricing.months}
                  </p>
                </div>
              )}

              {pricingPreview.zonen?.length > 0 && (
                <div className="flex flex-col gap-2 mb-4">
                  {pricingPreview.zonen.map((zone, i) => (
                    <div key={`${zone.label}-${i}`} className="flex justify-between text-[11px] text-studio-w3 py-1 border-b border-white/5 last:border-0">
                      <span>{zone.label}</span>
                      <span className="text-studio-white font-medium tabular-nums">{fmtCHF(zone.preis)} {ui.perSession}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>

        {pricingPreview && !pricingLoading && !pricingError && (
          <div className="rounded-[14px] border border-studio-gold/30 bg-linear-to-br from-studio-gold/12 to-studio-teal/5 p-4">
            <p className="text-[13px] font-bold text-studio-gold-2 m-0 mb-3">{ui.pricing.priceEstimate}</p>

            <div className="flex flex-col gap-1.5 mb-3">
              {pricingPreview.area != null && (
                <div className="flex justify-between text-[12px] text-studio-w3 py-1 border-b border-white/5">
                  <span>{ui.pricing.area}</span>
                  <span className="text-studio-white">{pricingPreview.area} cm²</span>
                </div>
              )}
              <div className="flex justify-between text-[12px] text-studio-w3 py-1 border-b border-white/5">
                <span>{ui.pricing.pricePerSession}</span>
                <span className="text-studio-gold-2 font-bold tabular-nums">{fmtCHF(pricingPreview.pricePerSession)}</span>
              </div>
              {sessions && (
                <div className="flex justify-between text-[12px] text-studio-w3 py-1 border-b border-white/5">
                  <span>{ui.pricing.estimatedSessions}</span>
                  <span className="text-studio-white tabular-nums">{sessions.min} – {sessions.max}</span>
                </div>
              )}
            </div>

            {pricingPreview.totalMin != null && pricingPreview.totalMax != null && (
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-[13px] font-bold text-studio-white">{ui.pricing.totalCost}</span>
                <span className="text-studio-gold-2 text-[18px] font-extrabold tabular-nums">
                  {fmtCHF(pricingPreview.totalMin)} – {fmtCHF(pricingPreview.totalMax)}
                </span>
              </div>
            )}

            <p className="text-[10px] text-studio-w4 m-0 mt-3 leading-relaxed">
              {ui.pricing.disclaimer.replace(
                '{confidence}',
                confidence != null ? `, ${ui.pricing.confidence} ${confidence}%` : ''
              )}
            </p>
          </div>
        )}

        <div className="rounded-[12px] border border-studio-teal/20 bg-studio-teal/5 p-3 text-[11px] text-studio-w3 leading-relaxed">
          {ui.pricing.nextStep}
        </div>
      </div>
    )
  }

  // ── Step 7: Review ──────────────────────────────────────────────────────
  const ReviewRow = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-2 border-b border-elaya-border/60 last:border-0 text-[12px]">
      <span className="text-studio-w3 shrink-0">{label}</span>
      <span className="text-studio-w1 text-right font-medium">{value || '—'}</span>
    </div>
  )

  const renderReview = () => (
    <div className="flex flex-col gap-4">
      <div className="rounded-[14px] border border-elaya-border bg-studio-bg-4 p-4">
        <p className="text-[11px] font-semibold text-studio-gold-2 uppercase tracking-wider m-0 mb-3">{ui.review.title}</p>
        <ReviewRow label={ui.review.type} value={form.type === 'tattoo' ? ui.review.tattoo : ui.review.pmu} />
        <ReviewRow label={ui.review.label} value={form.tc_title} />
        <ReviewRow label={ui.review.bodyRegion} value={bodyLocationLabel(form.tc_body_location_main)} />
        {form.type === 'tattoo' && (
          <>
            <ReviewRow label={ui.review.zones} value={form.zonen_aktiv ? `${form.zonen.length} ${ui.review.zonesCount}` : ui.review.singleTattoo} />
            {!form.zonen_aktiv && areaCm2 && <ReviewRow label={ui.review.area} value={`${areaCm2} cm²`} />}
            <ReviewRow label={ui.review.age} value={labelFor(TC_AGE_BUCKETS, form.tc_age_bucket)} />
            <ReviewRow label={ui.review.tattooStyle} value={labelFor(TC_TYPES, form.tc_type)} />
            <ReviewRow label={ui.review.fitzpatrick} value={form.skin_fitzpatrick_type} />
            <ReviewRow label={ui.review.goal} value={GOAL_TARGETS.find(([v]) => v === form.goal_target)?.[1]} />
            {pricingPreview?.pricePerSession != null && (
              <ReviewRow label={ui.review.pricePerSession} value={fmtCHF(pricingPreview.pricePerSession)} />
            )}
            {pricingPreview?.sessions && (
              <ReviewRow label={ui.review.sessionsEstimated} value={`${pricingPreview.sessions.min} – ${pricingPreview.sessions.max}`} />
            )}
          </>
        )}
      </div>
      <div className="rounded-[12px] border border-studio-gold/15 bg-studio-gold/5 p-3 text-[11px] text-studio-w3 leading-relaxed">
        {ui.review.afterSave}
      </div>
    </div>
  )

  const stepContent = [
    renderBasics,
    renderProperties,
    renderSkin,
    renderLifestyle,
    renderGoal,
    renderPhotos,
    renderPricing,
    renderReview,
  ]

  const isLast = step === WIZARD_STEPS.length - 1
  const isPmuShort = form.type === 'pmu' && step === 0

  return (
    <div className="flex flex-col gap-4">
      <CaseWizardProgress step={form.type === 'pmu' ? 0 : step} total={form.type === 'pmu' ? 1 : WIZARD_STEPS.length} />

      <StepError message={error} />

      {form.type === 'pmu' ? renderBasics() : stepContent[step]()}

      <div className="flex justify-between gap-3 pt-4 border-t border-elaya-border mt-2">
        <div className="flex gap-2">
          {step > 0 && form.type !== 'pmu' ? (
            <Button type="button" variant="ghost" onClick={goBack} disabled={loading}>
              <ChevronLeft size={14} className="mr-0.5" /> {ui.back}
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
              {ui.cancel}
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {isPmuShort || isLast ? (
            <Button type="button" loading={loading} onClick={handleSubmit}>
              {ui.createCase}
            </Button>
          ) : (
            <Button type="button" onClick={goNext}>
              {ui.next} <ChevronRight size={14} className="ml-0.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CaseForm
