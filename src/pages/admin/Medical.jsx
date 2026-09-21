import { useState } from 'react'
import { PageHeader } from '../../components/ui'
import MedicalLockoutsPanel from '../../components/settings/MedicalLockoutsPanel'
import ConfigLifecycleBar from '../../components/settings/ConfigLifecycleBar'
import useAdminConfigDomain from '../../hooks/useAdminConfigDomain'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../constants/roles'
import useContent from '../../i18n/useContent'
import { useTranslation } from 'react-i18next'

/**
 * Medical & Safety — Super Admin lockout / Sperrfristen control (prototype parity).
 */
const AdminMedical = () => {
  const { t } = useTranslation()
  const { adminPages } = useContent()
  const copy = adminPages.medical || {}
  const role = useAuthStore((s) => s.user?.role)
  const canEditRules = role === ROLES.SUPER_ADMIN
  const [editing, setEditing] = useState(false)

  const {
    lifecycleByDomain,
    panelEpoch,
    loadMedical,
    saveMedical,
    handleLifecyclePublished,
    handleDraftDiscarded,
    loadPlatformBundle,
  } = useAdminConfigDomain()

  const activeLifecycle = lifecycleByDomain.sperrfristen
  const isEditing = editing || Boolean(activeLifecycle?.has_draft)

  const refreshLifecycle = async () => {
    const { lifecycle } = await loadPlatformBundle()
    if (lifecycle?.sperrfristen) {
      handleDraftDiscarded('sperrfristen', lifecycle.sperrfristen)
    }
  }

  return (
    <div className="p-6 max-w-[1100px]">
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
            onPublished={() => {
              void handleLifecyclePublished('sperrfristen')
              setEditing(false)
            }}
            onDraftDiscarded={(life) => {
              handleDraftDiscarded('sperrfristen', life)
              setEditing(false)
            }}
          />
        ) : null}

        <MedicalLockoutsPanel
          key={`medical-${panelEpoch}`}
          canEdit={canEditRules}
          editing={isEditing}
          currentVersion={activeLifecycle?.current_version || 0}
          hasDraft={Boolean(activeLifecycle?.has_draft)}
          loadConfig={loadMedical}
          saveConfig={canEditRules ? saveMedical : undefined}
          saveLabel={t('adminPages.settings.saveDraft', {
            defaultValue: 'Save draft',
          })}
          onEnterEdit={() => setEditing(true)}
          onRequestLifecycleRefresh={() => void refreshLifecycle()}
        />
      </div>
    </div>
  )
}

export default AdminMedical
