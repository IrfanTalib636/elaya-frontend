import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, PageHeader, Spinner, EmptyState, Button, Input, Select, Badge } from '../../components/ui'
import {
  getShopFinance,
  getStudioShopFinance,
  patchStudioFinanceTerms,
} from '../../api/adminShop'
import { getApiErrorMessage } from '../../lib/apiError'
import useContent from '../../i18n/useContent'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../constants/roles'

const fmt = (n) =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(n || 0)

const KpiCard = ({ label, value, accent, hint }) => (
  <Card>
    <p className="text-[12px] text-studio-w2 m-0">{label}</p>
    <p
      className={`text-[20px] font-bold m-0 mt-1 ${
        accent === 'amber'
          ? 'text-amber-600'
          : accent === 'emerald'
            ? 'text-emerald-600'
            : accent === 'gold'
              ? 'text-studio-gold-2'
              : 'text-studio-white'
      }`}
    >
      {value}
    </p>
    {hint ? <p className="m-0 mt-1 text-[11px] text-studio-w3">{hint}</p> : null}
  </Card>
)

const statusBadge = (status, copy) => {
  const s = String(status || '').toLowerCase()
  const label =
    s === 'aktiv'
      ? copy.statusActive || 'Active'
      : s === 'gesperrt'
        ? copy.statusBlocked || 'Blocked'
        : copy.statusPending || status || '—'
  return <Badge variant="status" value={s === 'aktiv' ? 'aktiv' : s === 'gesperrt' ? 'gesperrt' : 'pending'}>{label}</Badge>
}

/**
 * Admin Finance — Reines Abo-Modell (prototype parity) + shop commission ledger.
 * Theme: Elaya admin tokens.
 */
const AdminFinance = () => {
  const { t, adminPages } = useContent()
  const copy = adminPages.finance || {}
  const role = useAuthStore((s) => s.user?.role)
  const canEditTerms = role === ROLES.SUPER_ADMIN

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [selectedStudioId, setSelectedStudioId] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState(null)
  const [savingTerms, setSavingTerms] = useState(false)
  const [termsForm, setTermsForm] = useState({
    package_id: 'starter',
    preis_override: '',
    shop_provision_override: '',
    override_grund: '',
  })

  const loadOverview = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getShopFinance()
      setData(res.data.data)
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.loadError || 'Could not load finance'))
    } finally {
      setLoading(false)
    }
  }, [copy.loadError])

  useEffect(() => {
    void loadOverview()
  }, [loadOverview])

  const openStudio = useCallback(
    async (studioId) => {
      if (!studioId) return
      setSelectedStudioId(studioId)
      setDetailLoading(true)
      setDetail(null)
      try {
        const res = await getStudioShopFinance(studioId)
        const d = res.data.data
        setDetail(d)
        setTermsForm({
          package_id: d.terms?.package_id || 'starter',
          preis_override:
            d.terms?.preis_override != null ? String(d.terms.preis_override) : '',
          shop_provision_override:
            d.terms?.shop_provision_override != null
              ? String(d.terms.shop_provision_override)
              : '',
          override_grund: d.terms?.override_grund || '',
        })
      } catch (err) {
        toast.error(getApiErrorMessage(err, copy.detailError || 'Could not load studio finance'))
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

  const saveTerms = async ({ clear = false } = {}) => {
    if (!canEditTerms || !selectedStudioId) return
    setSavingTerms(true)
    try {
      const payload = clear
        ? { package_id: termsForm.package_id, clear_overrides: true }
        : {
            package_id: termsForm.package_id,
            preis_override:
              termsForm.preis_override === '' ? null : Number(termsForm.preis_override),
            shop_provision_override:
              termsForm.shop_provision_override === ''
                ? null
                : Number(termsForm.shop_provision_override),
            override_grund: termsForm.override_grund,
          }
      const res = await patchStudioFinanceTerms(selectedStudioId, payload)
      setDetail(res.data.data)
      toast.success(copy.termsSaved || 'Finance terms saved')
      await loadOverview()
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.termsSaveError || 'Could not save terms'))
    } finally {
      setSavingTerms(false)
    }
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
  const packageCounts = data?.package_counts || {}
  const periodLabel = data?.period?.label || ''

  // ── Studio detail ──────────────────────────────────────────────────────
  if (selectedStudioId) {
    const studio = detail?.studio
    const pl = detail?.pl
    const products = detail?.products || []
    const title =
      studio?.studio_name ||
      studio?.studio_code ||
      copy.studioDetailTitle ||
      'Studio finance'

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
          subtitle={
            periodLabel
              ? t('adminPages.finance.studioDetailSubtitlePeriod', {
                  period: periodLabel,
                  pct: detail?.terms?.shop_provision_studio_prozent ?? '—',
                  defaultValue: `Period {{period}} · Studio shop share {{pct}}%`,
                })
              : copy.studioDetailSubtitle
          }
        />

        {detailLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* A · Package & terms */}
            <Card>
              <h3 className="m-0 mb-1 text-[14px] font-semibold text-studio-white">
                {copy.blockPackage || 'A · Package & conditions'}
              </h3>
              <p className="m-0 mb-3 text-[12px] text-studio-w2">
                {copy.blockPackageHint ||
                  'Effective abo fee and shop provision (override > package). Sonderkonditionen require a reason (min. 10 characters).'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div>
                  <p className="m-0 text-[11px] text-studio-w3">{copy.headers.package || 'Package'}</p>
                  <p className="m-0 text-[14px] font-semibold text-studio-white">
                    {detail?.terms?.package_name || '—'}
                  </p>
                </div>
                <div>
                  <p className="m-0 text-[11px] text-studio-w3">{copy.headers.abo || 'Abo CHF'}</p>
                  <p className="m-0 text-[14px] font-semibold text-studio-gold-2">
                    {fmt(detail?.terms?.abo_chf)}
                  </p>
                </div>
                <div>
                  <p className="m-0 text-[11px] text-studio-w3">
                    {copy.shopProvisionPct || 'Shop provision (studio)'}
                  </p>
                  <p className="m-0 text-[14px] font-semibold text-studio-white">
                    {detail?.terms?.shop_provision_studio_prozent ?? '—'}%
                  </p>
                </div>
                <div>
                  <p className="m-0 text-[11px] text-studio-w3">{copy.headers.status || 'Status'}</p>
                  <div className="mt-0.5">{statusBadge(studio?.status, copy)}</div>
                </div>
              </div>

              {canEditTerms ? (
                <div className="border-t border-elaya-border pt-3 flex flex-col gap-3 max-w-[640px]">
                  <Select
                    label={copy.packageLabel || 'Package'}
                    value={termsForm.package_id}
                    onChange={(e) =>
                      setTermsForm((f) => ({ ...f, package_id: e.target.value }))
                    }
                  >
                    <option value="starter">Starter (CHF 29 · 10%)</option>
                    <option value="pro">Pro (CHF 49 · 15%)</option>
                    <option value="network">Network (CHF 99 · 20%)</option>
                  </Select>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label={copy.preisOverride || 'Abo override (CHF)'}
                      type="number"
                      step="0.01"
                      placeholder={copy.packageDefault || 'Package default'}
                      value={termsForm.preis_override}
                      onChange={(e) =>
                        setTermsForm((f) => ({ ...f, preis_override: e.target.value }))
                      }
                    />
                    <Input
                      label={copy.shopOverride || 'Shop provision override %'}
                      type="number"
                      step="0.1"
                      placeholder={copy.packageDefault || 'Package default'}
                      value={termsForm.shop_provision_override}
                      onChange={(e) =>
                        setTermsForm((f) => ({
                          ...f,
                          shop_provision_override: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Input
                    label={copy.overrideReason || 'Reason for special terms'}
                    value={termsForm.override_grund}
                    onChange={(e) =>
                      setTermsForm((f) => ({ ...f, override_grund: e.target.value }))
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button loading={savingTerms} onClick={() => void saveTerms()}>
                      {copy.saveTerms || 'Save terms'}
                    </Button>
                    <Button
                      variant="secondary"
                      loading={savingTerms}
                      onClick={() => void saveTerms({ clear: true })}
                    >
                      {copy.clearOverrides || 'Clear overrides'}
                    </Button>
                  </div>
                </div>
              ) : null}
            </Card>

            {/* C · Akquise */}
            <Card>
              <h3 className="m-0 mb-1 text-[14px] font-semibold text-studio-white">
                {copy.blockAkquise || 'C · Customers (analysis)'}
              </h3>
              <p className="m-0 mb-3 text-[12px] text-studio-w2">
                {detail?.akquise?.hint ||
                  copy.akquiseHint ||
                  'Acquisition source is analysis-only and does not affect fees.'}
              </p>
              <div className="grid grid-cols-3 gap-3">
                <KpiCard
                  label={copy.akquiseStudio || 'Studio own'}
                  value={String(detail?.akquise?.studio_eigen ?? 0)}
                />
                <KpiCard
                  label={copy.akquisePlatform || 'Platform referred'}
                  value={String(detail?.akquise?.plattform_vermittelt ?? 0)}
                />
                <KpiCard
                  label={copy.akquiseTransfer || 'Studio transfer'}
                  value={String(detail?.akquise?.studio_wechsel ?? 0)}
                />
              </div>
            </Card>

            {/* D · Dual P&L */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <h3 className="m-0 mb-3 text-[14px] font-semibold text-studio-white">
                  {copy.plStudio || 'D · Studio P&L (current month)'}
                </h3>
                <div className="flex flex-col gap-2 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-studio-w2">{copy.sessionRevenue || 'Session revenue'}</span>
                    <span className="text-studio-white font-medium">
                      {fmt(pl?.studio?.session_revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-studio-w2">{copy.shopProvision || 'Shop commission'}</span>
                    <span className="text-emerald-600 font-medium">
                      {fmt(pl?.studio?.shop_provision)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-elaya-border pt-2 mt-1">
                    <span className="font-semibold text-studio-white">
                      {copy.totalStudio || 'Total Studio'}
                    </span>
                    <span className="font-bold text-studio-white">{fmt(pl?.studio?.total)}</span>
                  </div>
                </div>
              </Card>
              <Card>
                <h3 className="m-0 mb-3 text-[14px] font-semibold text-studio-white">
                  {copy.plElaya || 'D · Elaya P&L (current month)'}
                </h3>
                <div className="flex flex-col gap-2 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-studio-w2">{copy.aboFee || 'Subscription fee'}</span>
                    <span className="text-studio-gold-2 font-medium">{fmt(pl?.elaya?.abo_chf)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-studio-w2">{copy.shopElayaShare || 'Shop share (Elaya)'}</span>
                    <span className="text-studio-white font-medium">{fmt(pl?.elaya?.shop_share)}</span>
                  </div>
                  <div className="flex justify-between border-t border-elaya-border pt-2 mt-1">
                    <span className="font-semibold text-studio-white">
                      {copy.totalElaya || 'Total Elaya'}
                    </span>
                    <span className="font-bold text-studio-gold-2">{fmt(pl?.elaya?.total)}</span>
                  </div>
                </div>
              </Card>
            </div>
            <p className="m-0 text-[11px] text-studio-w3">
              {pl?.note ||
                copy.plNote ||
                'Do not sum Studio total and Elaya total — they are separate views of the same period.'}
            </p>

            {/* Products */}
            <Card padding="none">
              <div className="px-4 py-3 border-b border-elaya-border">
                <p className="m-0 text-[13px] font-semibold text-studio-white">
                  {copy.productsSoldTitle || 'Products sold (current month)'}
                </p>
              </div>
              {products.length === 0 ? (
                <p className="m-0 px-4 py-8 text-[13px] text-studio-w2 text-center">
                  {copy.noProducts || 'No products sold through this studio yet'}
                </p>
              ) : (
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-left text-studio-w2 border-b border-elaya-border">
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
                        className="border-b border-elaya-border/60"
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
              )}
            </Card>
          </div>
        )}
      </div>
    )
  }

  // ── Platform overview ──────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader
        title={copy.title || 'Finance'}
        subtitle={
          copy.subtitleAbo ||
          'Pure subscription model: studio abo fee + Elaya shop share. No transaction fee. Amounts CHF excl. VAT.'
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KpiCard
          label={copy.aboRecurring || 'Recurring monthly revenue'}
          value={fmt(totals.abo_recurring_chf)}
          accent="gold"
        />
        <KpiCard
          label={copy.shopElayaMonth || 'Shop revenue Elaya (month)'}
          value={fmt(totals.shop_elaya_chf)}
        />
        <KpiCard
          label={copy.totalElayaMonth || 'Total revenue (month)'}
          value={fmt(totals.total_elaya_chf)}
          accent="gold"
        />
        <KpiCard
          label={copy.openInvoices || 'Open invoices'}
          value={`${totals.open_invoices_count ?? 0} · ${fmt(totals.open_invoices_chf)}`}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['starter', 'pro', 'network'].map((id) => (
          <span
            key={id}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-elaya-border text-[12px] text-studio-w1 bg-studio-bg-4"
          >
            <span className="font-semibold capitalize text-studio-white">{id}</span>
            <span className="text-studio-w3">{packageCounts[id] ?? 0}</span>
          </span>
        ))}
      </div>

      <Card className="mb-6 border-l-[3px] border-l-studio-gold-2">
        <h3 className="m-0 text-[13px] font-semibold text-studio-white">
          {copy.aboModelTitle || 'Pure subscription model'}
        </h3>
        <ul className="m-0 mt-2 pl-4 text-[12px] text-studio-w2 leading-relaxed space-y-1">
          <li>
            {copy.aboModelRule1 ||
              'Revenue = subscription fee per studio + Elaya share of shop sales. NO transaction fee.'}
          </li>
          <li>
            {copy.aboModelRule2 ||
              'Acquisition source is for analysis only and does not affect fees.'}
          </li>
          <li>{copy.aboModelRule3 || 'All amounts in CHF, excl. VAT.'}</li>
        </ul>
      </Card>

      {/* Secondary shop commission strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label={copy.totalSales || 'Shop GMV'} value={fmt(totals.shop_gmv_chf)} />
        <KpiCard
          label={copy.studioCommission || 'Studio commission'}
          value={fmt(totals.provision_total)}
          accent="emerald"
        />
        <KpiCard
          label={copy.provisionOpen || 'Commission open'}
          value={fmt(totals.pending_provision)}
          accent="amber"
        />
        <KpiCard
          label={copy.provisionPaid || 'Commission paid'}
          value={fmt(totals.paid_provision)}
        />
      </div>

      <div className="mb-3">
        <h2 className="m-0 text-[15px] font-semibold text-studio-white">
          {copy.studiosTitleAbo || 'Studios'}
        </h2>
        <p className="m-0 mt-0.5 text-[12px] text-studio-w2">
          {copy.studiosHintAbo || 'Click a studio for package terms, dual P&L and products.'}
        </p>
      </div>

      {studios.length === 0 ? (
        <EmptyState title={copy.empty || 'No studios'} />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[860px]">
              <thead>
                <tr className="text-left text-studio-w2 border-b border-elaya-border">
                  <th className="p-3">{copy.headers.studio}</th>
                  <th className="p-3">{copy.headers.package || 'Package'}</th>
                  <th className="p-3">{copy.headers.locations || 'Locations'}</th>
                  <th className="p-3">{copy.headers.customers || 'Customers'}</th>
                  <th className="p-3">{copy.headers.abo || 'Abo CHF'}</th>
                  <th className="p-3">{copy.headers.shopElaya || 'Shop Elaya'}</th>
                  <th className="p-3">{copy.headers.status || 'Status'}</th>
                  <th className="p-3">{copy.headers.invoice || 'Invoice'}</th>
                  <th className="p-3 w-8" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {studios.map((s) => (
                  <tr
                    key={s.studio_id}
                    className="border-b border-elaya-border/60 hover:bg-studio-bg-4/60 cursor-pointer transition-colors"
                    onClick={() => void openStudio(s.studio_id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        void openStudio(s.studio_id)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                  >
                    <td className="p-3 font-medium text-studio-white">
                      {s.studio_name || s.studio_code}
                      {s.studio_code && s.studio_name ? (
                        <span className="block text-[11px] text-studio-w3 font-normal">
                          {s.studio_code}
                        </span>
                      ) : null}
                    </td>
                    <td className="p-3">
                      {s.package_name}
                      {s.has_override ? (
                        <span className="block text-[10px] text-studio-gold-2">
                          {copy.override || 'Override'}
                        </span>
                      ) : null}
                    </td>
                    <td className="p-3">{s.standorte_count}</td>
                    <td className="p-3">{s.customers_count}</td>
                    <td className="p-3 text-studio-gold-2 font-medium">{fmt(s.abo_chf)}</td>
                    <td className="p-3">{fmt(s.shop_elaya_chf)}</td>
                    <td className="p-3">{statusBadge(s.status, copy)}</td>
                    <td className="p-3 text-studio-w3">
                      {s.open_invoices_count
                        ? `${s.open_invoices_count} · ${fmt(s.open_invoices_chf)}`
                        : '—'}
                    </td>
                    <td className="p-3 text-studio-w3">
                      <ChevronRight size={16} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default AdminFinance
