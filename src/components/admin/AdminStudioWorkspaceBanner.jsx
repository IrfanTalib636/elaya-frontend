import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Button, Input, Modal } from '../ui'
import useAuthStore from '../../store/authStore'
import { getApiErrorMessage } from '../../lib/apiError'
import useContent from '../../i18n/useContent'

/**
 * Prototype-style banner: admin viewing a studio (RO → enable edit → back to admin).
 * Keeps existing Elaya studio theme tokens.
 */
const AdminStudioWorkspaceBanner = () => {
  const navigate = useNavigate()
  const { adminPages } = useContent()
  const copy = adminPages.studioWorkspace || {}
  const studioWorkspace = useAuthStore((s) => s.studioWorkspace)
  const enableStudioWorkspaceEdit = useAuthStore((s) => s.enableStudioWorkspaceEdit)
  const exitStudioWorkspace = useAuthStore((s) => s.exitStudioWorkspace)

  const [editOpen, setEditOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [exiting, setExiting] = useState(false)

  if (!studioWorkspace?.studioId) return null

  const name = studioWorkspace.firma || studioWorkspace.studioCode || 'Studio'
  const editMode = !!studioWorkspace.editMode

  const onEnableEdit = async () => {
    const trimmed = reason.trim()
    if (trimmed.length < 10) {
      toast.error(copy.editReasonMin || 'Please enter a reason (at least 10 characters).')
      return
    }
    setSaving(true)
    try {
      await enableStudioWorkspaceEdit(trimmed)
      toast.success(copy.editEnabled || 'Edit mode enabled — changes are audited.')
      setEditOpen(false)
      setReason('')
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.editError || 'Could not enable edit mode'))
    } finally {
      setSaving(false)
    }
  }

  const onExit = async () => {
    setExiting(true)
    try {
      const result = await exitStudioWorkspace()
      if (result?.restored) {
        toast.success(copy.exitSuccess || 'Back to Admin')
        navigate('/admin/studios')
      } else {
        navigate('/admin/login')
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.exitError || 'Could not exit workspace'))
      navigate('/admin/studios')
    } finally {
      setExiting(false)
    }
  }

  return (
    <>
      <div
        className={`sticky top-0 z-[80] border-b px-4 py-3 flex flex-wrap items-center justify-between gap-3 ${
          editMode
            ? 'bg-studio-gold/15 border-studio-gold/40'
            : 'bg-amber-500/15 border-amber-500/35'
        }`}
      >
        <div className="min-w-0">
          <p className="m-0 text-[13px] font-semibold text-studio-white">
            {editMode
              ? copy.editBannerTitle || `Edit mode: you are managing ${name} as Elaya Admin`
              : copy.roBannerTitle || `Read-only: viewing ${name} as Platform Admin`}
          </p>
          <p className="m-0 mt-0.5 text-[11px] text-studio-w2">
            {editMode
              ? copy.editBannerBody ||
                'You have full studio access. Changes are audited. No separate studio login required.'
              : copy.roBannerBody ||
                'Enable editing to change customers, appointments, shop, staff, and settings.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {!editMode ? (
            <Button type="button" onClick={() => setEditOpen(true)}>
              {copy.enableEdit || 'Enable editing'}
            </Button>
          ) : (
            <span className="inline-flex items-center rounded-[8px] border border-studio-gold/40 px-2.5 py-1 text-[11px] font-semibold text-studio-gold-2">
              {copy.editActive || 'Editing active'}
            </span>
          )}
          <Button type="button" variant="secondary" loading={exiting} onClick={() => void onExit()}>
            {copy.backToAdmin || 'Back to Admin'}
          </Button>
        </div>
      </div>

      {editOpen ? (
        <Modal
          onClose={() => setEditOpen(false)}
          title={copy.editModalTitle || 'Enable studio editing'}
        >
          <p className="m-0 mb-3 text-[13px] text-studio-w1">
            {copy.editModalBody ||
              `You are about to edit ${name} as Elaya Admin. Please provide a reason (min. 10 characters).`}
          </p>
          <Input
            label={copy.editReasonLabel || 'Reason'}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              copy.editReasonPh ||
              'e.g. Support request — adjust appointment for customer X'
            }
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>
              {copy.cancel || 'Cancel'}
            </Button>
            <Button type="button" loading={saving} onClick={() => void onEnableEdit()}>
              {copy.confirmEdit || 'Enable editing'}
            </Button>
          </div>
        </Modal>
      ) : null}
    </>
  )
}

export default AdminStudioWorkspaceBanner
