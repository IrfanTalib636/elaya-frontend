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
import useContent from '../../i18n/useContent'

const AdminStudios = () => {
  const { t, adminPages } = useContent()
  const copy = adminPages.studios
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
      toast.error(copy.loadError)
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
      toast.success(copy.statusUpdated)
      load()
    } catch {
      toast.error(copy.statusUpdateFailed)
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
      toast.error(copy.pricingLoadError)
      setPricingStudio(null)
    } finally {
      setPricingLoading(false)
    }
  }

  const savePricing = async () => {
    if (!pricingStudio) return
    setPricingSaving(true)
    try {
      await updateStudioConfigAdmin(pricingStudio.id || pricingStudio._id, {
        studio_pricing: buildStudioPricing(pricingValues),
      })
      toast.success(copy.pricingSaved)
      setPricingStudio(null)
    } catch (e) {
      toast.error(e?.response?.data?.message || copy.saveFailed)
    } finally {
      setPricingSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-[1000px]">
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : studios.length === 0 ? (
        <EmptyState title={copy.empty} />
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
                    {copy.prices}
                  </Button>
                  {s.status !== 'aktiv' ? (
                    <Button onClick={() => setStatus(s, 'aktiv')}>{copy.activate}</Button>
                  ) : (
                    <Button variant="secondary" onClick={() => setStatus(s, 'gesperrt')}>
                      {copy.lock}
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
          title={t('adminPages.studios.pricingModalTitle', {
            name: pricingStudio.firma ?? pricingStudio.studio_code ?? '',
          })}
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
                {copy.save}
              </Button>
            </div>
          )}
        </Modal>
      ) : null}
    </div>
  )
}

export default AdminStudios
