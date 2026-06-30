import { LogOut } from 'lucide-react'
import ElayaLogo from '../ElayaLogo'
import { common } from '../../content'

const StudioLayout = ({ onLogout, children }) => {
  return (
    <div className="theme-studio min-h-screen bg-studio-bg font-sans flex">
      <aside className="elaya-sidebar fixed left-0 top-0 z-50 flex h-screen w-studio-sidebar flex-col border-r border-elaya-border bg-studio-sidebar px-4 py-5">
        <div className="px-2">
          <ElayaLogo size="sm" />
        </div>

        <div className="flex-1" />

        <div className="border-t border-elaya-border pt-4 px-2">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-elaya-border-strong bg-studio-bg-4 py-2 text-studio-w2 text-[12px] font-semibold cursor-pointer hover:bg-studio-bg-5 transition-colors"
          >
            <LogOut size={14} />
            {common.logout}
          </button>
        </div>
      </aside>

      <main className="elaya-main min-h-screen flex-1 ml-studio-sidebar">
        {children}
      </main>
    </div>
  )
}

export default StudioLayout
