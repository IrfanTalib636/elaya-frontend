import { PageHeader } from '../../components/ui'
import MedicalLockoutsPanel from '../../components/settings/MedicalLockoutsPanel'
import ConfigLifecycleBar from '../../components/settings/ConfigLifecycleBar'
import useAdminConfigDomain from '../../hooks/useAdminConfigDomain'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../constants/roles'
import useContent from '../../i18n/useContent'
import { useTranslation } from 'react-i18next'

/**
 * Medical & Safety — Super Admin lockout / Sperrfristen control (prototype Medical page).
 */
const AdminMedical = () => {
  const { t } = useTranslation()
  const { adminPages } = useContent()
  const copy = adminPages.medical || {}
  const role = useAuthStore((s) => s.user?.role)
  const canEditRules = role === ROLES.SUPER_ADMIN

  const {
    lifecycleByDomain,
    panelEpoch,
    loadMedical,
    saveMedical,
    handleLifecyclePublished,
    handleDraftDiscarded,
  } = useAdminConfigDomain()

  const activeLifecycle = lifecycleByDomain.sperrfristen

  return (
    <div className="p-6 max-w-[860px]">
      <PageHeader
        title={copy.title || 'Medical & Safety'}
        subtitle={
          copy.subtitle ||
          'Platform lockout periods (Sperrfristen). Only Super Admin can edit; studios apply them at booking time.'
        }
      />

      <div className="flex flex-col gap-5">
        {canEditRules ? (
          <ConfigLifecycleBar
            domain="sperrfristen"
            canEdit={canEditRules}
            hasDraft={Boolean(activeLifecycle?.has_draft)}
            currentVersion={activeLifecycle?.current_version || 0}
            onPublished={() => void handleLifecyclePublished('sperrfristen')}
            onDraftDiscarded={(life) => handleDraftDiscarded('sperrfristen', life)}
          />
        ) : null}
        <MedicalLockoutsPanel
          key={`medical-${panelEpoch}`}
          canEdit={canEditRules}
          loadConfig={loadMedical}
          saveConfig={canEditRules ? saveMedical : undefined}
          saveLabel={t('adminPages.settings.saveDraft', {
            defaultValue: 'Save draft',
          })}
        />
      </div>
    </div>
  )
}

export default AdminMedical
