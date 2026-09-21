import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Card, Spinner } from '../ui'
import { getStudioConfig, updateStudioConfig } from '../../api/config'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../constants/roles'

/**
 * Studio Automations — view all rules; edit aktiv + days only when editierbar_studio.
 */
const AutomationsTab = () => {
  const { t, i18n } = useTranslation()
  const isDe = (i18n.language || 'en').startsWith('de')
  const role = useAuthStore((s) => s.user?.role)
  const canEdit = role === ROLES.STUDIO_ADMIN || role === ROLES.SUPER_ADMIN

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [kategorien, setKategorien] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getStudioConfig()
      const auto = res.data.data.studio_config?.automatisierungen || {}
      setKategorien(Array.isArray(auto.kategorien) ? auto.kategorien : [])
    } catch {
      toast.error(t('settings.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  const patchRule = async (ruleId, patch) => {
    if (!canEdit) return
    setSaving(true)
    try {
      const res = await updateStudioConfig({
        automatisierungen_overrides: { [ruleId]: patch },
      })
      const auto = res.data.data.studio_config?.automatisierungen || {}
      setKategorien(Array.isArray(auto.kategorien) ? auto.kategorien : [])
      toast.success(t('settings.saved'))
    } catch (err) {
      toast.error(err?.response?.data?.message ?? t('settings.saveFailed'))
      await load()
    } finally {
      setSaving(false)
    }
  }

  const labelOf = (item) => (isDe ? item.label_de : item.label_en) || item.label_de
  const descOf = (r) =>
    (isDe ? r.beschreibung_de : r.beschreibung_en) || r.beschreibung_de || ''

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="m-0 text-[13px] font-semibold text-studio-white">
          {t('settingsPage.automations.title', { defaultValue: 'Automations' })}
        </p>
        <p className="m-0 mt-2 text-[12px] text-studio-w2 leading-relaxed">
          {t('settingsPage.automations.intro', {
            defaultValue:
              'Automations send automatic chat messages to customers. Rules are managed by Elaya. You can turn studio-editable rules on/off and adjust their days value — creating or deleting rules is reserved for platform admin.',
          })}
        </p>
      </Card>

      {kategorien.length === 0 ? (
        <Card>
          <p className="m-0 text-[13px] text-studio-w2 text-center py-4">
            {t('settingsPage.automations.empty', { defaultValue: 'No automation rules yet.' })}
          </p>
        </Card>
      ) : (
        kategorien.map((kat) => {
          const regeln = kat.regeln || []
          const onCount = regeln.filter((r) => r.aktiv !== false).length
          return (
            <Card key={kat.id} padding="none">
              <div className="px-4 py-3 border-b border-elaya-border flex justify-between items-center">
                <span className="text-[11px] font-mono uppercase tracking-wide text-studio-gold-2">
                  {labelOf(kat)}
                </span>
                <span className="text-[11px] text-studio-w3">
                  {onCount}/{regeln.length}{' '}
                  {t('settingsPage.automations.active', { defaultValue: 'active' })}
                </span>
              </div>
              <div className="divide-y divide-elaya-border">
                {regeln.map((r) => {
                  const isOn = r.aktiv !== false
                  const editable = r.editierbar_studio !== false && canEdit
                  return (
                    <div
                      key={r.id}
                      className={`px-4 py-3 flex items-start justify-between gap-3 ${
                        editable ? '' : 'opacity-80'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={`m-0 text-[13px] font-semibold ${
                            isOn ? 'text-studio-white' : 'text-studio-w3'
                          }`}
                        >
                          {labelOf(r)}
                        </p>
                        <p className="m-0 mt-0.5 text-[11px] text-studio-w3 leading-relaxed">
                          {descOf(r)}
                        </p>
                        {r.hat_tage_feld ? (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[11px] text-studio-w2">
                              {t('settingsPage.automations.days', { defaultValue: 'Days' })}:
                            </span>
                            <input
                              type="number"
                              min={r.tage_min ?? 1}
                              max={r.tage_max ?? 365}
                              className="w-[64px] rounded-[8px] border border-elaya-border bg-studio-bg-4 text-studio-white text-[12px] px-2 py-1 disabled:opacity-50"
                              value={r.tage_wert ?? ''}
                              disabled={!editable || saving}
                              onChange={(e) => {
                                const v = parseInt(e.target.value, 10)
                                if (!Number.isNaN(v)) void patchRule(r.id, { wert: v })
                              }}
                            />
                          </div>
                        ) : null}
                        {!r.editierbar_studio ? (
                          <p className="m-0 mt-2 text-[10px] text-studio-w3">
                            🔒{' '}
                            {t('settingsPage.automations.locked', {
                              defaultValue: 'Managed centrally by Elaya',
                            })}
                          </p>
                        ) : null}
                      </div>
                      <label
                        className={`flex flex-col items-center gap-1 shrink-0 ${
                          editable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isOn}
                          disabled={!editable || saving}
                          onChange={(e) => void patchRule(r.id, { aktiv: e.target.checked })}
                          className="accent-studio-teal w-4 h-4"
                        />
                        <span
                          className={`text-[10px] font-bold ${
                            isOn ? 'text-studio-teal-2' : 'text-studio-w3'
                          }`}
                        >
                          {isOn
                            ? t('settingsPage.automations.on', { defaultValue: 'ON' })
                            : t('settingsPage.automations.off', { defaultValue: 'OFF' })}
                        </span>
                      </label>
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        })
      )}
    </div>
  )
}

export default AutomationsTab
