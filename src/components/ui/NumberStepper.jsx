import { ChevronDown, ChevronUp } from 'lucide-react'
import useContent from '../../i18n/useContent'

export function stepNumber(value, step, direction, min) {
  const delta = Number(step)
  const d = Number.isFinite(delta) && delta !== 0 ? Math.abs(delta) : 1
  const current =
    value === '' || value == null || !Number.isFinite(Number(value)) ? 0 : Number(value)
  const places = String(d).includes('.') ? String(d).split('.')[1].length : 0
  let next = Number((current + direction * d).toFixed(places))
  if (min != null && min !== '' && Number.isFinite(Number(min)) && next < Number(min)) {
    next = Number(min)
  }
  return next
}

/**
 * Number field with up and down controls. One click moves the value by `step`.
 */
const NumberStepper = ({
  label,
  error,
  hint,
  className = '',
  id,
  value,
  onChange,
  step = 1,
  min,
  disabled = false,
  inputClassName = '',
}) => {
  const { t } = useContent()
  const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  const bump = (direction) => {
    if (disabled) return
    onChange(String(stepNumber(value, step, direction, min)))
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label ? (
        <label htmlFor={fieldId} className="text-studio-white text-[12px] font-semibold">
          {label}
        </label>
      ) : null}
      <div
        className={`flex items-stretch rounded-[10px] border-[1.5px] bg-studio-bg-3 overflow-hidden ${
          error ? 'border-studio-red' : 'border-elaya-border-strong focus-within:border-studio-gold'
        } ${disabled ? 'opacity-60' : ''}`}
      >
        <input
          id={fieldId}
          type="number"
          step={step}
          min={min}
          disabled={disabled}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={`min-w-0 flex-1 px-[14px] py-[10px] bg-transparent text-studio-white text-[13px] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${inputClassName}`}
        />
        <div className="flex flex-col border-l border-elaya-border shrink-0">
          <button
            type="button"
            disabled={disabled}
            aria-label={t('common.increase', { defaultValue: 'Increase' })}
            onClick={() => bump(1)}
            className="flex flex-1 items-center justify-center px-1.5 text-studio-w2 hover:text-studio-white hover:bg-studio-bg-4 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            disabled={disabled}
            aria-label={t('common.decrease', { defaultValue: 'Decrease' })}
            onClick={() => bump(-1)}
            className="flex flex-1 items-center justify-center px-1.5 text-studio-w2 hover:text-studio-white hover:bg-studio-bg-4 disabled:cursor-not-allowed border-0 border-t border-elaya-border bg-transparent cursor-pointer"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
      {error ? <p className="text-studio-red text-[11px] m-0">{error}</p> : null}
      {hint && !error ? <p className="text-studio-w3 text-[11px] m-0">{hint}</p> : null}
    </div>
  )
}

export default NumberStepper
