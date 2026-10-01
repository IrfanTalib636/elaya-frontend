import { Input } from '../ui'
import { PRICING_GROUPS } from './pricingFields'
import PricingLiveCalculator from './PricingLiveCalculator'
import useContent from '../../i18n/useContent'

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
    <div className="@container">
      <div className="grid grid-cols-1 @lg:grid-cols-[minmax(0,1fr)_280px] gap-5 items-start">
        <div className="flex flex-col gap-5 min-w-0">
          <p className="text-studio-w3 text-[11px] m-0 border border-elaya-border rounded-[10px] px-3 py-2 bg-studio-bg-4">
            {copy.intro}
          </p>

          {PRICING_GROUPS.map((group, i) => {
            const title = copy.groups[group.id] || group.title
            return (
              <div key={group.id || group.title}>
                {i > 0 && <div className="h-px bg-elaya-border mb-5" />}
                <p className="text-[12px] font-semibold text-studio-w2 m-0 mb-3">{title}</p>
                <div className="grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 gap-3">
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
                      placeholder={
                        defaults?.[key] != null ? String(defaults[key]) : copy.platformDefault
                      }
                      disabled={disabled}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <aside className="order-first @lg:order-none @lg:sticky @lg:top-4 @lg:max-h-[calc(100vh-2rem)] @lg:overflow-y-auto min-w-0">
          <PricingLiveCalculator
            values={values}
            savedBaseline={savedPricing}
            studioId={studioId}
          />
        </aside>
      </div>
    </div>
  )
}

export default PricingConfigForm
