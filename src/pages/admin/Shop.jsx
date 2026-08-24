import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Card,
  PageHeader,
  Spinner,
  Button,
  Input,
  Select,
  Badge,
  Modal,
  EmptyState,
  Pagination,
} from '../../components/ui'
import {
  listAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  listAdminOrders,
  patchOrderCommission,
} from '../../api/adminShop'
import useContent from '../../i18n/useContent'

const CATEGORY_IDS = ['Nachsorge', 'Sonnenschutz', 'Reinigung', 'Zubehör', 'Sonstiges']
const emptyForm = {
  product_code: '',
  artikelnummer: '',
  name: '',
  beschreibung: '',
  preis_chf: '',
  kategorie: 'Nachsorge',
  bild_url: '',
  lagerbestand: '',
  aktiv: true,
}

const fmt = (n) =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(n || 0)

const AdminShop = () => {
  const { adminPages } = useContent()
  const copy = adminPages.shop
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const loadProducts = useCallback(async (pageNum = 1) => {
    setLoading(true)
    try {
      const res = await listAdminProducts({ page: pageNum, limit: 20 })
      setProducts(res.data.data.products ?? [])
      setPagination(res.data.data.pagination)
    } catch {
      toast.error(copy.productsLoadError)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadOrders = useCallback(async (pageNum = 1) => {
    setLoading(true)
    try {
      const res = await listAdminOrders({ page: pageNum, limit: 20 })
      setOrders(res.data.data.orders ?? [])
      setPagination(res.data.data.pagination)
    } catch {
      toast.error(copy.ordersLoadError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'products') loadProducts(page)
    else loadOrders(page)
  }, [tab, page, loadProducts, loadOrders])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      product_code: p.product_code || '',
      artikelnummer: p.artikelnummer || '',
      name: p.name || '',
      beschreibung: p.beschreibung || '',
      preis_chf: String(p.preis_chf ?? ''),
      kategorie: p.kategorie || 'Sonstiges',
      bild_url: p.bild_url || '',
      lagerbestand: p.lagerbestand == null ? '' : String(p.lagerbestand),
      aktiv: p.aktiv !== false,
    })
    setModalOpen(true)
  }

  const saveProduct = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        preis_chf: Number(form.preis_chf),
        lagerbestand: form.lagerbestand === '' ? null : Number(form.lagerbestand),
      }
      if (editing) {
        await updateAdminProduct(editing.id, payload)
        toast.success(copy.productUpdated)
      } else {
        await createAdminProduct(payload)
        toast.success(copy.productCreated)
      }
      setModalOpen(false)
      loadProducts(page)
    } catch (e) {
      toast.error(e?.response?.data?.message || copy.saveFailed)
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (p) => {
    try {
      await updateAdminProduct(p.id, { aktiv: !p.aktiv })
      loadProducts(page)
    } catch {
      toast.error(copy.statusError)
    }
  }

  const markCommission = async (order, status, { viaStripe = false } = {}) => {
    try {
      await patchOrderCommission(order.id, status, viaStripe ? { pay_via_stripe: true } : {})
      toast.success(viaStripe ? copy.provisionStripe : copy.provisionUpdated)
      loadOrders(page)
    } catch (err) {
      toast.error(
        err?.response?.data?.message || copy.provisionError
      )
    }
  }

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
      >
        {tab === 'products' ? (
          <Button onClick={openCreate}>+ {copy.newProduct}</Button>
        ) : null}
      </PageHeader>

      <div className="flex gap-2 mb-4">
        {['products', 'orders'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setPage(1)
              setTab(t)
            }}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold border cursor-pointer ${
              tab === t
                ? 'border-admin-emerald text-admin-emerald bg-admin-emerald/10'
                : 'border-admin-line text-admin-ivory/70'
            }`}
          >
            {t === 'products' ? copy.tabProducts : copy.tabOrders}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : tab === 'products' ? (
        products.length === 0 ? (
          <EmptyState title={copy.noProducts} description={copy.noProductsDesc} />
        ) : (
          <Card padding="none">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-admin-muted border-b border-admin-line">
                  <th className="p-3">{copy.headers.name}</th>
                  <th className="p-3">{copy.headers.sku}</th>
                  <th className="p-3">{copy.headers.price}</th>
                  <th className="p-3">{copy.headers.stock}</th>
                  <th className="p-3">{copy.headers.status}</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-admin-line/60">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 font-mono text-[12px]">{p.artikelnummer}</td>
                    <td className="p-3">{fmt(p.preis_chf)}</td>
                    <td className="p-3">{p.lagerbestand ?? '∞'}</td>
                    <td className="p-3">
                      <Badge variant="status" value={p.aktiv ? 'aktiv' : 'gesperrt'}>
                        {p.aktiv ? copy.active : copy.inactive}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Button variant="secondary" onClick={() => openEdit(p)}>
                        {copy.edit}
                      </Button>
                      <Button variant="ghost" onClick={() => toggleActive(p)}>
                        {p.aktiv ? copy.deactivate : copy.activate}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )
      ) : orders.length === 0 ? (
        <EmptyState title={copy.noOrders} />
      ) : (
        <Card padding="none">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-admin-muted border-b border-admin-line">
                <th className="p-3">{copy.headers.order}</th>
                <th className="p-3">{copy.headers.studio}</th>
                <th className="p-3">{copy.headers.customer}</th>
                <th className="p-3">{copy.headers.revenue}</th>
                <th className="p-3">{copy.headers.provision}</th>
                <th className="p-3">{copy.headers.payout}</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-admin-line/60">
                  <td className="p-3 font-mono text-[12px]">{o.order_number}</td>
                  <td className="p-3">{o.studio_name}</td>
                  <td className="p-3">{o.kunden_name}</td>
                  <td className="p-3">{fmt(o.total_chf)}</td>
                  <td className="p-3">
                    {fmt(o.provision_betrag)} ({o.provision_prozent}%)
                  </td>
                  <td className="p-3">
                    <Badge variant="status" value={o.commission_status === 'paid' ? 'aktiv' : 'ausstehend'}>
                      {o.commission_status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {o.commission_status !== 'paid' ? (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => markCommission(o, 'paid')}
                        >
                          {copy.markPaidManual}
                        </Button>
                        <Button
                          onClick={() => markCommission(o, 'paid', { viaStripe: true })}
                        >
                          {copy.viaStripe}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => markCommission(o, 'pending')}
                      >
                        {copy.reset}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} className="mt-4" />

      {modalOpen ? (
      <Modal
        onClose={() => setModalOpen(false)}
        title={editing ? copy.editProduct : copy.newProduct}
      >
        <div className="space-y-3">
          <Input
            label={copy.form.name}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={copy.form.productCode}
              value={form.product_code}
              onChange={(e) => setForm({ ...form, product_code: e.target.value })}
              disabled={!!editing}
            />
            <Input
              label={copy.form.sku}
              value={form.artikelnummer}
              onChange={(e) => setForm({ ...form, artikelnummer: e.target.value })}
              disabled={!!editing}
            />
          </div>
          <Input
            label={copy.form.description}
            value={form.beschreibung}
            onChange={(e) => setForm({ ...form, beschreibung: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={copy.form.priceChf}
              type="number"
              value={form.preis_chf}
              onChange={(e) => setForm({ ...form, preis_chf: e.target.value })}
            />
            <Input
              label={copy.form.stock}
              type="number"
              value={form.lagerbestand}
              onChange={(e) => setForm({ ...form, lagerbestand: e.target.value })}
              placeholder={copy.form.stockPh}
            />
          </div>
          <Select
            label={copy.form.category}
            value={form.kategorie}
            onChange={(e) => setForm({ ...form, kategorie: e.target.value })}
          >
            {CATEGORY_IDS.map((c) => (
              <option key={c} value={c}>{copy.categories[c] || c}</option>
            ))}
          </Select>
          <Input
            label={copy.form.imageUrl}
            value={form.bild_url}
            onChange={(e) => setForm({ ...form, bild_url: e.target.value })}
          />
          <label className="flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={form.aktiv}
              onChange={(e) => setForm({ ...form, aktiv: e.target.checked })}
            />
            {copy.form.active}
          </label>
          <Button onClick={saveProduct} loading={saving} className="w-full">
            {copy.save}
          </Button>
        </div>
      </Modal>
      ) : null}
    </div>
  )
}

export default AdminShop
