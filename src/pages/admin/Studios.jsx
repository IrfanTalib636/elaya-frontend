import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Card,
  PageHeader,
  Spinner,
  Button,
  Badge,
  EmptyState,
} from '../../components/ui'
import { listAdminStudios, patchStudioStatus } from '../../api/adminStudios'

const AdminStudios = () => {
  const [loading, setLoading] = useState(true)
  const [studios, setStudios] = useState([])

  const load = async () => {
    setLoading(true)
    try {
      const res = await listAdminStudios({ limit: 100 })
      const data = res.data.data
      setStudios(data.studios ?? data ?? [])
    } catch {
      toast.error('Studios konnten nicht geladen werden')
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
      toast.success('Status aktualisiert')
      load()
    } catch {
      toast.error('Status-Update fehlgeschlagen')
    }
  }

  return (
    <div className="p-6 max-w-[1000px]">
      <PageHeader
        title="Studios"
        subtitle="Freigabe / Sperre · Paketverwaltung unter Features"
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : studios.length === 0 ? (
        <EmptyState title="Keine Studios" />
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
                  {s.status !== 'aktiv' ? (
                    <Button onClick={() => setStatus(s, 'aktiv')}>Aktivieren</Button>
                  ) : (
                    <Button variant="secondary" onClick={() => setStatus(s, 'gesperrt')}>
                      Sperren
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminStudios
