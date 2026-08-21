import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Card,
  PageHeader,
  Spinner,
  Button,
  Input,
  Modal,
  EmptyState,
  Pagination,
  Badge,
} from '../../components/ui'
import {
  getAdminElaycoinOverview,
  adminAdjustElaycoins,
} from '../../api/adminElaycoins'
import useContent from '../../i18n/useContent'

const AdminElaycoins = () => {
  const { t, adminPages } = useContent()
  const copy = adminPages.elaycoins

  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState([])
  const [summary, setSummary] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [adjustFor, setAdjustFor] = useState(null)
  const [coins, setCoins] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(
    async (pageNum = 1) => {
      setLoading(true)
      try {
        const res = await getAdminElaycoinOverview({
          page: pageNum,
          limit: 20,
          q: q || undefined,
        })
        setCustomers(res.data.data.customers ?? [])
        setSummary(res.data.data.summary)
        setPagination(res.data.data.pagination)
      } catch {
        toast.error(copy.loadError)
      } finally {
        setLoading(false)
      }
    },
    [q, copy.loadError]
  )

  useEffect(() => {
    load(page)
  }, [page, load])

  const submitAdjust = async () => {
    setSaving(true)
    try {
      await adminAdjustElaycoins({
        customer_id: adjustFor.id,
        coins: Number(coins),
        reason,
      })
      toast.success(copy.adjustSaved)
      setAdjustFor(null)
      setCoins('')
      setReason('')
      load(page)
    } catch (e) {
      toast.error(e?.response?.data?.message || copy.adjustError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="flex gap-3 mb-4 items-end">
        <Input
          label={copy.search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={copy.searchPh}
        />
        <Button
          onClick={() => {
            setPage(1)
            load(1)
          }}
        >
          {copy.searchBtn}
        </Button>
      </div>

      {summary ? (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <p className="text-[12px] text-admin-muted m-0">{copy.kpiTotal}</p>
            <p className="text-[20px] font-bold m-0">{summary.total_balance}</p>
          </Card>
          <Card>
            <p className="text-[12px] text-admin-muted m-0">{copy.kpiWithBalance}</p>
            <p className="text-[20px] font-bold m-0">{summary.customers_with_balance}</p>
          </Card>
          <Card>
            <p className="text-[12px] text-admin-muted m-0">{copy.kpiCustomers}</p>
            <p className="text-[20px] font-bold m-0">{summary.total_customers}</p>
          </Card>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : customers.length === 0 ? (
        <EmptyState title={copy.empty} />
      ) : (
        <div className="space-y-3">
          {customers.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold m-0">
                    {c.vorname} {c.nachname}
                  </p>
                  <p className="text-[12px] text-admin-muted m-0">{c.email}</p>
                  <p className="text-[12px] m-0 mt-1">
                    {t('adminPages.elaycoins.studioBalance', {
                      studio: c.studio?.firma || '—',
                    })}
                    <strong>{c.balance}</strong>
                  </p>
                </div>
                <Button variant="secondary" onClick={() => setAdjustFor(c)}>
                  {copy.adjust}
                </Button>
              </div>
              {(c.recent_transactions || []).length > 0 ? (
                <div className="mt-3 space-y-1">
                  {c.recent_transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex justify-between text-[12px] text-admin-muted"
                    >
                      <span>
                        {tx.label || tx.situationKey}
                        {tx.herkunft_studio_name
                          ? ` · ${tx.herkunft_studio_name}`
                          : ''}
                      </span>
                      <Badge variant="default">
                        {(tx.coins || 0) > 0 ? '+' : ''}
                        {tx.coins}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} className="mt-4" />

      {adjustFor ? (
      <Modal
        onClose={() => setAdjustFor(null)}
        title={copy.modalTitle}
      >
        <p className="text-[13px] mb-3">
          {t('adminPages.elaycoins.modalIntro', {
            name: `${adjustFor?.vorname} ${adjustFor?.nachname}`,
            balance: adjustFor?.balance,
          })}
        </p>
        <Input
          label={copy.coinsLabel}
          type="number"
          value={coins}
          onChange={(e) => setCoins(e.target.value)}
        />
        <Input
          label={copy.reason}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-3"
        />
        <Button className="w-full mt-4" loading={saving} onClick={submitAdjust}>
          {copy.save}
        </Button>
      </Modal>
      ) : null}
    </div>
  )
}

export default AdminElaycoins
