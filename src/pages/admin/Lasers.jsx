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

const emptyForm = () => ({
  manufacturer: '',
  model: '',
  wavelengths: '',
  notes: '',
  active: true,
})

const parseWavelengths = (raw) =>
  String(raw || '')
    .split(/[,;\s]+/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)

export default function AdminLasers() {
  const [loading, setLoading] = useState(true)
  const [devices, setDevices] = useState([])
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
      setRequests(r.data.data.requests || [])
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load lasers'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const startEdit = (device) => {
    setEditingId(device.id)
    setForm({
      manufacturer: device.manufacturer || '',
      model: device.model || '',
      wavelengths: (device.wavelengths_nm || []).join(', '),
      notes: device.notes || '',
      active: device.active !== false,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm())
  }

  const handleSave = async () => {
    if (!form.manufacturer.trim() || !form.model.trim()) {
      toast.error('Manufacturer and model are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        manufacturer: form.manufacturer.trim(),
        model: form.model.trim(),
        wavelengths_nm: parseWavelengths(form.wavelengths),
        notes: form.notes,
        active: form.active,
      }
      if (editingId) await updateLaser(editingId, payload)
      else await createLaser(payload)
      toast.success(editingId ? 'Laser updated' : 'Laser created')
      cancelEdit()
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Save failed'))
    } finally {
      setSaving(false)
    }
  }

  const handleResolve = async (id, decision) => {
    try {
      await resolveLaserRequest(id, { decision })
      toast.success(decision === 'approved' ? 'Approved & added to catalog' : 'Rejected')
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Resolve failed'))
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
      <PageHeader
        title="Laser catalog"
        subtitle="Approved devices studios can select. Studios cannot edit master data."
      />

      <Card className="flex flex-col gap-3">
        <h3 className="m-0 text-[14px] font-semibold text-studio-white">
          {editingId ? 'Edit laser' : 'Add laser'}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Manufacturer"
            value={form.manufacturer}
            onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))}
          />
          <Input
            label="Model"
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
          />
          <Input
            label="Wavelengths (nm)"
            hint="Comma-separated, e.g. 532, 1064"
            value={form.wavelengths}
            onChange={(e) => setForm((f) => ({ ...f, wavelengths: e.target.value }))}
          />
          <Input
            label="Notes"
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
          Active (selectable by studios)
        </label>
        <div className="flex gap-2 justify-end">
          {editingId ? (
            <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={saving}>
              Cancel
            </Button>
          ) : null}
          <Button size="sm" loading={saving} onClick={() => void handleSave()}>
            {editingId ? 'Update' : 'Create'}
          </Button>
        </div>
      </Card>

      {requests.length > 0 ? (
        <Card className="flex flex-col gap-3">
          <h3 className="m-0 text-[14px] font-semibold text-studio-white">
            Pending studio requests
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
                    {req.studio?.firma || 'Studio'} · {req.requested_by || '—'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => void handleResolve(req.id, 'rejected')}>
                    Reject
                  </Button>
                  <Button size="sm" onClick={() => void handleResolve(req.id, 'approved')}>
                    Approve
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card className="flex flex-col gap-2">
        <h3 className="m-0 text-[14px] font-semibold text-studio-white mb-1">Catalog</h3>
        {devices.map((d) => (
          <div
            key={d.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-elaya-border py-2 last:border-0"
          >
            <div>
              <p className="m-0 text-[13px] text-studio-white font-medium">{d.label}</p>
              <p className="m-0 text-[11px] text-studio-w3">
                {(d.wavelengths_nm || []).map((n) => `${n} nm`).join(' · ') || 'No wavelengths'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={d.active ? 'status' : 'default'} value={d.active ? 'aktiv' : 'gesperrt'}>
                {d.active ? 'Active' : 'Inactive'}
              </Badge>
              <Button size="sm" variant="ghost" onClick={() => startEdit(d)}>
                Edit
              </Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
