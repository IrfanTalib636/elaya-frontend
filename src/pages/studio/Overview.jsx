import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Calendar, TrendingUp, Heart, ArrowRight, ListTodo, MessageCircle } from 'lucide-react'
import { useChatUnreadBadges } from '../../hooks/useChatUnreadBadges'
import useAuthStore from '../../store/authStore'
import { listCustomers } from '../../api/customers'
import { listAppointments } from '../../api/appointments'
import { listSessions } from '../../api/sessions'
import { listNachsorge } from '../../api/nachsorge'
import { listStudioOpenActions } from '../../api/openActions'
import { markActionOpened, subscribeOpenActionsChanged } from '../../lib/openActionsSync'
import { Card, Badge, Button, Spinner, PageHeader } from '../../components/ui'
import useContent from '../../i18n/useContent'

const chfFormatter = new Intl.NumberFormat('de-CH', {
  style: 'currency',
  currency: 'CHF',
  maximumFractionDigits: 0,
})
const fmtCHF = (n) => chfFormatter.format(n ?? 0)

const todayISO = () => new Date().toISOString().slice(0, 10)

const KpiCard = ({ icon: Icon, label, value, color = 'text-studio-gold-2' }) => (
  <Card className="flex items-start gap-4">
    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 bg-studio-bg-4 ${color}`}>
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <p className="text-[24px] font-bold text-studio-white m-0 leading-none">{value}</p>
      <p className="text-studio-w2 text-[12px] m-0 mt-1">{label}</p>
    </div>
  </Card>
)

const ApptRow = ({ appt, onClick, typeConsultation, typeTreatment }) => {
  const caseLabel    = appt.case?.caseId ?? '—'
  const customerName = appt.customer
    ? `${appt.customer.vorname ?? ''} ${appt.customer.nachname ?? ''}`.trim() || '—'
    : '—'
  const sessionLabel = appt.type === 'beratung' ? typeConsultation : typeTreatment

  return (
    <tr
      className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="py-3 pr-4 text-studio-white text-[13px] font-medium">{customerName}</td>
      <td className="py-3 pr-4 text-studio-gold-2 text-[12px] font-mono">{caseLabel}</td>
      <td className="py-3 pr-4 text-studio-w1 text-[12px]">{appt.time ?? '—'}</td>
      <td className="py-3 pr-4 text-studio-w2 text-[12px]">{sessionLabel}</td>
      <td className="py-3">
        <Badge variant="status" value={appt.status}>{appt.status}</Badge>
      </td>
    </tr>
  )
}

const StudioOverview = () => {
  const navigate = useNavigate()
  const { language, studioPages, studioActions } = useContent()
  const copy = studioPages.overview
  const profile = useAuthStore((s) => s.profile)
  const user = useAuthStore((s) => s.user)
  const { totalUnread, customerUnread, platformUnread } = useChatUnreadBadges({
    customerChat: true,
    platformChat: true,
  })

  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState({ customers: 0, todayAppts: 0, weekRevenue: 0, openAftercare: 0 })
  const [todayAppts, setTodayAppts] = useState([])
  const [openActions, setOpenActions] = useState({ open: 0, urgent: 0, rows: [] })
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString(language === 'en' ? 'en-GB' : 'de-CH', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      }),
    [language]
  )

  const tableHeaders = [
    copy.headers.customer,
    copy.headers.case,
    copy.headers.time,
    copy.headers.session,
    copy.headers.status,
  ]

  useEffect(() => {
    const load = async () => {
      try {
        const today = todayISO()
        const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)

        const [custRes, apptRes, sessRes, nachsorgeRes] = await Promise.all([
          listCustomers({ limit: 1 }),
          listAppointments({ from: today, to: today, limit: 100 }),
          listSessions({ date_from: weekAgo, date_to: today, limit: 100 }),
          listNachsorge({ page: 1, limit: 50 }).catch(() => null),
        ])

        const appointments = apptRes.data.data.appointments ?? []
        const sessions = sessRes.data.data.sessions ?? []
        const weekRevenue = sessions
          .filter((s) => !s.is_no_show && !s.is_draft)
          .reduce((sum, s) => sum + (s.zahlung?.betragCHF ?? 0), 0)

        const twoWeeksAgo = Date.now() - 14 * 864e5
        const openAftercare = (nachsorgeRes?.data.data.checks ?? []).filter(
          (c) =>
            (c.ampel === 'rot' || c.ampel === 'orange') &&
            new Date(c.erstellt_am).getTime() >= twoWeeksAgo
        ).length

        setKpis({
          customers: custRes.data.data.pagination.total,
          todayAppts: appointments.length,
          weekRevenue,
          openAftercare,
        })
        setTodayAppts(appointments.slice(0, 8))
      } catch {
        // fail silently — KPIs default to 0
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = () => {
      listStudioOpenActions()
        .then((res) => {
          if (cancelled) return
          const data = res.data?.data || {}
          setOpenActions({
            open: data.summary?.open || 0,
            urgent: data.summary?.urgent || 0,
            rows: (data.actions || []).slice(0, 4),
          })
        })
        .catch(() => {
          if (!cancelled) setOpenActions({ open: 0, urgent: 0, rows: [] })
        })
    }
    load()
    const unsubscribe = subscribeOpenActionsChanged(load)
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  const studioName = profile?.firma ?? user?.email ?? copy.studioFallback

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader
        title={copy.title}
        subtitle={`${studioName} · ${todayLabel}`}
      >
        <Button size="sm" variant="secondary" onClick={() => navigate('/studio/customers')}>
          {copy.viewCustomers}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KpiCard icon={Users}      label={copy.kpiActiveCustomers}  value={kpis.customers}           color="text-studio-gold-2" />
        <KpiCard icon={Calendar}   label={copy.kpiTodayAppointments} value={kpis.todayAppts}          color="text-studio-teal"   />
        <KpiCard icon={TrendingUp} label={copy.kpiWeekRevenue}      value={fmtCHF(kpis.weekRevenue)} color="text-studio-gold-2" />
        <KpiCard icon={Heart}      label={copy.kpiOpenAftercare}    value={kpis.openAftercare}       color="text-studio-amber"  />
        <button
          type="button"
          className="text-left bg-transparent border-0 p-0 cursor-pointer"
          onClick={() =>
            navigate(customerUnread > 0 ? '/studio/chat' : platformUnread > 0 ? '/studio/platform-chat' : '/studio/chat')
          }
        >
          <KpiCard
            icon={MessageCircle}
            label={copy.kpiUnreadMessages || 'Unread messages'}
            value={totalUnread}
            color={totalUnread > 0 ? 'text-elaya-error' : 'text-studio-gold-2'}
          />
        </button>
      </div>

      <Card padding="none" className="mb-8">
        <div className="flex items-center justify-between px-5 py-4 border-b border-elaya-border">
          <div>
            <h2 className="text-[14px] font-semibold text-studio-white m-0">{studioActions.title}</h2>
            <p className="text-studio-w3 text-[12px] m-0 mt-1">
              {studioActions.openCount}: {openActions.open} · {studioActions.urgentCount}: {openActions.urgent}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/studio/actions')}
            className="text-studio-gold-2 hover:text-studio-gold-3 gap-1"
          >
            {studioActions.viewAll} <ArrowRight size={13} />
          </Button>
        </div>
        {openActions.rows.length === 0 ? (
          <div className="px-5 py-8 text-center text-studio-w3 text-[13px] flex flex-col items-center gap-2">
            <ListTodo size={18} />
            {studioActions.dashboardEmpty}
          </div>
        ) : (
          <div className="divide-y divide-elaya-border">
            {openActions.rows.map((row) => (
              <button
                key={row.key}
                type="button"
                onClick={() => { markActionOpened(); navigate(row.path || '/studio/actions') }}
                className="w-full text-left px-5 py-3 flex items-center gap-3 bg-transparent border-0 cursor-pointer hover:bg-studio-bg-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-studio-white text-[13px] font-medium m-0 truncate">
                    {row.customer_name}{row.case_ref ? ` · ${row.case_ref}` : ''}
                  </p>
                  <p className="text-studio-w2 text-[12px] m-0 mt-0.5 truncate">
                    {studioActions.types?.[row.type] || row.type}
                  </p>
                </div>
                <span className={`text-[11px] font-semibold ${row.priority === 'hoch' ? 'text-elaya-error' : 'text-studio-gold-2'}`}>
                  {studioActions.priorities?.[row.priority] || row.priority}
                </span>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card padding="none">
        <div className="flex items-center justify-between px-5 py-4 border-b border-elaya-border">
          <h2 className="text-[14px] font-semibold text-studio-white m-0">{copy.todayAppointments}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/studio/today')}
            className="text-studio-gold-2 hover:text-studio-gold-3 gap-1"
          >
            {copy.viewAll} <ArrowRight size={13} />
          </Button>
        </div>

        {todayAppts.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar size={32} className="text-studio-w4 mx-auto mb-3" />
            <p className="text-studio-w2 text-[13px] m-0">{copy.noAppointmentsToday}</p>
          </div>
        ) : (
          <div className="px-5 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-elaya-border">
                  {tableHeaders.map((h) => (
                    <th key={h} className="py-2.5 pr-4 text-left text-[10px] font-semibold text-studio-w3 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todayAppts.map((appt) => (
                  <ApptRow
                    key={appt._id}
                    appt={appt}
                    typeConsultation={copy.typeConsultation}
                    typeTreatment={copy.typeTreatment}
                    onClick={() => navigate(`/studio/cases/${appt.case?._id ?? appt.case}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default StudioOverview
