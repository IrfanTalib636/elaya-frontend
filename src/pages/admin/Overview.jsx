import { useEffect, useState } from 'react'
import { Card, PageHeader, Spinner } from '../../components/ui'
import { getShopFinance } from '../../api/adminShop'
import { getAdminElaycoinOverview } from '../../api/adminElaycoins'
import { listAdminStudios } from '../../api/adminStudios'

const fmt = (n) =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(n || 0)

const AdminOverview = () => {
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

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader
        title="Admin Übersicht"
        subtitle="Plattform-KPIs · Shop-Provision · Elaycoins (Stripe Connect pending)"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-[12px] text-admin-muted m-0">Studios</p>
          <p className="text-[22px] font-bold m-0 mt-1">{studioList.length}</p>
        </Card>
        <Card>
          <p className="text-[12px] text-admin-muted m-0">Shop Umsatz</p>
          <p className="text-[22px] font-bold m-0 mt-1">{fmt(totals.revenue)}</p>
        </Card>
        <Card>
          <p className="text-[12px] text-admin-muted m-0">Studio-Provision (offen)</p>
          <p className="text-[22px] font-bold m-0 mt-1 text-amber-600">
            {fmt(totals.pending_provision)}
          </p>
        </Card>
        <Card>
          <p className="text-[12px] text-admin-muted m-0">Elaycoins gesamt</p>
          <p className="text-[22px] font-bold m-0 mt-1">
            {coins?.summary?.total_balance ?? 0}
          </p>
        </Card>
      </div>

      <Card>
        <p className="text-[13px] text-admin-muted m-0 mb-2">
          Provision Standard: {finance?.provision_percent_default ?? 20}% an Studios ·{' '}
          Stripe Connect: {finance?.stripe_connect_enabled ? 'aktiv' : 'ausstehend (Keys pending)'}
        </p>
        <p className="text-[12px] m-0 text-admin-muted">
          Top Studios nach Shop-Umsatz:{' '}
          {(finance?.studios || [])
            .slice(0, 5)
            .map((s) => `${s.studio_name || s.studio_code} (${fmt(s.revenue)})`)
            .join(' · ') || '—'}
        </p>
      </Card>
    </div>
  )
}

export default AdminOverview
