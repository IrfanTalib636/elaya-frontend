import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Card, PageHeader, Spinner, Button, Badge, EmptyState, Modal, Input } from '../../components/ui'
import {
  listStudioTransfers,
  approveStudioTransfer,
  rejectStudioTransfer,
} from '../../api/studioTransfers'

const AdminTransfers = () => {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [rejectId, setRejectId] = useState(null)
  const [ablehnungsgrund, setAblehnungsgrund] = useState('')
  const [acting, setActing] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await listStudioTransfers({ limit: 50 })
      setItems(res.data.data?.transfers ?? [])
    } catch {
      toast.error('Transfers konnten nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const approve = async (id) => {
    setActing(id)
    try {
      await approveStudioTransfer(id)
      toast.success('Genehmigt')
      load()
    } catch {
      toast.error('Genehmigung fehlgeschlagen')
    } finally {
      setActing(null)
    }
  }

  const reject = async () => {
    if (!rejectId) return
    const reason = ablehnungsgrund.trim()
    if (!reason) {
      toast.error('Bitte Ablehnungsgrund angeben')
      return
    }
    setActing(rejectId)
    try {
      await rejectStudioTransfer(rejectId, { ablehnungsgrund: reason })
      toast.success('Abgelehnt')
      setRejectId(null)
      setAblehnungsgrund('')
      load()
    } catch {
      toast.error('Ablehnung fehlgeschlagen')
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="p-6 max-w-[1000px]">
      <PageHeader title="Studio-Wechsel" subtitle="Anfragen genehmigen oder ablehnen" />
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="Keine Anfragen" />
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <Card key={t.id || t._id} className="flex justify-between gap-4">
              <div>
                <p className="font-semibold m-0">{t.kunde_name || 'Kunde'}</p>
                <p className="text-[12px] text-admin-muted m-0">
                  {(t.von_firma_name || '?')} → {(t.zu_firma_name || '?')}
                </p>
                <Badge className="mt-1" variant="status" value={t.status}>
                  {t.status}
                </Badge>
              </div>
              {t.status === 'ausstehend' || t.status === 'pending' ? (
                <div className="flex gap-2">
                  <Button
                    disabled={acting === (t.id || t._id)}
                    onClick={() => approve(t.id || t._id)}
                  >
                    Genehmigen
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={acting === (t.id || t._id)}
                    onClick={() => {
                      setRejectId(t.id || t._id)
                      setAblehnungsgrund('')
                    }}
                  >
                    Ablehnen
                  </Button>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      {rejectId ? (
        <Modal title="Wechsel ablehnen" onClose={() => setRejectId(null)}>
          <Input
            label="Ablehnungsgrund"
            value={ablehnungsgrund}
            onChange={(e) => setAblehnungsgrund(e.target.value)}
            placeholder="Grund für die Ablehnung"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setRejectId(null)}>
              Abbrechen
            </Button>
            <Button disabled={!!acting} onClick={reject}>
              Ablehnen
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

export default AdminTransfers
