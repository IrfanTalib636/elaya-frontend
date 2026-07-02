import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Calendar, TrendingUp, Heart, ArrowRight } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { listCustomers } from '../../api/customers'
import { listAppointments } from '../../api/appointments'
import { listSessions } from '../../api/sessions'
import { Card, Badge, Button, Spinner, PageHeader } from '../../components/ui'

// Cached formatter — created once, not on every render
const chfFormatter = new Intl.NumberFormat('de-CH', {
  style: 'currency',
  currency: 'CHF',
  maximumFractionDigits: 0,
})
const fmtCHF = (n) => chfFormatter.format(n ?? 0)

const todayISO = () => new Date().toISOString().slice(0, 10)

const formatDate = (d) =>
  new Date(d).toLocaleDateString('de-CH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

const TABLE_HEADERS = ['Kunde', 'Fall', 'Zeit', 'Session', 'Status']

// ── Sub-components ────────────────────────────────────────────────────────
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

const ApptRow = ({ appt, onClick }) => {
  const caseLabel    = appt.case?.caseId ?? '—'
  const customerName = appt.customer
    ? `${appt.customer.vorname ?? ''} ${appt.customer.nachname ?? ''}`.trim() || '—'
    : '—'
  const sessionLabel = appt.type === 'beratung' ? 'Beratung' : 'Behandlung'

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

// ── Page ──────────────────────────────────────────────────────────────────
const StudioOverview = () => {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const user = useAuthStore((s) => s.user)

  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState({ customers: 0, todayAppts: 0, weekRevenue: 0 })
  const [todayAppts, setTodayAppts] = useState([])
  const todayLabel = useMemo(() => formatDate(new Date()), [])

  useEffect(() => {
    const load = async () => {
      try {
        const today = todayISO()
        const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)

        const [custRes, apptRes, sessRes] = await Promise.all([
          listCustomers({ limit: 1 }),
          listAppointments({ from: today, to: today, limit: 100 }),
          listSessions({ date_from: weekAgo, date_to: today, limit: 100 }),
        ])

        const appointments = apptRes.data.data.appointments ?? []
        const sessions = sessRes.data.data.sessions ?? []
        const weekRevenue = sessions
          .filter((s) => !s.is_no_show && !s.is_draft)
          .reduce((sum, s) => sum + (s.zahlung?.betragCHF ?? 0), 0)

        setKpis({
          customers: custRes.data.data.pagination.total,
          todayAppts: appointments.length,
          weekRevenue,
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

  const studioName = profile?.firma ?? user?.email ?? 'Studio'

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
        title="Dashboard"
        subtitle={`${studioName} · ${todayLabel}`}
      >
        <Button size="sm" variant="secondary" onClick={() => navigate('/studio/customers')}>
          Kunden ansehen
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard icon={Users}      label="Aktive Kunden"       value={kpis.customers}           color="text-studio-gold-2" />
        <KpiCard icon={Calendar}   label="Heute Termine"       value={kpis.todayAppts}          color="text-studio-teal"   />
        <KpiCard icon={TrendingUp} label="Umsatz diese Woche"  value={fmtCHF(kpis.weekRevenue)} color="text-studio-gold-2" />
        <KpiCard icon={Heart}      label="Offene Nachsorgen"   value={0}                        color="text-studio-amber"  />
      </div>

      <Card padding="none">
        <div className="flex items-center justify-between px-5 py-4 border-b border-elaya-border">
          <h2 className="text-[14px] font-semibold text-studio-white m-0">Heutige Termine</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/studio/today')}
            className="text-studio-gold-2 hover:text-studio-gold-3 gap-1"
          >
            Alle ansehen <ArrowRight size={13} />
          </Button>
        </div>

        {todayAppts.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar size={32} className="text-studio-w4 mx-auto mb-3" />
            <p className="text-studio-w2 text-[13px] m-0">Heute keine Termine</p>
          </div>
        ) : (
          <div className="px-5 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-elaya-border">
                  {TABLE_HEADERS.map((h) => (
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
