/**
 * Base card container. Use as a layout primitive.
 * padding: sm | md | lg | none
 */
const PADDING = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
}

const Card = ({ children, padding = 'md', className = '', ...props }) => (
  <div
    className={`
      bg-studio-bg-3 border border-elaya-border rounded-[15px]
      ${PADDING[padding]}
      ${className}
    `}
    {...props}
  >
    {children}
  </div>
)

export default Card
