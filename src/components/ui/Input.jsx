/**
 * Consistent text input matching the auth form style.
 * Pass `label`, `error`, `hint` as props for the field wrapper.
 */
const Input = ({
  label,
  error,
  hint,
  className = '',
  id,
  ...props
}) => {
  const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={fieldId} className="text-studio-white text-[12px] font-semibold">
          {label}
        </label>
      )}
      <input
        id={fieldId}
        className={`
          w-full px-[14px] py-[10px] rounded-[10px]
          border-[1.5px] bg-studio-bg-3
          text-studio-white text-[13px] outline-none
          transition-colors placeholder:text-studio-w3
          ${error
            ? 'border-studio-red focus:border-studio-red'
            : 'border-elaya-border-strong focus:border-studio-gold'
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-studio-red text-[11px] m-0">{error}</p>}
      {hint && !error && <p className="text-studio-w3 text-[11px] m-0">{hint}</p>}
    </div>
  )
}

export default Input
