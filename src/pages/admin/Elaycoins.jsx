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

const AdminElaycoins = () => {
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
        toast.error('Elaycoins konnten nicht geladen werden')
      } finally {
        setLoading(false)
      }
    },
    [q]
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
      toast.success('Korrektur gespeichert')
      setAdjustFor(null)
      setCoins('')
      setReason('')
      load(page)
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Korrektur fehlgeschlagen')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader
        title="Elaycoins (Plattform)"
        subtitle="Kunden-Guthaben gehören dem Kunden · studioübergreifende Übersicht · Admin-Korrekturen"
      />

      <div className="flex gap-3 mb-4 items-end">
        <Input
          label="Suche"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name oder E-Mail"
        />
        <Button
          onClick={() => {
            setPage(1)
            load(1)
          }}
        >
          Suchen
        </Button>
      </div>

      {summary ? (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <p className="text-[12px] text-admin-muted m-0">Coins gesamt</p>
            <p className="text-[20px] font-bold m-0">{summary.total_balance}</p>
          </Card>
          <Card>
            <p className="text-[12px] text-admin-muted m-0">Kunden mit Guthaben</p>
            <p className="text-[20px] font-bold m-0">{summary.customers_with_balance}</p>
          </Card>
          <Card>
            <p className="text-[12px] text-admin-muted m-0">Kunden</p>
            <p className="text-[20px] font-bold m-0">{summary.total_customers}</p>
          </Card>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : customers.length === 0 ? (
        <EmptyState title="Keine Kunden" />
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
                    Studio: {c.studio?.firma || '—'} · Balance:{' '}
                    <strong>{c.balance}</strong>
                  </p>
                </div>
                <Button variant="secondary" onClick={() => setAdjustFor(c)}>
                  Korrigieren
                </Button>
              </div>
              {(c.recent_transactions || []).length > 0 ? (
                <div className="mt-3 space-y-1">
                  {c.recent_transactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex justify-between text-[12px] text-admin-muted"
                    >
                      <span>
                        {t.label || t.situationKey}
                        {t.herkunft_studio_name
                          ? ` · ${t.herkunft_studio_name}`
                          : ''}
                      </span>
                      <Badge variant="default">
                        {(t.coins || 0) > 0 ? '+' : ''}
                        {t.coins}
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
        title="Elaycoin-Korrektur"
      >
        <p className="text-[13px] mb-3">
          {adjustFor?.vorname} {adjustFor?.nachname} · aktuell {adjustFor?.balance}{' '}
          Coins
        </p>
        <Input
          label="Coins (+ gutschreiben / − abziehen)"
          type="number"
          value={coins}
          onChange={(e) => setCoins(e.target.value)}
        />
        <Input
          label="Grund"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-3"
        />
        <Button className="w-full mt-4" loading={saving} onClick={submitAdjust}>
          Speichern
        </Button>
      </Modal>
      ) : null}
    </div>
  )
}

export default AdminElaycoins
