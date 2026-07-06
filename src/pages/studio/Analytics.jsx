import { AlertCircle, BarChart2, Calendar, TrendingUp, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell, Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis,
} from 'recharts'
import { getAnalyticsSummary } from '../../api/analytics'
import { PIPELINE_STAGES } from '../../constants/pipeline'
import { Card, PageHeader, Spinner } from '../../components/ui'

// ── Formatters ─────────────────────────────────────────────────────────────
const chfFmt = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 })
const fmtCHF = (n) => chfFmt.format(n ?? 0)
const fmtPct = (n, total) => (total > 0 ? `${Math.round((n / total) * 100)}%` : '—')

const PIPELINE_CHART = PIPELINE_STAGES.map((s, i) => ({
  ...s,
  color: ['#4a9aff', '#f0a030', '#2ecc8a', '#80b8ff'][i],
}))

const PERIODS = [
  { id: 'month',   label: 'Dieser Monat' },
  { id: 'quarter', label: 'Quartal'       },
  { id: 'year',    label: 'Dieses Jahr'   },
  { id: 'all',     label: 'Gesamt'        },
]

const AKQUISE_META = {
  studio_eigen:         { label: 'Studio-Eigen', icon: '🟢', fee: false },
  plattform_vermittelt: { label: 'Plattform',    icon: '🔵', fee: true  },
  studio_wechsel:       { label: 'Wechsel',      icon: '🟠', fee: true  },
}

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
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)

  const load = useCallback(async (p) => {
    setLoading(true)
    try {
      const { from, to } = getRange(p)
      const params = {}
      if (from) {
        params.from = from
        params.to = to
      }
      const res = await getAnalyticsSummary(params)
      setSummary(res.data.data)
    } catch {
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(period) }, [period, load])

  const stats = {
    revenue: summary?.treatment?.revenue ?? 0,
    sessionsDone: summary?.treatment?.session_count ?? 0,
    noShows: summary?.dashboard?.no_show_count ?? 0,
    totalCustomers: summary?.dashboard?.total_customers ?? 0,
    pipeline: summary?.dashboard?.pipeline_counts ?? {},
    apptTotal: summary?.dashboard?.appointments?.total ?? 0,
    apptCancelled: summary?.dashboard?.appointments?.cancelled ?? 0,
  }

  const chartData = summary?.chart_months ?? []

  const avgPerSession = stats.sessionsDone > 0 ? stats.revenue / stats.sessionsDone : 0

  const pieData = PIPELINE_CHART.flatMap((s) => {
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
                {chartData.length === 0 && loading && <Spinner size="sm" />}
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
          <Card className="mb-5">
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

          {/* ── M2: Revenue by source, fees, shop, coins ── */}
          {summary && (
            <>
              <Card className="mb-5">
                <h2 className="text-[14px] font-semibold text-studio-white m-0 mb-1">Umsatz nach Herkunft</h2>
                <p className="text-studio-w3 text-[11px] m-0 mb-4">Behandlungsumsatz ohne No-Shows</p>
                <div className="bg-studio-gold/10 border border-studio-gold/20 rounded-[12px] p-4 mb-4">
                  <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0">Gesamt-Behandlungsumsatz</p>
                  <p className="text-studio-gold-2 text-[24px] font-bold m-0 mt-1 tabular-nums">
                    {fmtCHF(summary.treatment?.revenue)}
                  </p>
                  <p className="text-studio-w4 text-[10px] m-0 mt-1">{summary.treatment?.session_count ?? 0} Sitzung(en)</p>
                </div>
                {Object.entries(AKQUISE_META).map(([key, meta]) => {
                  const row = summary.treatment?.by_akquise?.[key] ?? { umsatz: 0, count: 0 }
                  const fee = meta.fee ? row.umsatz * ((summary.platform_fee?.percent ?? 3) / 100) : 0
                  return (
                    <div key={key} className="flex justify-between items-center py-2.5 border-b border-elaya-border last:border-0">
                      <div className="flex items-center gap-2">
                        <span>{meta.icon}</span>
                        <div>
                          <p className="text-studio-w1 text-[12px] font-semibold m-0">{meta.label}</p>
                          <p className="text-studio-w4 text-[10px] m-0">
                            {row.count} Sitzung(en)
                            {meta.fee && row.umsatz > 0 && ` · ${summary.platform_fee?.percent}% Gebühr: ${fmtCHF(fee)}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-studio-gold-2 text-[13px] font-bold font-mono tabular-nums">{fmtCHF(row.umsatz)}</span>
                    </div>
                  )
                })}
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                <Card>
                  <h2 className="text-[14px] font-semibold text-studio-white m-0 mb-1">Shop-Provision</h2>
                  <p className="text-studio-w3 text-[11px] m-0 mb-4">
                    {summary.shop?.provision_percent ?? 25}% auf ElayShop-Käufe
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 rounded-[10px] bg-studio-bg-4">
                      <p className="text-[18px] font-bold text-studio-white m-0">{summary.shop?.order_count ?? 0}</p>
                      <p className="text-studio-w4 text-[10px] m-0 mt-1">Bestellungen</p>
                    </div>
                    <div className="text-center p-3 rounded-[10px] bg-studio-bg-4">
                      <p className="text-[16px] font-bold text-studio-teal-2 m-0 tabular-nums">{fmtCHF(summary.shop?.revenue)}</p>
                      <p className="text-studio-w4 text-[10px] m-0 mt-1">Shop-Umsatz</p>
                    </div>
                    <div className="text-center p-3 rounded-[10px] bg-studio-gold/10">
                      <p className="text-[16px] font-bold text-studio-gold-2 m-0 tabular-nums">{fmtCHF(summary.shop?.provision_total)}</p>
                      <p className="text-studio-gold-2 text-[10px] m-0 mt-1">Provision</p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h2 className="text-[14px] font-semibold text-studio-white m-0 mb-1">Elaycoins</h2>
                  <p className="text-studio-w3 text-[11px] m-0 mb-4">Übersicht im gewählten Zeitraum</p>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-studio-w2 text-[12px]">Coins gesamt (Studio)</span>
                      <span className="text-studio-gold-2 font-bold tabular-nums">{summary.coins?.total_balance ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-studio-w2 text-[12px]">Kunden mit Guthaben</span>
                      <span className="text-studio-white font-semibold tabular-nums">{summary.coins?.customers_with_balance ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-studio-w2 text-[12px]">Vergeben im Zeitraum</span>
                      <span className="text-elaya-success font-semibold tabular-nums">+{summary.coins?.rewarded_in_period ?? 0}</span>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="border border-studio-teal-2/20">
                <h2 className="text-[14px] font-semibold text-studio-white m-0 mb-1">Netto-Übersicht (ca.)</h2>
                <p className="text-studio-w3 text-[11px] m-0 mb-4">Grobe Rechnung für den gewählten Zeitraum</p>
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-elaya-border">
                    <span className="text-studio-w2 text-[12px]">Behandlungsumsatz</span>
                    <span className="text-studio-white font-semibold font-mono tabular-nums">{fmtCHF(summary.treatment?.revenue)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-elaya-border">
                    <span className="text-studio-w2 text-[12px]">− Plattform-Gebühr ({summary.platform_fee?.percent ?? 3}%)</span>
                    <span className="text-studio-red font-semibold font-mono tabular-nums">− {fmtCHF(summary.platform_fee?.amount)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-elaya-border">
                    <span className="text-studio-w2 text-[12px]">+ Shop-Provision</span>
                    <span className="text-elaya-success font-semibold font-mono tabular-nums">+ {fmtCHF(summary.shop?.provision_total)}</span>
                  </div>
                  <div className="flex justify-between pt-3 mt-1 border-t-2 border-elaya-border">
                    <span className="text-studio-white font-bold text-[13px]">Netto (ca.)</span>
                    <span className="text-studio-teal-2 text-[18px] font-bold font-mono tabular-nums">{fmtCHF(summary.netto_approx)}</span>
                  </div>
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default StudioAnalytics
