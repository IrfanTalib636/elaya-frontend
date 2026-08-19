import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Card, PageHeader, Spinner, Button } from '../../components/ui'
import { getPlatformConfig, updatePlatformConfig } from '../../api/adminConfig'
import SessionPredictionForm from '../../components/sessionPrediction/SessionPredictionForm'
import {
  buildSessionPredictionPayload,
  cloneSessionPrediction,
} from '../../components/sessionPrediction/sessionPredictionFields'

const AdminSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [values, setValues] = useState(null)
  const [plausibility, setPlausibility] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getPlatformConfig()
      setValues(cloneSessionPrediction(res.data.data.platform_config?.session_prediction))
      setPlausibility(res.data.data.excel_plausibility || null)
    } catch {
      toast.error('Sitzungsprognose konnte nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updatePlatformConfig({
        session_prediction: buildSessionPredictionPayload(values),
      })
      setValues(cloneSessionPrediction(res.data.data.platform_config?.session_prediction))
      setPlausibility(res.data.data.excel_plausibility || null)
      toast.success('Sitzungsprognose gespeichert')
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
        subtitle="Sitzungsprognose — nur Admin darf diese Parameter ändern. Sie fliessen automatisch in Preis- und Sitzungsschätzung bei Case-Erstellung ein."
      />

      <Card className="flex flex-col gap-5">
        {values ? (
          <SessionPredictionForm values={values} onChange={setValues} plausibility={plausibility} />
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
