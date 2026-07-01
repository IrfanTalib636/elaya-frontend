/**
 * Empty list / no results state.
 */
const EmptyState = ({ icon: Icon, title, description, children }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
    {Icon && <Icon size={36} className="text-studio-w4" />}
    <p className="text-studio-w1 font-semibold text-[14px] m-0">{title}</p>
    {description && (
      <p className="text-studio-w3 text-[12px] m-0 max-w-xs">{description}</p>
    )}
    {children}
  </div>
)

export default EmptyState
