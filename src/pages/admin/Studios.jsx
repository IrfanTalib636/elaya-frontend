import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Card,
  PageHeader,
  Spinner,
  Button,
  Badge,
  Modal,
  EmptyState,
} from '../../components/ui'
import { listAdminStudios, patchStudioStatus } from '../../api/adminStudios'
import { getStudioConfigAdmin, updateStudioConfigAdmin } from '../../api/adminConfig'
import PricingConfigForm from '../../components/pricing/PricingConfigForm'
import {
  pricingValuesFromConfig,
  buildStudioPricing,
} from '../../components/pricing/pricingFields'

const AdminStudios = () => {
  const [loading, setLoading] = useState(true)
  const [studios, setStudios] = useState([])

  const [pricingStudio, setPricingStudio] = useState(null)
  const [pricingLoading, setPricingLoading] = useState(false)
  const [pricingSaving, setPricingSaving] = useState(false)
  const [pricingDefaults, setPricingDefaults] = useState(null)
  const [pricingValues, setPricingValues] = useState(() => pricingValuesFromConfig())

  const load = async () => {
    setLoading(true)
    try {
      const res = await listAdminStudios({ limit: 100 })
      const data = res.data.data
      setStudios(data.studios ?? data ?? [])
    } catch {
      toast.error('Studios konnten nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const setStatus = async (studio, status) => {
    try {
      await patchStudioStatus(studio.id || studio._id, status)
      toast.success('Status aktualisiert')
      load()
    } catch {
      toast.error('Status-Update fehlgeschlagen')
    }
  }

  const openPricing = async (studio) => {
    const id = studio.id || studio._id
    setPricingStudio(studio)
    setPricingLoading(true)
    try {
      const res = await getStudioConfigAdmin(id)
      const cfg = res.data.data.studio_config
      setPricingValues(pricingValuesFromConfig(cfg.studio_pricing))
      setPricingDefaults(cfg.pricing_defaults ?? null)
    } catch {
      toast.error('Preiskonfiguration konnte nicht geladen werden')
      setPricingStudio(null)
    } finally {
      setPricingLoading(false)
    }
  }

  const savePricing = async () => {
    if (!pricingStudio) return
    setPricingSaving(true)
    try {
      // studio_pricing replaces the whole override set — always send every filled key.
      await updateStudioConfigAdmin(pricingStudio.id || pricingStudio._id, {
        studio_pricing: buildStudioPricing(pricingValues),
      })
      toast.success('Preise gespeichert')
      setPricingStudio(null)
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Speichern fehlgeschlagen')
    } finally {
      setPricingSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-[1000px]">
      <PageHeader
        title="Studios"
        subtitle="Freigabe / Sperre · Paketverwaltung unter Features"
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : studios.length === 0 ? (
        <EmptyState title="Keine Studios" />
      ) : (
        <div className="space-y-3">
          {studios.map((s) => {
            const id = s.id || s._id
            return (
              <Card key={id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold m-0">{s.firma}</p>
                  <p className="text-[12px] text-admin-muted m-0">
                    {s.studio_code} · {s.email}
                  </p>
                  <Badge className="mt-1" variant="status" value={s.status}>
                    {s.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => openPricing(s)}>
                    Preise
                  </Button>
                  {s.status !== 'aktiv' ? (
                    <Button onClick={() => setStatus(s, 'aktiv')}>Aktivieren</Button>
                  ) : (
                    <Button variant="secondary" onClick={() => setStatus(s, 'gesperrt')}>
                      Sperren
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {pricingStudio ? (
        <Modal
          onClose={() => setPricingStudio(null)}
          title={`Preise · ${pricingStudio.firma ?? pricingStudio.studio_code ?? ''}`}
          width="max-w-2xl"
        >
          {pricingLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-4">
              <PricingConfigForm
                values={pricingValues}
                defaults={pricingDefaults}
                onChange={(key, value) =>
                  setPricingValues((prev) => ({ ...prev, [key]: value }))
                }
                disabled={pricingSaving}
              />
              <Button onClick={savePricing} loading={pricingSaving} className="w-full">
                Speichern
              </Button>
            </div>
          )}
        </Modal>
      ) : null}
    </div>
  )
}

export default AdminStudios
