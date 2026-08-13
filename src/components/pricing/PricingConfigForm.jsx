import { Input } from '../ui'
import { PRICING_GROUPS } from './pricingFields'

/**
 * Full pricing editor (base prices + all multipliers), reused by
 * Studio-Einstellungen and the Admin per-studio pricing modal.
 */
const PricingConfigForm = ({ values, defaults, onChange, disabled = false }) => (
  <div className="flex flex-col gap-5">
    <p className="text-studio-w3 text-[11px] m-0 border border-elaya-border rounded-[10px] px-3 py-2 bg-studio-bg-4">
      Diese Werte steuern die KI-Preisberechnung und die Sitzungsschätzung für die Kunden
      dieses Studios. Leere Felder verwenden den Plattform-Standard.
    </p>

    {PRICING_GROUPS.map((group, i) => (
      <div key={group.title}>
        {i > 0 && <div className="h-px bg-elaya-border mb-5" />}
        <p className="text-[12px] font-semibold text-studio-w2 m-0 mb-3">{group.title}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {group.fields.map(({ key, label, step }) => (
            <Input
              key={key}
              id={`pricing-${key}`}
              label={label}
              type="number"
              min={0}
              step={step ?? '0.05'}
              value={values?.[key] ?? ''}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={defaults?.[key] != null ? String(defaults[key]) : 'Plattform-Standard'}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
)

export default PricingConfigForm
