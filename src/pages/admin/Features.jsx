import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Card,
  PageHeader,
  Spinner,
  Select,
  Badge,
  Button,
  Input,
  Modal,
} from '../../components/ui'
import {
  listStudioFeatures,
  updateStudioConfigAdmin,
  getFeatureCatalog,
  updatePlatformConfig,
} from '../../api/adminConfig'
import { getApiErrorMessage } from '../../lib/apiError'
import useContent from '../../i18n/useContent'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../constants/roles'

const PLAN_OPTIONS = [
  { value: 'basic', label: 'Starter', packageId: 'starter' },
  { value: 'professional', label: 'Pro', packageId: 'pro' },
  { value: 'enterprise', label: 'Network', packageId: 'network' },
]

const emptyPackageForm = () => ({
  id: '',
  name: '',
  preis_monat: '29',
  beschreibung: '',
  mitarbeiter_max: '2',
  standorte_max: '1',
  standort_aufpreis_chf: '0',
  shop_provision_prozent: '10',
  ki_kontingent_monat: '50',
  datenaufbewahrung_monate: '12',
  features: [],
})

const unb = (v, copy) =>
  v === null || v === undefined || v === '' ? copy.unlimited || 'unlimited' : String(v)

const fmtChf = (n) =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(Number(n) || 0)

/**
 * Pakete & Features — prototype parity (Paket-Verwaltung + Studio Feature-Flags).
 * Theme: Elaya admin tokens.
 */
const AdminFeatures = () => {
  const { t, adminPages } = useContent()
  const copy = adminPages.features || {}
  const role = useAuthStore((s) => s.user?.role)
  const canEdit = role === ROLES.SUPER_ADMIN

  const [tab, setTab] = useState('packages')
  const [loading, setLoading] = useState(true)
  const [catalog, setCatalog] = useState([])
  const [studios, setStudios] = useState([])
  const [plans, setPlans] = useState({})
  const [seatLimits, setSeatLimits] = useState({})
  const [packages, setPackages] = useState([])
  const [kiWeights, setKiWeights] = useState({
    nachsorge: 2,
    verblassung: 3,
    kundenchat: 1,
    studio_ki_chat: 1,
  })
  const [global, setGlobal] = useState({})
  const [savingId, setSavingId] = useState(null)
  const [savingKi, setSavingKi] = useState(false)
  const [savingPkg, setSavingPkg] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [pkgForm, setPkgForm] = useState(emptyPackageForm())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [c, s] = await Promise.all([getFeatureCatalog(), listStudioFeatures()])
      const data = c.data.data || {}
      setCatalog(data.catalog || [])
      setPlans(data.subscription_plans || {})
      setSeatLimits(data.subscription_seat_limits || {})
      setPackages(data.subscription_packages || [])
      setKiWeights(
        data.ki_gewichtungen || {
          nachsorge: 2,
          verblassung: 3,
          kundenchat: 1,
          studio_ki_chat: 1,
        }
      )
      setGlobal(data.feature_global || {})
      setStudios(s.data.data.studios || [])
    } catch {
      toast.error(copy.loadError || 'Could not load features')
    } finally {
      setLoading(false)
    }
  }, [copy.loadError])

  useEffect(() => {
    load()
  }, [load])

  const studiosByPackage = useMemo(() => {
    const map = {}
    for (const s of studios) {
      const opt = PLAN_OPTIONS.find((p) => p.value === s.subscription_plan)
      const pid = opt?.packageId || 'starter'
      map[pid] = (map[pid] || 0) + 1
    }
    return map
  }, [studios])

  const setPlan = async (studio, plan) => {
    setSavingId(studio.studio_id)
    try {
      await updateStudioConfigAdmin(studio.studio_id, { subscription_plan: plan })
      toast.success(copy.planUpdated || 'Plan updated')
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.planError || 'Could not save plan'))
    } finally {
      setSavingId(null)
    }
  }

  const toggleOverride = async (studio, featureKey) => {
    const current = studio.overrides?.[featureKey]
    let next
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
      toast.error(copy.overrideError || 'Override failed')
    } finally {
      setSavingId(null)
    }
  }

  const setAllOverrides = async (studio, on) => {
    const overrides = {}
    for (const f of catalog) overrides[f.key] = on
    setSavingId(studio.studio_id)
    try {
      await updateStudioConfigAdmin(studio.studio_id, { feature_overrides: overrides })
      toast.success(on ? copy.allOnSaved || 'All features ON' : copy.allOffSaved || 'All features OFF')
      await load()
    } catch {
      toast.error(copy.overrideError || 'Override failed')
    } finally {
      setSavingId(null)
    }
  }

  const resetToPackage = async (studio) => {
    setSavingId(studio.studio_id)
    try {
      await updateStudioConfigAdmin(studio.studio_id, { feature_overrides: {} })
      toast.success(copy.packageDefaultSaved || 'Reset to package defaults')
      await load()
    } catch {
      toast.error(copy.overrideError || 'Override failed')
    } finally {
      setSavingId(null)
    }
  }

  const toggleGlobal = async (featureKey) => {
    if (!canEdit) return
    const next = { ...global, [featureKey]: global[featureKey] === false ? true : false }
    const payload = {}
    for (const [k, v] of Object.entries(next)) {
      if (v === false) payload[k] = false
    }
    try {
      await updatePlatformConfig({ feature_global: payload })
      toast.success(copy.globalUpdated || 'Global features updated')
      await load()
    } catch {
      toast.error(copy.globalError || 'Global features failed')
    }
  }

  const saveKiWeights = async () => {
    if (!canEdit) return
    const neu = {
      nachsorge: Number(kiWeights.nachsorge),
      verblassung: Number(kiWeights.verblassung),
      kundenchat: Number(kiWeights.kundenchat),
      studio_ki_chat: Number(kiWeights.studio_ki_chat),
    }
    if (!Object.values(neu).every((v) => Number.isFinite(v) && v >= 0)) {
      toast.error(copy.kiWeightsInvalid || 'Enter valid unit values (≥ 0) for all weightings')
      return
    }
    setSavingKi(true)
    try {
      await updatePlatformConfig({ ki_gewichtungen: neu })
      toast.success(copy.kiWeightsSaved || 'AI weightings saved')
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.kiWeightsError || 'Could not save AI weightings'))
    } finally {
      setSavingKi(false)
    }
  }

  const openNewPackage = () => {
    setEditingId(null)
    setPkgForm(emptyPackageForm())
    setModalOpen(true)
  }

  const openEditPackage = (p) => {
    const lim = p.limits || {}
    setEditingId(p.id)
    setPkgForm({
      id: p.id,
      name: p.name || p.name_de || '',
      preis_monat: String(p.preis_monat ?? 0),
      beschreibung: p.beschreibung || '',
      mitarbeiter_max:
        lim.mitarbeiter_max === null || lim.mitarbeiter_max === undefined
          ? ''
          : String(lim.mitarbeiter_max),
      standorte_max:
        lim.standorte_max === null || lim.standorte_max === undefined
          ? ''
          : String(lim.standorte_max),
      standort_aufpreis_chf: String(lim.standort_aufpreis_chf ?? 0),
      shop_provision_prozent: String(
        lim.shop_provision_prozent ?? p.shop_provision_studio_prozent ?? 10
      ),
      ki_kontingent_monat:
        lim.ki_kontingent_monat === null || lim.ki_kontingent_monat === undefined
          ? ''
          : String(lim.ki_kontingent_monat),
      datenaufbewahrung_monate:
        lim.datenaufbewahrung_monate === null || lim.datenaufbewahrung_monate === undefined
          ? ''
          : String(lim.datenaufbewahrung_monate),
      features: Array.isArray(p.features) ? [...p.features] : [],
    })
    setModalOpen(true)
  }

  const optNum = (raw) => {
    const t = String(raw ?? '').trim()
    if (t === '') return null
    const n = Number(t)
    return Number.isFinite(n) ? n : NaN
  }

  const savePackage = async () => {
    if (!canEdit) return
    const name = String(pkgForm.name || '').trim()
    const preis = Number(pkgForm.preis_monat)
    const limits = {
      mitarbeiter_max: optNum(pkgForm.mitarbeiter_max),
      standorte_max: optNum(pkgForm.standorte_max),
      standort_aufpreis_chf: optNum(pkgForm.standort_aufpreis_chf) ?? 0,
      shop_provision_prozent: optNum(pkgForm.shop_provision_prozent),
      ki_kontingent_monat: optNum(pkgForm.ki_kontingent_monat),
      datenaufbewahrung_monate: optNum(pkgForm.datenaufbewahrung_monate),
    }
    const limitsOk = Object.values(limits).every(
      (v) => v === null || (Number.isFinite(v) && v >= 0)
    )
    if (
      !name ||
      !(preis >= 0) ||
      limits.shop_provision_prozent == null ||
      limits.shop_provision_prozent < 0 ||
      !limitsOk
    ) {
      toast.error(
        copy.packageInvalid ||
          'Enter name, valid price, and valid limits (shop provision ≥ 0)'
      )
      return
    }

    let nextList = [...packages]
    if (editingId) {
      nextList = nextList.map((p) =>
        p.id === editingId
          ? {
              ...p,
              name,
              name_de: name,
              name_en: name,
              preis_monat: preis,
              beschreibung: String(pkgForm.beschreibung || '').trim(),
              limits,
              features: pkgForm.features,
            }
          : p
      )
    } else {
      let base =
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '') || 'paket'
      let nid = base
      let i = 2
      while (nextList.some((x) => x.id === nid)) {
        nid = `${base}_${i}`
        i += 1
      }
      nextList.push({
        id: nid,
        name,
        name_de: name,
        name_en: name,
        preis_monat: preis,
        beschreibung: String(pkgForm.beschreibung || '').trim(),
        limits,
        features: pkgForm.features,
        plan: 'basic',
      })
    }

    setSavingPkg(true)
    try {
      await updatePlatformConfig({ subscription_packages: nextList })
      toast.success(
        editingId
          ? copy.packageUpdated || 'Package saved'
          : copy.packageCreated || 'Package created'
      )
      setModalOpen(false)
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.packageError || 'Could not save package'))
    } finally {
      setSavingPkg(false)
    }
  }

  const togglePkgFeature = (key) => {
    setPkgForm((f) => {
      const set = new Set(f.features)
      if (set.has(key)) set.delete(key)
      else set.add(key)
      return { ...f, features: [...set] }
    })
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
        title={copy.title || 'Packages & Features'}
        subtitle={
          copy.subtitleAbo ||
          copy.subtitle ||
          'Subscription packages · AI weightings · studio feature flags'
        }
      />

      <div className="flex gap-2 mb-5">
        {[
          { id: 'packages', label: copy.tabPackages || 'Package management' },
          { id: 'flags', label: copy.tabFlags || 'Studio feature flags' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold border cursor-pointer ${
              tab === item.id
                ? 'border-admin-emerald text-admin-emerald bg-admin-emerald/10'
                : 'border-admin-line text-studio-w2'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'packages' ? (
        <div className="flex flex-col gap-5">
          <Card>
            <p className="font-semibold m-0 mb-1 text-studio-white">
              {copy.kiWeightsTitle || 'AI weightings'}
            </p>
            <p className="text-[12px] text-studio-w2 m-0 mb-4 leading-relaxed max-w-[720px]">
              {copy.kiWeightsHint ||
                'How many units of the monthly AI quota a single use of this function consumes. Higher values for cost-intensive functions (e.g. image analysis).'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[720px]">
              {[
                { key: 'nachsorge', label: copy.kiNachsorge || 'Aftercare analysis (units/use)' },
                { key: 'verblassung', label: copy.kiVerblassung || 'Fading analysis (units/use)' },
                { key: 'kundenchat', label: copy.kiKundenchat || 'Customer chat (units/use)' },
                {
                  key: 'studio_ki_chat',
                  label: copy.kiStudioChat || 'Studio AI chat (units/use)',
                },
              ].map((row) => (
                <Input
                  key={row.key}
                  label={row.label}
                  type="number"
                  min={0}
                  step={1}
                  value={kiWeights[row.key] ?? ''}
                  disabled={!canEdit}
                  onChange={(e) =>
                    setKiWeights((w) => ({ ...w, [row.key]: e.target.value }))
                  }
                />
              ))}
            </div>
            {canEdit ? (
              <div className="mt-4">
                <Button type="button" onClick={saveKiWeights} disabled={savingKi}>
                  {savingKi
                    ? copy.saving || 'Saving…'
                    : copy.kiWeightsSave || 'Save AI weightings'}
                </Button>
              </div>
            ) : null}
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 text-[15px] font-semibold text-studio-white">
              {copy.packagesTitle || 'Elaya packages'}
            </p>
            {canEdit ? (
              <Button type="button" onClick={openNewPackage}>
                {copy.newPackage || '+ New package'}
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((p) => {
              const lim = p.limits || {}
              return (
                <Card key={p.id}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="m-0 text-[16px] font-semibold text-studio-white">
                      {p.name || p.name_de}
                    </p>
                    <p className="m-0 text-[13px] font-semibold text-admin-emerald whitespace-nowrap">
                      {fmtChf(p.preis_monat)}
                      <span className="text-studio-w3 font-normal">
                        {copy.perMonth || '/mo'}
                      </span>
                    </p>
                  </div>
                  <p className="m-0 mb-3 text-[12px] text-studio-w2">
                    {p.beschreibung || '—'}
                  </p>
                  <div className="flex flex-col gap-1 text-[12px] text-studio-w2 mb-4">
                    <span>
                      {copy.locationsIncl || 'Locations incl.'}:{' '}
                      {unb(lim.standorte_max, copy)}
                    </span>
                    <span>
                      {copy.surchargeLocation || 'Surcharge / location'}:{' '}
                      {fmtChf(lim.standort_aufpreis_chf || 0)}
                    </span>
                    <span>
                      {copy.employees || 'Employees'}: {unb(lim.mitarbeiter_max, copy)}
                    </span>
                    <span>
                      {copy.shopProvision || 'Shop provision studio'}:{' '}
                      {lim.shop_provision_prozent ?? p.shop_provision_studio_prozent}%
                    </span>
                    <span>
                      {copy.kiQuota || 'AI quota'}: {unb(lim.ki_kontingent_monat, copy)}
                    </span>
                    <span>
                      {copy.dataRetention || 'Data retention'}:{' '}
                      {lim.datenaufbewahrung_monate == null
                        ? copy.unlimited || 'unlimited'
                        : `${lim.datenaufbewahrung_monate} ${copy.months || 'months'}`}
                    </span>
                    <span>
                      {(p.features || []).length} / {catalog.length}{' '}
                      {copy.featuresActive || 'features active'}
                    </span>
                    <span>
                      {studiosByPackage[p.id] || 0}{' '}
                      {copy.studiosWithPackage || 'studio(s) on this package'}
                    </span>
                  </div>
                  {canEdit ? (
                    <Button type="button" variant="secondary" onClick={() => openEditPackage(p)}>
                      {copy.editPackage || 'Edit'}
                    </Button>
                  ) : null}
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <Card>
            <p className="font-semibold m-0 mb-3 text-studio-white">
              {copy.globalTitle || 'Global feature switches'}
            </p>
            <div className="flex flex-wrap gap-2">
              {catalog.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => toggleGlobal(f.key)}
                  className={`px-2.5 py-1 rounded-md text-[12px] border cursor-pointer ${
                    global[f.key] === false
                      ? 'border-red-400 text-red-500'
                      : 'border-admin-line text-studio-w2'
                  } ${!canEdit ? 'opacity-60 cursor-default' : ''}`}
                >
                  {f.label}
                  {global[f.key] === false ? ' · OFF' : ''}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-studio-w3 m-0 mt-2">
              {t('adminPages.features.planDefaults', {
                basic: (plans.basic || []).length,
                pro: (plans.professional || []).length,
                ent: (plans.enterprise || []).length,
              })}
            </p>
          </Card>

          <Card>
            <p className="font-semibold m-0 mb-1 text-studio-white">
              {copy.seatsTitle || 'Employee login seats (per plan)'}
            </p>
            <p className="text-[11px] text-studio-w3 m-0 mb-3">
              {copy.seatsHint ||
                'Synced from package employee limits when packages are saved. Empty = unlimited.'}
            </p>
            <div className="grid grid-cols-3 gap-3 text-[12px] text-studio-w2">
              {PLAN_OPTIONS.map((pl) => (
                <div key={pl.value}>
                  <p className="m-0 mb-1 font-semibold text-studio-white">{pl.label}</p>
                  <p className="m-0">
                    {seatLimits[pl.value] == null
                      ? copy.unlimited || 'unlimited'
                      : seatLimits[pl.value]}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            {studios.map((s) => {
              const pkg = packages.find((p) => {
                const opt = PLAN_OPTIONS.find((o) => o.value === s.subscription_plan)
                return p.id === (opt?.packageId || 'starter')
              })
              return (
                <Card key={s.studio_id}>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold m-0 text-studio-white">
                        {s.firma}{' '}
                        <span className="text-studio-w3 font-normal text-[12px]">
                          ({s.studio_code})
                        </span>
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="status" value={s.status}>
                          {s.status}
                        </Badge>
                        {pkg ? (
                          <span className="text-[11px] text-studio-w3">
                            {fmtChf(pkg.preis_monat)}
                            {copy.perMonth || '/mo'} ·{' '}
                            {copy.shopProvision || 'Shop provision'}{' '}
                            {pkg.shop_provision_studio_prozent ??
                              pkg.limits?.shop_provision_prozent}
                            %
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <Select
                      value={s.subscription_plan}
                      onChange={(e) => setPlan(s, e.target.value)}
                      disabled={savingId === s.studio_id || !canEdit}
                    >
                      {PLAN_OPTIONS.map((pl) => (
                        <option key={pl.value} value={pl.value}>
                          {pl.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  {canEdit ? (
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={savingId === s.studio_id}
                        onClick={() => setAllOverrides(s, true)}
                      >
                        {copy.allOn || 'All ON'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={savingId === s.studio_id}
                        onClick={() => setAllOverrides(s, false)}
                      >
                        {copy.allOff || 'All OFF'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={savingId === s.studio_id}
                        onClick={() => resetToPackage(s)}
                      >
                        {copy.resetPackage || 'Package default'}
                      </Button>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-1.5">
                    {catalog.map((f) => {
                      const on = s.features?.[f.key]
                      const ov = s.overrides?.[f.key]
                      return (
                        <button
                          key={f.key}
                          type="button"
                          disabled={!canEdit || savingId === s.studio_id}
                          title={
                            ov === true
                              ? copy.forceOn
                              : ov === false
                                ? copy.forceOff
                                : copy.planDefault
                          }
                          onClick={() => toggleOverride(s, f.key)}
                          className={`px-2 py-1 rounded text-[11px] border cursor-pointer ${
                            on
                              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                              : 'border-admin-line text-studio-w3'
                          } ${!canEdit ? 'opacity-60 cursor-default' : ''}`}
                        >
                          {f.label}
                          {ov === true ? ' ★' : ov === false ? ' ✕' : ''}
                        </button>
                      )
                    })}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {modalOpen ? (
        <Modal
          onClose={() => setModalOpen(false)}
          title={
            editingId
              ? copy.editPackageTitle || 'Edit package'
              : copy.newPackageTitle || 'New package'
          }
        >
          <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-1">
            <Input
              label={copy.packageName || 'Name'}
              value={pkgForm.name}
              onChange={(e) => setPkgForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              label={copy.aboPrice || 'Subscription CHF / month'}
              type="number"
              min={0}
              value={pkgForm.preis_monat}
              onChange={(e) => setPkgForm((f) => ({ ...f, preis_monat: e.target.value }))}
            />
            <Input
              label={copy.description || 'Description'}
              value={pkgForm.beschreibung}
              onChange={(e) => setPkgForm((f) => ({ ...f, beschreibung: e.target.value }))}
            />
            <p className="m-0 mt-1 text-[13px] font-semibold text-studio-white">
              {copy.limitsTitle || 'Limits'}
            </p>
            <p className="m-0 text-[11px] text-studio-w3">
              {copy.limitsHint || 'Empty field = unlimited.'}
            </p>
            <Input
              label={copy.employees || 'Max employees'}
              type="number"
              min={0}
              value={pkgForm.mitarbeiter_max}
              onChange={(e) => setPkgForm((f) => ({ ...f, mitarbeiter_max: e.target.value }))}
            />
            <Input
              label={copy.locationsIncl || 'Locations included'}
              type="number"
              min={0}
              value={pkgForm.standorte_max}
              onChange={(e) => setPkgForm((f) => ({ ...f, standorte_max: e.target.value }))}
            />
            <Input
              label={copy.surchargeLocation || 'Surcharge per extra location (CHF)'}
              type="number"
              min={0}
              value={pkgForm.standort_aufpreis_chf}
              onChange={(e) =>
                setPkgForm((f) => ({ ...f, standort_aufpreis_chf: e.target.value }))
              }
            />
            <Input
              label={copy.shopProvision || 'Shop provision studio (%)'}
              type="number"
              min={0}
              step={0.1}
              value={pkgForm.shop_provision_prozent}
              onChange={(e) =>
                setPkgForm((f) => ({ ...f, shop_provision_prozent: e.target.value }))
              }
              hint={
                copy.shopProvisionHint ||
                'Studio share of shop GMV. Per-studio exceptions only via Finance special terms (with reason).'
              }
            />
            <Input
              label={copy.kiQuota || 'AI quota / month (units)'}
              type="number"
              min={0}
              value={pkgForm.ki_kontingent_monat}
              onChange={(e) =>
                setPkgForm((f) => ({ ...f, ki_kontingent_monat: e.target.value }))
              }
              hint={
                copy.kiQuotaHint ||
                'Soft cap — never blocks AI. Overage can be billed separately. Empty = unlimited.'
              }
            />
            <Input
              label={copy.dataRetention || 'Data retention (months)'}
              type="number"
              min={0}
              value={pkgForm.datenaufbewahrung_monate}
              onChange={(e) =>
                setPkgForm((f) => ({ ...f, datenaufbewahrung_monate: e.target.value }))
              }
            />
            <p className="m-0 mt-1 text-[13px] font-semibold text-studio-white">
              {copy.featuresTitle || 'Features'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {catalog.map((f) => {
                const on = pkgForm.features.includes(f.key)
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => togglePkgFeature(f.key)}
                    className={`px-2 py-1 rounded text-[11px] border cursor-pointer ${
                      on
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                        : 'border-admin-line text-studio-w3'
                    }`}
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                {copy.cancel || 'Cancel'}
              </Button>
              <Button type="button" onClick={savePackage} disabled={savingPkg}>
                {savingPkg ? copy.saving || 'Saving…' : copy.save || 'Save'}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

export default AdminFeatures
