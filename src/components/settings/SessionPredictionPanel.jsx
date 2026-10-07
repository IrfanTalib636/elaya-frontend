import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Card, Button, Spinner } from '../ui'
import SessionPredictionForm from '../sessionPrediction/SessionPredictionForm'
import {
  buildSessionPredictionPayload,
  cloneSessionPrediction,
} from '../sessionPrediction/sessionPredictionFields'
import usePlatformConfigSocket from '../../hooks/usePlatformConfigSocket'

/**
 * Super Admin editor for platform session-prediction parameters.
 * Studios do not see this panel. Live testing is the Case Simulator.
 */
export default function SessionPredictionPanel({
  canEdit = false,
  loadConfig,
  saveConfig,
  saveLabel,
  section = null,
  title = null,
  description = null,
  onPreviewValues = null,
}) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [values, setValues] = useState(null)

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true)
      try {
        const data = await loadConfig()
        const next = cloneSessionPrediction(data.session_prediction)
        setValues(next)
      } catch {
        toast.error(t('settingsPage.sessions.toasts.loadFailed'))
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [loadConfig, t]
  )

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (loading || !values || !onPreviewValues) return
    onPreviewValues(buildSessionPredictionPayload(values))
  }, [loading, values, onPreviewValues])

  usePlatformConfigSocket({
    enabled: true,
    onSessionPredictionUpdated: () => {
      toast(t('settingsPage.sessions.toasts.adminUpdated'), { icon: '↻' })
      void load({ silent: true })
    },
  })

  const handleSave = async () => {
    if (!canEdit || !saveConfig || !values) return
    setSaving(true)
    try {
      const data = await saveConfig({
        session_prediction: buildSessionPredictionPayload(values),
      })
      const next = cloneSessionPrediction(data?.session_prediction || values)
      setValues(next)
      toast.success(
        t('adminPages.settings.draftSaved', {
          defaultValue: t('settingsPage.sessions.toasts.saved', {
            defaultValue: t('settings.save'),
          }),
        })
      )
    } catch (err) {
      toast.error(err?.response?.data?.message || t('settingsPage.shared.saveFailedFallback'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  return (
    <Card className="flex flex-col gap-5">
      <div className="border-b border-elaya-border pb-4">
        <h2 className="text-[15px] font-bold text-studio-white m-0">
          {title || t('settingsPage.sessions.title')}
        </h2>
        <p className="text-studio-w3 text-[12px] m-0 mt-1">
          {description || t('settingsPage.sessions.desc')}
        </p>
      </div>

      <p className="text-studio-w3 text-[11px] m-0 border border-elaya-border rounded-[10px] px-3 py-2 bg-studio-bg-4">
        {canEdit
          ? t('settingsPage.sessions.adminEditHint', {
              defaultValue:
                'Save a draft first, then publish with a reason. Studios only see published rules.',
            })
          : t('settingsPage.sessions.viewOnlyHint')}
      </p>

      {values && Object.keys(values).length > 0 ? (
        <SessionPredictionForm
          values={values}
          onChange={canEdit ? setValues : () => {}}
          disabled={!canEdit}
          section={section}
        />
      ) : (
        <p className="text-studio-w2 text-[12px] m-0">{t('settingsPage.sessions.noParameters')}</p>
      )}

      {canEdit ? (
        <div className="flex justify-end pt-2 border-t border-elaya-border">
          <Button loading={saving} onClick={handleSave} disabled={!values}>
            {saveLabel || t('settings.save')}
          </Button>
        </div>
      ) : null}
    </Card>
  )
}
