import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PageHeader, Card, Button, Input, Spinner, Badge } from '../../components/ui'
import {
  listLasers,
  createLaser,
  updateLaser,
  listLaserRequests,
  resolveLaserRequest,
} from '../../api/adminPhase4'
import { getApiErrorMessage } from '../../lib/apiError'
import useContent from '../../i18n/useContent'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../constants/roles'
import LaserColorDeltasEditor from '../../components/lasers/LaserColorDeltasEditor'
import { sameLaserColors } from '../../components/lasers/laserColors'

const emptyForm = (colors = {}) => ({
  manufacturer: '',
  model: '',
  wavelengths: '',
  notes: '',
  active: true,
  colors: { ...colors },
  liveColors: { ...colors },
  colorsPending: false,
})

const parseWavelengths = (raw) =>
  String(raw || '')
    .split(/[,;\s]+/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)

export default function AdminLasers() {
  const { adminPages } = useContent()
  const copy = adminPages.lasers || {}
  const canEditColors = useAuthStore((s) => s.user?.role) === ROLES.SUPER_ADMIN
  const [loading, setLoading] = useState(true)
  const [devices, setDevices] = useState([])
  const [defaultColors, setDefaultColors] = useState({})
  const [requests, setRequests] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [d, r] = await Promise.all([
        listLasers(),
        listLaserRequests({ status: 'pending' }),
      ])
      setDevices(d.data.data.devices || [])
      const defaults = d.data.data.default_color_deltas || {}
      setDefaultColors(defaults)
      setForm((f) => (f.manufacturer || f.model ? f : emptyForm(defaults)))
      setRequests(r.data.data.requests || [])
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.loadError || 'Failed to load lasers'))
    } finally {
      setLoading(false)
    }
  }, [copy.loadError])

  useEffect(() => {
    void load()
  }, [load])

  const startEdit = (device) => {
    setEditingId(device.id)
    const live = device.color_deltas || {}
    setForm({
      manufacturer: device.manufacturer || '',
      model: device.model || '',
      wavelengths: (device.wavelengths_nm || []).join(', '),
      notes: device.notes || '',
      active: device.active !== false,
      colors: { ...(device.color_deltas_draft || live) },
      liveColors: { ...live },
      colorsPending: Boolean(device.color_deltas_pending),
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm(defaultColors))
  }

  const handleSave = async () => {
    if (!form.manufacturer.trim() || !form.model.trim()) {
      toast.error(copy.required || 'Manufacturer and model are required')
      return
    }
    setSaving(true)
    try {
      const current = editingId
        ? devices.find((d) => d.id === editingId)
        : null
      const savedColors = current ? current.color_deltas_draft || current.color_deltas : form.liveColors
      const colorsChanged = canEditColors && !sameLaserColors(form.colors, savedColors)
      const payload = {
        manufacturer: form.manufacturer.trim(),
        model: form.model.trim(),
        wavelengths_nm: parseWavelengths(form.wavelengths),
        notes: form.notes,
        active: form.active,
        ...(colorsChanged ? { color_deltas: form.colors } : {}),
      }
      const res = editingId ? await updateLaser(editingId, payload) : await createLaser(payload)
      toast.success(editingId ? copy.updated : copy.created)
      if (res.data?.data?.colors_drafted) toast.success(copy.colorsDrafted)
      cancelEdit()
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.saveFailed || 'Save failed'))
    } finally {
      setSaving(false)
    }
  }

  const handleResolve = async (id, decision) => {
    try {
      await resolveLaserRequest(id, { decision })
      toast.success(decision === 'approved' ? copy.approved : copy.rejected)
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.resolveFailed || 'Resolve failed'))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="max-w-[960px] flex flex-col gap-5">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <Card className="flex flex-col gap-3">
        <h3 className="m-0 text-[14px] font-semibold text-studio-white">
          {editingId ? copy.editLaser : copy.addLaser}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={copy.manufacturer}
            value={form.manufacturer}
            onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))}
          />
          <Input
            label={copy.model}
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
          />
          <Input
            label={copy.wavelengths}
            hint={copy.wavelengthsHint}
            value={form.wavelengths}
            onChange={(e) => setForm((f) => ({ ...f, wavelengths: e.target.value }))}
          />
          <Input
            label={copy.notes}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>
        <label className="flex items-center gap-2 text-[12px] text-studio-w2">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
          />
          {copy.activeSelectable}
        </label>
        <LaserColorDeltasEditor
          values={form.colors}
          liveValues={form.liveColors}
          pending={form.colorsPending}
          disabled={!canEditColors}
          onChange={(colors) => setForm((f) => ({ ...f, colors }))}
        />
        <div className="flex gap-2 justify-end">
          {editingId ? (
            <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={saving}>
              {copy.cancel}
            </Button>
          ) : null}
          <Button size="sm" loading={saving} onClick={() => void handleSave()}>
            {editingId ? copy.update : copy.create}
          </Button>
        </div>
      </Card>

      {requests.length > 0 ? (
        <Card className="flex flex-col gap-3">
          <h3 className="m-0 text-[14px] font-semibold text-studio-white">
            {copy.pendingRequests}
          </h3>
          <ul className="m-0 p-0 list-none flex flex-col gap-2">
            {requests.map((req) => (
              <li
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-2 border border-elaya-border rounded-[10px] px-3 py-2"
              >
                <div>
                  <p className="m-0 text-[13px] text-studio-white font-medium">
                    {req.manufacturer} {req.model}
                  </p>
                  <p className="m-0 text-[11px] text-studio-w3">
                    {req.studio?.firma || copy.studioFallback} · {req.requested_by || '—'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void handleResolve(req.id, 'rejected')}
                  >
                    {copy.reject}
                  </Button>
                  <Button size="sm" onClick={() => void handleResolve(req.id, 'approved')}>
                    {copy.approve}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card className="flex flex-col gap-2">
        <h3 className="m-0 text-[14px] font-semibold text-studio-white mb-1">
          {copy.catalog}
        </h3>
        {devices.map((d) => (
          <div
            key={d.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-elaya-border py-2 last:border-0"
          >
            <div>
              <p className="m-0 text-[13px] text-studio-white font-medium">{d.label}</p>
              <p className="m-0 text-[11px] text-studio-w3">
                {(d.wavelengths_nm || []).map((n) => `${n} nm`).join(' · ') ||
                  copy.noWavelengths}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {d.color_deltas_pending ? (
                <Badge variant="default" value="entwurf">
                  {copy.colorDraftBadge}
                </Badge>
              ) : null}
              <Badge variant={d.active ? 'status' : 'default'} value={d.active ? 'aktiv' : 'gesperrt'}>
                {d.active ? copy.active : copy.inactive}
              </Badge>
              <Button size="sm" variant="ghost" onClick={() => startEdit(d)}>
                {copy.edit}
              </Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
