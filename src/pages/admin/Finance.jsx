import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, PageHeader, Spinner, EmptyState, Button } from '../../components/ui'
import { getShopFinance, getStudioShopFinance } from '../../api/adminShop'
import { getApiErrorMessage } from '../../lib/apiError'
import useContent from '../../i18n/useContent'

const fmt = (n) =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(n || 0)

const KpiCard = ({ label, value, accent }) => (
  <Card>
    <p className="text-[12px] text-admin-muted m-0">{label}</p>
    <p
      className={`text-[20px] font-bold m-0 mt-1 ${
        accent === 'amber'
          ? 'text-amber-600'
          : accent === 'emerald'
            ? 'text-emerald-600'
            : accent === 'gold'
              ? 'text-studio-gold-2'
              : ''
      }`}
    >
      {value}
    </p>
  </Card>
)

const AdminFinance = () => {
  const { t, adminPages } = useContent()
  const copy = adminPages.finance

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [selectedStudioId, setSelectedStudioId] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getShopFinance()
        setData(res.data.data)
      } catch (err) {
        toast.error(getApiErrorMessage(err, copy.loadError || 'Could not load finance'))
      } finally {
        setLoading(false)
      }
    })()
  }, [copy.loadError])

  const openStudio = useCallback(
    async (studioId) => {
      if (!studioId) return
      setSelectedStudioId(studioId)
      setDetailLoading(true)
      setDetail(null)
      try {
        const res = await getStudioShopFinance(studioId)
        setDetail(res.data.data)
      } catch (err) {
        toast.error(getApiErrorMessage(err, copy.detailError || 'Could not load studio sales'))
        setSelectedStudioId(null)
      } finally {
        setDetailLoading(false)
      }
    },
    [copy.detailError]
  )

  const backToList = () => {
    setSelectedStudioId(null)
    setDetail(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  const totals = data?.totals || {}
  const studios = data?.studios || []
  const provisionPct = data?.provision_percent_default ?? 20

  // ── Studio product detail ──────────────────────────────────────────────
  if (selectedStudioId) {
    const studio = detail?.studio
    const products = detail?.products || []
    const title =
      studio?.studio_name ||
      studio?.studio_code ||
      copy.studioDetailTitle ||
      'Studio sales'

    return (
      <div className="p-6 max-w-[1100px]">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={backToList} className="gap-1.5 px-0">
            <ArrowLeft size={14} />
            {copy.backToStudios || 'Back to studios'}
          </Button>
        </div>

        <PageHeader
          title={title}
          subtitle={t('adminPages.finance.studioDetailSubtitle', {
            pct: detail?.provision_percent_default ?? provisionPct,
            code: studio?.studio_code || '',
          })}
        />

        {detailLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KpiCard label={copy.totalSales} value={fmt(studio?.revenue)} accent="gold" />
              <KpiCard
                label={copy.studioCommission}
                value={fmt(studio?.provision_total)}
                accent="emerald"
              />
              <KpiCard label={copy.headers.orders} value={String(studio?.order_count || 0)} />
              <KpiCard
                label={copy.provisionOpen}
                value={fmt(studio?.pending_provision)}
                accent="amber"
              />
            </div>

            {products.length === 0 ? (
              <EmptyState title={copy.noProducts || 'No products sold through this studio yet'} />
            ) : (
              <Card padding="none">
                <div className="px-4 py-3 border-b border-admin-line">
                  <p className="m-0 text-[13px] font-semibold text-studio-white">
                    {copy.productsSoldTitle || 'Products sold'}
                  </p>
                  <p className="m-0 mt-0.5 text-[12px] text-admin-muted">
                    {copy.productsSoldHint ||
                      'Line items sold through this studio, with commission per product.'}
                  </p>
                </div>
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-left text-admin-muted border-b border-admin-line">
                      <th className="p-3">{copy.headers.product}</th>
                      <th className="p-3">{copy.headers.qty}</th>
                      <th className="p-3">{copy.headers.orders}</th>
                      <th className="p-3">{copy.headers.sales}</th>
                      <th className="p-3">{copy.headers.commission}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr
                        key={p.product_id || p.product_name}
                        className="border-b border-admin-line/50"
                      >
                        <td className="p-3 font-medium text-studio-white">{p.product_name}</td>
                        <td className="p-3">{p.quantity}</td>
                        <td className="p-3">{p.order_count}</td>
                        <td className="p-3">{fmt(p.revenue)}</td>
                        <td className="p-3 text-emerald-600">{fmt(p.commission)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </>
        )}
      </div>
    )
  }

  // ── Platform overview ──────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader
        title={copy.title}
        subtitle={t('adminPages.finance.subtitle', { pct: provisionPct })}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label={copy.totalSales} value={fmt(totals.revenue)} accent="gold" />
        <KpiCard
          label={copy.studioCommission}
          value={fmt(totals.provision_total)}
          accent="emerald"
        />
        <KpiCard
          label={copy.provisionOpen}
          value={fmt(totals.pending_provision)}
          accent="amber"
        />
        <KpiCard
          label={copy.provisionPaid}
          value={fmt(totals.paid_provision)}
        />
      </div>

      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="m-0 text-[15px] font-semibold text-studio-white">
            {copy.studiosTitle || 'Sales by studio'}
          </h2>
          <p className="m-0 mt-0.5 text-[12px] text-admin-muted">
            {copy.studiosHint || 'Click a studio to see which products were sold.'}
          </p>
        </div>
        <p className="m-0 text-[12px] text-admin-muted shrink-0">
          {copy.elayaShare}: {fmt(totals.elaya_total)}
        </p>
      </div>

      {studios.length === 0 ? (
        <EmptyState title={copy.empty} />
      ) : (
        <Card padding="none">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-admin-muted border-b border-admin-line">
                <th className="p-3">{copy.headers.studio}</th>
                <th className="p-3">{copy.headers.orders}</th>
                <th className="p-3">{copy.headers.sales}</th>
                <th className="p-3">{copy.headers.commission}</th>
                <th className="p-3">{copy.headers.open}</th>
                <th className="p-3">{copy.headers.paid}</th>
                <th className="p-3 w-8" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {studios.map((s) => (
                <tr
                  key={s.studio_id}
                  className="border-b border-admin-line/50 hover:bg-studio-bg-4/60 cursor-pointer transition-colors"
                  onClick={() => void openStudio(s.studio_id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      void openStudio(s.studio_id)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${copy.openStudioDetail || 'Open'} ${s.studio_name || s.studio_code}`}
                >
                  <td className="p-3 font-medium text-studio-white">
                    {s.studio_name || s.studio_code}
                    {s.studio_code && s.studio_name ? (
                      <span className="block text-[11px] text-admin-muted font-normal">
                        {s.studio_code}
                      </span>
                    ) : null}
                  </td>
                  <td className="p-3">{s.order_count}</td>
                  <td className="p-3">{fmt(s.revenue)}</td>
                  <td className="p-3 text-emerald-600">{fmt(s.provision_total)}</td>
                  <td className="p-3 text-amber-600">{fmt(s.pending_provision)}</td>
                  <td className="p-3">{fmt(s.paid_provision)}</td>
                  <td className="p-3 text-admin-muted">
                    <ChevronRight size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

export default AdminFinance
