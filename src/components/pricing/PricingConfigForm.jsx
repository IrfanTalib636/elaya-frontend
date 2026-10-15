import { ENGINE_PRICING_GROUPS, PRICING_GROUPS } from './pricingFields'
import NumberStepper from '../ui/NumberStepper'
import EngineDisclosure from '../engine/EngineDisclosure'
import useContent from '../../i18n/useContent'

const PricingConfigForm = ({
  values,
  onChange,
  disabled = false,
  includeEngineRules = false,
}) => {
  const { components } = useContent()
  const copy = components.pricing
  const groups = includeEngineRules ? [...PRICING_GROUPS, ...ENGINE_PRICING_GROUPS] : PRICING_GROUPS

  return (
    <div className="@container flex flex-col gap-5 min-w-0">
      <p className="text-studio-w3 text-[11px] m-0 border border-elaya-border rounded-[10px] px-3 py-2 bg-studio-bg-4">
        {copy.intro}
      </p>

      {groups.map((group, i) => {
        const title = copy.groups[group.id] || group.title
        return (
          <div key={group.id || group.title}>
            {i > 0 && <div className="h-px bg-elaya-border mb-5" />}
            <p className="text-[12px] font-semibold text-studio-w2 m-0 mb-3">{title}</p>
            <div className="grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 gap-3">
              {group.fields.map(({ key, label, step }) => (
                <NumberStepper
                  key={key}
                  id={`pricing-${key}`}
                  label={copy.fields[key] || label}
                  min={0}
                  step={step ?? '0.05'}
                  value={values?.[key] ?? ''}
                  onChange={(next) => onChange(key, next)}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        )
      })}

      <EngineDisclosure title={copy.priceHowTitle} lines={copy.priceHowLines} />
    </div>
  )
}

export default PricingConfigForm
