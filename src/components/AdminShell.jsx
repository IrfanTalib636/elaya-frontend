import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Store,
  Coins,
  Wallet,
  ToggleLeft,
  ShoppingBag,
  LogOut,
  ArrowLeftRight,
  Settings,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { toast as toastMessages, adminNav } from '../content'
import ElayaLogo from './ElayaLogo'

const ICONS = {
  overview: LayoutDashboard,
  studios: Store,
  elaycoins: Coins,
  finance: Wallet,
  features: ToggleLeft,
  shop: ShoppingBag,
  transfer: ArrowLeftRight,
  settings: Settings,
}

const NAV = [
  { to: '/admin/overview', id: 'overview' },
  { to: '/admin/studios', id: 'studios' },
  { to: '/admin/shop', id: 'shop' },
  { to: '/admin/finance', id: 'finance' },
  { to: '/admin/elaycoins', id: 'elaycoins' },
  { to: '/admin/features', id: 'features' },
  { to: '/admin/transfers', id: 'transfer' },
  { to: '/admin/settings', id: 'settings' },
]

const AdminShell = () => {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    toast.success(toastMessages.logoutSuccess)
    navigate('/admin/login')
  }

  const labelFor = (id) => adminNav.items.find((i) => i.id === id)?.label || id

  return (
    <div className="theme-admin min-h-screen bg-admin-bg font-admin flex">
      <aside className="elaya-sidebar fixed left-0 top-0 z-50 flex h-screen w-admin-sidebar flex-col border-r border-admin-line bg-admin-bg-card px-3 py-5">
        <div className="px-2 mb-6">
          <ElayaLogo size="sm" />
          <p className="text-admin-muted text-[10px] mt-2 uppercase tracking-wider">
            {adminNav.sidebarTitle}
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-1">
          {NAV.map((item) => {
            const Icon = ICONS[item.id] || LayoutDashboard
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-admin-emerald/15 text-admin-emerald'
                      : 'text-admin-ivory/80 hover:bg-admin-bg-card-2 hover:text-admin-ivory'
                  }`
                }
              >
                <Icon size={16} />
                {labelFor(item.id)}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-admin-line pt-4 px-2">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-admin-line bg-admin-bg-card-2 py-2 text-admin-ivory text-[13px] font-semibold cursor-pointer hover:border-admin-emerald transition-colors font-sans"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      <main className="elaya-main min-h-screen flex-1 ml-admin-sidebar font-sans">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminShell
