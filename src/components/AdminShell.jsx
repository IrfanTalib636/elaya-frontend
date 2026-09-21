import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Store,
  MessageSquare,
  Users,
  Target,
  Microscope,
  ShieldAlert,
  FileText,
  LogOut,
  Search,
  Lock,
  ShoppingBag,
  ToggleLeft,
  ArrowLeftRight,
  Settings,
  Coins,
  Wallet,
  Bell,
  Zap,
  UserCog,
  Brain,
  Contact,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import useContent from '../i18n/useContent'
import ElayaLogo from './ElayaLogo'
import AdminNotificationBell from './admin/AdminNotificationBell'

const ICONS = {
  overview: LayoutDashboard,
  studios: Store,
  studioChat: MessageSquare,
  customers: Users,
  crm: Target,
  engine: Microscope,
  medical: ShieldAlert,
  documents: FileText,
  shop: ShoppingBag,
  features: ToggleLeft,
  transfer: ArrowLeftRight,
  settings: Settings,
  elaycoins: Coins,
  automations: Bell,
  finance: Wallet,
  lasers: Zap,
  users: UserCog,
  studioTeam: Contact,
  ai: Brain,
}

const PRIMARY_NAV = [
  { to: '/admin/overview', id: 'overview' },
  { to: '/admin/studios', id: 'studios' },
  { to: '/admin/studio-chat', id: 'studioChat' },
  { to: '/admin/customers', id: 'customers' },
  { to: '/admin/crm', id: 'crm' },
  { to: '/admin/engine', id: 'engine' },
  { to: '/admin/medical', id: 'medical' },
  { to: '/admin/documents', id: 'documents' },
]

const TOOLS_NAV = [
  { to: '/admin/finance', id: 'finance' },
  { to: '/admin/elaycoins', id: 'elaycoins' },
  { to: '/admin/automations', id: 'automations' },
  { to: '/admin/shop', id: 'shop' },
  { to: '/admin/features', id: 'features' },
  { to: '/admin/lasers', id: 'lasers' },
  { to: '/admin/ai-training', id: 'ai' },
  { to: '/admin/users', id: 'users' },
  { to: '/admin/studio-team', id: 'studioTeam' },
  { to: '/admin/transfers', id: 'transfer' },
  { to: '/admin/settings', id: 'settings' },
]

const NavItem = ({ to, id, label }) => {
  const Icon = ICONS[id] || LayoutDashboard
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors w-full no-underline ${
          isActive
            ? 'bg-(--nav-active-bg) text-studio-gold-2'
            : 'text-studio-w1 hover:text-studio-white hover:bg-studio-bg-4'
        }`
      }
    >
      <Icon size={15} className="shrink-0" />
      <span className="truncate flex-1">{label}</span>
    </NavLink>
  )
}

const AdminShell = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user, profile } = useAuthStore()
  const { toast: toastMessages, adminNav, common } = useContent()
  const [query, setQuery] = useState('')
  const hideFab = location.pathname.startsWith('/admin/studio-chat')

  const labelFor = (id) => adminNav.items.find((i) => i.id === id)?.label || id

  const displayName = useMemo(() => {
    const fromProfile =
      profile?.vorname ||
      profile?.first_name ||
      profile?.name ||
      user?.name ||
      user?.email?.split('@')[0]
    return fromProfile || 'Admin'
  }, [profile, user])

  const handleLogout = async () => {
    await logout()
    toast.success(toastMessages.logoutSuccess)
    navigate('/admin/login')
  }

  const onSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    navigate(`/admin/customers?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="theme-studio theme-admin min-h-screen bg-studio-bg font-sans flex">
      <aside
        translate="no"
        className="fixed left-0 top-0 z-50 flex h-screen w-studio-sidebar flex-col border-r border-elaya-border bg-studio-sidebar"
      >
        <div className="flex items-center h-[65px] border-b border-elaya-border shrink-0 px-5">
          <ElayaLogo size="sm" />
        </div>

        <div className="px-3 pt-4 pb-2">
          <p className="text-studio-w3 text-[10px] uppercase tracking-[0.14em] m-0 px-1">
            {adminNav.sidebarTitle}
          </p>
          <p className="text-studio-w3 text-[10px] uppercase tracking-[0.12em] m-0 mt-0.5 px-1 opacity-70">
            {adminNav.sidebarTag}
          </p>
        </div>

        <form onSubmit={onSearch} className="px-3 mb-2">
          <label className="relative block">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-w3 pointer-events-none"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={adminNav.searchPlaceholder}
              className="w-full rounded-[10px] border border-elaya-border bg-studio-bg-4 py-2 pl-9 pr-3 text-[12px] text-studio-white placeholder:text-studio-w3 outline-none focus:border-studio-gold/50"
            />
          </label>
        </form>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
          {PRIMARY_NAV.map((item) => (
            <NavItem key={item.to} {...item} label={labelFor(item.id)} />
          ))}

          <p className="text-studio-w3 text-[10px] uppercase tracking-wider px-3 pt-4 pb-1 m-0">
            {adminNav.toolsHeading}
          </p>
          {TOOLS_NAV.map((item) => (
            <NavItem key={item.to} {...item} label={labelFor(item.id)} />
          ))}
        </nav>

        <div className="border-t border-elaya-border px-3 py-4 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between gap-2 px-1">
            <p className="text-studio-w3 text-[10px] m-0 leading-snug">{adminNav.versionLabel}</p>
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] border border-elaya-border text-studio-amber"
              title={adminNav.lockHint}
            >
              <Lock size={12} />
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-elaya-border bg-studio-bg-4 py-2 text-studio-white text-[12px] font-semibold cursor-pointer hover:border-studio-gold/40 transition-colors"
          >
            <LogOut size={13} />
            {common.logout}
          </button>
        </div>
      </aside>

      <main className="min-h-screen flex-1 ml-studio-sidebar relative px-7 py-6">
        <div className="absolute top-5 right-7 z-[70]">
          <AdminNotificationBell />
        </div>
        <Outlet context={{ displayName }} />
      </main>

      {!hideFab ? (
        <NavLink
          to="/admin/studio-chat"
          aria-label={labelFor('studioChat')}
          className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-studio-gold text-white shadow-lg shadow-studio-gold/30 no-underline hover:bg-studio-gold-2 transition-colors"
        >
          <MessageSquare size={22} />
        </NavLink>
      ) : null}
    </div>
  )
}

export default AdminShell
