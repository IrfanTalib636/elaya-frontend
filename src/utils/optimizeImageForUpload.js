/** Soft target for fast studio uploads. */
const TARGET_UPLOAD_BYTES = 600 * 1024

/**
 * Stay under live nginx default (1 MB) so studio uploads never get HTTP 413
 * before the API. After nginx client_max_body_size is raised this can be relaxed.
 */
const HARD_MAX_BYTES = 850 * 1024

const PREFERRED_LONG_EDGE = 2048

const COMPRESS_STEPS = [
  { edge: 2048, quality: 0.82 },
  { edge: 1800, quality: 0.76 },
  { edge: 1600, quality: 0.7 },
  { edge: 1400, quality: 0.64 },
  { edge: 1280, quality: 0.58 },
  { edge: 1120, quality: 0.52 },
  { edge: 960, quality: 0.46 },
  { edge: 800, quality: 0.4 },
  { edge: 640, quality: 0.34 },
  { edge: 512, quality: 0.3 },
  { edge: 400, quality: 0.26 },
  { edge: 320, quality: 0.22 },
]

const isBrowserImage = (file) => /image\/(jpeg|jpg|png|webp)/i.test(file.type)

const renderJpeg = (bitmap, edge, quality) => {
  const longEdge = Math.max(bitmap.width, bitmap.height)
  const scale = longEdge > edge ? edge / longEdge : 1
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.resolve(null)
  ctx.drawImage(bitmap, 0, 0, width, height)
  return new Promise((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/jpeg', quality)
  })
}

const toJpegFile = (blob, baseName) =>
  new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })

/**
 * Compress images before upload. Non-images (e.g. PDF) pass through unchanged.
 */
export const optimizeImageForUpload = async (file) => {
  const isImage = file.type.startsWith('image/') || file.type === ''
  if (!isImage) return file

  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    if (file.size <= HARD_MAX_BYTES) return file
    throw new Error('PHOTO_TOO_LARGE')
  }

  try {
    const longEdge = Math.max(bitmap.width, bitmap.height)
    const alreadySmallEnough =
      file.size <= TARGET_UPLOAD_BYTES &&
      isBrowserImage(file) &&
      longEdge <= PREFERRED_LONG_EDGE

    if (alreadySmallEnough) return file

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo'
    let best = null

    for (const step of COMPRESS_STEPS) {
      const blob = await renderJpeg(bitmap, step.edge, step.quality)
      if (!blob) continue
      if (!best || blob.size < best.size) best = { blob, size: blob.size }
      if (blob.size <= TARGET_UPLOAD_BYTES) return toJpegFile(blob, baseName)
      if (blob.size <= HARD_MAX_BYTES && step.edge <= 960) {
        return toJpegFile(blob, baseName)
      }
    }

    if (best && best.size <= HARD_MAX_BYTES) return toJpegFile(best.blob, baseName)

    for (const step of [
      { edge: 280, quality: 0.18 },
      { edge: 240, quality: 0.15 },
      { edge: 200, quality: 0.12 },
    ]) {
      const blob = await renderJpeg(bitmap, step.edge, step.quality)
      if (!blob) continue
      if (blob.size <= HARD_MAX_BYTES) return toJpegFile(blob, baseName)
      if (!best || blob.size < best.size) best = { blob, size: blob.size }
    }

    if (best && best.size <= HARD_MAX_BYTES) return toJpegFile(best.blob, baseName)
    if (best) return toJpegFile(best.blob, baseName)
    if (file.size <= HARD_MAX_BYTES) return file

    const tiny = await renderJpeg(bitmap, 200, 0.1)
    if (tiny) return toJpegFile(tiny, baseName)
    return file
  } finally {
    bitmap.close()
  }
}
