import { useEffect } from 'react'
import { X } from 'lucide-react'

const Modal = ({ title, onClose, children, width = 'max-w-lg' }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
    >
      <div className={`w-full ${width} bg-studio-bg-3 border border-elaya-border rounded-[18px] shadow-2xl flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-elaya-border shrink-0">
          <h2 className="text-[15px] font-bold text-studio-white m-0">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-studio-w2 hover:text-studio-white hover:bg-studio-bg-4 transition-colors bg-transparent border-0 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
