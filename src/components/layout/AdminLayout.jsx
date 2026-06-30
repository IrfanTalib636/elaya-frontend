import { LogOut } from 'lucide-react'
import elayadLogo from '../../assets/elaya-logo.png'
import { common } from '../../content'

const AdminLayout = ({ onLogout, children }) => {
  return (
    <div className="theme-admin min-h-screen bg-admin-bg font-admin flex">
      <aside className="elaya-sidebar fixed left-0 top-0 z-50 flex h-screen w-admin-sidebar flex-col border-r border-admin-line bg-admin-bg-card px-4 py-5">
        <div className="px-2">
          <img src={elayadLogo} alt="Elaya" className="elaya-logo block w-[130px]" />
        </div>

        <div className="flex-1" />

        <div className="border-t border-admin-line pt-4 px-2">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-admin-line bg-admin-bg-card-2 py-2 text-admin-ivory text-[13px] font-semibold cursor-pointer hover:border-admin-emerald transition-colors font-sans"
          >
            <LogOut size={14} />
            {common.logout}
          </button>
        </div>
      </aside>

      <main className="elaya-main min-h-screen flex-1 ml-admin-sidebar font-sans">
        {children}
      </main>
    </div>
  )
}

export default AdminLayout
