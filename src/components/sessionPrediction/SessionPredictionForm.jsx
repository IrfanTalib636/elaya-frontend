import { Input } from '../ui'
import {
  AFTERCARE_FIELDS,
  LIFESTYLE_SCORE_GROUPS,
  SESSION_BASE_FIELDS,
  TATTOO_DELTA_GROUPS,
} from './sessionPredictionFields'

const NumberField = ({ id, label, value, onChange, disabled, step = '0.05', hint }) => (
  <Input
    id={id}
    label={label}
    type="number"
    step={step}
    value={value ?? ''}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    hint={hint}
  />
)

const FieldGrid = ({ children }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{children}</div>
)

/**
 * Shared editor for platform Sitzungsprognose parameters.
 * Admin: editable. Studio: pass disabled.
 */
const SessionPredictionForm = ({ values, onChange, disabled = false }) => {
  const setBase = (key, value) => onChange({ ...values, [key]: value })

  const setMap = (bucket, group, key, value) => {
    onChange({
      ...values,
      [bucket]: {
        ...(values[bucket] || {}),
        [group]: {
          ...(values[bucket]?.[group] || {}),
          [key]: value,
        },
      },
    })
  }

  const setBand = (index, key, value) => {
    const next = (values.lifestyle_bands || []).map((band, i) =>
      i === index ? { ...band, [key]: value } : band
    )
    onChange({ ...values, lifestyle_bands: next })
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-[11px] m-0 border border-elaya-border rounded-[10px] px-3 py-2 bg-studio-bg-4 text-studio-w3">
        Formel: (Basis + Tattoo-Deltas) × Lifestyle-Multiplikator → Sitzungsmitte, danach Min/Max-Range.
        Lifestyle-Score 1 = ×0.85 (optimal), Score 5 = ×1.50 (stark beeinträchtigt). Kunden sehen diese
        Parameter nicht.
      </p>

      <div>
        <p className="text-[12px] font-semibold m-0 mb-3">Basis &amp; Range</p>
        <FieldGrid>
          {SESSION_BASE_FIELDS.map(({ key, label, step, hint }) => (
            <NumberField
              key={key}
              id={`sp-${key}`}
              label={label}
              step={step}
              hint={hint}
              value={values?.[key]}
              onChange={(v) => setBase(key, v)}
              disabled={disabled}
            />
          ))}
        </FieldGrid>
      </div>

      {TATTOO_DELTA_GROUPS.map((group) => (
        <div key={group.key}>
          <div className="h-px bg-elaya-border mb-5" />
          <p className="text-[12px] font-semibold m-0 mb-3">{group.title}</p>
          <FieldGrid>
            {group.fields.map(({ key, label }) => (
              <NumberField
                key={key}
                id={`sp-delta-${group.key}-${key}`}
                label={label}
                step="1"
                value={values?.tattoo_deltas?.[group.key]?.[key]}
                onChange={(v) => setMap('tattoo_deltas', group.key, key, v)}
                disabled={disabled}
              />
            ))}
          </FieldGrid>
        </div>
      ))}

      <div>
        <div className="h-px bg-elaya-border mb-5" />
        <p className="text-[12px] font-semibold m-0 mb-1">Lifestyle-Composite</p>
        <p className="text-[11px] text-studio-w3 m-0 mb-3">
          Einzelfelder (1–5) werden gemittelt. Schlaf = Durchschnitt aus Qualität und Stunden.
        </p>
      </div>

      {LIFESTYLE_SCORE_GROUPS.map((group) => (
        <div key={group.key}>
          <p className="text-[12px] font-semibold m-0 mb-3">{group.title}</p>
          <FieldGrid>
            {group.fields.map(({ key, label }) => (
              <NumberField
                key={key}
                id={`sp-life-${group.key}-${key}`}
                label={label}
                step="0.1"
                value={values?.lifestyle_scores?.[group.key]?.[key]}
                onChange={(v) => setMap('lifestyle_scores', group.key, key, v)}
                disabled={disabled}
              />
            ))}
          </FieldGrid>
        </div>
      ))}

      <div>
        <div className="h-px bg-elaya-border mb-5" />
        <p className="text-[12px] font-semibold m-0 mb-3">Lifestyle-Multiplikatoren</p>
        <div className="flex flex-col gap-3">
          {(values?.lifestyle_bands || []).map((band, index) => (
            <div key={`band-${index}`} className="grid grid-cols-3 gap-3">
              <NumberField
                id={`sp-band-${index}-avg`}
                label="Ø bis"
                step="0.1"
                value={band.max_avg}
                onChange={(v) => setBand(index, 'max_avg', v)}
                disabled={disabled}
              />
              <NumberField
                id={`sp-band-${index}-score`}
                label="Score"
                step="1"
                value={band.score}
                onChange={(v) => setBand(index, 'score', v)}
                disabled={disabled}
              />
              <NumberField
                id={`sp-band-${index}-mult`}
                label="Multiplikator"
                step="0.05"
                value={band.multiplier}
                onChange={(v) => setBand(index, 'multiplier', v)}
                disabled={disabled}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="h-px bg-elaya-border mb-5" />
        <p className="text-[12px] font-semibold m-0 mb-3">Nachsorge-Bereitschaft (zusätzliche Max-Sitzungen)</p>
        <FieldGrid>
          {AFTERCARE_FIELDS.map(({ key, label }) => (
            <NumberField
              key={key}
              id={`sp-aftercare-${key}`}
              label={label}
              step="1"
              value={values?.aftercare_extra_max?.[key]}
              onChange={(v) =>
                onChange({
                  ...values,
                  aftercare_extra_max: {
                    ...(values.aftercare_extra_max || {}),
                    [key]: v,
                  },
                })
              }
              disabled={disabled}
            />
          ))}
        </FieldGrid>
      </div>
    </div>
  )
}

export default SessionPredictionForm
