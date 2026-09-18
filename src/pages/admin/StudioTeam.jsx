import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PageHeader, Card, Button, Input, Spinner, Badge, Select } from '../../components/ui'
import {
  listAdminStudioLogins,
  listAdminStaffProfiles,
  updateStudioLogin,
} from '../../api/studioTeam'
import { getApiErrorMessage } from '../../lib/apiError'

export default function AdminStudioTeam() {
  const [tab, setTab] = useState('logins')
  const [loading, setLoading] = useState(true)
  const [logins, setLogins] = useState([])
  const [profiles, setProfiles] = useState([])
  const [roles, setRoles] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [l, p] = await Promise.all([
        listAdminStudioLogins(),
        listAdminStaffProfiles(),
      ])
      setLogins(l.data.data.users || [])
      setRoles(l.data.data.account_roles || [])
      setProfiles(p.data.data.profiles || [])
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load studio team data'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const setStatus = async (user, status) => {
    try {
      await updateStudioLogin(user.id, {
        status,
        studio_id: user.studio_id,
      })
      toast.success(status === 'gesperrt' ? 'Deactivated' : 'Activated')
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Update failed'))
    }
  }

  const setRole = async (user, studio_account_role) => {
    try {
      await updateStudioLogin(user.id, {
        studio_account_role,
        studio_id: user.studio_id,
      })
      toast.success('Role updated')
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
    <div className="max-w-[1100px] flex flex-col gap-5">
      <PageHeader
        title="Studio team"
        subtitle="Staff Profiles (no login) and User Accounts (ELAYA logins) across all studios."
      />

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={tab === 'logins' ? 'primary' : 'ghost'}
          onClick={() => setTab('logins')}
        >
          User Accounts ({logins.length})
        </Button>
        <Button
          size="sm"
          variant={tab === 'profiles' ? 'primary' : 'ghost'}
          onClick={() => setTab('profiles')}
        >
          Staff Profiles ({profiles.length})
        </Button>
      </div>

      {tab === 'logins' ? (
        <Card className="flex flex-col gap-2">
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
                  {u.email} · {u.studio?.firma || '—'} ({u.studio?.studio_code}) ·{' '}
                  {u.studio_account_role}
                  {u.last_login
                    ? ` · last ${new Date(u.last_login).toLocaleString()}`
                    : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="status" value={u.status}>
                  {u.status}
                </Badge>
                <Select
                  value={u.studio_account_role || 'treatment'}
                  onChange={(e) => void setRole(u, e.target.value)}
                >
                  {roles.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </Select>
                {u.status === 'aktiv' ? (
                  <Button size="sm" variant="ghost" onClick={() => void setStatus(u, 'gesperrt')}>
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void setStatus(u, 'aktiv')}
                  >
                    Activate
                  </Button>
                )}
              </div>
            </div>
          ))}
        </Card>
      ) : (
        <Card className="flex flex-col gap-2">
          {profiles.map((p) => (
            <div
              key={`${p.studio.id}-${p.id}`}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-elaya-border py-2 last:border-0"
            >
              <div>
                <p className="m-0 text-[13px] text-studio-white font-medium">
                  {p.vorname} {p.nachname}
                </p>
                <p className="m-0 text-[11px] text-studio-w3">
                  {p.rolle} · {p.studio.firma} ({p.studio.studio_code})
                  {p.user_id ? ' · linked login' : ' · no login'}
                </p>
              </div>
              <Badge variant="status" value={p.aktiv ? 'aktiv' : 'gesperrt'}>
                {p.aktiv ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
