import { Input } from '../ui'
import {
  AFTERCARE_FIELDS,
  LIFESTYLE_SCORE_GROUPS,
  SESSION_BASE_FIELDS,
  TATTOO_DELTA_GROUPS,
} from './sessionPredictionFields'
import SessionPredictionLiveCalculator from './SessionPredictionLiveCalculator'
import useContent from '../../i18n/useContent'

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

const fmtCHF = (n) =>
  n == null ? '—' : `CHF ${Number(n).toLocaleString('de-CH')}`

const PlausibilityPanel = ({ report }) => {
  const { t, components } = useContent()
  const copy = components.sessionPrediction
  if (!report?.results?.length) return null
  return (
    <div className="border border-elaya-border rounded-[10px] px-3 py-3 bg-studio-bg-4">
      <p className="text-[12px] font-semibold m-0 mb-1">{copy.plausibilityTitle}</p>
      <p className="text-[11px] text-studio-w3 m-0 mb-3">{copy.plausibilityHint}</p>
      <div className="flex flex-col gap-2">
        {report.results.map((row) => (
          <div key={row.id} className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[12px] text-studio-w1">
              {row.pass ? '✓' : '✗'} {row.title}
            </span>
            <span className="text-[11px] text-studio-w3">
              {fmtCHF(row.got.price_per_session)} · {t('components.sessionPrediction.sessionsRange', { min: row.got.sessions_min, max: row.got.sessions_max })} ·{' '}
              {fmtCHF(row.got.total_min)}–{fmtCHF(row.got.total_max)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Shared editor for platform Sitzungsprognose parameters.
 * Admin: editable. Studio: pass disabled.
 * Live calculator shows effect of current `values` immediately.
 */
const SessionPredictionForm = ({
  values,
  onChange,
  disabled = false,
  plausibility = null,
  savedBaseline = null,
}) => {
  const { components } = useContent()
  const copy = components.sessionPrediction

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
        {copy.formulaHint}
      </p>

      {values ? (
        <SessionPredictionLiveCalculator values={values} savedBaseline={savedBaseline} />
      ) : null}

      <PlausibilityPanel report={plausibility} />

      <div>
        <p className="text-[12px] font-semibold m-0 mb-3">{copy.baseSection}</p>
        <FieldGrid>
          {SESSION_BASE_FIELDS.map(({ key, step, hintKey }) => (
            <NumberField
              key={key}
              id={`sp-${key}`}
              label={copy.base[key]}
              step={step}
              hint={hintKey ? copy.baseHints[hintKey] : undefined}
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
          <p className="text-[12px] font-semibold m-0 mb-3">{copy.tattooGroupTitles[group.key]}</p>
          <FieldGrid>
            {group.fields.map(({ key }) => (
              <NumberField
                key={key}
                id={`sp-delta-${group.key}-${key}`}
                label={copy.tattooFields[group.key]?.[key] || key}
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
        <p className="text-[12px] font-semibold m-0 mb-1">{copy.lifestyleComposite}</p>
        <p className="text-[11px] text-studio-w3 m-0 mb-3">
          {copy.lifestyleCompositeHint}
        </p>
      </div>

      {LIFESTYLE_SCORE_GROUPS.map((group) => (
        <div key={group.key}>
          <p className="text-[12px] font-semibold m-0 mb-3">{copy.lifestyleGroupTitles[group.key]}</p>
          <FieldGrid>
            {group.fields.map(({ key }) => (
              <NumberField
                key={key}
                id={`sp-life-${group.key}-${key}`}
                label={copy.lifestyleFields[group.key]?.[key] || key}
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
        <p className="text-[12px] font-semibold m-0 mb-3">{copy.lifestyleMultipliers}</p>
        <div className="flex flex-col gap-3">
          {(values?.lifestyle_bands || []).map((band, index) => (
            <div key={`band-${index}`} className="grid grid-cols-3 gap-3">
              <NumberField
                id={`sp-band-${index}-avg`}
                label={copy.avgUpTo}
                step="0.1"
                value={band.max_avg}
                onChange={(v) => setBand(index, 'max_avg', v)}
                disabled={disabled}
              />
              <NumberField
                id={`sp-band-${index}-score`}
                label={copy.score}
                step="1"
                value={band.score}
                onChange={(v) => setBand(index, 'score', v)}
                disabled={disabled}
              />
              <NumberField
                id={`sp-band-${index}-mult`}
                label={copy.multiplier}
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
        <p className="text-[12px] font-semibold m-0 mb-3">{copy.aftercareSection}</p>
        <FieldGrid>
          {AFTERCARE_FIELDS.map(({ key }) => (
            <NumberField
              key={key}
              id={`sp-aftercare-${key}`}
              label={copy.aftercareFields[key]}
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
