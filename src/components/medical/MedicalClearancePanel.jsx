import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FileCheck2, ImageOff, ShieldAlert } from 'lucide-react'
import { Button, Card, Modal } from '../ui'
import { getApiErrorMessage } from '../../lib/apiError'
import { fetchPhotoBlobUrl } from '../../api/files'
import { reviewCustomerMedicalClearance } from '../../api/medicalClearance'

const STATUS_LABEL = {
  not_required: 'Not required',
  required: 'Required — waiting for upload',
  pending_review: 'Pending studio verification',
  verified: 'Verified — treatment unlocked',
  rejected: 'Rejected — new document needed',
}

const isImageMime = (mime, name = '') => {
  if (mime && String(mime).startsWith('image/')) return true
  return /\.(png|jpe?g|gif|webp|heic|heif)$/i.test(name)
}

/** Private certificate thumbnail — bytes loaded with session auth. */
const ClearanceDocThumb = ({ fileId, label, mime, onOpen }) => {
  const [url, setUrl] = useState('')
  const [failed, setFailed] = useState(false)
  const image = isImageMime(mime, label)

  useEffect(() => {
    if (!fileId || !image) {
      setUrl('')
      return undefined
    }
    let cancelled = false
    let objectUrl = ''
    ;(async () => {
      try {
        objectUrl = await fetchPhotoBlobUrl(fileId)
        if (cancelled) {
          URL.revokeObjectURL(objectUrl)
          return
        }
        setUrl(objectUrl)
        setFailed(false)
      } catch {
        if (!cancelled) {
          setUrl('')
          setFailed(true)
        }
      }
    })()
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [fileId, image])

  if (!fileId) return null

  return (
    <button
      type="button"
      onClick={() => {
        if (url) onOpen({ url, label })
        else if (!image) void onOpen({ url: null, label, fileId, download: true })
        else toast.error('Could not load image preview')
      }}
      className="flex flex-col gap-1.5 text-left bg-transparent border-0 p-0 cursor-pointer group w-[120px]"
    >
      <div className="w-[120px] h-[120px] rounded-[10px] border border-elaya-border bg-studio-bg-4 overflow-hidden flex items-center justify-center">
        {url ? (
          <img
            src={url}
            alt={label}
            className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : failed ? (
          <ImageOff size={22} className="text-studio-w4" />
        ) : (
          <span className="text-studio-w3 text-[11px]">{image ? '…' : 'File'}</span>
        )}
      </div>
      <p className="text-studio-w2 text-[10px] m-0 leading-snug line-clamp-2 break-all">
        {label}
      </p>
    </button>
  )
}

/**
 * Studio panel: verify that a doctor's certificate exists for the customer.
 * Explicitly NOT a medical decision — only document existence confirmation.
 */
export default function MedicalClearancePanel({
  customerId,
  clearance: initial,
  onUpdated,
  compact = false,
  readOnly = false,
}) {
  const [clearance, setClearance] = useState(initial || null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    setClearance(initial || null)
  }, [initial])

  if (!clearance || clearance.status === 'not_required') {
    if (compact) return null
    return (
      <Card className="flex flex-col gap-2" id="medical-clearance">
        <div className="flex items-center gap-2">
          <FileCheck2 size={14} className="text-studio-w3" />
          <h3 className="text-[13px] font-semibold text-studio-white m-0">
            Medical clearance
          </h3>
        </div>
        <p className="text-studio-w3 text-[12px] m-0">
          No doctor&apos;s certificate is currently required for this customer.
        </p>
      </Card>
    )
  }

  const status = clearance.status
  const docs = clearance.documents || []
  const canReview =
    !readOnly &&
    (status === 'pending_review' || status === 'rejected' || status === 'required') &&
    docs.length > 0

  const openDoc = async (fileId) => {
    if (!fileId) return
    try {
      const url = await fetchPhotoBlobUrl(fileId)
      setLightbox({ url, label: 'Certificate' })
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Could not open file')
    }
  }

  const handleThumbOpen = async (payload) => {
    if (payload?.url) {
      setLightbox(payload)
      return
    }
    if (payload?.fileId) {
      await openDoc(payload.fileId)
    }
  }

  const run = async (decision) => {
    if (!customerId || readOnly) return
    setSaving(true)
    try {
      const res = await reviewCustomerMedicalClearance(customerId, {
        decision,
        note: note.trim(),
      })
      const next = res.data?.data?.medical_clearance || res.data?.medical_clearance
      setClearance(next)
      setNote('')
      onUpdated?.(next)
      toast.success(
        decision === 'verify'
          ? 'Document verified — treatment lock removed'
          : 'Document rejected — customer notified'
      )
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Could not update clearance')
    } finally {
      setSaving(false)
    }
  }

  const border =
    status === 'verified'
      ? 'border-emerald-500/40'
      : status === 'rejected'
        ? 'border-red-400/40'
        : 'border-amber-400/40'

  return (
    <>
      <Card className={`flex flex-col gap-3 border ${border}`} id="medical-clearance">
        <div className="flex items-start gap-2">
          <ShieldAlert size={16} className="text-studio-gold-2 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h3 className="text-[13px] font-semibold text-studio-white m-0">
              Medical clearance (customer-level)
            </h3>
            <p className="text-studio-w3 text-[11px] m-0 mt-1 leading-relaxed">
              Verify that an appropriate doctor&apos;s confirmation exists for laser
              treatment. You are <strong className="text-studio-w1">not</strong> making a
              medical decision. Upload alone does not unlock booking — only your
              verification does. Applies to all tattoo cases of this customer.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[11px] px-2 py-1 rounded-md bg-studio-bg-4 text-studio-w1 border border-elaya-border">
            {STATUS_LABEL[status] || status}
          </span>
          {(clearance.reasons || []).map((r) => (
            <span
              key={r.condition_key || r.med_key}
              className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-studio-w2"
            >
              {r.label || r.condition_key || r.med_key}
            </span>
          ))}
        </div>

        {docs.length > 0 && (
          <div className="text-[12px] text-studio-w2">
            <p className="m-0 mb-2 font-medium text-studio-w1">
              Uploaded documents ({docs.length})
            </p>
            <div className="flex flex-wrap gap-3">
              {docs.map((d, i) => (
                <ClearanceDocThumb
                  key={`${d.file_id}-${i}`}
                  fileId={d.file_id}
                  label={
                    d.original_name ||
                    (d.uploaded_at
                      ? new Date(d.uploaded_at).toLocaleString('de-CH')
                      : 'Certificate')
                  }
                  mime={d.mime_type}
                  onOpen={(p) => void handleThumbOpen(p)}
                />
              ))}
            </div>
            <p className="m-0 mt-2 text-[10px] text-studio-w3">
              Click a thumbnail to view full size.
            </p>
          </div>
        )}

        {status === 'required' && docs.length === 0 && (
          <p className="text-[12px] text-amber-200/90 m-0">
            Waiting for the customer to upload a doctor&apos;s certificate.
          </p>
        )}

        {readOnly && docs.length > 0 && (
          <p className="text-[11px] text-studio-w3 m-0">
            Read-only — only the customer&apos;s current studio can verify or reject.
          </p>
        )}

        {canReview && (
          <div className="flex flex-col gap-2 pt-1 border-t border-elaya-border">
            <textarea
              className="w-full min-h-[64px] rounded-[10px] border border-elaya-border bg-studio-bg-4 text-studio-white text-[13px] px-3 py-2 outline-none"
              placeholder="Optional note (visible to customer on reject)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={saving}
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" loading={saving} onClick={() => void run('verify')}>
                Verify document — unlock treatment
              </Button>
              <Button
                size="sm"
                variant="secondary"
                loading={saving}
                onClick={() => void run('reject')}
              >
                Reject — request new upload
              </Button>
            </div>
          </div>
        )}

        {status === 'verified' && clearance.verified_at && (
          <p className="text-[11px] text-studio-w3 m-0">
            Verified {new Date(clearance.verified_at).toLocaleString('de-CH')}
            {clearance.verified_note ? ` · ${clearance.verified_note}` : ''}
          </p>
        )}
      </Card>

      {lightbox?.url ? (
        <Modal
          title={lightbox.label || 'Certificate'}
          onClose={() => setLightbox(null)}
          width="max-w-3xl"
        >
          <div className="flex flex-col gap-3">
            <div className="rounded-[12px] border border-elaya-border bg-studio-bg-4 overflow-hidden">
              <img
                src={lightbox.url}
                alt={lightbox.label || 'Certificate'}
                className="w-full max-h-[75vh] object-contain mx-auto"
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => setLightbox(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  )
}
