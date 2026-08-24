import { useEffect, useRef, useState, useCallback } from 'react'
import useContent from '../../i18n/useContent'

const DISPLAY_HEIGHT = 120
const JPEG_QUALITY = 0.58
const CANVAS_BG = '#0d1c35'
const PAD = 8
/** Target ~5–6 KB with soft grayscale (still readable) */
const MAX_EXPORT_WIDTH = 360
const MAX_EXPORT_HEIGHT = 90

const emptyBounds = () => ({
  minX: Infinity,
  minY: Infinity,
  maxX: -Infinity,
  maxY: -Infinity,
})

const SignatureCanvas = ({ onChange, className = '' }) => {
  const { components } = useContent()
  const copy = components.signature
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const hasContentRef = useRef(false)
  const boundsRef = useRef(emptyBounds())
  const logicalSizeRef = useRef({ width: 0, height: DISPLAY_HEIGHT })
  const [hasContent, setHasContent] = useState(false)

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const src = e.touches ? e.touches[0] : e
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    }
  }

  const expandBounds = (x, y) => {
    const b = boundsRef.current
    b.minX = Math.min(b.minX, x - PAD)
    b.minY = Math.min(b.minY, y - PAD)
    b.maxX = Math.max(b.maxX, x + PAD)
    b.maxY = Math.max(b.maxY, y + PAD)
  }

  const paintBackground = (ctx, width, height) => {
    ctx.fillStyle = CANVAS_BG
    ctx.fillRect(0, 0, width, height)
  }

  const setupCanvas = useCallback((canvas) => {
    const container = containerRef.current
    if (!canvas || !container) return null

    const width = Math.max(1, Math.floor(container.clientWidth))
    const height = DISPLAY_HEIGHT

    canvas.width = width
    canvas.height = height
    canvas.style.width = '100%'
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d')
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    paintBackground(ctx, width, height)
    ctx.strokeStyle = '#f4f8fc'
    ctx.lineWidth = 2.25
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    logicalSizeRef.current = { width, height }
    return ctx
  }, [])

  const exportCropped = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !hasContentRef.current) return

    const b = boundsRef.current
    if (!Number.isFinite(b.minX)) return

    const { width: cw, height: ch } = logicalSizeRef.current
    const x = Math.max(0, Math.floor(b.minX))
    const y = Math.max(0, Math.floor(b.minY))
    const w = Math.min(cw - x, Math.max(1, Math.ceil(b.maxX - b.minX)))
    const h = Math.min(ch - y, Math.max(1, Math.ceil(b.maxY - b.minY)))

    const scale = Math.min(1, MAX_EXPORT_WIDTH / w, MAX_EXPORT_HEIGHT / h)
    const outW = Math.max(1, Math.round(w * scale))
    const outH = Math.max(1, Math.round(h * scale))

    const mid = document.createElement('canvas')
    mid.width = outW
    mid.height = outH
    const mctx = mid.getContext('2d')
    mctx.imageSmoothingEnabled = true
    mctx.imageSmoothingQuality = 'high'
    mctx.drawImage(canvas, x, y, w, h, 0, 0, outW, outH)

    // Soft grayscale on white — keeps anti-aliased edges (hard B&W looked jagged)
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = outW
    exportCanvas.height = outH
    const ectx = exportCanvas.getContext('2d')
    const src = mctx.getImageData(0, 0, outW, outH)
    const dst = ectx.createImageData(outW, outH)
    const padLum = 13 * 0.299 + 28 * 0.587 + 53 * 0.114 // ~#0d1c35
    for (let i = 0; i < src.data.length; i += 4) {
      const lum = src.data[i] * 0.299 + src.data[i + 1] * 0.587 + src.data[i + 2] * 0.114
      // Map pad → white, strokes → dark; preserve soft edge pixels
      const t = Math.max(0, Math.min(1, (lum - padLum) / (220 - padLum)))
      const ink = Math.round(255 * (1 - t))
      dst.data[i] = ink
      dst.data[i + 1] = ink
      dst.data[i + 2] = ink
      dst.data[i + 3] = 255
    }
    ectx.putImageData(dst, 0, 0)
    onChange?.(exportCanvas.toDataURL('image/jpeg', JPEG_QUALITY))
  }, [onChange])

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setupCanvas(canvas)
    boundsRef.current = emptyBounds()
    hasContentRef.current = false
    setHasContent(false)
    onChange?.('')
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = setupCanvas(canvas)
    if (!ctx) return

    const start = (e) => {
      e.preventDefault()
      drawing.current = true
      const pos = getPos(e, canvas)
      lastPos.current = pos
      expandBounds(pos.x, pos.y)
    }

    const draw = (e) => {
      e.preventDefault()
      if (!drawing.current) return
      const pos = getPos(e, canvas)
      ctx.beginPath()
      ctx.moveTo(lastPos.current.x, lastPos.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      lastPos.current = pos
      expandBounds(pos.x, pos.y)
      if (!hasContentRef.current) {
        hasContentRef.current = true
        setHasContent(true)
      }
    }

    const stop = () => {
      if (!drawing.current) return
      drawing.current = false
      if (hasContentRef.current) exportCropped()
    }

    canvas.addEventListener('mousedown', start)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stop)
    canvas.addEventListener('mouseleave', stop)
    canvas.addEventListener('touchstart', start, { passive: false })
    canvas.addEventListener('touchmove', draw, { passive: false })
    canvas.addEventListener('touchend', stop)

    const ro = new ResizeObserver(() => {
      if (hasContentRef.current) return
      setupCanvas(canvas)
    })
    ro.observe(container)

    return () => {
      ro.disconnect()
      canvas.removeEventListener('mousedown', start)
      canvas.removeEventListener('mousemove', draw)
      canvas.removeEventListener('mouseup', stop)
      canvas.removeEventListener('mouseleave', stop)
      canvas.removeEventListener('touchstart', start)
      canvas.removeEventListener('touchmove', draw)
      canvas.removeEventListener('touchend', stop)
    }
  }, [exportCropped, setupCanvas])

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-studio-white text-[12px] font-semibold">{copy.canvasLabel}</span>
        <button
          type="button"
          onClick={clear}
          className="text-[11px] text-studio-w4 underline bg-transparent border-0 cursor-pointer hover:text-studio-w2"
        >
          {copy.clear}
        </button>
      </div>
      <div
        ref={containerRef}
        className={`rounded-[14px] border-2 border-dashed overflow-hidden bg-studio-bg-3 ${
          hasContent ? 'border-studio-teal-2/40' : 'border-elaya-border'
        }`}
      >
        <canvas
          ref={canvasRef}
          className="block w-full touch-none cursor-crosshair"
          style={{ touchAction: 'none', height: DISPLAY_HEIGHT }}
        />
      </div>
      {!hasContent && (
        <p className="text-studio-w4 text-[11px] text-center mt-2 m-0">
          {copy.hint}
        </p>
      )}
    </div>
  )
}

export default SignatureCanvas
