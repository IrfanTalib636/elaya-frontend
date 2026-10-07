import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import NumberStepper from '../ui/NumberStepper'
import EngineDisclosure from '../engine/EngineDisclosure'
import CaseLaserMatrix from '../engine/CaseLaserMatrix'
import { useEngineCaseOptional } from '../engine/EngineCaseContext'
import { caseBmi } from '../engine/engineCaseModel'
import {
  AFTERCARE_FIELDS,
  DEFAULT_BMI_FLOORS,
  LIFESTYLE_SCORE_GROUPS,
  SESSION_BASE_FIELDS,
  TATTOO_DELTA_GROUPS,
  TATTOO_GROUP_SECTION,
} from './sessionPredictionFields'
import useContent from '../../i18n/useContent'

const deltaHintFor = (value, t) => {
  const n = parseFloat(value)
  if (!Number.isFinite(n) || n === 0) {
    return {
      text: t('components.sessionPrediction.deltaNone', { defaultValue: 'No impact on sessions' }),
      tone: 'neutral',
    }
  }
  if (n > 0) {
    return {
      text: t('components.sessionPrediction.deltaMore', {
        count: n,
        defaultValue: `+${n} session(s) with normal lifestyle`,
      }),
      tone: 'up',
    }
  }
  const count = Math.abs(n)
  return {
    text: t('components.sessionPrediction.deltaLess', {
      count,
      defaultValue: `−${count} session(s) with normal lifestyle`,
    }),
    tone: 'down',
  }
}

const NumberField = ({
  id,
  label,
  value,
  onChange,
  disabled,
  step = '0.05',
  hint,
  effect = false,
  active = false,
  badge = null,
}) => {
  const { t } = useContent()
  const effectHint = effect ? deltaHintFor(value, t) : null
  return (
    <NumberStepper
      id={id}
      label={label}
      step={step}
      value={value ?? ''}
      onChange={onChange}
      disabled={disabled}
      hint={effectHint?.text || hint}
      hintTone={effectHint?.tone || 'neutral'}
      active={active}
      badge={badge}
    />
  )
}

const NOTE_AFTER_GROUP = {
  fitzpatrick: 'fitzpatrick',
  location: 'location',
  color: 'colors',
}

const FieldGrid = ({ children }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{children}</div>
)

/**
 * Super Admin editor for platform Sitzungsprognose parameters.
 * The case simulator covers live testing, so this form has no calculator
 * and no Excel reference list.
 *
 * `section` limits rendering to one engine nav section
 * — 'base' | 'colors' | 'fitzpatrick' | 'lifestyle' | 'healing'.
 */
const SessionPredictionForm = ({
  values,
  onChange,
  disabled = false,
  section = null,
}) => {
  const { components, t } = useContent()
  const copy = components.sessionPrediction
  const engineCase = useEngineCaseOptional()
  const activeKeys = engineCase?.activeKeys || null
  const caseBmiValue = engineCase?.form ? caseBmi(engineCase.form) : null
  const activeBadge = t('components.sessionPrediction.activeInCase', {
    defaultValue: 'Active in current case',
  })

  const show = (id) => !section || section === id
  const fieldActive = (group, key) => {
    if (!activeKeys || !activeKeys[group]) return true
    return activeKeys[group].includes(key)
  }

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

  const setBmiFloor = (index, key, value) => {
    const rows = values?.lifestyle_bmi_floors?.length
      ? values.lifestyle_bmi_floors
      : DEFAULT_BMI_FLOORS
    const next = rows.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    onChange({ ...values, lifestyle_bmi_floors: next })
  }

  return (
    <div className="flex flex-col gap-6">
      {engineCase && section && section !== 'base' ? (
        <p className="text-[11px] m-0 border border-studio-teal/30 rounded-[10px] px-3 py-2 bg-studio-teal/10 text-studio-w1">
          {t('components.sessionPrediction.caseBanner', {
            area: engineCase.area,
            laser: engineCase.laserName || '—',
            fitz: engineCase.form.skin_fitzpatrick_type,
            location: engineCase.form.tc_body_location_main,
            defaultValue: `Current case from the Case Simulator: ${engineCase.area} cm² · ${engineCase.laserName || '—'} · Fitzpatrick ${engineCase.form.skin_fitzpatrick_type} · ${engineCase.form.tc_body_location_main}`,
          })}
        </p>
      ) : null}
      {show('base') ? (
        <>
          <p className="text-[11px] m-0 border border-elaya-border rounded-[10px] px-3 py-2 bg-studio-bg-4 text-studio-w3">
            {copy.formulaHint}
          </p>

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
        </>
      ) : null}

      {section === 'colors' ? (
        <div className="rounded-[10px] border border-studio-gold/25 bg-studio-gold/5 px-3 py-2.5 flex items-start justify-between gap-3 flex-wrap">
          <p className="text-[11px] text-studio-w1 m-0 max-w-[520px]">
            {copy.colorLaserMatrixHint}
          </p>
          <Link
            to="/admin/lasers"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-studio-gold-2 whitespace-nowrap hover:underline"
          >
            {copy.colorLaserMatrixLink}
            <ArrowUpRight size={13} />
          </Link>
        </div>
      ) : null}

      {section === 'healing' ? (
        <div className="mb-4">
          <EngineDisclosure title={copy.notes?.healing?.title} lines={copy.notes?.healing?.lines} />
        </div>
      ) : null}

      {section === 'colors' ? (
        <>
          <CaseLaserMatrix disabled={disabled} />
          {engineCase?.selectedLaser ? (
            <EngineDisclosure title={copy.notes?.colors?.title} lines={copy.notes?.colors?.lines} />
          ) : null}
        </>
      ) : null}

      {TATTOO_DELTA_GROUPS.filter((group) => show(TATTOO_GROUP_SECTION[group.key]))
        .filter((group) => !(group.key === 'color' && engineCase?.selectedLaser))
        .map(
        (group, i) => (
          <div key={group.key}>
            {i > 0 || !section ? <div className="h-px bg-elaya-border mb-5" /> : null}
            <p className="text-[12px] font-semibold m-0 mb-3">{copy.tattooGroupTitles[group.key]}</p>
            <FieldGrid>
              {group.fields.map(({ key }) => {
                const active = fieldActive(group.key, key)
                return (
                  <NumberField
                    key={key}
                    id={`sp-delta-${group.key}-${key}`}
                    label={copy.tattooFields[group.key]?.[key] || key}
                    step="1"
                    effect
                    active={Boolean(activeKeys) && active}
                    badge={activeKeys && active ? activeBadge : null}
                    value={values?.tattoo_deltas?.[group.key]?.[key]}
                    onChange={(v) => setMap('tattoo_deltas', group.key, key, v)}
                    disabled={disabled || (activeKeys && !active)}
                  />
                )
              })}
            </FieldGrid>
            {NOTE_AFTER_GROUP[group.key] ? (
              <div className="mt-3">
                <EngineDisclosure
                  title={copy.notes?.[NOTE_AFTER_GROUP[group.key]]?.title}
                  lines={copy.notes?.[NOTE_AFTER_GROUP[group.key]]?.lines}
                />
              </div>
            ) : null}
          </div>
        )
      )}

      {show('lifestyle') ? (
        <>
          <div>
            {!section ? <div className="h-px bg-elaya-border mb-5" /> : null}
            <p className="text-[12px] font-semibold m-0 mb-1">{copy.lifestyleComposite}</p>
            <p className="text-[11px] text-studio-w3 m-0 mb-3">
              {copy.lifestyleCompositeHint}
            </p>
            <EngineDisclosure
              title={copy.notes?.lifestyleFactors?.title}
              lines={copy.notes?.lifestyleFactors?.lines}
            />
          </div>

          {LIFESTYLE_SCORE_GROUPS.map((group) => (
            <div key={group.key}>
              <p className="text-[12px] font-semibold m-0 mb-3">{copy.lifestyleGroupTitles[group.key]}</p>
              <FieldGrid>
                {group.fields.map(({ key }) => {
                  const active = fieldActive(group.key, key)
                  return (
                    <NumberField
                      key={key}
                      id={`sp-life-${group.key}-${key}`}
                      label={copy.lifestyleFields[group.key]?.[key] || key}
                      step="0.1"
                      active={Boolean(activeKeys) && active}
                      badge={activeKeys && active ? activeBadge : null}
                      value={values?.lifestyle_scores?.[group.key]?.[key]}
                      onChange={(v) => setMap('lifestyle_scores', group.key, key, v)}
                      disabled={disabled || (activeKeys && !active)}
                    />
                  )
                })}
              </FieldGrid>
            </div>
          ))}

          <div className="rounded-[12px] border border-elaya-border border-l-4 border-l-studio-teal bg-studio-bg-4 px-4 py-3">
            <p className="text-[12px] font-semibold text-studio-teal m-0 mb-2 uppercase tracking-wide">
              {copy.thresholdsTitle}
            </p>
            <p className="text-[12px] text-studio-w1 m-0 leading-relaxed">{copy.thresholdsIntro}</p>
            <p className="text-[12px] text-studio-w1 m-0 mt-2 leading-relaxed">{copy.thresholdsDefine}</p>
            <p className="text-[11px] font-semibold text-studio-teal m-0 mt-3 mb-1 uppercase tracking-wide">
              {copy.thresholdsExampleTitle}
            </p>
            <div className="text-[12px] text-studio-teal leading-relaxed">
              {(copy.thresholdsExamples || []).map((line) => (
                <p key={line} className="m-0">
                  {line}
                </p>
              ))}
            </div>
          </div>

          <EngineDisclosure
            title={copy.notes?.thresholdVsEffect?.title}
            lines={copy.notes?.thresholdVsEffect?.lines}
          />

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
            <p className="text-[12px] font-semibold m-0 mb-1">{copy.bmiFloorsTitle}</p>
            <p className="text-[11px] text-studio-w3 m-0 mb-3">{copy.bmiFloorsHint}</p>
            <div className="flex flex-col gap-3">
              {(values?.lifestyle_bmi_floors?.length
                ? values.lifestyle_bmi_floors
                : DEFAULT_BMI_FLOORS
              ).map((row, index) => {
                const applies =
                  caseBmiValue != null && caseBmiValue >= Number(row.min_bmi)
                return (
                <div key={`bmi-floor-${index}`} className="grid grid-cols-2 gap-3 max-w-[360px]">
                  <NumberField
                    id={`sp-bmi-floor-${index}-min`}
                    label={copy.bmiFloorMinBmi}
                    step="0.5"
                    value={row.min_bmi}
                    active={applies}
                    badge={applies ? activeBadge : null}
                    onChange={(v) => setBmiFloor(index, 'min_bmi', v)}
                    disabled={disabled}
                  />
                  <NumberField
                    id={`sp-bmi-floor-${index}-score`}
                    label={copy.bmiFloorMinScore}
                    step="1"
                    value={row.min_score}
                    onChange={(v) => setBmiFloor(index, 'min_score', v)}
                    disabled={disabled}
                  />
                </div>
                )
              })}
            </div>
          </div>
        </>
      ) : null}

      {show('healing') ? (
        <div>
          <div className="h-px bg-elaya-border mb-5" />
          <p className="text-[12px] font-semibold m-0 mb-3">{copy.aftercareSection}</p>
          <FieldGrid>
            {AFTERCARE_FIELDS.map(({ key }) => {
              const active = fieldActive('aftercare', key)
              return (
                <NumberField
                  key={key}
                  id={`sp-aftercare-${key}`}
                  label={copy.aftercareFields[key]}
                  step="1"
                  effect
                  active={Boolean(activeKeys) && active}
                  badge={activeKeys && active ? activeBadge : null}
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
                  disabled={disabled || (activeKeys && !active)}
                />
              )
            })}
          </FieldGrid>
        </div>
      ) : null}
    </div>
  )
}

export default SessionPredictionForm
