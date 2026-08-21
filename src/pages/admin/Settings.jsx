import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Card, PageHeader, Spinner, Button } from '../../components/ui'
import { getPlatformConfig, updatePlatformConfig } from '../../api/adminConfig'
import SessionPredictionForm from '../../components/sessionPrediction/SessionPredictionForm'
import {
  buildSessionPredictionPayload,
  cloneSessionPrediction,
} from '../../components/sessionPrediction/sessionPredictionFields'
import usePlatformConfigSocket from '../../hooks/usePlatformConfigSocket'

const AdminSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [values, setValues] = useState(null)
  const [savedBaseline, setSavedBaseline] = useState(null)
  const [plausibility, setPlausibility] = useState(null)

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    try {
      const res = await getPlatformConfig()
      const next = cloneSessionPrediction(res.data.data.platform_config?.session_prediction)
      setValues(next)
      setSavedBaseline(cloneSessionPrediction(next))
      setPlausibility(res.data.data.excel_plausibility || null)
    } catch {
      toast.error('Sitzungsprognose konnte nicht geladen werden')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  usePlatformConfigSocket({
    enabled: true,
    onSessionPredictionUpdated: () => {
      toast('Sitzungsprognose wurde aktualisiert — lade neu…', { icon: '↻' })
      load({ silent: true })
    },
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updatePlatformConfig({
        session_prediction: buildSessionPredictionPayload(values),
      })
      const next = cloneSessionPrediction(res.data.data.platform_config?.session_prediction)
      setValues(next)
      setSavedBaseline(cloneSessionPrediction(next))
      setPlausibility(res.data.data.excel_plausibility || null)
      toast.success('Sitzungsprognose gespeichert — Studio & Apps werden live aktualisiert')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Speichern fehlgeschlagen')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[960px]">
      <PageHeader
        title="Einstellungen"
        subtitle="Sitzungsprognose — Parameter ändern und im Live-Rechner sofort die Sitzungsrange sehen. Speichern übernimmt die Werte plattformweit (Socket)."
      />

      <Card className="flex flex-col gap-5">
        {values ? (
          <SessionPredictionForm
            values={values}
            onChange={setValues}
            plausibility={plausibility}
            savedBaseline={savedBaseline}
          />
        ) : (
          <p className="text-admin-muted text-[13px] m-0">Keine Parameter geladen.</p>
        )}
        <div className="flex justify-end pt-2 border-t border-admin-line">
          <Button loading={saving} onClick={handleSave} disabled={!values}>
            Speichern
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default AdminSettings
