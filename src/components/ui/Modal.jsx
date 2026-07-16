import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const getModalRoot = () => document.getElementById('modal-root') || document.body

const Modal = ({ title, onClose, children, width = 'max-w-lg', scrollResetKey }) => {
  const bodyRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!mounted) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mounted])

  useEffect(() => {
    if (scrollResetKey === undefined) return
    const el = bodyRef.current
    if (el) el.scrollTop = 0
  }, [scrollResetKey])

  if (!mounted) return null

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`w-full ${width} bg-studio-bg-3 border border-elaya-border rounded-[18px] shadow-2xl flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-elaya-border shrink-0">
          <h2 id="modal-title" className="text-[15px] font-bold text-studio-white m-0">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-studio-w2 hover:text-studio-white hover:bg-studio-bg-4 transition-colors bg-transparent border-0 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
        <div ref={bodyRef} className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>,
    getModalRoot()
  )
}

export default Modal
