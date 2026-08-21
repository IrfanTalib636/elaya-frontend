import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Card, PageHeader, Spinner, Button, Badge, EmptyState, Modal, Input } from '../../components/ui'
import {
  listStudioTransfers,
  approveStudioTransfer,
  rejectStudioTransfer,
} from '../../api/studioTransfers'
import useContent from '../../i18n/useContent'

const AdminTransfers = () => {
  const { t, adminPages } = useContent()
  const copy = adminPages.transfers

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
      toast.error(copy.loadError)
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
      toast.success(copy.approved)
      load()
    } catch {
      toast.error(copy.approveError)
    } finally {
      setActing(null)
    }
  }

  const reject = async () => {
    if (!rejectId) return
    const reason = ablehnungsgrund.trim()
    if (!reason) {
      toast.error(copy.reasonRequired)
      return
    }
    setActing(rejectId)
    try {
      await rejectStudioTransfer(rejectId, { ablehnungsgrund: reason })
      toast.success(copy.rejected)
      setRejectId(null)
      setAblehnungsgrund('')
      load()
    } catch {
      toast.error(copy.rejectError)
    } finally {
      setActing(null)
    }
  }

  const statusLabel = (status) =>
    t(`adminPages.transfers.statuses.${status}`, { defaultValue: status })

  return (
    <div className="p-6 max-w-[1000px]">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState title={copy.empty} />
      ) : (
        <div className="space-y-3">
          {items.map((tr) => (
            <Card key={tr.id || tr._id} className="flex justify-between gap-4">
              <div>
                <p className="font-semibold m-0">{tr.kunde_name || copy.customerFallback}</p>
                <p className="text-[12px] text-admin-muted m-0">
                  {(tr.von_firma_name || '?')} → {(tr.zu_firma_name || '?')}
                </p>
                <Badge className="mt-1" variant="status" value={tr.status}>
                  {statusLabel(tr.status)}
                </Badge>
              </div>
              {tr.status === 'ausstehend' || tr.status === 'pending' ? (
                <div className="flex gap-2">
                  <Button
                    disabled={acting === (tr.id || tr._id)}
                    onClick={() => approve(tr.id || tr._id)}
                  >
                    {copy.approve}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={acting === (tr.id || tr._id)}
                    onClick={() => {
                      setRejectId(tr.id || tr._id)
                      setAblehnungsgrund('')
                    }}
                  >
                    {copy.reject}
                  </Button>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      {rejectId ? (
        <Modal title={copy.rejectTitle} onClose={() => setRejectId(null)}>
          <Input
            label={copy.rejectReason}
            value={ablehnungsgrund}
            onChange={(e) => setAblehnungsgrund(e.target.value)}
            placeholder={copy.rejectPh}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setRejectId(null)}>
              {copy.cancel}
            </Button>
            <Button disabled={!!acting} onClick={reject}>
              {copy.reject}
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

export default AdminTransfers
