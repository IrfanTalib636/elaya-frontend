import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import useAdminNotifications from '../../hooks/useAdminNotifications'
import useContent from '../../i18n/useContent'

export default function AdminNotificationBell() {
  const { common } = useContent()
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const {
    unreadCount,
    items,
    loading,
    loadList,
    openNotification,
    markAllRead,
  } = useAdminNotifications({ enabled: true })

  useEffect(() => {
    if (!open) return undefined
    void loadList()
  }, [open, loadList])

  useEffect(() => {
    if (!open) return undefined
    const onDocClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label={common.notifications ?? 'Notifications'}
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-[10px] text-studio-w2 hover:text-studio-white hover:bg-studio-bg-4 border-0 cursor-pointer transition-colors"
      >
        <Bell size={16} />
        {unreadCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-studio-gold text-[10px] font-bold text-studio-bg flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full mt-2 w-[320px] max-h-[420px] overflow-hidden rounded-[14px] border border-elaya-border bg-studio-bg-3 shadow-xl z-[200] flex flex-col">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-elaya-border">
            <p className="m-0 text-[13px] font-semibold text-studio-white">
              {common.notifications ?? 'Notifications'}
            </p>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-[11px] text-studio-gold-2 bg-transparent border-0 cursor-pointer"
              >
                {common.markAllRead ?? 'Mark all read'}
              </button>
            ) : null}
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <p className="text-studio-w3 text-[12px] text-center py-8 m-0">…</p>
            ) : items.length === 0 ? (
              <p className="text-studio-w3 text-[12px] text-center py-8 m-0">
                {common.noNotifications ?? 'No notifications yet'}
              </p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    void openNotification(n)
                  }}
                  className={`w-full text-left px-3 py-2.5 border-0 border-b border-elaya-border cursor-pointer transition-colors ${
                    n.unread
                      ? 'bg-studio-gold/5 hover:bg-studio-gold/10'
                      : 'bg-transparent hover:bg-studio-bg-4'
                  }`}
                >
                  <p className="m-0 text-[12px] font-semibold text-studio-white truncate">
                    {n.title}
                  </p>
                  <p className="m-0 mt-0.5 text-[11px] text-studio-w3 line-clamp-2">
                    {n.body}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
