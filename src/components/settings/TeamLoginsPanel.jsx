import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Card, Button, Input, Spinner, Badge, Select } from '../ui'
import {
  getStudioSeatStatus,
  listStudioLogins,
  inviteStudioLogin,
  updateStudioLogin,
} from '../../api/studioTeam'
import { getStudioSettings } from '../../api/studio'
import { getApiErrorMessage } from '../../lib/apiError'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../constants/roles'

/**
 * User Accounts (ELAYA logins) — separate from Staff Profiles.
 */
export default function TeamLoginsPanel() {
  const user = useAuthStore((s) => s.user)
  const canManage =
    user?.role === ROLES.STUDIO_ADMIN ||
    user?.studio_account_role === 'owner' ||
    user?.role === ROLES.SUPER_ADMIN

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logins, setLogins] = useState([])
  const [seat, setSeat] = useState(null)
  const [roles, setRoles] = useState([])
  const [staff, setStaff] = useState([])
  const [invite, setInvite] = useState({
    email: '',
    name: '',
    studio_account_role: 'treatment',
    staff_profile_id: '',
  })
  const [tempPassword, setTempPassword] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [l, s, settings] = await Promise.all([
        listStudioLogins(),
        getStudioSeatStatus(),
        getStudioSettings().catch(() => null),
      ])
      setLogins(l.data.data.users || [])
      setSeat(l.data.data.seat_status || s.data.data.seat_status)
      setRoles(l.data.data.account_roles || s.data.data.account_roles || [])
      setStaff(settings?.data?.data?.settings?.mitarbeiter || [])
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load team logins'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleInvite = async () => {
    if (!invite.email.trim()) {
      toast.error('Email is required')
      return
    }
    if (seat?.at_limit) {
      toast.error(
        `Login limit reached (${seat.used}/${seat.limit}). Upgrade your plan to invite more.`
      )
      return
    }
    setSaving(true)
    setTempPassword(null)
    try {
      const res = await inviteStudioLogin({
        email: invite.email.trim(),
        name: invite.name.trim(),
        studio_account_role: invite.studio_account_role,
        staff_profile_id: invite.staff_profile_id || null,
      })
      toast.success('Invite sent')
      if (res.data.data.temporary_password) {
        setTempPassword(res.data.data.temporary_password)
      }
      setInvite({
        email: '',
        name: '',
        studio_account_role: 'treatment',
        staff_profile_id: '',
      })
      await load()
    } catch (err) {
      const code = err?.response?.data?.errors?.code
      if (code === 'SEAT_LIMIT_REACHED' || err?.response?.status === 403) {
        toast.error(
          err?.response?.data?.message ||
            'Login limit reached — upgrade your subscription plan.'
        )
      } else {
        toast.error(getApiErrorMessage(err, 'Invite failed'))
      }
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (row, status) => {
    try {
      await updateStudioLogin(row.id, { status })
      toast.success(status === 'gesperrt' ? 'Deactivated' : 'Activated')
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Update failed'))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-2">
        <h3 className="m-0 text-[14px] font-semibold text-studio-white">ELAYA logins</h3>
        <p className="m-0 text-[12px] text-studio-w2">
          Staff Profiles (other tab) are unlimited. Only people who work in ELAYA need a login.
        </p>
        {seat ? (
          <p className="m-0 text-[12px] text-studio-w2">
            Plan <span className="text-studio-white">{seat.plan}</span>
            {' · '}
            {seat.unlimited
              ? `${seat.used} active logins (unlimited)`
              : `${seat.used} / ${seat.limit} active logins`}
            {seat.at_limit ? (
              <span className="text-studio-gold-2"> — upgrade required to invite more</span>
            ) : null}
          </p>
        ) : null}
      </Card>

      {canManage ? (
        <Card className="flex flex-col gap-3">
          <h3 className="m-0 text-[14px] font-semibold text-studio-white">Invite employee login</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              value={invite.email}
              onChange={(e) => setInvite((f) => ({ ...f, email: e.target.value }))}
            />
            <Input
              label="Name"
              value={invite.name}
              onChange={(e) => setInvite((f) => ({ ...f, name: e.target.value }))}
            />
            <Select
              label="Role"
              value={invite.studio_account_role}
              onChange={(e) =>
                setInvite((f) => ({ ...f, studio_account_role: e.target.value }))
              }
            >
              {roles
                .filter((r) => r.key !== 'owner')
                .map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
            </Select>
            <Select
              label="Link Staff Profile (optional)"
              value={invite.staff_profile_id}
              onChange={(e) =>
                setInvite((f) => ({ ...f, staff_profile_id: e.target.value }))
              }
            >
              <option value="">None</option>
              {staff
                .filter((m) => m.aktiv !== false)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.vorname} {m.nachname}
                  </option>
                ))}
            </Select>
          </div>
          <div className="flex justify-end">
            <Button
              loading={saving}
              disabled={Boolean(seat?.at_limit)}
              onClick={() => void handleInvite()}
            >
              Send invite
            </Button>
          </div>
          {tempPassword ? (
            <p className="m-0 text-[12px] text-studio-gold-2">
              Dev temp password: <code>{tempPassword}</code>
            </p>
          ) : null}
        </Card>
      ) : null}

      <Card className="flex flex-col gap-2">
        <h3 className="m-0 text-[14px] font-semibold text-studio-white mb-1">Accounts</h3>
        {logins.map((u) => (
          <div
            key={u.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-elaya-border py-2 last:border-0"
          >
            <div>
              <p className="m-0 text-[13px] text-studio-white font-medium">
                {u.name || u.email}
              </p>
              <p className="m-0 text-[11px] text-studio-w3">
                {u.email} · {u.studio_account_role}
                {u.last_login
                  ? ` · last ${new Date(u.last_login).toLocaleString()}`
                  : ' · never logged in'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="status" value={u.status}>
                {u.status}
              </Badge>
              {canManage && u.studio_account_role !== 'owner' ? (
                u.status === 'aktiv' ? (
                  <Button size="sm" variant="ghost" onClick={() => void setStatus(u, 'gesperrt')}>
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={Boolean(seat?.at_limit)}
                    onClick={() => void setStatus(u, 'aktiv')}
                  >
                    Activate
                  </Button>
                )
              ) : null}
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
