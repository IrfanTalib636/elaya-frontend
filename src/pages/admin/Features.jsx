import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Card, PageHeader, Spinner, Select, Button, Badge } from '../../components/ui'
import {
  listStudioFeatures,
  updateStudioConfigAdmin,
  getFeatureCatalog,
  updatePlatformConfig,
} from '../../api/adminConfig'

const PLANS = [
  { value: 'basic', label: 'Basic' },
  { value: 'professional', label: 'Professional' },
  { value: 'enterprise', label: 'Enterprise' },
]

const AdminFeatures = () => {
  const [loading, setLoading] = useState(true)
  const [catalog, setCatalog] = useState([])
  const [studios, setStudios] = useState([])
  const [plans, setPlans] = useState({})
  const [global, setGlobal] = useState({})
  const [savingId, setSavingId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [c, s] = await Promise.all([getFeatureCatalog(), listStudioFeatures()])
      setCatalog(c.data.data.catalog || [])
      setPlans(c.data.data.subscription_plans || {})
      setGlobal(c.data.data.feature_global || {})
      setStudios(s.data.data.studios || [])
    } catch {
      toast.error('Features konnten nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const setPlan = async (studio, plan) => {
    setSavingId(studio.studio_id)
    try {
      await updateStudioConfigAdmin(studio.studio_id, { subscription_plan: plan })
      toast.success('Paket aktualisiert')
      await load()
    } catch {
      toast.error('Paket konnte nicht gespeichert werden')
    } finally {
      setSavingId(null)
    }
  }

  const toggleOverride = async (studio, featureKey) => {
    const current = studio.overrides?.[featureKey]
    let next
    // cycle: unset → false → true → unset
    if (current === undefined) next = false
    else if (current === false) next = true
    else next = undefined

    const overrides = { ...(studio.overrides || {}) }
    if (next === undefined) delete overrides[featureKey]
    else overrides[featureKey] = next

    setSavingId(studio.studio_id)
    try {
      await updateStudioConfigAdmin(studio.studio_id, { feature_overrides: overrides })
      await load()
    } catch {
      toast.error('Override fehlgeschlagen')
    } finally {
      setSavingId(null)
    }
  }

  const toggleGlobal = async (featureKey) => {
    const next = { ...global, [featureKey]: global[featureKey] === false ? true : false }
    // store only false disables; true/omit = not globally killed
    const payload = {}
    for (const [k, v] of Object.entries(next)) {
      if (v === false) payload[k] = false
    }
    try {
      await updatePlatformConfig({ feature_global: payload })
      toast.success('Globale Features aktualisiert')
      await load()
    } catch {
      toast.error('Globale Features fehlgeschlagen')
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
    <div className="p-6 max-w-[1200px]">
      <PageHeader
        title="Feature Management"
        subtitle="Pakete (Basic / Professional / Enterprise) · globale Schalter · Studio-Overrides"
      />

      <Card className="mb-6">
        <p className="font-semibold m-0 mb-3">Globale Feature-Schalter</p>
        <div className="flex flex-wrap gap-2">
          {catalog.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => toggleGlobal(f.key)}
              className={`px-2.5 py-1 rounded-md text-[12px] border cursor-pointer ${
                global[f.key] === false
                  ? 'border-red-400 text-red-500'
                  : 'border-admin-line text-admin-ivory/80'
              }`}
            >
              {f.label}
              {global[f.key] === false ? ' · OFF' : ''}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-admin-muted m-0 mt-2">
          Plan defaults — Basic: {(plans.basic || []).length} · Professional:{' '}
          {(plans.professional || []).length} · Enterprise:{' '}
          {(plans.enterprise || []).length} Features
        </p>
      </Card>

      <div className="space-y-4">
        {studios.map((s) => (
          <Card key={s.studio_id}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <p className="font-semibold m-0">
                  {s.firma}{' '}
                  <span className="text-admin-muted font-normal text-[12px]">
                    ({s.studio_code})
                  </span>
                </p>
                <Badge variant="status" value={s.status}>{s.status}</Badge>
              </div>
              <Select
                value={s.subscription_plan}
                onChange={(e) => setPlan(s, e.target.value)}
                disabled={savingId === s.studio_id}
              >
                {PLANS.map((pl) => (
                  <option key={pl.value} value={pl.value}>{pl.label}</option>
                ))}
              </Select>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {catalog.map((f) => {
                const on = s.features?.[f.key]
                const ov = s.overrides?.[f.key]
                return (
                  <button
                    key={f.key}
                    type="button"
                    title={
                      ov === true
                        ? 'Force ON'
                        : ov === false
                          ? 'Force OFF'
                          : 'Plan default'
                    }
                    onClick={() => toggleOverride(s, f.key)}
                    className={`px-2 py-1 rounded text-[11px] border cursor-pointer ${
                      on
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                        : 'border-admin-line text-admin-muted'
                    }`}
                  >
                    {f.label}
                    {ov === true ? ' ★' : ov === false ? ' ✕' : ''}
                  </button>
                )
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AdminFeatures
