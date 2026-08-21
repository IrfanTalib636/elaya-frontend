import { useEffect, useState } from 'react'
import { Card, PageHeader, Spinner } from '../../components/ui'
import { getShopFinance } from '../../api/adminShop'
import { getAdminElaycoinOverview } from '../../api/adminElaycoins'
import { listAdminStudios } from '../../api/adminStudios'
import useContent from '../../i18n/useContent'

const fmt = (n) =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(n || 0)

const AdminOverview = () => {
  const { t, adminPages } = useContent()
  const copy = adminPages.overview

  const [loading, setLoading] = useState(true)
  const [finance, setFinance] = useState(null)
  const [coins, setCoins] = useState(null)
  const [studios, setStudios] = useState([])

  useEffect(() => {
    ;(async () => {
      try {
        const [f, c, s] = await Promise.all([
          getShopFinance(),
          getAdminElaycoinOverview({ limit: 5 }),
          listAdminStudios({ limit: 50 }),
        ])
        setFinance(f.data.data)
        setCoins(c.data.data)
        setStudios(s.data.data?.studios ?? s.data.data ?? [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  const totals = finance?.totals || {}
  const studioList = Array.isArray(studios) ? studios : []
  const topList =
    (finance?.studios || [])
      .slice(0, 5)
      .map((s) => `${s.studio_name || s.studio_code} (${fmt(s.revenue)})`)
      .join(' · ') || '—'

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-[12px] text-admin-muted m-0">{copy.studios}</p>
          <p className="text-[22px] font-bold m-0 mt-1">{studioList.length}</p>
        </Card>
        <Card>
          <p className="text-[12px] text-admin-muted m-0">{copy.shopRevenue}</p>
          <p className="text-[22px] font-bold m-0 mt-1">{fmt(totals.revenue)}</p>
        </Card>
        <Card>
          <p className="text-[12px] text-admin-muted m-0">{copy.provisionOpen}</p>
          <p className="text-[22px] font-bold m-0 mt-1 text-amber-600">
            {fmt(totals.pending_provision)}
          </p>
        </Card>
        <Card>
          <p className="text-[12px] text-admin-muted m-0">{copy.coinsTotal}</p>
          <p className="text-[22px] font-bold m-0 mt-1">
            {coins?.summary?.total_balance ?? 0}
          </p>
        </Card>
      </div>

      <Card>
        <p className="text-[13px] text-admin-muted m-0 mb-2">
          {t('adminPages.overview.provisionStandard', {
            pct: finance?.provision_percent_default ?? 20,
            stripe: finance?.stripe_connect_enabled
              ? copy.stripeActive
              : copy.stripePending,
          })}
        </p>
        <p className="text-[12px] m-0 text-admin-muted">
          {t('adminPages.overview.topStudios', { list: topList })}
        </p>
      </Card>
    </div>
  )
}

export default AdminOverview
