import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, Camera, Sparkles } from 'lucide-react'
import { Input, Select, Button, Spinner } from '../ui'
import CaseWizardProgress from './CaseWizardProgress'
import { previewCasePricing } from '../../api/cases'
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
  labelFor,
  bodyLocationLabel,
} from '../../constants/caseIntake'

// ── Shared UI bits ────────────────────────────────────────────────────────
const FieldLabel = ({ children, hint, optional }) => (
  <div className="mb-2">
    <p className="text-studio-white text-[12px] font-semibold m-0">
      {children}
      {optional && <span className="text-studio-w4 font-normal ml-1">(optional)</span>}
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
const CaseForm = ({ onSubmit, loading, onCancel }) => {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(INITIAL_CASE_FORM)
  const [error, setError] = useState('')
  const [pricingPreview, setPricingPreview] = useState(null)
  const [pricingLoading, setPricingLoading] = useState(false)
  const [pricingError, setPricingError] = useState('')
  const scrollAnchorRef = useRef(null)

  /** Reset modal scroll to top when changing steps */
  useEffect(() => {
    const anchor = scrollAnchorRef.current
    if (!anchor) return

    let node = anchor.parentElement
    while (node) {
      const { overflowY, overflow } = window.getComputedStyle(node)
      const scrollable =
        overflowY === 'auto' ||
        overflowY === 'scroll' ||
        overflow === 'auto' ||
        overflow === 'scroll'
      if (scrollable && node.scrollHeight > node.clientHeight) {
        node.scrollTop = 0
        return
      }
      node = node.parentElement
    }
    anchor.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [step])

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
    if (form.type === 'pmu') {
      if (!form.tc_title?.trim()) return 'Bitte Bezeichnung angeben.'
      if (!form.tc_body_location_main) return 'Bitte Körperregion wählen.'
      return ''
    }

    switch (s) {
      case 0:
        if (!form.tc_title?.trim()) return 'Bitte Bezeichnung angeben.'
        if (!form.tc_body_location_main) return 'Bitte Körperregion wählen.'
        if (!form.tc_age_bucket) return 'Bitte Tattoo-Alter wählen.'
        if (!form.tc_type) return 'Bitte Tattoo-Typ wählen.'
        if (form.tc_prior_treatment === null) return 'Bitte Vorbehandlungen angeben.'
        return ''
      case 1:
        if (form.zonen_aktiv) {
          if (form.zonen.length < 2) return 'Mindestens 2 Zonen erforderlich.'
          if (!form.zonen.every(zoneValid)) return 'Bitte alle Zonen vollständig ausfüllen.'
          return ''
        }
        if (!form.tc_colors_present.length) return 'Bitte mindestens eine Farbe wählen.'
        if (!form.tc_density || !form.tc_saturation || !form.tc_shading || !form.tc_linework) {
          return 'Bitte alle Eigenschaften ausfüllen.'
        }
        if (!form.tc_size_length || !form.tc_size_width) return 'Bitte Masse in cm angeben.'
        return ''
      case 2:
        if (!form.skin_fitzpatrick_type) return 'Bitte Fitzpatrick-Typ wählen.'
        if (!form.skin_sun_zone) return 'Bitte Sonnenexposition wählen.'
        return ''
      case 3:
        if (!form.life_smoker || !form.life_alcohol || !form.life_activity) return 'Bitte alle Pflichtfelder ausfüllen.'
        if (!form.life_sleep_hours || !form.life_sleep_quality || !form.life_stress) return 'Bitte Schlaf & Stress angeben.'
        if (!form.life_height_cm || !form.life_weight_kg) return 'Bitte Körpermasse angeben.'
        if (!form.life_hydration || !form.life_nutrition) return 'Bitte Hydration & Ernährung angeben.'
        return ''
      case 4:
        if (!form.goal_target) return 'Bitte Behandlungsziel wählen.'
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
        if (!cancelled) setPricingError('Schätzung konnte nicht berechnet werden.')
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
      <FieldLabel>Fall-Typ</FieldLabel>
      <OptGrid>
        {CASE_TYPES.map((t) => (
          <Opt key={t.value} active={form.type === t.value} onClick={() => set('type', t.value)} className="flex-1 min-w-[120px]">
            {t.label}
          </Opt>
        ))}
      </OptGrid>

      {form.type === 'pmu' && (
        <div className="rounded-[12px] border border-studio-gold/20 bg-studio-gold/5 p-4 text-[12px] text-studio-w2 leading-relaxed">
          PMU-Fälle nutzen derzeit eine vereinfachte Erfassung. Vollständiger PMU-Wizard folgt — Sie können Basics speichern und Details später ergänzen.
        </div>
      )}

      <Input
        label="Bezeichnung *"
        value={form.tc_title}
        onChange={(e) => set('tc_title', e.target.value)}
        placeholder="z. B. Unterarm links Schriftzug"
      />

      <div>
        <FieldLabel hint="Wo befindet sich das Tattoo?">Körperregion *</FieldLabel>
        <OptGrid>
          {BODY_LOCATIONS.map(([v, l]) => (
            <Opt key={v} active={form.tc_body_location_main === v} onClick={() => set('tc_body_location_main', v)}>{l}</Opt>
          ))}
        </OptGrid>
      </div>

      {form.type === 'tattoo' && (
        <>
          <div>
            <FieldLabel hint="Grosses Motiv über mehrere Bereiche?">Zonen-Modus</FieldLabel>
            <OptGrid>
              <Opt active={!form.zonen_aktiv} onClick={() => setZonenModus(false)}>Einzelnes Tattoo</Opt>
              <Opt active={form.zonen_aktiv} onClick={() => setZonenModus(true)}>In Zonen aufteilen</Opt>
            </OptGrid>
          </div>

          <div>
            <FieldLabel optional>Seite</FieldLabel>
            <OptGrid>
              {TC_SIDES.map(([v, l]) => (
                <Opt key={v} active={form.tc_side === v} onClick={() => set('tc_side', form.tc_side === v ? '' : v)}>{l}</Opt>
              ))}
            </OptGrid>
          </div>

          <div>
            <FieldLabel>Tattoo-Alter *</FieldLabel>
            <OptGrid>
              {TC_AGE_BUCKETS.map(([v, l]) => (
                <Opt key={v} active={form.tc_age_bucket === v} onClick={() => set('tc_age_bucket', v)}>{l}</Opt>
              ))}
            </OptGrid>
          </div>

          <div>
            <FieldLabel>Tattoo-Typ *</FieldLabel>
            <OptGrid>
              {TC_TYPES.map(([v, l]) => (
                <Opt key={v} active={form.tc_type === v} onClick={() => set('tc_type', v)}>{l}</Opt>
              ))}
            </OptGrid>
          </div>

          <div>
            <FieldLabel hint="Wurde über ein älteres Tattoo tätowiert?">Cover-Up *</FieldLabel>
            <OptGrid>
              {TC_COVERUP.map(([v, l]) => (
                <Opt key={v} active={form.tc_coverup === v} onClick={() => set('tc_coverup', v)}>{l}</Opt>
              ))}
            </OptGrid>
          </div>

          <div>
            <FieldLabel hint="Bereits laser-behandelt?">Vorbehandlungen *</FieldLabel>
            <OptGrid>
              <Opt active={form.tc_prior_treatment === false} onClick={() => set('tc_prior_treatment', false)}>Nein</Opt>
              <Opt active={form.tc_prior_treatment === true} onClick={() => set('tc_prior_treatment', true)}>Ja</Opt>
            </OptGrid>
            {form.tc_prior_treatment === true && (
              <div className="mt-2">
                <Input
                  label="Anzahl Vorbehandlungen"
                  type="number"
                  min="0"
                  max="99"
                  value={form.tc_prior_treatment_count}
                  onChange={(e) => set('tc_prior_treatment_count', e.target.value)}
                  placeholder="z. B. 3"
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
          <FieldLabel hint="Mind. 2, max. 8 Zonen. Jede Zone wird separat geschätzt.">
            Zonen aufteilen *
          </FieldLabel>
          {form.zonen.map((z, i) => (
            <div key={z._id} className={`rounded-[14px] border p-4 flex flex-col gap-3 transition-colors ${zoneValid(z) ? 'border-studio-teal/30 bg-studio-teal/5' : 'border-elaya-border bg-studio-bg-4'}`}>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-studio-gold-2">Zone {i + 1}{zoneValid(z) ? ' ✓' : ''}</span>
                {form.zonen.length > 2 && (
                  <button type="button" onClick={() => setForm((p) => ({ ...p, zonen: p.zonen.filter((x) => x._id !== z._id) }))} className="text-studio-w4 hover:text-red-400 bg-transparent border-0 cursor-pointer p-1">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <Input label="Bezeichnung *" value={z.bezeichnung} onChange={(e) => setZone(z._id, { bezeichnung: e.target.value })} placeholder="z. B. Unterarm aussen" />
              <Select label="Körperstelle *" value={z.koerperstelle} onChange={(e) => setZone(z._id, { koerperstelle: e.target.value })}>
                <option value="">— wählen —</option>
                {BODY_LOCATIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
              <div>
                <FieldLabel>Farben *</FieldLabel>
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
                <FieldLabel>Dichte *</FieldLabel>
                <OptGrid>
                  {ZONE_DICHTE.map(([v, l]) => (
                    <Opt key={v} active={z.dichte === v} onClick={() => setZone(z._id, { dichte: v })}>{l}</Opt>
                  ))}
                </OptGrid>
              </div>
              <Select
                label="Fläche *"
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
                <option value="">— wählen —</option>
                {ZONE_FLAECHEN.map((t) => (
                  <option key={t.value} value={t.value}>{t.label} (~{t.cm2} cm²)</option>
                ))}
                <option value="manuell">Eigene Angabe (cm²)</option>
              </Select>
              {z.flaeche_modus === 'manuell' && (
                <Input type="number" min="0" label="Fläche (cm²)" value={z.flaeche_manuell} onChange={(e) => setZone(z._id, { flaeche_manuell: e.target.value })} />
              )}
            </div>
          ))}
          {form.zonen.length < 8 && (
            <Button type="button" variant="secondary" onClick={() => setForm((p) => ({ ...p, zonen: [...p.zonen, newZone()] }))} className="w-full">
              <Plus size={14} className="mr-1 inline" /> Weitere Zone
            </Button>
          )}
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel>Farben *</FieldLabel>
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
          ['tc_density', 'Farbdichte', QUALITY_LEVEL],
          ['tc_saturation', 'Farbsättigung', QUALITY_LEVEL],
          ['tc_shading', 'Schattierung', SHADING_LEVEL],
          ['tc_linework', 'Linienarbeit', LINEWORK_LEVEL],
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
          <FieldLabel hint="Mit Lineal messen — Studio misst exakt nach.">Masse in cm *</FieldLabel>
          <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-end">
            <Input label="Länge" type="number" min="0" step="0.1" value={form.tc_size_length} onChange={(e) => set('tc_size_length', e.target.value)} placeholder="8" />
            <span className="text-studio-w4 pb-2.5">×</span>
            <Input label="Breite" type="number" min="0" step="0.1" value={form.tc_size_width} onChange={(e) => set('tc_size_width', e.target.value)} placeholder="5" />
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
        <FieldLabel hint="Natürliche Hautfarbe ohne Bräune.">Fitzpatrick-Hauttyp *</FieldLabel>
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
        <FieldLabel optional>Hyperpigmentierungsrisiko</FieldLabel>
        <OptGrid>
          {RISK_LEVEL.map(([v, l]) => (
            <Opt key={v} active={form.skin_hyperpig_risk === v} onClick={() => set('skin_hyperpig_risk', form.skin_hyperpig_risk === v ? '' : v)}>{l}</Opt>
          ))}
        </OptGrid>
      </div>
      <div>
        <FieldLabel optional>Keloid-/Narbenrisiko</FieldLabel>
        <OptGrid>
          {RISK_LEVEL.map(([v, l]) => (
            <Opt key={v} active={form.skin_keloid_risk === v} onClick={() => set('skin_keloid_risk', form.skin_keloid_risk === v ? '' : v)}>{l}</Opt>
          ))}
        </OptGrid>
      </div>
      <div>
        <FieldLabel hint="Wie stark ist die Stelle der Sonne ausgesetzt?">Sonnenexpositionszone *</FieldLabel>
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
        <FieldLabel hint="Rauchen verlangsamt die Entfernung erheblich.">Rauchverhalten *</FieldLabel>
        <OptGrid>
          {LIFE_SMOKER.map(([v, l]) => (
            <Opt key={v} active={form.life_smoker === v} onClick={() => set('life_smoker', v)}>{l}</Opt>
          ))}
        </OptGrid>
        {['daily_light', 'daily_heavy'].includes(form.life_smoker) && (
          <div className="mt-2">
            <Input type="number" label="Zigaretten pro Tag" value={form.life_cig_per_day} onChange={(e) => set('life_cig_per_day', e.target.value)} />
          </div>
        )}
      </div>
      {[
        ['life_alcohol', 'Alkohol *', LIFE_ALCOHOL],
        ['life_activity', 'Aktivitätslevel *', LIFE_ACTIVITY],
        ['life_sleep_hours', 'Schlafstunden *', LIFE_SLEEP_HOURS],
        ['life_sleep_quality', 'Schlafqualität *', LIFE_SLEEP_QUALITY],
        ['life_stress', 'Stressniveau *', LIFE_STRESS],
        ['life_hydration', 'Hydration *', LIFE_HYDRATION],
        ['life_nutrition', 'Ernährungsqualität *', LIFE_NUTRITION],
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
        <FieldLabel>Körpermasse *</FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Grösse (cm)" type="number" value={form.life_height_cm} onChange={(e) => set('life_height_cm', e.target.value)} placeholder="172" />
          <Input label="Gewicht (kg)" type="number" value={form.life_weight_kg} onChange={(e) => set('life_weight_kg', e.target.value)} placeholder="70" />
        </div>
      </div>
    </div>
  )

  // ── Step 4: Goal ────────────────────────────────────────────────────────
  const renderGoal = () => (
    <div className="flex flex-col gap-4">
      <FieldLabel>Behandlungsziel *</FieldLabel>
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
        <FieldLabel optional>Anmerkungen</FieldLabel>
        <textarea
          className="w-full min-h-[80px] px-3 py-2.5 rounded-[10px] border border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[12px] outline-none focus:border-studio-gold resize-none"
          placeholder="Weitere Angaben oder Wünsche…"
          value={form.goal_notes}
          onChange={(e) => set('goal_notes', e.target.value)}
        />
      </div>
    </div>
  )

  // ── Step 5: Photos (optional) ───────────────────────────────────────────
  const renderPhotos = () => (
    <div className="flex flex-col gap-4">
      <div className="rounded-[12px] border border-studio-teal/20 bg-studio-teal/5 p-4 text-[12px] text-studio-w2 leading-relaxed">
        <p className="m-0 font-semibold text-studio-teal-2 mb-2">📸 Fotos — demnächst</p>
        <p className="m-0">Foto-Upload wird in einer späteren Version aktiviert. Sie können den Fall jetzt ohne Fotos speichern — der Kunde kann Erstfotos später in der App hochladen.</p>
      </div>
      <div className="flex flex-col items-center justify-center gap-3 py-8 rounded-[14px] border border-dashed border-elaya-border bg-studio-bg-4/50 text-studio-w4">
        <Camera size={32} strokeWidth={1.5} />
        <p className="text-[12px] m-0">Hauptfoto · Detailfoto · Referenzmarker</p>
        <p className="text-[10px] m-0 text-studio-w4">Optional — überspringen mit Weiter</p>
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
              <p className="text-[13px] font-bold text-studio-gold-2 m-0">KI-Tattooanalyse</p>
            </div>
            {confidence != null && (
              <span className={`text-[11px] font-semibold ${confidenceColor(confidence)}`}>
                Konfidenz {confidence}%
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
                    <span>Geschätzte Sitzungen</span>
                    <span className="text-studio-teal-2 font-bold">{sessions.min} – {sessions.max}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-studio-teal to-studio-teal-2 transition-all duration-500"
                      style={{ width: `${sessionPct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-studio-w4 m-0 mt-2">
                    Zeitrahmen ca. {sessions.min * 2} – {sessions.max * 2} Monate
                  </p>
                </div>
              )}

              {pricingPreview.zonen?.length > 0 && (
                <div className="flex flex-col gap-2 mb-4">
                  {pricingPreview.zonen.map((zone, i) => (
                    <div key={`${zone.label}-${i}`} className="flex justify-between text-[11px] text-studio-w3 py-1 border-b border-white/5 last:border-0">
                      <span>{zone.label}</span>
                      <span className="text-studio-white font-medium tabular-nums">{fmtCHF(zone.preis)} / Sitzung</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>

        {pricingPreview && !pricingLoading && !pricingError && (
          <div className="rounded-[14px] border border-studio-gold/30 bg-linear-to-br from-studio-gold/12 to-studio-teal/5 p-4">
            <p className="text-[13px] font-bold text-studio-gold-2 m-0 mb-3">Preisschätzung</p>

            <div className="flex flex-col gap-1.5 mb-3">
              {pricingPreview.area != null && (
                <div className="flex justify-between text-[12px] text-studio-w3 py-1 border-b border-white/5">
                  <span>Fläche</span>
                  <span className="text-studio-white">{pricingPreview.area} cm²</span>
                </div>
              )}
              <div className="flex justify-between text-[12px] text-studio-w3 py-1 border-b border-white/5">
                <span>Preis pro Sitzung</span>
                <span className="text-studio-gold-2 font-bold tabular-nums">{fmtCHF(pricingPreview.pricePerSession)}</span>
              </div>
              {sessions && (
                <div className="flex justify-between text-[12px] text-studio-w3 py-1 border-b border-white/5">
                  <span>Geschätzte Sitzungen</span>
                  <span className="text-studio-white tabular-nums">{sessions.min} – {sessions.max}</span>
                </div>
              )}
            </div>

            {pricingPreview.totalMin != null && pricingPreview.totalMax != null && (
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-[13px] font-bold text-studio-white">Gesamtkosten</span>
                <span className="text-studio-gold-2 text-[18px] font-extrabold tabular-nums">
                  {fmtCHF(pricingPreview.totalMin)} – {fmtCHF(pricingPreview.totalMax)}
                </span>
              </div>
            )}

            <p className="text-[10px] text-studio-w4 m-0 mt-3 leading-relaxed">
              KI-Schätzung (AB-Preis{confidence != null ? `, Konfidenz ${confidence}%` : ''}). Endgültiger Preis wird im Studio nach exakter Messung bestätigt.
            </p>
          </div>
        )}

        <div className="rounded-[12px] border border-studio-teal/20 bg-studio-teal/5 p-3 text-[11px] text-studio-w3 leading-relaxed">
          Im nächsten Schritt prüfen Sie die Zusammenfassung. Nach dem Speichern können Sie die Anamnese im Fall-Detail erfassen.
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
        <p className="text-[11px] font-semibold text-studio-gold-2 uppercase tracking-wider m-0 mb-3">Zusammenfassung</p>
        <ReviewRow label="Typ" value={form.type === 'tattoo' ? 'Tattoo' : 'PMU'} />
        <ReviewRow label="Bezeichnung" value={form.tc_title} />
        <ReviewRow label="Körperregion" value={bodyLocationLabel(form.tc_body_location_main)} />
        {form.type === 'tattoo' && (
          <>
            <ReviewRow label="Zonen" value={form.zonen_aktiv ? `${form.zonen.length} Zonen` : 'Einzelnes Tattoo'} />
            {!form.zonen_aktiv && areaCm2 && <ReviewRow label="Fläche" value={`${areaCm2} cm²`} />}
            <ReviewRow label="Alter" value={labelFor(TC_AGE_BUCKETS, form.tc_age_bucket)} />
            <ReviewRow label="Tätowierungsart" value={labelFor(TC_TYPES, form.tc_type)} />
            <ReviewRow label="Fitzpatrick" value={form.skin_fitzpatrick_type} />
            <ReviewRow label="Ziel" value={GOAL_TARGETS.find(([v]) => v === form.goal_target)?.[1]} />
            {pricingPreview?.pricePerSession != null && (
              <ReviewRow label="Preis / Sitzung" value={fmtCHF(pricingPreview.pricePerSession)} />
            )}
            {pricingPreview?.sessions && (
              <ReviewRow label="Sitzungen (geschätzt)" value={`${pricingPreview.sessions.min} – ${pricingPreview.sessions.max}`} />
            )}
          </>
        )}
      </div>
      <div className="rounded-[12px] border border-studio-gold/15 bg-studio-gold/5 p-3 text-[11px] text-studio-w3 leading-relaxed">
        Nach dem Speichern können Sie die Anamnese im Fall-Detail erfassen und Behandlungen planen.
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
    <div className="flex flex-col gap-4" translate="no">
      <div ref={scrollAnchorRef} className="h-0 w-full shrink-0" aria-hidden />
      <CaseWizardProgress step={form.type === 'pmu' ? 0 : step} total={form.type === 'pmu' ? 1 : WIZARD_STEPS.length} />

      <StepError message={error} />

      {form.type === 'pmu' ? renderBasics() : stepContent[step]()}

      <div className="flex justify-between gap-3 pt-4 border-t border-elaya-border mt-2">
        <div className="flex gap-2">
          {step > 0 && form.type !== 'pmu' ? (
            <Button type="button" variant="ghost" onClick={goBack} disabled={loading}>
              <ChevronLeft size={14} className="mr-0.5" /> Zurück
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
              Abbrechen
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {isPmuShort || isLast ? (
            <Button type="button" loading={loading} onClick={handleSubmit}>
              Fall anlegen
            </Button>
          ) : (
            <Button type="button" onClick={goNext}>
              Weiter <ChevronRight size={14} className="ml-0.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CaseForm
