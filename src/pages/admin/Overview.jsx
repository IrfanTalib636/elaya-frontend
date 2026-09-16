import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  Building2,
  Receipt,
  MessageSquare,
  Microscope,
  Coins,
  Wallet,
  Bot,
  ChevronRight,
} from 'lucide-react'
import { Spinner } from '../../components/ui'
import { getShopFinance } from '../../api/adminShop'
import { listAdminStudios } from '../../api/adminStudios'
import useContent from '../../i18n/useContent'

const QUICK_LINKS = [
  { id: 'studios', to: '/admin/studios', Icon: Building2 },
  { id: 'studioChat', to: '/admin/studio-chat', Icon: MessageSquare },
  { id: 'engine', to: '/admin/engine', Icon: Microscope },
  { id: 'elaycoins', to: '/admin/elaycoins', Icon: Coins },
  { id: 'finance', to: '/admin/finance', Icon: Wallet },
  { id: 'aiTraining', to: '/admin/ai-training', Icon: Bot },
]

const AdminOverview = () => {
  const { displayName } = useOutletContext() || {}
  const { adminPages, i18n } = useContent()
  const copy = adminPages.overview

  const [loading, setLoading] = useState(true)
  const [finance, setFinance] = useState(null)
  const [studios, setStudios] = useState([])
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const [f, s] = await Promise.all([
          getShopFinance(),
          listAdminStudios({ limit: 100 }),
        ])
        setFinance(f.data.data)
        setStudios(s.data.data?.studios ?? s.data.data ?? [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const locale = i18n?.language?.startsWith('de') ? 'de-CH' : 'en-GB'
  const clockLabel = useMemo(() => {
    const datePart = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(now)
    const timePart = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now)
    return `${datePart} · ${timePart}`
  }, [now, locale])

  const studioList = Array.isArray(studios) ? studios : []
  const activeStudios = studioList.filter(
    (s) => String(s.status || '').toLowerCase() === 'aktiv' || s.status === 'active'
  ).length
  const activeCount = activeStudios || studioList.length
  const outstandingInvoices = (finance?.studios || []).filter(
    (s) => Number(s.pending_provision || s.provision_open || 0) > 0
  ).length
  const outstanding =
    outstandingInvoices ||
    (Number(finance?.totals?.pending_provision) > 0 ? 1 : 0)

  const recent = useMemo(() => {
    const rows = (finance?.studios || []).slice(0, 5).map((s) => ({
      id: s.studio_id || s.studio_code || s.studio_name,
      title: copy.activityStudioOpened,
      detail: s.studio_name || s.studio_code || '—',
      when: s.last_order_at
        ? new Intl.DateTimeFormat(locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(s.last_order_at))
        : '—',
    }))
    if (rows.length) return rows
    return studioList.slice(0, 3).map((s) => ({
      id: s._id || s.id || s.studio_code,
      title: copy.activityStudioListed,
      detail: s.firma || s.name || s.studio_code || '—',
      when: s.updatedAt
        ? new Intl.DateTimeFormat(locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(s.updatedAt))
        : '—',
    }))
  }, [finance, studioList, copy, locale])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-[1100px]">
      <header className="mb-8">
        <h1 className="text-[28px] leading-tight font-bold text-studio-white m-0 tracking-tight">
          {copy.welcome.replace('{{name}}', displayName || 'Admin')}
        </h1>
        <p className="text-studio-w2 text-[13px] mt-2 mb-0 capitalize">
          {clockLabel}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="relative overflow-hidden rounded-2xl border border-elaya-border bg-studio-bg-3 p-5">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-studio-gold" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-studio-w2 text-[12px] m-0 uppercase tracking-wide">
                {copy.activeStudios}
              </p>
              <p className="text-[40px] font-bold text-studio-white m-0 mt-2 leading-none">
                {activeCount}
              </p>
            </div>
            <Building2 className="text-studio-gold-2 opacity-80" size={26} />
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-elaya-border bg-studio-bg-3 p-5">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-studio-gold" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-studio-w2 text-[12px] m-0 uppercase tracking-wide">
                {copy.outstandingInvoices}
              </p>
              <p className="text-[40px] font-bold text-studio-white m-0 mt-2 leading-none">
                {outstanding}
              </p>
            </div>
            <Receipt className="text-studio-gold-2 opacity-80" size={26} />
          </div>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-studio-white text-[15px] font-semibold m-0 mb-4">
          {copy.quickAccess}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_LINKS.map(({ id, to, Icon }) => {
            const item = copy.quick?.[id] || {}
            return (
              <Link
                key={id}
                to={to}
                className="rounded-2xl border border-elaya-border bg-studio-bg-3 p-5 no-underline text-inherit hover:border-studio-gold/40 transition-colors group flex items-start gap-3"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-studio-bg-4 text-studio-gold-2 border border-elaya-border">
                  <Icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-studio-white text-[14px] font-semibold">
                      {item.title}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-studio-w3 group-hover:text-studio-gold-2 shrink-0"
                    />
                  </span>
                  <span className="block text-studio-w2 text-[12px] mt-1 leading-snug">
                    {item.desc}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-studio-white text-[15px] font-semibold m-0 mb-4">
          {copy.recentActivity}
        </h2>
        <div className="rounded-2xl border border-elaya-border bg-studio-bg-3 overflow-hidden">
          {recent.length === 0 ? (
            <p className="text-studio-w2 text-[13px] m-0 p-5">{copy.activityEmpty}</p>
          ) : (
            <ul className="m-0 p-0 list-none divide-y divide-elaya-border">
              {recent.map((row) => (
                <li key={row.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-studio-bg-4 text-studio-gold-2 border border-elaya-border">
                    <Building2 size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-studio-white text-[13px] m-0 font-medium truncate">
                      {row.title}
                    </p>
                    <p className="text-studio-w2 text-[12px] m-0 mt-0.5 truncate">
                      {row.detail}
                    </p>
                  </div>
                  <span className="text-studio-w3 text-[11px] whitespace-nowrap">
                    {row.when}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

export default AdminOverview
