import { LogOut } from 'lucide-react'
import ElayaLogo from '../ElayaLogo'
import useContent from '../../i18n/useContent'

const AdminLayout = ({ onLogout, children }) => {
  const { common } = useContent()

  return (
    <div className="theme-studio theme-admin min-h-screen bg-studio-bg font-sans flex">
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-studio-sidebar flex-col border-r border-elaya-border bg-studio-sidebar px-4 py-5">
        <div className="px-2">
          <ElayaLogo size="sm" />
        </div>

        <div className="flex-1" />

        <div className="border-t border-elaya-border pt-4 px-2">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-elaya-border bg-studio-bg-4 py-2 text-studio-white text-[13px] font-semibold cursor-pointer hover:border-studio-gold/40 transition-colors"
          >
            <LogOut size={14} />
            {common.logout}
          </button>
        </div>
      </aside>

      <main className="min-h-screen flex-1 ml-studio-sidebar font-sans px-7 py-6">
        {children}
      </main>
    </div>
  )
}

export default AdminLayout
