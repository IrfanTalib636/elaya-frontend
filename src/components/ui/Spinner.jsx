/**
 * sizes: sm | md | lg
 */
const SIZES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
}

const Spinner = ({ size = 'md', className = '' }) => (
  <span
    className={`
      inline-block rounded-full border-studio-gold/30 border-t-studio-gold-2
      animate-spin ${SIZES[size]} ${className}
    `}
  />
)

export default Spinner
