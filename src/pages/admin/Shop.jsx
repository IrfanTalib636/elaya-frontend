import { useCallback, useEffect, useMemo, useState } from 'react'
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
  uploadAdminProductImages,
  listAdminOrders,
  patchOrderCommission,
  getAdminShipping,
  updateAdminShopCatalog,
  listAdminPromotions,
  createAdminPromotion,
  updateAdminPromotion,
  deleteAdminPromotion,
} from '../../api/adminShop'
import useContent from '../../i18n/useContent'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../constants/roles'
import { resolveProductPrice, pickActivePromotion, formatMoney, isDiscountInRange } from '../../utils/shopPricing'
import { resolveShopImageUrl } from '../../utils/mediaUrl'

const CATEGORY_IDS = ['Nachsorge', 'Sonnenschutz', 'Reinigung', 'Zubehör', 'Sonstiges']
const CURRENCIES = ['CHF', 'EUR']

const emptyDiscount = {
  aktiv: false,
  typ: 'percent',
  wert: '',
  von: '',
  bis: '',
  stackable_with_general: false,
  exclude_from_general: false,
}

const emptyForm = {
  product_code: '',
  artikelnummer: '',
  name: '',
  beschreibung: '',
  preis_chf: '',
  waehrung: 'CHF',
  kategorie: 'Nachsorge',
  ursprung: '',
  bild_url: '',
  bilder: [],
  lagerbestand: '',
  aktiv: true,
  rabatt: emptyDiscount,
}

const emptyPromoForm = {
  name: '',
  aktiv: true,
  typ: 'percent',
  wert: '',
  waehrung: 'CHF',
  von: '',
  bis: '',
  exclude_product_ids: [],
}

const fmt = (n, currency = 'CHF') => formatMoney(n, currency)

/** yyyy-MM-dd for <input type="date"> from an ISO string / Date / ''. */
const toDateInput = (v) => {
  if (!v) return ''
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

/** Strikethrough original + highlighted final price — shared by product rows and previews. */
const PricePreview = ({ price, size = 'md' }) => {
  const big = size === 'lg' ? 'text-[18px]' : 'text-[13px]'
  if (!price || price.savings <= 0) {
    return <span className={`font-mono font-semibold text-studio-white ${big}`}>{fmt(price?.final ?? 0, price?.currency)}</span>
  }
  return (
    <span className="inline-flex items-center gap-2 flex-wrap">
      <span className="font-mono text-studio-w3 text-[11px] line-through">{fmt(price.original, price.currency)}</span>
      <span className={`font-mono font-bold text-admin-emerald ${big}`}>{fmt(price.final, price.currency)}</span>
      {price.discount_label ? (
        <Badge className="bg-admin-emerald/15 text-admin-emerald">{price.discount_label}</Badge>
      ) : null}
    </span>
  )
}

const PromotionStatusBadge = ({ promo, copy }) => {
  const now = new Date()
  const inRange = isDiscountInRange(now, promo.von, promo.bis)
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
  const start = typeof promo.von === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(promo.von)
    ? promo.von
    : promo.von
      ? new Date(promo.von).toISOString().slice(0, 10)
      : ''
  let label = copy.statusOff
  let cls = 'bg-studio-w4 text-studio-w2'
  if (promo.aktiv) {
    if (!inRange && start && today < start) {
      label = copy.statusScheduled
      cls = 'bg-studio-gold/15 text-studio-gold-2'
    } else if (!inRange) {
      label = copy.statusExpired
      cls = 'bg-elaya-error/15 text-elaya-error'
    } else {
      label = copy.statusActive
      cls = 'bg-admin-emerald/15 text-admin-emerald'
    }
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>{label}</span>
}

const AdminShop = () => {
  const { adminPages } = useContent()
  const copy = adminPages.shop
  const role = useAuthStore((s) => s.user?.role)
  const canManage = role === ROLES.SUPER_ADMIN
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [promotions, setPromotions] = useState([])
  const [categories, setCategories] = useState(CATEGORY_IDS)
  const [shippingRates, setShippingRates] = useState({})
  const [newCategory, setNewCategory] = useState('')
  const [catalogSaving, setCatalogSaving] = useState(false)
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState('')

  const [promoModalOpen, setPromoModalOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState(null)
  const [promoForm, setPromoForm] = useState(emptyPromoForm)
  const [promoSaving, setPromoSaving] = useState(false)
  const [previewProductId, setPreviewProductId] = useState('')

  const loadProducts = useCallback(async (pageNum = 1) => {
    setLoading(true)
    try {
      const res = await listAdminProducts({ page: pageNum, limit: 20 })
      setProducts(res.data.data.products ?? [])
      if (Array.isArray(res.data.data.categories) && res.data.data.categories.length) {
        setCategories(res.data.data.categories)
      }
      setPagination(res.data.data.pagination)
    } catch {
      toast.error(copy.productsLoadError)
    } finally {
      setLoading(false)
    }
  }, [copy.productsLoadError])

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
  }, [copy.ordersLoadError])

  const loadCatalog = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAdminShipping()
      const data = res.data.data || {}
      setShippingRates(data.rates || {})
      if (Array.isArray(data.categories) && data.categories.length) {
        setCategories(data.categories)
      }
      setPagination(null)
    } catch {
      toast.error(copy.shippingLoadError || 'Could not load shop catalog settings')
    } finally {
      setLoading(false)
    }
  }, [copy.shippingLoadError])

  const loadPromotions = useCallback(async (pageNum = 1) => {
    setLoading(true)
    try {
      const res = await listAdminPromotions({ page: pageNum, limit: 50 })
      setPromotions(res.data.data.promotions ?? [])
      setPagination(res.data.data.pagination ?? null)
    } catch {
      toast.error(copy.promotions.loadError)
    } finally {
      setLoading(false)
    }
  }, [copy.promotions.loadError])

  // Need the product catalog loaded for the promotions tab's exclude-list + preview,
  // even when the active tab is "promotions".
  useEffect(() => {
    if (!products.length) loadProducts(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (tab === 'products') loadProducts(page)
    else if (tab === 'orders') loadOrders(page)
    else if (tab === 'promotions') loadPromotions(page)
    else void loadCatalog()
  }, [tab, page, loadProducts, loadOrders, loadCatalog, loadPromotions])

  const activePromotion = useMemo(() => pickActivePromotion(promotions), [promotions])

  const openCreate = () => {
    if (!canManage) return
    setEditing(null)
    setForm({ ...emptyForm, kategorie: categories[0] || 'Sonstiges', rabatt: { ...emptyDiscount } })
    setNewImageUrl('')
    setModalOpen(true)
  }

  const openEdit = (p) => {
    if (!canManage) return
    setEditing(p)
    setForm({
      product_code: p.product_code || '',
      artikelnummer: p.artikelnummer || '',
      name: p.name || '',
      beschreibung: p.beschreibung || '',
      preis_chf: String(p.preis_chf ?? ''),
      waehrung: p.waehrung || 'CHF',
      kategorie: p.kategorie || categories[0] || 'Sonstiges',
      ursprung: p.ursprung || '',
      bild_url: p.bild_url || '',
      bilder: Array.isArray(p.bilder) ? [...p.bilder] : (p.bild_url ? [p.bild_url] : []),
      lagerbestand: p.lagerbestand == null ? '' : String(p.lagerbestand),
      aktiv: p.aktiv !== false,
      rabatt: {
        aktiv: p.rabatt?.aktiv ?? false,
        typ: p.rabatt?.typ ?? 'percent',
        wert: p.rabatt?.wert != null ? String(p.rabatt.wert) : '',
        von: toDateInput(p.rabatt?.von),
        bis: toDateInput(p.rabatt?.bis),
        stackable_with_general: p.rabatt?.stackable_with_general ?? false,
        exclude_from_general: p.rabatt?.exclude_from_general ?? false,
      },
    })
    setNewImageUrl('')
    setModalOpen(true)
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const res = await uploadAdminProductImages(files)
      const urls = res.data.data.urls || []
      setForm((f) => ({ ...f, bilder: [...f.bilder, ...urls] }))
      toast.success(copy.form.uploadImages)
    } catch (err) {
      toast.error(err?.response?.data?.message || copy.saveFailed)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const addImageUrl = () => {
    const url = newImageUrl.trim()
    if (!url) return
    setForm((f) => ({ ...f, bilder: [...f.bilder, url] }))
    setNewImageUrl('')
  }

  const removeImageAt = (index) => {
    setForm((f) => ({ ...f, bilder: f.bilder.filter((_, i) => i !== index) }))
  }

  // Live preview reflects the in-progress form state (not yet saved).
  const formPreviewPrice = useMemo(() => {
    const draft = {
      id: editing?.id,
      preis_chf: Number(form.preis_chf) || 0,
      waehrung: form.waehrung,
      rabatt: {
        aktiv: form.rabatt.aktiv,
        typ: form.rabatt.typ,
        wert: Number(form.rabatt.wert) || 0,
        von: form.rabatt.von || null,
        bis: form.rabatt.bis || null,
        stackable_with_general: form.rabatt.stackable_with_general,
        exclude_from_general: form.rabatt.exclude_from_general,
      },
    }
    return resolveProductPrice(draft, { generalPromo: activePromotion })
  }, [form, editing, activePromotion])

  const saveProduct = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        preis_chf: Number(form.preis_chf),
        lagerbestand: form.lagerbestand === '' ? null : Number(form.lagerbestand),
        bild_url: form.bilder[0] || form.bild_url || '',
        rabatt: {
          aktiv: form.rabatt.aktiv,
          typ: form.rabatt.typ,
          wert: form.rabatt.wert === '' ? 0 : Number(form.rabatt.wert),
          von: form.rabatt.von || null,
          bis: form.rabatt.bis || null,
          stackable_with_general: form.rabatt.stackable_with_general,
          exclude_from_general: form.rabatt.exclude_from_general,
        },
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
    if (!canManage) return
    try {
      await updateAdminProduct(p.id, { aktiv: !p.aktiv })
      loadProducts(page)
    } catch {
      toast.error(copy.statusError)
    }
  }

  const markCommission = async (order, status, { viaStripe = false } = {}) => {
    if (!canManage) return
    try {
      await patchOrderCommission(order.id, status, viaStripe ? { pay_via_stripe: true } : {})
      toast.success(viaStripe ? copy.provisionStripe : copy.provisionUpdated)
      loadOrders(page)
    } catch (err) {
      toast.error(err?.response?.data?.message || copy.provisionError)
    }
  }

  const saveCatalog = async (nextRates = shippingRates, nextCategories = categories) => {
    if (!canManage) return
    setCatalogSaving(true)
    try {
      const res = await updateAdminShopCatalog({
        rates: nextRates,
        categories: nextCategories,
      })
      setShippingRates(res.data.data.rates || nextRates)
      setCategories(res.data.data.categories || nextCategories)
      toast.success(copy.catalogSaved || 'Shop catalog saved')
    } catch (e) {
      toast.error(e?.response?.data?.message || copy.catalogSaveError || 'Could not save')
    } finally {
      setCatalogSaving(false)
    }
  }

  const addCategory = () => {
    const name = newCategory.trim()
    if (!name) return
    if (categories.includes(name)) {
      toast.error(copy.categoryExists || 'Category already exists')
      return
    }
    const next = [...categories, name]
    setCategories(next)
    setNewCategory('')
    void saveCatalog(shippingRates, next)
  }

  const removeCategory = (name) => {
    if (categories.length <= 1) {
      toast.error(copy.categoryMin || 'At least one category is required')
      return
    }
    const next = categories.filter((c) => c !== name)
    setCategories(next)
    void saveCatalog(shippingRates, next)
  }

  // ── Promotions ────────────────────────────────────────────────────────
  const pcopy = copy.promotions

  const openCreatePromo = () => {
    if (!canManage) return
    setEditingPromo(null)
    setPromoForm({ ...emptyPromoForm })
    setModalOpen(false)
    setPromoModalOpen(true)
  }

  const openEditPromo = (promo) => {
    if (!canManage) return
    setEditingPromo(promo)
    setPromoForm({
      name: promo.name || '',
      aktiv: promo.aktiv !== false,
      typ: promo.typ || 'percent',
      wert: promo.wert != null ? String(promo.wert) : '',
      waehrung: promo.waehrung || 'CHF',
      von: toDateInput(promo.von),
      bis: toDateInput(promo.bis),
      exclude_product_ids: promo.exclude_product_ids || [],
    })
    setPromoModalOpen(true)
  }

  const togglePromoExcludeProduct = (productId) => {
    setPromoForm((f) => {
      const has = f.exclude_product_ids.includes(productId)
      return {
        ...f,
        exclude_product_ids: has
          ? f.exclude_product_ids.filter((id) => id !== productId)
          : [...f.exclude_product_ids, productId],
      }
    })
  }

  const savePromotion = async () => {
    setPromoSaving(true)
    try {
      const payload = {
        name: promoForm.name.trim(),
        aktiv: promoForm.aktiv,
        typ: promoForm.typ,
        wert: Number(promoForm.wert) || 0,
        waehrung: promoForm.waehrung,
        von: promoForm.von || null,
        bis: promoForm.bis || null,
        exclude_product_ids: promoForm.exclude_product_ids,
      }
      if (editingPromo) {
        await updateAdminPromotion(editingPromo.id, payload)
        toast.success(pcopy.updated)
      } else {
        await createAdminPromotion(payload)
        toast.success(pcopy.created)
      }
      setPromoModalOpen(false)
      loadPromotions(page)
    } catch (e) {
      toast.error(e?.response?.data?.message || pcopy.saveFailed)
    } finally {
      setPromoSaving(false)
    }
  }

  const removePromotion = async (promo) => {
    if (!canManage) return
    if (!window.confirm(pcopy.deleteConfirm)) return
    try {
      await deleteAdminPromotion(promo.id)
      toast.success(pcopy.deleted)
      loadPromotions(page)
    } catch (e) {
      toast.error(e?.response?.data?.message || pcopy.deleteFailed)
    }
  }

  // Live preview in the promotion modal — against the currently edited promo draft.
  const promoDraftPromo = useMemo(
    () => ({
      aktiv: promoForm.aktiv,
      typ: promoForm.typ,
      wert: Number(promoForm.wert) || 0,
      waehrung: promoForm.waehrung,
      von: promoForm.von || null,
      bis: promoForm.bis || null,
      exclude_product_ids: promoForm.exclude_product_ids,
    }),
    [promoForm]
  )
  const previewProduct = products.find((p) => p.id === previewProductId) || products[0] || null
  const promoPreviewPrice = previewProduct
    ? resolveProductPrice(previewProduct, { generalPromo: promoDraftPromo })
    : null

  const promoPeriodLabel = (promo) => {
    if (!promo.von && !promo.bis) return pcopy.noPeriod
    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('de-CH') : '…')
    return `${fmtDate(promo.von)} – ${fmtDate(promo.bis)}`
  }

  const tabs = [
    { id: 'products', label: copy.tabProducts },
    { id: 'promotions', label: copy.tabPromotions || 'Promotions' },
    { id: 'categories', label: copy.tabCategories || 'Categories' },
    { id: 'shipping', label: copy.tabShipping || 'Shipping' },
    { id: 'orders', label: copy.tabOrders },
  ]

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader title={copy.title} subtitle={copy.subtitle}>
        {tab === 'products' && canManage ? (
          <Button onClick={openCreate}>+ {copy.newProduct}</Button>
        ) : tab === 'promotions' && canManage ? (
          <Button onClick={openCreatePromo}>+ {pcopy.newPromotion}</Button>
        ) : null}
      </PageHeader>

      {!canManage ? (
        <div className="mb-4 px-4 py-3 rounded-[12px] border border-elaya-border bg-studio-bg-4">
          <p className="text-studio-w2 text-[12px] m-0">{copy.superAdminOnlyHint}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setPage(1)
              setTab(t.id)
            }}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold border cursor-pointer ${
              tab === t.id
                ? 'border-admin-emerald text-admin-emerald bg-admin-emerald/10'
                : 'border-admin-line text-admin-ivory/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : tab === 'categories' ? (
        <Card>
          <p className="m-0 mb-3 text-[12px] text-studio-w2">
            {copy.categoriesHint ||
              'Manage product categories used in the catalog. Changes apply platform-wide.'}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-2 rounded-[10px] border border-elaya-border bg-studio-bg-4 px-3 py-1.5 text-[12px]"
              >
                {copy.categories?.[c] || c}
                {canManage ? (
                  <button
                    type="button"
                    onClick={() => removeCategory(c)}
                    className="bg-transparent border-0 text-studio-w3 cursor-pointer hover:text-red-400"
                  >
                    ×
                  </button>
                ) : null}
              </span>
            ))}
          </div>
          {canManage ? (
            <div className="flex gap-2 items-end max-w-md">
              <Input
                label={copy.newCategory || 'New category'}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button loading={catalogSaving} onClick={addCategory}>
                {copy.addCategory || 'Add'}
              </Button>
            </div>
          ) : null}
        </Card>
      ) : tab === 'shipping' ? (
        <Card>
          <p className="m-0 mb-3 text-[12px] text-studio-w2">
            {copy.shippingHint ||
              'Shipping rates (CHF) and free-shipping thresholds by country.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[720px]">
            {Object.keys(shippingRates).map((key) => (
              <Input
                key={key}
                label={key}
                type="number"
                step="0.1"
                value={String(shippingRates[key] ?? '')}
                disabled={!canManage}
                onChange={(e) =>
                  setShippingRates((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                }
              />
            ))}
          </div>
          {canManage ? (
            <Button
              className="mt-4"
              loading={catalogSaving}
              onClick={() => void saveCatalog()}
            >
              {copy.saveShipping || 'Save shipping'}
            </Button>
          ) : null}
        </Card>
      ) : tab === 'promotions' ? (
        promotions.length === 0 ? (
          <EmptyState title={pcopy.empty} description={pcopy.emptyDesc} />
        ) : (
          <Card padding="none">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-admin-muted border-b border-admin-line">
                  <th className="p-3">{pcopy.headers.name}</th>
                  <th className="p-3">{pcopy.headers.type}</th>
                  <th className="p-3">{pcopy.headers.value}</th>
                  <th className="p-3">{pcopy.headers.period}</th>
                  <th className="p-3">{pcopy.headers.status}</th>
                  <th className="p-3">{pcopy.headers.excluded}</th>
                  {canManage ? <th className="p-3" /> : null}
                </tr>
              </thead>
              <tbody>
                {promotions.map((p) => (
                  <tr key={p.id} className="border-b border-admin-line/60">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3">{p.typ === 'fixed' ? pcopy.typeFixed : pcopy.typePercent}</td>
                    <td className="p-3 font-mono">
                      {p.typ === 'fixed' ? fmt(p.wert, p.waehrung) : `${p.wert}%`}
                    </td>
                    <td className="p-3 text-[12px] text-studio-w2">{promoPeriodLabel(p)}</td>
                    <td className="p-3"><PromotionStatusBadge promo={p} copy={pcopy} /></td>
                    <td className="p-3 text-[12px] text-studio-w2">{p.exclude_product_ids.length}</td>
                    {canManage ? (
                      <td className="p-3 text-right space-x-2 whitespace-nowrap">
                        <Button variant="secondary" onClick={() => openEditPromo(p)}>
                          {copy.edit}
                        </Button>
                        <Button variant="danger" onClick={() => removePromotion(p)}>
                          {pcopy.delete}
                        </Button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )
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
                  {canManage ? <th className="p-3" /> : null}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const price = resolveProductPrice(p, { generalPromo: activePromotion })
                  return (
                    <tr key={p.id} className="border-b border-admin-line/60">
                      <td className="p-3 font-medium">
                        <div className="flex items-center gap-2">
                          {p.bild_url ? (
                            <img
                              src={resolveShopImageUrl(p.bild_url)}
                              alt=""
                              className="w-8 h-8 rounded object-cover border border-elaya-border"
                            />
                          ) : null}
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[12px]">{p.artikelnummer}</td>
                      <td className="p-3"><PricePreview price={price} /></td>
                      <td className="p-3">{p.lagerbestand ?? '∞'}</td>
                      <td className="p-3">
                        <Badge variant="status" value={p.aktiv ? 'aktiv' : 'gesperrt'}>
                          {p.aktiv ? copy.active : copy.inactive}
                        </Badge>
                      </td>
                      {canManage ? (
                        <td className="p-3 text-right space-x-2 whitespace-nowrap">
                          <Button variant="secondary" onClick={() => openEdit(p)}>
                            {copy.edit}
                          </Button>
                          <Button variant="ghost" onClick={() => toggleActive(p)}>
                            {p.aktiv ? copy.deactivate : copy.activate}
                          </Button>
                        </td>
                      ) : null}
                    </tr>
                  )
                })}
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
                {canManage ? <th className="p-3" /> : null}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-admin-line/60">
                  <td className="p-3 font-mono text-[12px]">{o.order_number}</td>
                  <td className="p-3">{o.studio_name}</td>
                  <td className="p-3">{o.kunden_name}</td>
                  <td className="p-3">{fmt(o.total_chf, o.waehrung)}</td>
                  <td className="p-3">
                    {fmt(o.provision_betrag, o.waehrung)} ({o.provision_prozent}%)
                  </td>
                  <td className="p-3">
                    <Badge variant="status" value={o.commission_status === 'paid' ? 'aktiv' : 'ausstehend'}>
                      {o.commission_status}
                    </Badge>
                  </td>
                  {canManage ? (
                    <td className="p-3 text-right space-x-2">
                      {o.commission_status !== 'paid' ? (
                        <>
                          <Button variant="secondary" onClick={() => markCommission(o, 'paid')}>
                            {copy.markPaidManual}
                          </Button>
                          <Button onClick={() => markCommission(o, 'paid', { viaStripe: true })}>
                            {copy.viaStripe}
                          </Button>
                        </>
                      ) : (
                        <Button variant="ghost" onClick={() => markCommission(o, 'pending')}>
                          {copy.reset}
                        </Button>
                      )}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {(tab === 'products' || tab === 'orders') && (
        <Pagination pagination={pagination} onPageChange={setPage} className="mt-4" />
      )}

      {modalOpen && canManage ? (
        <Modal onClose={() => setModalOpen(false)} title={editing ? copy.editProduct : copy.newProduct} width="max-w-2xl">
          <div className="space-y-4">
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
            <div className="grid grid-cols-3 gap-3">
              <Input
                label={copy.form.priceChf}
                type="number"
                step="0.05"
                value={form.preis_chf}
                onChange={(e) => setForm({ ...form, preis_chf: e.target.value })}
              />
              <Select
                label={copy.form.currency}
                value={form.waehrung}
                onChange={(e) => setForm({ ...form, waehrung: e.target.value })}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
              <Input
                label={copy.form.stock}
                type="number"
                value={form.lagerbestand}
                onChange={(e) => setForm({ ...form, lagerbestand: e.target.value })}
                placeholder={copy.form.stockPh}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label={copy.form.category}
                value={form.kategorie}
                onChange={(e) => setForm({ ...form, kategorie: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {copy.categories?.[c] || c}
                  </option>
                ))}
              </Select>
              <Input
                label={copy.form.origin}
                value={form.ursprung}
                onChange={(e) => setForm({ ...form, ursprung: e.target.value })}
                placeholder={copy.form.originPh}
              />
            </div>

            {/* Images */}
            <div className="space-y-2 pt-2 border-t border-elaya-border">
              <p className="text-studio-white text-[12px] font-semibold m-0">{copy.form.images}</p>
              {form.bilder.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {form.bilder.map((url, i) => (
                    <div key={`${url}-${i}`} className="relative group">
                      <img
                        src={resolveShopImageUrl(url)}
                        alt=""
                        className="w-20 h-20 rounded-[10px] object-cover border border-elaya-border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageAt(i)}
                        title={copy.form.removeImage}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-studio-red text-white text-[11px] leading-none border-0 cursor-pointer flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="flex flex-wrap items-end gap-2">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-[10px] border border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[12px] font-semibold cursor-pointer hover:border-studio-gold/40">
                  {uploading ? <Spinner size="sm" /> : null}
                  {copy.form.uploadImages}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
                <Input
                  placeholder="https://…"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 min-w-[180px]"
                />
                <Button variant="secondary" onClick={addImageUrl}>{copy.form.addImageUrl}</Button>
              </div>
              <p className="text-studio-w3 text-[10px] m-0">{copy.form.uploadHint}</p>
            </div>

            {/* Discount */}
            <div className="space-y-3 pt-2 border-t border-elaya-border">
              <div className="flex items-center justify-between">
                <p className="text-studio-white text-[12px] font-semibold m-0">{copy.form.discountSection}</p>
                <label className="flex items-center gap-2 text-[12px] text-studio-w2">
                  <input
                    type="checkbox"
                    checked={form.rabatt.aktiv}
                    onChange={(e) => setForm({ ...form, rabatt: { ...form.rabatt, aktiv: e.target.checked } })}
                  />
                  {copy.form.discountActive}
                </label>
              </div>
              <p className="text-studio-w3 text-[11px] m-0">{copy.form.discountHint}</p>

              {form.rabatt.aktiv ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label={copy.form.discountType}
                      value={form.rabatt.typ}
                      onChange={(e) => setForm({ ...form, rabatt: { ...form.rabatt, typ: e.target.value } })}
                    >
                      <option value="percent">{copy.form.discountTypePercent}</option>
                      <option value="fixed">{copy.form.discountTypeFixed}</option>
                    </Select>
                    <Input
                      label={`${copy.form.discountValue} ${form.rabatt.typ === 'percent' ? '(%)' : `(${form.waehrung})`}`}
                      type="number"
                      value={form.rabatt.wert}
                      onChange={(e) => setForm({ ...form, rabatt: { ...form.rabatt, wert: e.target.value } })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label={copy.form.discountFrom}
                      type="date"
                      value={form.rabatt.von}
                      onChange={(e) => setForm({ ...form, rabatt: { ...form.rabatt, von: e.target.value } })}
                    />
                    <Input
                      label={copy.form.discountTo}
                      type="date"
                      value={form.rabatt.bis}
                      onChange={(e) => setForm({ ...form, rabatt: { ...form.rabatt, bis: e.target.value } })}
                    />
                  </div>
                  <label className="flex items-start gap-2 text-[12px] text-studio-w2">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={form.rabatt.stackable_with_general}
                      onChange={(e) =>
                        setForm({ ...form, rabatt: { ...form.rabatt, stackable_with_general: e.target.checked } })
                      }
                    />
                    <span>
                      {copy.form.discountStackable}
                      <span className="block text-studio-w3 text-[10px] mt-0.5">{copy.form.discountStackableHint}</span>
                    </span>
                  </label>
                </>
              ) : null}

              <label className="flex items-start gap-2 text-[12px] text-studio-w2">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={form.rabatt.exclude_from_general}
                  onChange={(e) =>
                    setForm({ ...form, rabatt: { ...form.rabatt, exclude_from_general: e.target.checked } })
                  }
                />
                <span>
                  {copy.form.discountExcludeGeneral}
                  <span className="block text-studio-w3 text-[10px] mt-0.5">{copy.form.discountExcludeGeneralHint}</span>
                </span>
              </label>
            </div>

            {/* Live preview */}
            <div className="rounded-[12px] border border-elaya-border bg-studio-bg-4 p-4">
              <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0 mb-2">{copy.form.livePreview}</p>
              {formPreviewPrice.savings > 0 ? (
                <div className="flex items-center gap-3">
                  <span className="text-studio-w3 text-[13px] line-through font-mono">
                    {fmt(formPreviewPrice.original, formPreviewPrice.currency)}
                  </span>
                  <span className="text-admin-emerald text-[20px] font-bold font-mono">
                    {fmt(formPreviewPrice.final, formPreviewPrice.currency)}
                  </span>
                  <Badge className="bg-admin-emerald/15 text-admin-emerald">{formPreviewPrice.discount_label}</Badge>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-studio-white text-[20px] font-bold font-mono">
                    {fmt(formPreviewPrice.final, formPreviewPrice.currency)}
                  </span>
                  <span className="text-studio-w3 text-[11px]">{copy.form.noDiscount}</span>
                </div>
              )}
            </div>

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

      {promoModalOpen && canManage ? (
        <Modal
          onClose={() => setPromoModalOpen(false)}
          title={editingPromo ? pcopy.editPromotion : pcopy.newPromotion}
          width="max-w-2xl"
        >
          <div className="space-y-4">
            <Input
              label={pcopy.name}
              value={promoForm.name}
              onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
              placeholder={pcopy.namePh}
            />
            <label className="flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={promoForm.aktiv}
                onChange={(e) => setPromoForm({ ...promoForm, aktiv: e.target.checked })}
              />
              {pcopy.active}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <Select
                label={pcopy.type}
                value={promoForm.typ}
                onChange={(e) => setPromoForm({ ...promoForm, typ: e.target.value })}
              >
                <option value="percent">{pcopy.typePercent}</option>
                <option value="fixed">{pcopy.typeFixed}</option>
              </Select>
              <Input
                label={`${pcopy.value} ${promoForm.typ === 'percent' ? '(%)' : ''}`}
                type="number"
                value={promoForm.wert}
                onChange={(e) => setPromoForm({ ...promoForm, wert: e.target.value })}
              />
              <Select
                label={pcopy.currency}
                value={promoForm.waehrung}
                onChange={(e) => setPromoForm({ ...promoForm, waehrung: e.target.value })}
                disabled={promoForm.typ !== 'fixed'}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={pcopy.from}
                type="date"
                value={promoForm.von}
                onChange={(e) => setPromoForm({ ...promoForm, von: e.target.value })}
              />
              <Input
                label={pcopy.to}
                type="date"
                value={promoForm.bis}
                onChange={(e) => setPromoForm({ ...promoForm, bis: e.target.value })}
              />
            </div>

            <div>
              <p className="text-studio-white text-[12px] font-semibold m-0 mb-1">{pcopy.excludeProducts}</p>
              <p className="text-studio-w3 text-[11px] m-0 mb-2">{pcopy.excludeProductsHint}</p>
              <div className="max-h-[160px] overflow-y-auto rounded-[10px] border border-elaya-border divide-y divide-elaya-border">
                {products.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 px-3 py-2 text-[12px] text-studio-w1 cursor-pointer hover:bg-studio-bg-4"
                  >
                    <input
                      type="checkbox"
                      checked={promoForm.exclude_product_ids.includes(p.id)}
                      onChange={() => togglePromoExcludeProduct(p.id)}
                    />
                    <span className="truncate">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Live preview against a sample product */}
            <div className="rounded-[12px] border border-elaya-border bg-studio-bg-4 p-4">
              <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0 mb-2">{pcopy.previewTitle}</p>
              <Select
                label={pcopy.previewSample}
                value={previewProductId || previewProduct?.id || ''}
                onChange={(e) => setPreviewProductId(e.target.value)}
                className="mb-3"
              >
                {!products.length ? <option value="">{pcopy.previewSelect}</option> : null}
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
              {promoPreviewPrice ? (
                promoPreviewPrice.savings > 0 ? (
                  <div className="flex items-center gap-3">
                    <span className="text-studio-w3 text-[13px] line-through font-mono">
                      {fmt(promoPreviewPrice.original, promoPreviewPrice.currency)}
                    </span>
                    <span className="text-admin-emerald text-[20px] font-bold font-mono">
                      {fmt(promoPreviewPrice.final, promoPreviewPrice.currency)}
                    </span>
                    <Badge className="bg-admin-emerald/15 text-admin-emerald">{promoPreviewPrice.discount_label}</Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-studio-white text-[20px] font-bold font-mono">
                      {fmt(promoPreviewPrice.final, promoPreviewPrice.currency)}
                    </span>
                    <span className="text-studio-w3 text-[11px]">{copy.form.noDiscount}</span>
                  </div>
                )
              ) : null}
            </div>

            <Button onClick={savePromotion} loading={promoSaving} className="w-full">
              {pcopy.save}
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

export default AdminShop
