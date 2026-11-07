import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import {
  listLasers,
  listAdminStudioLasers,
  assignLaserToStudio,
  unassignLaserFromStudio,
} from '../../api/adminPhase4'
import PricingConfigForm from '../../components/pricing/PricingConfigForm'
import {
  pricingValuesFromConfig,
  buildStudioPricing,
} from '../../components/pricing/pricingFields'
import useContent from '../../i18n/useContent'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../constants/roles'
import { getApiErrorMessage } from '../../lib/apiError'

/**
 * One group-booking size tier: its name, point cost and the area range it
 * covers, above the field that sets its threshold.
 */
const SizeTier = ({ name, points, range, children }) => {
  const { t } = useContent()
  return (
    <div className="rounded-[10px] border border-elaya-border p-3">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-[12px] font-semibold">{name}</span>
          {points != null && (
            <span className="text-[11px] font-medium text-admin-emerald whitespace-nowrap">
              {t('settingsPage.groupBooking.points', { count: points })}
            </span>
          )}
        </div>
        <span className="text-[11px] text-admin-muted whitespace-nowrap">{range}</span>
      </div>
      {children}
    </div>
  )
}

/** Blocking periods and appointment defaults an admin may edit per studio. */
const SPERRFRIST_FIELDS = [
  { key: 'same_case_tage',            i18n: 'sameCase' },
  { key: 'cross_case_tage',           i18n: 'crossCase' },
  { key: 'uv_mittel_tage',            i18n: 'uvModerate' },
  { key: 'uv_intensiv_tage',          i18n: 'uvIntense' },
  { key: 'medikament_kurz_tage',      i18n: 'medShort' },
  { key: 'medikament_retinoide_tage', i18n: 'medRetinoids' },
]

const TERMIN_FIELDS = [
  { key: 'behandlung_dauer_minuten', i18n: 'treatmentDuration', unit: 'minutes' },
  { key: 'beratung_dauer_minuten',   i18n: 'consultDuration',   unit: 'minutes' },
  { key: 'gruppen_dauer_minuten',    i18n: 'groupDuration',     unit: 'minutes' },
  { key: 'buchung_horizont_tage',    i18n: 'horizon',           unit: 'days', min: 1 },
  { key: 'min_vorlaufzeit_stunden',  i18n: 'leadTime',          unit: 'hours' },
]

const numericFields = (fields, values) =>
  Object.fromEntries(
    fields
      .map(({ key }) => [key, Number(values[key])])
      .filter(([, value]) => Number.isFinite(value))
  )

const AdminStudios = () => {
  const navigate = useNavigate()
  const { t, adminPages } = useContent()
  const copy = adminPages.studios
  const role = useAuthStore((s) => s.user?.role)
  const enterStudioWorkspace = useAuthStore((s) => s.enterStudioWorkspace)
  const canEditPricing = role === ROLES.SUPER_ADMIN
  const [loading, setLoading] = useState(true)
  const [studios, setStudios] = useState([])
  const [enteringId, setEnteringId] = useState(null)

  const [pricingStudio, setPricingStudio] = useState(null)
  const [pricingLoading, setPricingLoading] = useState(false)
  const [pricingSaving, setPricingSaving] = useState(false)
  const [pricingDefaults, setPricingDefaults] = useState(null)
  const [pricingValues, setPricingValues] = useState(() => pricingValuesFromConfig())
  /** Stored values, so the live calculator can show saved → draft. */
  const [pricingSaved, setPricingSaved] = useState(null)
  const [groupForm, setGroupForm] = useState({})
  /** Points per size tier, served read-only alongside the studio config. */
  const [groupPunkte, setGroupPunkte] = useState(null)
  const [sperrenForm, setSperrenForm] = useState({})
  const [terminForm, setTerminForm] = useState({})

  const [lasersStudio, setLasersStudio] = useState(null)
  const [lasersLoading, setLasersLoading] = useState(false)
  const [assignedLasers, setAssignedLasers] = useState([])
  const [catalogLasers, setCatalogLasers] = useState([])
  const [addLaserId, setAddLaserId] = useState('')
  const [lasersSaving, setLasersSaving] = useState(false)

  const load = useCallback(async () => {
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
  }, [copy.loadError])

  useEffect(() => {
    load()
  }, [load])

  const openStudioDashboard = async (studioId) => {
    setEnteringId(studioId)
    try {
      await enterStudioWorkspace(studioId)
      toast.success(copy.workspaceEntered || 'Studio dashboard opened')
      navigate('/studio/dashboard')
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, copy.workspaceEnterError || 'Could not open studio dashboard')
      )
    } finally {
      setEnteringId(null)
    }
  }

  const setStatus = async (studio, status) => {
    try {
      await patchStudioStatus(studio.id || studio._id, status)
      toast.success(copy.statusUpdated)
      load()
    } catch {
      toast.error(copy.statusUpdateFailed)
    }
  }

  const openAssignedLasers = async (studio) => {
    const id = studio.id || studio._id
    setLasersStudio(studio)
    setAddLaserId('')
    setLasersLoading(true)
    try {
      const [assignedRes, catalogRes] = await Promise.all([
        listAdminStudioLasers(id),
        listLasers(),
      ])
      setAssignedLasers(assignedRes.data?.data?.devices || [])
      setCatalogLasers(
        (catalogRes.data?.data?.devices || []).filter((d) => d.active !== false)
      )
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.lasersLoadError || 'Could not load lasers'))
      setLasersStudio(null)
    } finally {
      setLasersLoading(false)
    }
  }

  const handleAssignLaser = async () => {
    if (!lasersStudio || !addLaserId) return
    const studioId = lasersStudio.id || lasersStudio._id
    setLasersSaving(true)
    try {
      await assignLaserToStudio({ studio_id: studioId, laser_device_id: addLaserId })
      toast.success(copy.laserAssigned || 'Laser assigned')
      setAddLaserId('')
      const assignedRes = await listAdminStudioLasers(studioId)
      setAssignedLasers(assignedRes.data?.data?.devices || [])
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.laserAssignFailed || 'Could not assign laser'))
    } finally {
      setLasersSaving(false)
    }
  }

  const handleRemoveLaser = async (laserDeviceId) => {
    if (!lasersStudio || !laserDeviceId) return
    const studioId = lasersStudio.id || lasersStudio._id
    setLasersSaving(true)
    try {
      await unassignLaserFromStudio({
        studio_id: studioId,
        laser_device_id: laserDeviceId,
      })
      toast.success(copy.laserRemoved || 'Laser removed')
      setAssignedLasers((prev) => prev.filter((d) => d.id !== laserDeviceId))
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.laserRemoveFailed || 'Could not remove laser'))
    } finally {
      setLasersSaving(false)
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
      setPricingSaved(pricingValuesFromConfig(cfg.studio_pricing))
      setPricingDefaults(cfg.pricing_defaults ?? null)
      // Every fallback is the platform default the server ships with the config.
      const gg = { ...(cfg.gruppen_groessen_defaults ?? {}), ...(cfg.gruppen_groessen ?? {}) }
      setGroupPunkte(cfg.gruppen_punkte ?? null)
      setGroupForm({
        klein_max_cm2: gg.klein_max_cm2 ?? '',
        mittelgross_max_cm2: gg.mittelgross_max_cm2 ?? '',
        max_punkte: gg.max_punkte ?? '',
        gruppen_rabatt_pct:
          gg.gruppen_rabatt == null ? '' : Math.round(gg.gruppen_rabatt * 100),
      })
      setSperrenForm({ ...(cfg.sperrfristen_defaults ?? {}), ...(cfg.sperrfristen ?? {}) })
      setTerminForm({
        ...(cfg.termin_einstellungen_defaults ?? {}),
        ...(cfg.termin_einstellungen ?? {}),
      })
    } catch {
      toast.error(copy.pricingLoadError)
      setPricingStudio(null)
    } finally {
      setPricingLoading(false)
    }
  }

  const savePricing = async () => {
    if (!pricingStudio || !canEditPricing) return
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
        sperrfristen: numericFields(SPERRFRIST_FIELDS, sperrenForm),
        termin_einstellungen: numericFields(TERMIN_FIELDS, terminForm),
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
                <div className="flex gap-2 flex-wrap justify-end">
                  <Button
                    variant="secondary"
                    loading={enteringId === id}
                    onClick={() => void openStudioDashboard(id)}
                  >
                    {copy.openWorkspace || 'Open workspace'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate(`/admin/studios/${id}/workspace`)}
                  >
                    {copy.openLists || 'Data lists'}
                  </Button>
                  <Button variant="ghost" onClick={() => void openAssignedLasers(s)}>
                    {copy.assignedLasers || 'Assigned lasers'}
                  </Button>
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
          width="max-w-5xl"
        >
          {pricingLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-4">
              <PricingConfigForm
                values={pricingValues}
                onChange={(key, value) =>
                  setPricingValues((prev) => ({ ...prev, [key]: value }))
                }
                disabled={!canEditPricing || pricingSaving}
              />
              <div className="space-y-2 pt-2 border-t border-elaya-border">
                <p className="text-[13px] font-semibold m-0">{copy.groupTitle}</p>
                <p className="text-[12px] text-admin-muted m-0">{copy.groupDesc}</p>
                {/* All three tiers, each with the point cost the booking
                    validation applies, so admins see the full scale. */}
                <div className="space-y-3">
                  <SizeTier
                    name={t('settingsPage.groupBooking.categorySmall')}
                    points={groupPunkte?.klein}
                    range={t('settingsPage.groupBooking.rangeUpTo', {
                      max: groupForm.klein_max_cm2,
                    })}
                  >
                    <Input
                      label={t('settingsPage.groupBooking.smallUpTo')}
                      type="number"
                      min={1}
                      value={groupForm.klein_max_cm2}
                      onChange={(e) =>
                        setGroupForm((p) => ({ ...p, klein_max_cm2: e.target.value }))
                      }
                      disabled={pricingSaving}
                    />
                  </SizeTier>

                  <SizeTier
                    name={t('settingsPage.groupBooking.categoryMedium')}
                    points={groupPunkte?.mittelgross}
                    range={t('settingsPage.groupBooking.rangeBetween', {
                      min: groupForm.klein_max_cm2,
                      max: groupForm.mittelgross_max_cm2,
                    })}
                  >
                    <Input
                      label={t('settingsPage.groupBooking.mediumUpTo')}
                      type="number"
                      min={1}
                      value={groupForm.mittelgross_max_cm2}
                      onChange={(e) =>
                        setGroupForm((p) => ({ ...p, mittelgross_max_cm2: e.target.value }))
                      }
                      disabled={pricingSaving}
                    />
                  </SizeTier>

                  <SizeTier
                    name={t('settingsPage.groupBooking.categoryLarge')}
                    points={groupPunkte?.gross}
                    range={t('settingsPage.groupBooking.rangeAbove', {
                      min: groupForm.mittelgross_max_cm2,
                    })}
                  >
                    {/* Large begins where medium ends, so this writes the same
                        threshold — one value, no gap between the tiers. */}
                    <Input
                      label={t('settingsPage.groupBooking.largeFrom')}
                      type="number"
                      min={1}
                      value={groupForm.mittelgross_max_cm2}
                      onChange={(e) =>
                        setGroupForm((p) => ({ ...p, mittelgross_max_cm2: e.target.value }))
                      }
                      hint={t('settingsPage.groupBooking.boundaryHint')}
                      disabled={pricingSaving}
                    />
                    <p className="text-[11px] text-admin-muted m-0 mt-2">
                      {t('settingsPage.groupBooking.largeNote')}
                    </p>
                  </SizeTier>

                  <div className="grid grid-cols-2 gap-3 pt-1">
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
                      onChange={(e) =>
                        setGroupForm((p) => ({ ...p, gruppen_rabatt_pct: e.target.value }))
                      }
                      disabled={pricingSaving}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-elaya-border">
                <p className="text-[13px] font-semibold m-0">
                  {t('settingsPage.bookingRules.lockoutsTitle')}
                </p>
                <p className="text-[12px] text-admin-muted m-0">
                  {t('settingsPage.bookingRules.desc')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {SPERRFRIST_FIELDS.map(({ key, i18n }) => (
                    <Input
                      key={key}
                      label={t(`settingsPage.bookingRules.lockouts.${i18n}`)}
                      type="number"
                      min={0}
                      value={sperrenForm[key] ?? ''}
                      hint={t('settingsPage.bookingRules.units.days')}
                      onChange={(e) =>
                        setSperrenForm((p) => ({ ...p, [key]: e.target.value }))
                      }
                      disabled={!canEditPricing || pricingSaving}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-elaya-border">
                <p className="text-[13px] font-semibold m-0">
                  {t('settingsPage.bookingRules.appointmentsTitle')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {TERMIN_FIELDS.map(({ key, i18n, unit, min }) => (
                    <Input
                      key={key}
                      label={t(`settingsPage.bookingRules.appointments.${i18n}`)}
                      type="number"
                      min={min ?? 0}
                      value={terminForm[key] ?? ''}
                      hint={t(`settingsPage.bookingRules.units.${unit}`)}
                      onChange={(e) =>
                        setTerminForm((p) => ({ ...p, [key]: e.target.value }))
                      }
                      disabled={!canEditPricing || pricingSaving}
                    />
                  ))}
                </div>
              </div>
              <Button
                onClick={savePricing}
                loading={pricingSaving}
                className="w-full"
                disabled={!canEditPricing}
              >
                {copy.save}
              </Button>
            </div>
          )}
        </Modal>
      ) : null}

      {lasersStudio ? (
        <Modal
          onClose={() => setLasersStudio(null)}
          title={t('adminPages.studios.assignedLasersTitle', {
            name: lasersStudio.firma || lasersStudio.studio_code || '',
            defaultValue: `Assigned lasers · ${lasersStudio.firma || lasersStudio.studio_code || ''}`,
          })}
          width="max-w-2xl"
        >
          {lasersLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-[12px] text-admin-muted m-0">
                {copy.assignedLasersHint ||
                  'Lasers come from the central Super Admin catalog. Assign multiple devices if the studio has several rooms or machines.'}
              </p>

              {assignedLasers.length === 0 ? (
                <p className="text-[13px] text-admin-muted m-0">
                  {copy.assignedLasersEmpty || 'No lasers assigned yet.'}
                </p>
              ) : (
                <ul className="m-0 p-0 list-none divide-y divide-elaya-border rounded-[10px] border border-elaya-border overflow-hidden">
                  {assignedLasers.map((device) => (
                    <li
                      key={device.id}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 bg-studio-bg-3"
                    >
                      <div className="min-w-0">
                        <p className="m-0 text-[13px] font-semibold text-studio-white truncate">
                          {device.label}
                        </p>
                        <p className="m-0 text-[11px] text-admin-muted truncate">
                          {[device.manufacturer, device.model].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={lasersSaving}
                        onClick={() => void handleRemoveLaser(device.id)}
                      >
                        {copy.removeLaser || 'Remove'}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                <label className="flex flex-col gap-1 text-[12px] text-admin-muted flex-1">
                  {copy.addLaser || 'Add laser from catalog'}
                  <select
                    className="text-[13px] bg-studio-bg-3 text-studio-white border border-elaya-border rounded-[8px] px-2 py-2"
                    value={addLaserId}
                    onChange={(e) => setAddLaserId(e.target.value)}
                    disabled={lasersSaving}
                  >
                    <option value="">—</option>
                    {catalogLasers
                      .filter((d) => !assignedLasers.some((a) => a.id === d.id))
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.label}
                        </option>
                      ))}
                  </select>
                </label>
                <Button
                  size="sm"
                  loading={lasersSaving}
                  disabled={!addLaserId}
                  onClick={() => void handleAssignLaser()}
                >
                  {copy.assignLaser || 'Assign'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      ) : null}
    </div>
  )
}

export default AdminStudios
