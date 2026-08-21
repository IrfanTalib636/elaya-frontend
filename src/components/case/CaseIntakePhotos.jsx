import { useEffect, useState } from 'react'
import { fetchPhotoBlobUrl } from '../../api/files'
import useContent from '../../i18n/useContent'
import { Card, Button, Modal } from '../ui'

const IntakePhotoThumb = ({ fileId, label, hint, onOpen }) => {
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!fileId) {
      setPreviewUrl('')
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
        setPreviewUrl(objectUrl)
      } catch {
        if (!cancelled) setPreviewUrl('')
      }
    })()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [fileId])

  if (!fileId) return null

  return (
    <button
      type="button"
      onClick={() => previewUrl && onOpen({ url: previewUrl, label, hint })}
      className="flex flex-col gap-2 text-left bg-transparent border-0 p-0 cursor-pointer group"
    >
      <div className="aspect-square rounded-[10px] border border-elaya-border bg-studio-bg-4 overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={label}
            className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-studio-w3 text-[11px]">
            …
          </div>
        )}
      </div>
      <div>
        <p className="text-studio-white text-[12px] font-medium m-0">{label}</p>
        {hint && <p className="text-studio-w3 text-[10px] m-0 mt-0.5">{hint}</p>}
      </div>
    </button>
  )
}

const CaseIntakePhotos = ({ caseData }) => {
  const { caseForm, components } = useContent()
  const photoUi = caseForm.ui.photos
  const [lightbox, setLightbox] = useState(null)

  const photoSlots = [
    { field: 'photo_intake_main', label: photoUi.main, hint: photoUi.mainHint },
    { field: 'photo_intake_detail', label: photoUi.detail, hint: photoUi.detailHint },
    { field: 'photo_marker', label: photoUi.marker, hint: photoUi.markerHint },
  ]

  const slots = photoSlots.filter(({ field }) => caseData?.[field])
  if (!slots.length) return null

  return (
    <>
      <Card>
        <h2 className="text-[13px] font-semibold text-studio-white m-0 mb-4 pb-3 border-b border-elaya-border">
          {photoUi.title}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {slots.map(({ field, label, hint }) => (
            <IntakePhotoThumb
              key={field}
              fileId={caseData[field]}
              label={label}
              hint={hint}
              onOpen={setLightbox}
            />
          ))}
        </div>
      </Card>

      {lightbox && (
        <Modal title={lightbox.label} onClose={() => setLightbox(null)} width="max-w-2xl">
          <div className="flex flex-col gap-3">
            <div className="rounded-[12px] border border-elaya-border bg-studio-bg-4 overflow-hidden">
              <img
                src={lightbox.url}
                alt={lightbox.label}
                className="w-full max-h-[60vh] object-contain mx-auto"
              />
            </div>
            {lightbox.hint && (
              <p className="text-studio-w3 text-[12px] m-0">{lightbox.hint}</p>
            )}
            <div className="flex justify-end pt-1">
              <Button size="sm" variant="secondary" onClick={() => setLightbox(null)}>
                {components.caseIntakePhotos.close}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default CaseIntakePhotos
