import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Calendar, BarChart2, Heart,
  ShoppingBag, Coins, Settings, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ElayaLogo from '../ElayaLogo'
import useAuthStore from '../../store/authStore'
import { common, toast as toastMessages, studioNav } from '../../content'

const NAV_SECTIONS = [
  {
    label: 'STUDIO',
    items: [
      { to: '/studio/dashboard',    icon: LayoutDashboard, label: studioNav?.dashboard    ?? 'Dashboard'    },
      { to: '/studio/customers',    icon: Users,           label: studioNav?.customers    ?? 'Kunden'       },
      { to: '/studio/appointments', icon: Calendar,        label: studioNav?.appointments ?? 'Termine'      },
      { to: '/studio/analytics',    icon: BarChart2,       label: studioNav?.analytics    ?? 'Analytik'     },
      { to: '/studio/crm',          icon: Heart,           label: studioNav?.crm          ?? 'Nachsorge'    },
    ],
  },
  {
    label: 'VERWALTUNG',
    items: [
      { to: '/studio/shop',      icon: ShoppingBag, label: studioNav?.shop      ?? 'Avora Shop'    },
      { to: '/studio/elaycoins', icon: Coins,       label: studioNav?.elaycoins ?? 'Elaycoins'     },
      { to: '/studio/settings',  icon: Settings,    label: studioNav?.settings  ?? 'Einstellungen' },
    ],
  },
]

// ── NavItem ────────────────────────────────────────────────────────────────
const NavItem = ({ to, icon: Icon, label, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative flex items-center py-2 rounded-[10px] text-[13px] font-medium transition-colors w-full group ${
        collapsed ? 'justify-center px-2' : 'px-3 gap-2.5'
      } ${
        isActive
          ? 'bg-(--nav-active-bg) text-studio-gold-2'
          : 'text-studio-w1 hover:text-studio-white hover:bg-studio-bg-4'
      }`
    }
  >
    <Icon size={15} className="shrink-0" />

    {!collapsed && <span className="truncate">{label}</span>}

    {/* Tooltip shown on hover when collapsed */}
    {collapsed && (
      <span className="pointer-events-none absolute left-full ml-2 px-2.5 py-1.5 rounded-[8px] border border-elaya-border bg-studio-bg-3 text-studio-white text-[12px] font-medium whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-100">
        {label}
      </span>
    )}
  </NavLink>
)

// ── Layout ────────────────────────────────────────────────────────────────
const StudioLayout = ({ children }) => {
  const navigate = useNavigate()
  const logout   = useAuthStore((s) => s.logout)
  const user     = useAuthStore((s) => s.user)
  const profile  = useAuthStore((s) => s.profile)

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === '1' } catch { return false }
  })

  const toggleCollapse = () =>
    setCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem('sidebar_collapsed', next ? '1' : '0') } catch {}
      return next
    })

  const handleLogout = async () => {
    await logout()
    toast.success(toastMessages.logoutSuccess)
    navigate('/studio/login')
  }

  const studioName = profile?.firma ?? ''
  const initials   = studioName
    ? studioName.slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'S'

  return (
    <div className="theme-studio min-h-screen bg-studio-bg font-sans flex">

      {/* ── Sidebar ── */}
      <aside className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-elaya-border bg-studio-sidebar transition-[width] duration-200 ease-in-out ${collapsed ? 'w-14' : 'w-studio-sidebar'}`}>

        {/* Logo + collapse toggle */}
        <div className={`flex items-center h-[65px] border-b border-elaya-border shrink-0 ${collapsed ? 'justify-center' : 'px-5 justify-between'}`}>
          {collapsed
            ? <ElayaLogo size="sm" markOnly />
            : <ElayaLogo size="sm" />
          }
          {!collapsed && (
            <button
              type="button"
              onClick={toggleCollapse}
              className="flex items-center justify-center w-6 h-6 rounded-[6px] text-studio-w3 hover:text-studio-white hover:bg-studio-bg-4 transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className={`flex-1 py-4 flex flex-col gap-4 ${collapsed ? 'px-1.5' : 'px-3 overflow-y-auto'}`}>
          {NAV_SECTIONS.map((section, i) => (
            <div key={section.label} className="flex flex-col gap-0.5">
              {collapsed
                ? i > 0 && <div className="h-px bg-elaya-border mx-1 mb-2" />
                : <span className="px-3 mb-1 text-[10px] font-semibold tracking-widest text-studio-w3 uppercase">{section.label}</span>
              }
              {section.items.map((item) => (
                <NavItem key={item.to} {...item} collapsed={collapsed} />
              ))}
            </div>
          ))}
        </nav>

        {/* User + logout */}
        <div className={`border-t border-elaya-border py-4 flex flex-col gap-2 shrink-0 ${collapsed ? 'px-1.5 items-center' : 'px-3'}`}>

          {collapsed ? (
            <>
              {/* Avatar only */}
              <div className="w-8 h-8 rounded-full bg-studio-gold/20 flex items-center justify-center text-studio-gold-2 text-[11px] font-bold">
                {initials}
              </div>
              {/* Logout icon */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center w-8 h-8 rounded-[8px] text-studio-w2 hover:text-studio-white hover:bg-studio-bg-4 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
              </button>
              {/* Expand button */}
              <button
                type="button"
                onClick={toggleCollapse}
                className="flex items-center justify-center w-8 h-8 rounded-[8px] text-studio-w3 hover:text-studio-white hover:bg-studio-bg-4 transition-colors cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </>
          ) : (
            <>
              {/* Full user info */}
              <div className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-studio-gold/20 flex items-center justify-center text-studio-gold-2 text-[11px] font-bold shrink-0">
                  {initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-studio-white text-[12px] font-semibold truncate">
                    {studioName || user?.email || ''}
                  </span>
                  <span className="text-studio-w3 text-[10px] truncate">
                    {profile?.studio_code ?? ''}
                  </span>
                </div>
              </div>
              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 rounded-[10px] text-studio-w2 text-[12px] font-medium cursor-pointer hover:text-studio-white hover:bg-studio-bg-4 transition-colors"
              >
                <LogOut size={14} className="shrink-0" />
                {common.logout}
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={`flex-1 min-h-screen bg-studio-bg transition-[margin-left] duration-200 ease-in-out ${collapsed ? 'ml-14' : 'ml-studio-sidebar'}`}>
        {children}
      </main>
    </div>
  )
}

export default StudioLayout
