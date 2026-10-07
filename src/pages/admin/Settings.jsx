import { PageHeader } from '../../components/ui'
import AppearanceSettings from '../../components/settings/AppearanceSettings'
import useContent from '../../i18n/useContent'
import { Link } from 'react-router-dom'

/**
 * Admin Settings — appearance / account preferences.
 * Pricing, session prediction → Engine. Medical lockouts → Medical & Safety.
 */
const AdminSettings = () => {
  const { adminPages } = useContent()
  const copy = adminPages.settings

  return (
    <div className="p-6 max-w-[860px]">
      <PageHeader
        title={copy.title}
        subtitle={copy.appearanceOnlySubtitle}
      />

      <div className="mb-5 rounded-[12px] border border-elaya-border bg-studio-bg-4 px-4 py-3 text-[12px] text-studio-w1 flex flex-wrap gap-x-4 gap-y-2">
        <Link to="/admin/engine" className="text-studio-gold-2 no-underline hover:underline">
          {copy.engineLink}
        </Link>
        <Link to="/admin/medical" className="text-studio-gold-2 no-underline hover:underline">
          {copy.medicalLink}
        </Link>
      </div>

      <AppearanceSettings />
    </div>
  )
}

export default AdminSettings
