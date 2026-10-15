import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import NumberStepper from '../ui/NumberStepper'
import useContent from '../../i18n/useContent'
import { LASER_COLORS } from './laserColors'

/**
 * Colour deltas of one laser = session_prediction.laser_color_overrides[laserId].
 * Edits are saved into the shared Prediction Engine DRAFT; LIVE changes only on publish.
 */
export default function LaserColorDeltasEditor({ values, liveValues, pending = false, disabled = false, onChange }) {
  const { adminPages, components, t } = useContent()
  const copy = adminPages.lasers || {}
  const colorLabels = components.sessionPrediction?.tattooFields?.color || {}

  return (
    <div className="flex flex-col gap-3 border-t border-elaya-border pt-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="m-0 text-[13px] font-semibold text-studio-white">{copy.colorDeltasTitle}</p>
          <p className="m-0 mt-1 text-[11px] text-studio-w3 max-w-[620px]">{copy.colorDeltasHint}</p>
        </div>
        <Link
          to="/admin/engine?view=admin&section=colors"
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-studio-gold-2"
        >
          {copy.reviewInEngine}
          <ArrowUpRight size={13} />
        </Link>
      </div>

      {pending ? (
        <p className="m-0 rounded-[10px] border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-[11px] text-amber-700">
          {copy.colorDraftPending}
        </p>
      ) : null}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {LASER_COLORS.map((color) => {
          const live = Number(liveValues?.[color] ?? 0)
          const value = values?.[color] ?? live
          const changed = Number(value) !== live
          return (
            <NumberStepper
              key={color}
              id={`laser-color-${color}`}
              label={colorLabels[color] || color}
              step="1"
              value={value}
              disabled={disabled}
              active={changed}
              hint={changed ? t('adminPages.lasers.liveValue', { value: live, defaultValue: `LIVE: ${live}` }) : undefined}
              hintTone={changed ? 'up' : 'neutral'}
              onChange={(next) => {
                const n = next === '' || next == null ? 0 : Number(next)
                onChange?.({ ...values, [color]: Number.isFinite(n) ? n : 0 })
              }}
            />
          )
        })}
      </div>
      {disabled ? <p className="m-0 text-[11px] text-studio-w3">{copy.colorDeltasSuperAdminOnly}</p> : null}
    </div>
  )
}
