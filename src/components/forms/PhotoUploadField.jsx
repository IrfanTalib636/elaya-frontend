import { useEffect, useRef, useState } from 'react'
import { Camera, X, Loader2 } from 'lucide-react'
import { uploadStagingPhoto, deleteStagingPhoto, fetchPhotoBlobUrl } from '../../api/files'
import { getApiErrorMessage } from '../../lib/apiError'
import { caseForm } from '../../content'

const photoUi = caseForm.ui.photos

const PhotoUploadField = ({
  label,
  hint,
  slot,
  customerId,
  fileId,
  onChange,
  disabled = false,
}) => {
  const inputRef = useRef(null)
  const objectUrlRef = useRef('')
  const mountedRef = useRef(true)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadPreview = async () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = ''
      }

      if (!fileId) {
        if (!cancelled && mountedRef.current) setPreviewUrl('')
        return
      }

      try {
        const url = await fetchPhotoBlobUrl(fileId)
        if (cancelled || !mountedRef.current) {
          URL.revokeObjectURL(url)
          return
        }
        objectUrlRef.current = url
        setPreviewUrl(url)
      } catch {
        if (!cancelled && mountedRef.current) setPreviewUrl('')
      }
    }

    loadPreview()

    return () => {
      cancelled = true
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = ''
      }
    }
  }, [fileId])

  const handleSelect = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || disabled) return

    setError('')
    setUploading(true)

    try {
      const res = await uploadStagingPhoto(file, { customerId, slot })
      onChange(res.data.data.id)
    } catch (err) {
      setError(getApiErrorMessage(err, photoUi.uploadFailed))
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!fileId || disabled) return
    setError('')
    setUploading(true)
    try {
      await deleteStagingPhoto(fileId)
      onChange('')
    } catch (err) {
      setError(getApiErrorMessage(err, photoUi.removeFailed))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-studio-white text-[12px] font-semibold m-0">{label}</p>
        {hint && <p className="text-studio-w3 text-[11px] m-0 mt-0.5">{hint}</p>}
      </div>

      <div
        className={`relative rounded-[12px] border overflow-hidden transition-colors
          ${previewUrl ? 'border-elaya-border bg-studio-bg-4' : 'border-dashed border-elaya-border bg-studio-bg-4/50'}
          ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
      >
        {previewUrl ? (
          <div className="relative aspect-square max-h-48">
            <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer border-0 hover:bg-black/80"
                aria-label={photoUi.removeAria}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || disabled}
            className="w-full flex flex-col items-center justify-center gap-2 py-8 cursor-pointer bg-transparent border-0 text-studio-w3 hover:text-studio-w2 transition-colors"
          >
            {uploading ? (
              <Loader2 size={24} className="animate-spin text-studio-gold-2" />
            ) : (
              <Camera size={24} strokeWidth={1.5} />
            )}
            <span className="text-[11px]">{uploading ? photoUi.uploading : photoUi.selectPhoto}</span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleSelect}
        />
      </div>

      {error && <p className="text-[11px] text-studio-red m-0">{error}</p>}
    </div>
  )
}

export default PhotoUploadField
