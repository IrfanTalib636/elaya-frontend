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
  Input,
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
  const [groupForm, setGroupForm] = useState({
    klein_max_cm2: 50,
    mittelgross_max_cm2: 150,
    max_punkte: 4,
    gruppen_rabatt_pct: 15,
  })

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
      const gg = cfg.gruppen_groessen ?? {}
      setGroupForm({
        klein_max_cm2: gg.klein_max_cm2 ?? 50,
        mittelgross_max_cm2: gg.mittelgross_max_cm2 ?? 150,
        max_punkte: gg.max_punkte ?? 4,
        gruppen_rabatt_pct: Math.round((gg.gruppen_rabatt ?? 0.15) * 100),
      })
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
        gruppen_groessen: {
          klein_max_cm2: Number(groupForm.klein_max_cm2),
          mittelgross_max_cm2: Number(groupForm.mittelgross_max_cm2),
          max_punkte: Number(groupForm.max_punkte),
          gruppen_rabatt: Number(groupForm.gruppen_rabatt_pct) / 100,
        },
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
              <div className="space-y-2 pt-2 border-t border-elaya-border">
                <p className="text-[13px] font-semibold m-0">{copy.groupTitle}</p>
                <p className="text-[12px] text-admin-muted m-0">{copy.groupDesc}</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={copy.groupSmallMax}
                    type="number"
                    min={1}
                    value={groupForm.klein_max_cm2}
                    onChange={(e) => setGroupForm((p) => ({ ...p, klein_max_cm2: e.target.value }))}
                    disabled={pricingSaving}
                  />
                  <Input
                    label={copy.groupMediumMax}
                    type="number"
                    min={1}
                    value={groupForm.mittelgross_max_cm2}
                    onChange={(e) => setGroupForm((p) => ({ ...p, mittelgross_max_cm2: e.target.value }))}
                    disabled={pricingSaving}
                  />
                  <Input
                    label={copy.groupMaxPoints}
                    type="number"
                    min={1}
                    max={16}
                    value={groupForm.max_punkte}
                    onChange={(e) => setGroupForm((p) => ({ ...p, max_punkte: e.target.value }))}
                    disabled={pricingSaving}
                  />
                  <Input
                    label={copy.groupDiscount}
                    type="number"
                    min={0}
                    max={100}
                    value={groupForm.gruppen_rabatt_pct}
                    onChange={(e) => setGroupForm((p) => ({ ...p, gruppen_rabatt_pct: e.target.value }))}
                    disabled={pricingSaving}
                  />
                </div>
              </div>
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
