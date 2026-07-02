import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, Users, Calendar, BarChart2, AlertCircle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { listSessions } from '../../api/sessions'
import { listCustomers } from '../../api/customers'
import { listAppointments } from '../../api/appointments'
import { Card, Spinner, PageHeader } from '../../components/ui'

// ── Formatters ─────────────────────────────────────────────────────────────
const chfFmt = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 })
const fmtCHF = (n) => chfFmt.format(n ?? 0)
const fmtPct = (n, total) => (total > 0 ? `${Math.round((n / total) * 100)}%` : '—')

const MONTHS_DE = ['Jan', 'Feb', 'März', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

const PIPELINE_STAGES = [
  { value: 'Neu',               label: 'Neu',               color: '#4a9aff' },
  { value: 'Beratung geplant',  label: 'Beratung geplant',  color: '#f0a030' },
  { value: 'Behandlung aktiv',  label: 'Behandlung aktiv',  color: '#2ecc8a' },
  { value: 'Beratung erledigt', label: 'Beratung erledigt', color: '#80b8ff' },
]

const PERIODS = [
  { id: 'month',   label: 'Dieser Monat' },
  { id: 'quarter', label: 'Quartal'       },
  { id: 'year',    label: 'Dieses Jahr'   },
  { id: 'all',     label: 'Gesamt'        },
]

// ── Helpers ────────────────────────────────────────────────────────────────
const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const getRange = (period) => {
  const now   = new Date()
  const today = toISO(now)
  if (period === 'month')   return { from: toISO(new Date(now.getFullYear(), now.getMonth(), 1)), to: today }
  if (period === 'quarter') return { from: toISO(new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())), to: today }
  if (period === 'year')    return { from: toISO(new Date(now.getFullYear(), 0, 1)), to: today }
  return { from: null, to: null }
}

const buildChartMonths = () => {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d    = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    return { label: MONTHS_DE[d.getMonth()], from: toISO(d), to: toISO(last), revenue: 0 }
  })
}

// ── Custom tooltip for BarChart ────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-studio-bg-3 border border-elaya-border rounded-[10px] px-3 py-2 shadow-lg">
      <p className="text-studio-w2 text-[11px] m-0 mb-0.5">{label}</p>
      <p className="text-studio-gold-2 text-[13px] font-bold m-0">{fmtCHF(payload[0].value)}</p>
    </div>
  )
}

// ── Custom legend for PieChart ─────────────────────────────────────────────
const PieLegend = ({ payload }) => (
  <ul className="flex flex-col gap-2 mt-2">
    {payload.map((entry) => (
      <li key={entry.value} className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
        <span className="text-studio-w2 text-[11px]">{entry.value}</span>
        <span className="text-studio-w1 text-[11px] font-semibold ml-auto">{entry.payload.count}</span>
      </li>
    ))}
  </ul>
)

// ── KPI card ──────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, color = 'text-studio-gold-2' }) => (
  <Card className="flex items-start gap-4">
    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 bg-studio-bg-4 ${color}`}>
      <Icon size={18} />
    </div>
    <div className="min-w-0 overflow-hidden">
      <p className="text-[18px] font-bold text-studio-white m-0 leading-none truncate">{value}</p>
      <p className="text-studio-w2 text-[12px] m-0 mt-1">{label}</p>
      {sub && <p className="text-studio-w3 text-[11px] m-0 mt-0.5">{sub}</p>}
    </div>
  </Card>
)

// ── Page ───────────────────────────────────────────────────────────────────
const StudioAnalytics = () => {
  const [period, setPeriod]           = useState('month')
  const [loading, setLoading]         = useState(true)
  const [chartLoading, setChartLoading] = useState(true)

  const [stats, setStats] = useState({
    revenue:        0,
    sessionsDone:   0,
    noShows:        0,
    totalCustomers: 0,
    pipeline:       {},
    apptTotal:      0,
    apptCancelled:  0,
  })

  const [chartData, setChartData] = useState(() => buildChartMonths())

  // ── Period data ────────────────────────────────────────────────────────
  const loadPeriod = useCallback(async (p) => {
    setLoading(true)
    try {
      const { from, to } = getRange(p)
      const params        = { is_draft: 'false', limit: 100 }
      if (from) { params.from = from; params.to = to }

      const [sessRes, custRes, apptRes, apptCancelRes, ...pipelineRes] = await Promise.all([
        listSessions(params),
        listCustomers({ limit: 1 }),
        listAppointments({ ...(from ? { from, to } : {}), limit: 1 }),
        listAppointments({ ...(from ? { from, to } : {}), status: 'storniert', limit: 1 }),
        ...PIPELINE_STAGES.map((s) => listCustomers({ pipeline_stufe: s.value, limit: 1 })),
      ])

      const sessions     = sessRes.data.data.sessions ?? []
      const revenue      = sessions.filter((s) => !s.is_no_show).reduce((sum, s) => sum + (s.zahlung?.betragCHF ?? 0), 0)
      const sessionsDone = sessions.filter((s) => !s.is_no_show).length
      const noShows      = sessions.filter((s) => s.is_no_show).length

      const pipeline = {}
      PIPELINE_STAGES.forEach((s, i) => {
        pipeline[s.value] = pipelineRes[i].data.data.pagination.total
      })

      setStats({
        revenue,
        sessionsDone,
        noShows,
        totalCustomers: custRes.data.data.pagination.total,
        pipeline,
        apptTotal:     apptRes.data.data.pagination.total,
        apptCancelled: apptCancelRes.data.data.pagination.total,
      })
    } catch {
      // silent — stats keep previous values
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Chart data (last 6 months, loaded once on mount) ──────────────────
  const loadChart = useCallback(async () => {
    setChartLoading(true)
    try {
      const months    = buildChartMonths()
      const revenues  = await Promise.all(
        months.map((m) =>
          listSessions({ from: m.from, to: m.to, is_draft: 'false', limit: 100 })
            .then((r) => {
              const sessions = r.data.data.sessions ?? []
              return sessions.filter((s) => !s.is_no_show).reduce((sum, s) => sum + (s.zahlung?.betragCHF ?? 0), 0)
            })
            .catch(() => 0)
        )
      )
      setChartData(months.map((m, i) => ({ label: m.label, revenue: revenues[i] })))
    } finally {
      setChartLoading(false)
    }
  }, [])

  useEffect(() => { loadPeriod(period) }, [period, loadPeriod])
  useEffect(() => { loadChart() },        [loadChart])

  const avgPerSession = stats.sessionsDone > 0 ? stats.revenue / stats.sessionsDone : 0

  const pieData = PIPELINE_STAGES.flatMap((s) => {
    const count = stats.pipeline[s.value] ?? 0
    return count > 0 ? [{ name: s.label, value: count, count, color: s.color }] : []
  })

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader title="Analytik" subtitle="Umsatz, Sitzungen & Kunden">
        <div className="flex gap-1 bg-studio-bg-3 p-1 rounded-[10px] border border-elaya-border">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-[7px] text-[11px] font-semibold transition-colors cursor-pointer border-0 ${
                period === p.id
                  ? 'bg-studio-gold text-white'
                  : 'bg-transparent text-studio-w2 hover:text-studio-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* ── KPI row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              icon={TrendingUp}
              label="Umsatz"
              value={fmtCHF(stats.revenue)}
            />
            <KpiCard
              icon={BarChart2}
              label="Sitzungen abgeschlossen"
              value={stats.sessionsDone}
              sub={`Ø ${fmtCHF(avgPerSession)} / Sitzung`}
            />
            <KpiCard
              icon={AlertCircle}
              label="No-Shows"
              value={stats.noShows}
              sub={fmtPct(stats.noShows, stats.sessionsDone + stats.noShows) + ' Rate'}
              color="text-elaya-error"
            />
            <KpiCard
              icon={Calendar}
              label="Stornierte Termine"
              value={stats.apptCancelled}
              sub={fmtPct(stats.apptCancelled, stats.apptTotal) + ' von ' + stats.apptTotal}
              color="text-studio-amber"
            />
          </div>

          {/* ── Charts row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

            {/* Revenue bar chart */}
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-[14px] font-semibold text-studio-white m-0">Umsatz – letzte 6 Monate</h2>
                  <p className="text-studio-w3 text-[11px] m-0 mt-0.5">Abgeschlossene Sitzungen</p>
                </div>
                {chartLoading && <Spinner size="sm" />}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barSize={28} margin={{ top: 4, right: 4, bottom: 0, left: 8 }}>
                  <CartesianGrid vertical={false} stroke="rgba(74,154,255,0.08)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (v === 0 ? '0' : v >= 1000 ? `${v / 1000}k` : v)}
                    label={{ value: 'CHF', angle: -90, position: 'insideLeft', offset: -2, style: { fill: 'rgba(255,255,255,0.25)', fontSize: 10 } }}
                    width={44}
                  />
                  <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(74,154,255,0.06)' }} />
                  <Bar dataKey="revenue" fill="#1e6fd9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Pipeline donut */}
            <Card className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-[12px] bg-studio-bg-4 text-studio-gold-2 flex items-center justify-center shrink-0">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-[22px] font-bold text-studio-white m-0 leading-none">{stats.totalCustomers}</p>
                  <p className="text-studio-w2 text-[12px] m-0 mt-0.5">Aktive Kunden</p>
                </div>
              </div>

              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={34}
                        outerRadius={54}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v, name) => [v, name]}
                        contentStyle={{
                          background: '#0d1c35',
                          border: '1px solid rgba(74,154,255,0.1)',
                          borderRadius: 10,
                          fontSize: 12,
                          color: 'rgba(255,255,255,0.9)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <Legend content={<PieLegend />} payload={pieData.map((d) => ({ value: d.name, color: d.color, payload: d }))} />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-studio-w3 text-[12px] m-0">Keine Kunden vorhanden</p>
                </div>
              )}
            </Card>
          </div>

          {/* ── Summary row ── */}
          <Card>
            <h2 className="text-[14px] font-semibold text-studio-white m-0 mb-4">Sitzungen – Übersicht</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { label: 'Abgeschlossen',  value: stats.sessionsDone,    color: 'text-elaya-success' },
                { label: 'No-Show',        value: stats.noShows,         color: 'text-elaya-error'   },
                { label: 'Ø Umsatz',       value: fmtCHF(avgPerSession), color: 'text-studio-gold-2' },
                { label: 'Termine gesamt', value: stats.apptTotal,       color: 'text-studio-w1'     },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className={`text-[20px] font-bold leading-none ${color}`}>{value}</span>
                  <span className="text-studio-w3 text-[11px]">{label}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

export default StudioAnalytics
