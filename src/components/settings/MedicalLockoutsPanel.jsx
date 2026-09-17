import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Button, Card, Input, Spinner } from '../ui'
import { getApiErrorMessage } from '../../lib/apiError'

const SPERRFRIST_FIELDS = [
  { key: 'same_case_tage', i18n: 'sameCase' },
  { key: 'cross_case_tage', i18n: 'crossCase' },
  { key: 'uv_mittel_tage', i18n: 'uvModerate' },
  { key: 'uv_intensiv_tage', i18n: 'uvIntense' },
  { key: 'medikament_kurz_tage', i18n: 'medShort' },
  { key: 'medikament_retinoide_tage', i18n: 'medRetinoids' },
]

/**
 * Platform medical lockouts (Sperrfristen) — super-admin editable.
 */
export default function MedicalLockoutsPanel({
  canEdit = false,
  loadConfig,
  saveConfig,
  saveLabel,
}) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [values, setValues] = useState({})
  const [baseline, setBaseline] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await loadConfig()
      const next = { ...(data?.sperrfristen || {}) }
      setValues(next)
      setBaseline(next)
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('settings.loadFailed')))
    } finally {
      setLoading(false)
    }
  }, [loadConfig, t])

  useEffect(() => {
    void load()
  }, [load])

  const dirty = SPERRFRIST_FIELDS.some(
    ({ key }) => String(values[key] ?? '') !== String(baseline[key] ?? '')
  )

  const handleSave = async () => {
    if (!canEdit || !saveConfig) return
    setSaving(true)
    try {
      const payload = Object.fromEntries(
        SPERRFRIST_FIELDS.map(({ key }) => [key, Number(values[key])]).filter(([, n]) =>
          Number.isFinite(n)
        )
      )
      const data = await saveConfig({ sperrfristen: payload })
      const next = { ...(data?.sperrfristen || payload) }
      setValues(next)
      setBaseline(next)
      toast.success(
        t('adminPages.settings.draftSaved', { defaultValue: t('settings.saved') })
      )
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('settings.saveFailed')))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="m-0 text-[15px] font-semibold text-studio-white">
            {t('settingsPage.bookingRules.lockoutsTitle')}
          </h3>
          <p className="m-0 mt-1 text-[12px] text-studio-w2">
            {t('adminPages.settings.medicalLockoutsDesc', {
              defaultValue:
                'Global medical lockout periods (same case, cross case, UV, medication). Studios can view these but cannot change them. Save as draft, then publish to go live.',
            })}
          </p>
        </div>
        {canEdit ? (
          <Button
            size="sm"
            disabled={!dirty || saving}
            loading={saving}
            onClick={() => void handleSave()}
          >
            {saveLabel || t('common.save')}
          </Button>
        ) : (
          <p className="m-0 text-[11px] text-studio-w3">
            {t('adminPages.settings.superAdminOnly', {
              defaultValue: 'Only Super Admin can edit',
            })}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SPERRFRIST_FIELDS.map(({ key, i18n }) => (
          <Input
            key={key}
            label={t(`settingsPage.bookingRules.lockouts.${i18n}`)}
            type="number"
            min={0}
            value={values[key] ?? ''}
            hint={t('settingsPage.bookingRules.units.days')}
            disabled={!canEdit || saving}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, [key]: e.target.value }))
            }
          />
        ))}
      </div>
    </Card>
  )
}
