import { PageHeader } from '../../components/ui'
import useContent from '../../i18n/useContent'

/**
 * Placeholder for prototype sections that are not wired to APIs yet.
 */
const AdminComingSoon = ({ title, subtitle, sectionId }) => {
  const { adminNav, adminPages } = useContent()
  const section = sectionId ? adminPages?.[sectionId] : null
  const heading = title || section?.title || adminNav.contentPlaceholder
  const sub = subtitle || section?.subtitle || adminNav.contentPlaceholder

  return (
    <div className="max-w-[960px]">
      <PageHeader title={heading} subtitle={sub} />
      <div className="rounded-2xl border border-elaya-border bg-studio-bg-3 p-6 mt-2">
        <p className="text-studio-w2 text-[14px] m-0 leading-relaxed">
          {adminNav.comingSoonBody}
        </p>
      </div>
    </div>
  )
}

export default AdminComingSoon
