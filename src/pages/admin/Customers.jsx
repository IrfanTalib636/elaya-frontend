import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { listCustomers } from '../../api/customers'
import {
  Card,
  Badge,
  Spinner,
  PageHeader,
  EmptyState,
  Pagination,
} from '../../components/ui'
import CustomerAvatar from '../../components/CustomerAvatar'
import useContent from '../../i18n/useContent'

const PAGE_SIZE = 50

const AdminCustomers = () => {
  const { t, adminPages } = useContent()
  const copy = adminPages.customers
  const [searchParams, setSearchParams] = useSearchParams()

  const initialQ = searchParams.get('q') || ''
  const [customers, setCustomers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(initialQ)
  const [page, setPage] = useState(1)

  const load = useCallback(
    async (q, pageNum) => {
      setLoading(true)
      try {
        const params = { limit: PAGE_SIZE, page: pageNum }
        if (q?.trim()) params.search = q.trim()
        const res = await listCustomers(params)
        setCustomers(res.data.data.customers || [])
        setPagination(res.data.data.pagination || null)
      } catch {
        toast.error(copy.loadError)
      } finally {
        setLoading(false)
      }
    },
    [copy.loadError]
  )

  useEffect(() => {
    const tmr = setTimeout(() => load(search, page), search ? 350 : 0)
    return () => clearTimeout(tmr)
  }, [search, page, load])

  useEffect(() => {
    setPage(1)
  }, [search])

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    if (search.trim()) next.set('q', search.trim())
    else next.delete('q')
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync search into URL
  }, [search])

  const headers = [
    copy.headers?.name || 'Name',
    copy.headers?.email || 'Email',
    copy.headers?.phone || 'Phone',
    copy.headers?.studio || 'Studio',
    copy.headers?.pipeline || 'Pipeline',
    copy.headers?.cases || 'Open cases',
  ]

  return (
    <div className="max-w-[1100px]">
      <PageHeader
        title={copy.title}
        subtitle={
          pagination
            ? t('adminPages.customers.subtitle', { count: pagination.total })
            : copy.subtitle
        }
      />

      <div className="relative flex-1 max-w-sm mb-5">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-w3 pointer-events-none"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={copy.searchPlaceholder}
          className="w-full pl-8 pr-4 py-[9px] rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[13px] outline-none focus:border-studio-gold transition-colors placeholder:text-studio-w3"
        />
      </div>

      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="md" />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title={copy.emptyTitle}
            description={search ? copy.emptySearch : copy.emptyHint}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-elaya-border">
                    {headers.map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[10px] font-semibold text-studio-w3 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr
                      key={c._id || c.id}
                      className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <CustomerAvatar vorname={c.vorname} nachname={c.nachname} />
                          <span className="text-studio-white text-[13px] font-medium">
                            {c.vorname} {c.nachname}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-studio-w1 text-[12px]">{c.email || '—'}</td>
                      <td className="px-5 py-3 text-studio-w1 text-[12px]">{c.telefon || '—'}</td>
                      <td className="px-5 py-3 text-studio-w1 text-[12px]">
                        {c.aktuelle_firma_name || copy.noStudio}
                      </td>
                      <td className="px-5 py-3">
                        {c.pipeline_stufe ? (
                          <Badge variant="pipeline" value={c.pipeline_stufe}>
                            {t(`pipeline.${c.pipeline_stufe}`, {
                              defaultValue: c.pipeline_stufe,
                            })}
                          </Badge>
                        ) : (
                          <span className="text-studio-w3 text-[12px]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-studio-w1 text-[12px] tabular-nums">
                        {c.offene_faelle ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              pagination={pagination}
              onPageChange={setPage}
              showPageNumbers
              forceShow
            />
          </>
        )}
      </Card>
    </div>
  )
}

export default AdminCustomers
