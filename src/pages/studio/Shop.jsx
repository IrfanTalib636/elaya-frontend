import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { listShopOrders, patchShopOrderStatus } from '../../api/shop'
import { Card, PageHeader, Spinner, Pagination, EmptyState, Modal } from '../../components/ui'
import { PAGE_SIZE } from '../../constants/pagination'
import useContent from '../../i18n/useContent'

const chfFmt = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' })
const fmtCHF = (n) => chfFmt.format(n ?? 0)

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const STATUS_VALUES = ['bestellt', 'versendet', 'geliefert']

const OrderDetailModal = ({ order, onClose }) => {
  const { t, studioPages } = useContent()
  const copy = studioPages.shop
  const addr = order.lieferadresse
  const brutto = (order.total_chf ?? 0) + (order.versandkosten ?? 0)
  const statusLabel = (s) => copy.status[s] ?? s

  return (
    <Modal
      title={order.order_number ? t('studioPages.shop.detailsTitle', { number: order.order_number }) : copy.detailsFallback}
      onClose={onClose}
      width="max-w-lg"
      scrollResetKey={order.id}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div>
            <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0 mb-0.5">{copy.labelDate}</p>
            <p className="text-studio-white m-0 font-mono">{fmtDate(order.erstellt_am)}</p>
          </div>
          <div>
            <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0 mb-0.5">{copy.labelStatus}</p>
            <p className="text-studio-white m-0 font-semibold">{statusLabel(order.status)}</p>
          </div>
          <div>
            <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0 mb-0.5">{copy.labelCustomer}</p>
            <p className="text-studio-white m-0 font-medium">{order.kunden_name || '—'}</p>
          </div>
          <div>
            <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0 mb-0.5">{copy.labelPayment}</p>
            <p className="text-studio-white m-0 capitalize">
              {order.zahlungsart || '—'}
              {order.zahlung_simuliert ? (
                <span className="text-studio-w3 text-[10px] ml-1.5 normal-case">{copy.simulated}</span>
              ) : null}
            </p>
          </div>
        </div>

        <div>
          <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0 mb-2">{copy.products}</p>
          <ul className="m-0 p-0 list-none divide-y divide-elaya-border border border-elaya-border rounded-[10px] overflow-hidden">
            {(order.produkte ?? []).map((p, i) => (
              <li
                key={`${p.produkt_id || p.produkt_name}-${i}`}
                className="flex items-start justify-between gap-3 px-3.5 py-2.5 bg-studio-bg-4"
              >
                <div className="min-w-0">
                  <p className="text-studio-white text-[13px] font-medium m-0 leading-snug">
                    {p.produkt_name}
                  </p>
                  <p className="text-studio-w3 text-[11px] m-0 mt-0.5">
                    {p.menge}× {fmtCHF(p.preis_chf)}
                  </p>
                </div>
                <p className="text-studio-teal-2 text-[12px] font-mono font-semibold m-0 whitespace-nowrap shrink-0">
                  {fmtCHF((p.menge ?? 0) * (p.preis_chf ?? 0))}
                </p>
              </li>
            ))}
            {(order.produkte ?? []).length === 0 && (
              <li className="px-3.5 py-3 text-studio-w3 text-[12px]">{copy.noProducts}</li>
            )}
          </ul>
        </div>

        <div className="space-y-1.5 text-[12px] border-t border-elaya-border pt-4">
          <div className="flex justify-between gap-3">
            <span className="text-studio-w2">{copy.goodsValue}</span>
            <span className="text-studio-white font-mono">{fmtCHF(order.total_chf)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-studio-w2">{t('studioPages.shop.shipping', { country: order.lieferland || '—' })}</span>
            <span className="text-studio-white font-mono">{fmtCHF(order.versandkosten)}</span>
          </div>
          <div className="flex justify-between gap-3 pt-1">
            <span className="text-studio-white font-semibold">{copy.gross}</span>
            <span className="text-studio-teal-2 font-mono font-bold">{fmtCHF(brutto)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-studio-w2">{t('studioPages.shop.provision', { pct: order.provision_prozent })}</span>
            <span className="text-studio-gold-2 font-mono">{fmtCHF(order.provision_betrag)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-studio-w2">{copy.payout}</span>
            <span className="font-mono">
              {order.commission_status === 'paid'
                ? copy.commission.paid
                : order.commission_status === 'cancelled'
                  ? copy.commission.cancelled
                  : copy.commission.open}
            </span>
          </div>
        </div>

        {addr && (addr.strasse || addr.ort) ? (
          <div>
            <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0 mb-1.5">{copy.shippingAddress}</p>
            <p className="text-studio-w1 text-[12px] m-0 leading-relaxed">
              {[addr.vorname, addr.nachname].filter(Boolean).join(' ')}
              <br />
              {addr.strasse}
              <br />
              {[addr.plz, addr.ort].filter(Boolean).join(' ')}
              {addr.land ? (
                <>
                  <br />
                  {addr.land}
                </>
              ) : null}
            </p>
          </div>
        ) : null}
      </div>
    </Modal>
  )
}

const StudioShop = () => {
  const { t, studioPages } = useContent()
  const copy = studioPages.shop
  const STATUS_OPTIONS = STATUS_VALUES.map((value) => ({ value, label: copy.status[value] }))

  const [orders, setOrders] = useState([])
  const [summary, setSummary] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [updatingId, setUpdatingId] = useState(null)
  const [detailOrder, setDetailOrder] = useState(null)

  const load = useCallback(async (pageNum, { background = false } = {}) => {
    if (!background) setLoading(true)
    try {
      const res = await listShopOrders({ page: pageNum, limit: PAGE_SIZE })
      setOrders(res.data.data.orders ?? [])
      setSummary(res.data.data.summary ?? null)
      setPagination(res.data.data.pagination)
    } catch (err) {
      const status = err?.response?.status
      toast.error(
        status === 403
          ? copy.loadForbidden
          : copy.loadError
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page, { background: page > 1 })
  }, [page, load])

  const handleStatusChange = async (orderId, newStatus) => {
    const previous = orders.find((o) => o.id === orderId)?.status
    if (previous === newStatus) return

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    )
    setDetailOrder((prev) =>
      prev?.id === orderId ? { ...prev, status: newStatus } : prev
    )
    setUpdatingId(orderId)

    try {
      await patchShopOrderStatus(orderId, newStatus)
      toast.success(copy.statusUpdated)
    } catch {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: previous } : o))
      )
      setDetailOrder((prev) =>
        prev?.id === orderId ? { ...prev, status: previous } : prev
      )
      toast.error(copy.statusError)
    } finally {
      setUpdatingId(null)
    }
  }

  const commissionLabel = (status) => {
    if (status === 'paid') return { text: copy.commission.paid, cls: 'text-studio-teal-2' }
    if (status === 'cancelled') return { text: copy.commission.cancelled, cls: 'text-studio-w3' }
    return { text: copy.commission.open, cls: 'text-studio-gold-2' }
  }

  return (
    <div className="p-6 max-w-[1200px]">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      {loading && orders.length === 0 && !pagination?.total ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : orders.length === 0 && !pagination?.total ? (
        <EmptyState title={copy.emptyTitle} description={copy.emptyDesc} />
      ) : (
        <Card padding="none" className={loading && orders.length > 0 ? 'opacity-60 pointer-events-none' : ''}>
          {pagination?.total > 0 && (
            <div className="px-5 py-4 border-b border-elaya-border flex flex-wrap gap-6">
              <div>
                <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0">{copy.kpiOrders}</p>
                <p className="text-studio-white text-[18px] font-bold m-0 tabular-nums">{pagination.total}</p>
              </div>
              <div>
                <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0">{copy.kpiRevenue}</p>
                <p className="text-studio-white text-[18px] font-bold m-0 tabular-nums">
                  {fmtCHF(summary?.revenue ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0">{copy.kpiProvOpen}</p>
                <p className="text-studio-gold-2 text-[18px] font-bold m-0 tabular-nums">
                  {fmtCHF(summary?.pending_provision ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0">{copy.kpiProvPaid}</p>
                <p className="text-studio-teal-2 text-[18px] font-bold m-0 tabular-nums">
                  {fmtCHF(summary?.paid_provision ?? 0)}
                </p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="border-b border-elaya-border">
                  {[copy.headers.date, copy.headers.customer, copy.headers.products, copy.headers.amount, copy.headers.prov, copy.headers.payout, copy.headers.status].map((h) => (
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
                {orders.map((o) => {
                  const prodTxt = (o.produkte ?? [])
                    .map((p) => `${p.menge}× ${p.produkt_name}`)
                    .join(', ') || '—'

                  return (
                    <tr key={o.id} className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4">
                      <td className="px-5 py-3 text-studio-w2 text-[12px] font-mono whitespace-nowrap">
                        {fmtDate(o.erstellt_am)}
                      </td>
                      <td className="px-5 py-3 text-studio-white text-[12px] font-medium max-w-[140px] truncate">
                        {o.kunden_name || '—'}
                      </td>
                      <td className="px-5 py-3 text-studio-w2 text-[11px] max-w-[220px]">
                        <button
                          type="button"
                          onClick={() => setDetailOrder(o)}
                          title={copy.showDetails}
                          className="w-full text-left truncate text-studio-teal-2 hover:text-studio-teal underline-offset-2 hover:underline bg-transparent border-0 p-0 cursor-pointer font-inherit text-[11px]"
                        >
                          {prodTxt}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-studio-teal-2 text-[12px] font-mono font-semibold whitespace-nowrap">
                        {fmtCHF(o.total_chf)}
                      </td>
                      <td className="px-5 py-3 text-studio-gold-2 text-[12px] font-mono whitespace-nowrap">
                        {fmtCHF(o.provision_betrag)}
                        <span className="text-studio-w4 text-[10px] ml-1">({o.provision_prozent}%)</span>
                      </td>
                      <td className="px-5 py-3 text-[11px] font-semibold whitespace-nowrap">
                        {(() => {
                          const c = commissionLabel(o.commission_status)
                          return <span className={c.cls}>{c.text}</span>
                        })()}
                      </td>
                      <td className="px-5 py-3 min-w-[130px]">
                        <select
                          value={o.status}
                          disabled={updatingId === o.id}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="w-full px-2 py-1.5 rounded-[8px] border border-elaya-border bg-studio-bg-3 text-studio-w1 text-[11px] font-semibold cursor-pointer outline-none focus:border-studio-gold disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <Pagination pagination={pagination} onPageChange={setPage} />
        </Card>
      )}

      <p className="text-studio-w4 text-[11px] mt-4 m-0">{copy.footerHint}</p>

      {detailOrder && (
        <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />
      )}
    </div>
  )
}

export default StudioShop
