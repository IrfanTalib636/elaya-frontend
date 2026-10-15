import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import NumberStepper from '../ui/NumberStepper'
import useContent from '../../i18n/useContent'
import { LASER_COLORS, isLaserColorOverride } from './laserColors'

/**
 * Colour deltas of one laser. Unchanged values stay inherited from Engine Master Data
 * defaults. Only a colour the user changes is stored as an override for this laser.
 */
export default function LaserColorDeltasEditor({
  values,
  liveValues,
  defaultValues = {},
  pending = false,
  disabled = false,
  onChange,
}) {
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
          const fallback = Number(defaultValues?.[color] ?? 0)
          const live = Number(liveValues?.[color] ?? fallback)
          const value = values?.[color] ?? live
          const changed = Number(value) !== live
          const overridden = isLaserColorOverride(value, fallback)
          return (
            <div key={color} className="flex flex-col gap-1">
              <NumberStepper
                id={`laser-color-${color}`}
                label={colorLabels[color] || color}
                step="1"
                value={value}
                disabled={disabled}
                active={changed || overridden}
                badge={overridden ? copy.colorOverrideBadge : copy.colorInheritedBadge}
                badgeTone={overridden ? 'gold' : 'muted'}
                hint={
                  changed
                    ? t('adminPages.lasers.liveValue', { value: live, defaultValue: `LIVE: ${live}` })
                    : overridden
                      ? copy.colorOverrideHint
                      : copy.colorInheritedHint
                }
                hintTone={changed ? 'up' : 'neutral'}
                onChange={(next) => {
                  const n = next === '' || next == null ? fallback : Number(next)
                  onChange?.({ ...values, [color]: Number.isFinite(n) ? n : fallback })
                }}
              />
              {overridden && !disabled ? (
                <button
                  type="button"
                  className="self-start border-0 bg-transparent p-0 text-[11px] font-semibold text-studio-gold-2 cursor-pointer hover:underline"
                  onClick={() => onChange?.({ ...values, [color]: fallback })}
                >
                  {copy.colorUseDefault}
                </button>
              ) : null}
            </div>
          )
        })}
      </div>
      {disabled ? <p className="m-0 text-[11px] text-studio-w3">{copy.colorDeltasSuperAdminOnly}</p> : null}
    </div>
  )
}
