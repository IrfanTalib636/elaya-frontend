import NumberStepper from '../ui/NumberStepper'
import useContent from '../../i18n/useContent'
import { useEngineCaseOptional } from './EngineCaseContext'
import { laserLabel } from './engineCaseModel'

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
      defaultValue: `${count} fewer session(s) with normal lifestyle`,
    }),
    tone: 'down',
  }
}

/** Per-laser colour matrix. Only the Case Simulator's laser and its colours are editable. */
const CaseLaserMatrix = ({ disabled = false }) => {
  const engineCase = useEngineCaseOptional()
  const { components, t } = useContent()
  const copy = components.sessionPrediction
  if (!engineCase?.lasers?.length) return null

  const selectedId = engineCase.selectedLaser?.id
  const caseColors = engineCase.form?.tc_colors_present || []
  const badge = t('components.sessionPrediction.activeInCase', {
    defaultValue: 'Active in current case',
  })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[12px] font-semibold m-0">
        {t('components.sessionPrediction.laserMatrixTitle', {
          defaultValue: 'Laser colour deltas',
        })}
      </p>
      {engineCase.lasers.map((laser) => {
        const activeLaser = laser.id === selectedId
        const drafts = engineCase.laserDrafts?.[laser.id] || {}
        return (
          <div
            key={laser.id}
            className={`rounded-[12px] border p-3 ${
              activeLaser ? 'border-studio-teal bg-studio-teal/5' : 'border-elaya-border opacity-60'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-[13px] font-semibold text-studio-white m-0">{laserLabel(laser)}</p>
              {activeLaser ? (
                <span className="shrink-0 rounded-full border border-studio-teal/50 bg-studio-teal/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-studio-teal">
                  {badge}
                </span>
              ) : null}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COLORS.map((color) => {
                const inCase = caseColors.includes(color)
                const editable = activeLaser && inCase && !disabled
                const raw = drafts[color] ?? laser.color_deltas?.[color] ?? 0
                const hint = deltaHintFor(raw, t)
                return (
                  <NumberStepper
                    key={color}
                    id={`laser-${laser.id}-${color}`}
                    label={copy.tattooFields?.color?.[color] || color}
                    step="1"
                    value={raw}
                    disabled={!editable}
                    active={editable}
                    hint={hint.text}
                    hintTone={hint.tone}
                    onChange={(next) => engineCase.setLaserColorDelta(laser.id, color, next)}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CaseLaserMatrix
