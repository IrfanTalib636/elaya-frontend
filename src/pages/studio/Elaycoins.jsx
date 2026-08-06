import { useState, useEffect, useCallback, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coins, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { getStudioElaycoinOverview } from '../../api/elaycoins'
import { Card, PageHeader, Spinner, Pagination, EmptyState, Badge } from '../../components/ui'
import CustomerAvatar from '../../components/CustomerAvatar'
import { PAGE_SIZE } from '../../constants/pagination'

const SOURCE_LABELS = {
  studio_eigen:         'Studio',
  plattform_vermittelt: 'Plattform',
  studio_wechsel:       'Wechsel',
}

const fmtDate = (d) => {
  if (!d) return '—'
  try {
    return new Intl.DateTimeFormat('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(d))
  } catch {
    return '—'
  }
}

const StudioElaycoins = () => {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [summary, setSummary] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState(null)

  const load = useCallback(async (pageNum, { background = false } = {}) => {
    if (!background) setLoading(true)
    try {
      const res = await getStudioElaycoinOverview({ page: pageNum, limit: PAGE_SIZE })
      setCustomers(res.data.data.customers ?? [])
      setSummary(res.data.data.summary ?? null)
      setPagination(res.data.data.pagination)
    } catch {
      toast.error('Elaycoins konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page, { background: page > 1 })
  }, [page, load])

  const totalRedeemed = customers.reduce((s, c) => s + (c.redeemed_at_studio ?? 0), 0)
  const totalCredited = customers.reduce((s, c) => s + (c.credited_at_studio ?? 0), 0)

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader
        title="Elaycoins"
        subtitle="Coin-Guthaben, Gutschriften und Einlösungen deiner Kunden"
      />

      {loading && customers.length === 0 ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className={loading && customers.length > 0 ? 'opacity-60 pointer-events-none' : ''}>
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-studio-gold/15 text-studio-gold-2 flex items-center justify-center">
                  <Coins size={18} />
                </div>
                <div>
                  <p className="text-[20px] font-bold text-studio-white m-0 tabular-nums">{summary.total_balance ?? 0}</p>
                  <p className="text-studio-w2 text-[12px] m-0">Coins gesamt</p>
                </div>
              </Card>
              <Card>
                <p className="text-[20px] font-bold text-studio-white m-0 tabular-nums">{summary.customers_with_balance ?? 0}</p>
                <p className="text-studio-w2 text-[12px] m-0 mt-1">Kunden mit Guthaben</p>
              </Card>
              <Card>
                <p className="text-[20px] font-bold text-studio-teal-2 m-0 tabular-nums">+{totalCredited}</p>
                <p className="text-studio-w2 text-[12px] m-0 mt-1">Gutgeschrieben (Seite)</p>
              </Card>
              <Card>
                <p className="text-[20px] font-bold text-studio-gold-2 m-0 tabular-nums">−{totalRedeemed}</p>
                <p className="text-studio-w2 text-[12px] m-0 mt-1">Eingelöst (Seite)</p>
              </Card>
            </div>
          )}

          {customers.length === 0 ? (
            <EmptyState title="Keine Kunden" description="Lege Kunden an, um Coin-Konten zu sehen." />
          ) : (
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-elaya-border">
                      {['Kunde', 'E-Mail', 'Quelle', 'Guthaben', 'Gutgeschrieben', 'Eingelöst', ''].map((h) => (
                        <th
                          key={h || 'go'}
                          className="px-5 py-3 text-left text-[10px] font-semibold text-studio-w3 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => {
                      const open = expandedId === c.id
                      return (
                        <Fragment key={c.id}>
                          <tr
                            className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4"
                          >
                            <td className="px-5 py-3">
                              <button
                                type="button"
                                className="flex items-center gap-2.5 bg-transparent border-0 p-0 cursor-pointer text-left"
                                onClick={() => navigate(`/studio/customers/${c.id}`)}
                              >
                                <CustomerAvatar vorname={c.vorname} nachname={c.nachname} />
                                <span className="text-studio-white text-[13px] font-medium" translate="no">
                                  {c.vorname} {c.nachname}
                                </span>
                              </button>
                            </td>
                            <td className="px-5 py-3 text-studio-w2 text-[12px]">{c.email}</td>
                            <td className="px-5 py-3">
                              <Badge variant="source" value={c.akquise_quelle}>
                                {SOURCE_LABELS[c.akquise_quelle] ?? c.akquise_quelle}
                              </Badge>
                            </td>
                            <td className="px-5 py-3 text-studio-gold-2 text-[14px] font-bold tabular-nums">
                              {c.balance ?? 0}
                            </td>
                            <td className="px-5 py-3 text-studio-teal-2 text-[13px] font-semibold tabular-nums">
                              +{c.credited_at_studio ?? 0}
                            </td>
                            <td className="px-5 py-3 text-studio-w1 text-[13px] font-semibold tabular-nums">
                              −{c.redeemed_at_studio ?? 0}
                            </td>
                            <td className="px-5 py-3">
                              <button
                                type="button"
                                className="bg-transparent border-0 p-0 cursor-pointer text-studio-w3 hover:text-studio-white"
                                title="Letzte Transaktionen"
                                onClick={() => setExpandedId(open ? null : c.id)}
                              >
                                <ChevronRight
                                  size={14}
                                  className={open ? 'rotate-90 transition-transform' : 'transition-transform'}
                                />
                              </button>
                            </td>
                          </tr>
                          {open && (c.recent_transactions?.length ?? 0) > 0 ? (
                            <tr className="bg-studio-bg-4/60">
                              <td colSpan={7} className="px-5 py-3">
                                <div className="space-y-1.5">
                                  {(c.recent_transactions ?? []).map((tx) => (
                                    <div
                                      key={tx.id || `${tx.datum}-${tx.coins}`}
                                      className="flex justify-between gap-3 text-[12px]"
                                    >
                                      <span className="text-studio-w2 truncate">
                                        {fmtDate(tx.datum)} · {tx.label || tx.situationKey || '—'}
                                        {tx.herkunft_studio_name
                                          ? ` · ${tx.herkunft_studio_name}`
                                          : ''}
                                      </span>
                                      <span
                                        className={`font-mono font-semibold tabular-nums ${
                                          (tx.coins ?? 0) >= 0
                                            ? 'text-studio-teal-2'
                                            : 'text-studio-gold-2'
                                        }`}
                                      >
                                        {(tx.coins ?? 0) >= 0 ? '+' : ''}
                                        {tx.coins ?? 0}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination pagination={pagination} onPageChange={setPage} />
            </Card>
          )}

          <p className="text-studio-w4 text-[11px] mt-4 m-0">
            Studios vergeben Coins über Behandlungen und Termine. Manuelle Korrekturen nur durch Plattform-Admin.
            Stripe-Auszahlung der Shop-Provision folgt, sobald die Kontodaten vorliegen.
          </p>
        </div>
      )}
    </div>
  )
}

export default StudioElaycoins
