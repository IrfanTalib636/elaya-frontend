import { Input } from '../ui'
import { PRICING_GROUPS } from './pricingFields'
import PricingLiveCalculator from './PricingLiveCalculator'
import useContent from '../../i18n/useContent'

/**
 * Full pricing editor (base prices + all multipliers), reused by
 * Studio-Einstellungen and the Admin per-studio pricing modal.
 *
 * `savedPricing` is the currently stored override set; passing it lets the live
 * calculator show saved → draft instead of only the draft price.
 */
const PricingConfigForm = ({
  values,
  defaults,
  onChange,
  disabled = false,
  savedPricing = null,
  studioId = null,
}) => {
  const { components } = useContent()
  const copy = components.pricing

  return (
    <div className="flex flex-col gap-5">
      <p className="text-studio-w3 text-[11px] m-0 border border-elaya-border rounded-[10px] px-3 py-2 bg-studio-bg-4">
        {copy.intro}
      </p>

      {/* Sticky so the price stays visible while scrolling through the factors
          further down — the whole point is seeing the effect of each edit. */}
      <div className="sticky top-0 z-10">
        <PricingLiveCalculator values={values} savedBaseline={savedPricing} studioId={studioId} />
      </div>

      {PRICING_GROUPS.map((group, i) => {
        const title = copy.groups[group.id] || group.title
        return (
          <div key={group.id || group.title}>
            {i > 0 && <div className="h-px bg-elaya-border mb-5" />}
            <p className="text-[12px] font-semibold text-studio-w2 m-0 mb-3">{title}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {group.fields.map(({ key, label, step }) => (
                <Input
                  key={key}
                  id={`pricing-${key}`}
                  label={copy.fields[key] || label}
                  type="number"
                  min={0}
                  step={step ?? '0.05'}
                  value={values?.[key] ?? ''}
                  onChange={(e) => onChange(key, e.target.value)}
                  placeholder={defaults?.[key] != null ? String(defaults[key]) : copy.platformDefault}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PricingConfigForm
