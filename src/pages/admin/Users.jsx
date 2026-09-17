import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PageHeader, Card, Button, Input, Spinner, Badge, Select } from '../../components/ui'
import {
  listAdminUsers,
  inviteAdminUser,
  updateAdminUser,
} from '../../api/adminPhase4'
import { getApiErrorMessage } from '../../lib/apiError'
import { ROLES } from '../../constants/roles'

const emptyInvite = () => ({
  email: '',
  name: '',
  role: ROLES.ADMIN,
  permissions: [],
})

export default function AdminUsers() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [catalog, setCatalog] = useState([])
  const [invite, setInvite] = useState(emptyInvite)
  const [saving, setSaving] = useState(false)
  const [tempPassword, setTempPassword] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listAdminUsers()
      setUsers(res.data.data.users || [])
      setCatalog(res.data.data.permission_catalog || [])
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load admin users'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const togglePerm = (key) => {
    setInvite((prev) => {
      const has = prev.permissions.includes(key)
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter((p) => p !== key)
          : [...prev.permissions, key],
      }
    })
  }

  const handleInvite = async () => {
    if (!invite.email.trim()) {
      toast.error('Email is required')
      return
    }
    setSaving(true)
    setTempPassword(null)
    try {
      const res = await inviteAdminUser({
        email: invite.email.trim(),
        name: invite.name.trim(),
        role: invite.role,
        permissions: invite.role === ROLES.ADMIN ? invite.permissions : [],
      })
      toast.success('Admin invited')
      if (res.data.data.temporary_password) {
        setTempPassword(res.data.data.temporary_password)
      }
      setInvite(emptyInvite())
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Invite failed'))
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (user, status) => {
    try {
      await updateAdminUser(user.id, { status })
      toast.success(status === 'gesperrt' ? 'Deactivated' : 'Activated')
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Update failed'))
    }
  }

  const setUserPerms = async (user, permissions) => {
    try {
      await updateAdminUser(user.id, { permissions })
      toast.success('Permissions updated')
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Update failed'))
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
        title="Admin users"
        subtitle="Invite admins, assign permissions, activate or deactivate. No impersonation."
      />

      <Card className="flex flex-col gap-3">
        <h3 className="m-0 text-[14px] font-semibold text-studio-white">Invite admin</h3>
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
            value={invite.role}
            onChange={(e) => setInvite((f) => ({ ...f, role: e.target.value }))}
          >
            <option value={ROLES.ADMIN}>Admin</option>
            <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
          </Select>
        </div>
        {invite.role === ROLES.ADMIN ? (
          <div className="flex flex-col gap-1.5">
            <p className="m-0 text-[12px] font-semibold text-studio-white">Permissions</p>
            {catalog.map((p) => (
              <label key={p.key} className="flex items-start gap-2 text-[12px] text-studio-w2">
                <input
                  type="checkbox"
                  checked={invite.permissions.includes(p.key)}
                  onChange={() => togglePerm(p.key)}
                />
                <span>
                  <span className="text-studio-white">{p.label}</span>
                  {p.description ? ` — ${p.description}` : ''}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="m-0 text-[12px] text-studio-w3">
            Super Admin receives all permissions automatically.
          </p>
        )}
        <div className="flex justify-end">
          <Button loading={saving} onClick={() => void handleInvite()}>
            Send invite
          </Button>
        </div>
        {tempPassword ? (
          <p className="m-0 text-[12px] text-studio-gold-2">
            Dev temporary password: <code>{tempPassword}</code> (also emailed as reset link)
          </p>
        ) : null}
      </Card>

      <Card className="flex flex-col gap-2">
        <h3 className="m-0 text-[14px] font-semibold text-studio-white mb-1">Directory</h3>
        {users.map((u) => (
          <div
            key={u.id}
            className="border-b border-elaya-border py-3 last:border-0 flex flex-col gap-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="m-0 text-[13px] text-studio-white font-medium">
                  {u.name || u.email}
                </p>
                <p className="m-0 text-[11px] text-studio-w3">
                  {u.email} · {u.role}
                  {u.last_login
                    ? ` · last active ${new Date(u.last_login).toLocaleString()}`
                    : ' · never logged in'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="status" value={u.status}>
                  {u.status}
                </Badge>
                {u.status === 'aktiv' ? (
                  <Button size="sm" variant="ghost" onClick={() => void setStatus(u, 'gesperrt')}>
                    Deactivate
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => void setStatus(u, 'aktiv')}>
                    Activate
                  </Button>
                )}
              </div>
            </div>
            {u.role === ROLES.ADMIN ? (
              <div className="flex flex-wrap gap-2">
                {catalog.map((p) => {
                  const on = (u.permissions || []).includes(p.key)
                  return (
                    <button
                      key={p.key}
                      type="button"
                      className={`text-[11px] px-2 py-1 rounded-[6px] border cursor-pointer ${
                        on
                          ? 'border-studio-gold text-studio-gold-2'
                          : 'border-elaya-border text-studio-w3'
                      }`}
                      onClick={() => {
                        const next = on
                          ? (u.permissions || []).filter((x) => x !== p.key)
                          : [...(u.permissions || []), p.key]
                        void setUserPerms(u, next)
                      }}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
        ))}
      </Card>
    </div>
  )
}
