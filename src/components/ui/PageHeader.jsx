/**
 * Consistent page header — title + optional subtitle + right-side actions.
 */
const PageHeader = ({ title, subtitle, children }) => (
  <div className="flex items-start justify-between gap-4 mb-6">
    <div>
      <h1 className="text-[20px] font-bold text-studio-white m-0 leading-tight">{title}</h1>
      {subtitle && (
        <p className="text-studio-w2 text-[13px] m-0 mt-0.5">{subtitle}</p>
      )}
    </div>
    {children && (
      <div className="flex items-center gap-2 shrink-0">{children}</div>
    )}
  </div>
)

export default PageHeader
