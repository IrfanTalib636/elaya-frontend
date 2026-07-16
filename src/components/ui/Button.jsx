/**
 * Variants: primary | secondary | ghost | danger
 * Sizes:    sm | md | lg
 */
const VARIANTS = {
  primary:
    'bg-linear-to-br from-studio-gold-2 to-studio-gold text-white border-0 hover:opacity-90',
  secondary:
    'bg-studio-bg-4 text-studio-white border border-elaya-border-strong hover:bg-studio-bg-5 hover:border-studio-gold/40',
  ghost:
    'bg-transparent text-studio-w1 border-0 hover:text-studio-white hover:bg-studio-bg-4',
  danger:
    'bg-transparent text-studio-red border border-studio-red/30 hover:bg-studio-red/10',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-[11px] rounded-[8px]',
  md: 'px-4 py-[10px] text-[13px] rounded-[12px]',
  lg: 'px-6 py-[12px] text-[14px] rounded-[12px]',
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={`
      inline-flex items-center justify-center gap-2 font-semibold
      cursor-pointer transition-all select-none
      disabled:opacity-60 disabled:cursor-not-allowed
      ${VARIANTS[variant]}
      ${SIZES[size]}
      ${className}
    `}
    {...props}
  >
    {loading && (
      <span
        aria-hidden="true"
        className="shrink-0 w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
      />
    )}
    {children}
  </button>
)

export default Button
