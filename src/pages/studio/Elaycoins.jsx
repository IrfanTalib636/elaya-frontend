import { useState, useEffect, useCallback } from 'react'
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

const StudioElaycoins = () => {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [summary, setSummary] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

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

  return (
    <div className="p-6 max-w-[1000px]">
      <PageHeader
        title="Elaycoins"
        subtitle="Coin-Guthaben deiner Kunden (nur Lesezugriff)"
      />

      {loading && customers.length === 0 ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className={loading && customers.length > 0 ? 'opacity-60 pointer-events-none' : ''}>
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
                <p className="text-[20px] font-bold text-studio-white m-0 tabular-nums">{summary.total_customers ?? 0}</p>
                <p className="text-studio-w2 text-[12px] m-0 mt-1">Kunden gesamt</p>
              </Card>
            </div>
          )}

          {customers.length === 0 ? (
            <EmptyState title="Keine Kunden" description="Lege Kunden an, um Coin-Konten zu sehen." />
          ) : (
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-elaya-border">
                      {['Kunde', 'E-Mail', 'Quelle', 'Guthaben', ''].map((h) => (
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
                    {customers.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4 cursor-pointer"
                        onClick={() => navigate(`/studio/customers/${c.id}`)}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <CustomerAvatar vorname={c.vorname} nachname={c.nachname} />
                            <span className="text-studio-white text-[13px] font-medium" translate="no">
                              {c.vorname} {c.nachname}
                            </span>
                          </div>
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
                        <td className="px-5 py-3 text-studio-w3"><ChevronRight size={14} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pagination={pagination} onPageChange={setPage} />
            </Card>
          )}

          <p className="text-studio-w4 text-[11px] mt-4 m-0">
            Studios vergeben Coins über Behandlungen und Termine. Manuelle Anpassungen nur durch Plattform-Admin.
          </p>
        </div>
      )}
    </div>
  )
}

export default StudioElaycoins
