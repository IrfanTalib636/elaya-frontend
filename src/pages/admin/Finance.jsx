import { useEffect, useState } from 'react'
import { Card, PageHeader, Spinner, EmptyState } from '../../components/ui'
import { getShopFinance } from '../../api/adminShop'

const fmt = (n) =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(n || 0)

const AdminFinance = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getShopFinance()
        setData(res.data.data)
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

  const totals = data?.totals || {}
  const studios = data?.studios || []

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader
        title="Finanzen"
        subtitle={`Shop-Umsatz & Studio-Provisionen (${data?.provision_percent_default ?? 20}% Standard). Stripe Connect Auszahlung: pending.`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-[12px] text-admin-muted m-0">Umsatz (Warenwert)</p>
          <p className="text-[20px] font-bold m-0 mt-1">{fmt(totals.revenue)}</p>
        </Card>
        <Card>
          <p className="text-[12px] text-admin-muted m-0">Elaya-Anteil</p>
          <p className="text-[20px] font-bold m-0 mt-1">{fmt(totals.elaya_total)}</p>
        </Card>
        <Card>
          <p className="text-[12px] text-admin-muted m-0">Provision offen</p>
          <p className="text-[20px] font-bold m-0 mt-1 text-amber-600">
            {fmt(totals.pending_provision)}
          </p>
        </Card>
        <Card>
          <p className="text-[12px] text-admin-muted m-0">Provision ausgezahlt</p>
          <p className="text-[20px] font-bold m-0 mt-1 text-emerald-600">
            {fmt(totals.paid_provision)}
          </p>
        </Card>
      </div>

      {studios.length === 0 ? (
        <EmptyState title="Noch keine Shop-Umsätze" />
      ) : (
        <Card padding="none">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-admin-muted border-b border-admin-line">
                <th className="p-3">Studio</th>
                <th className="p-3">Bestellungen</th>
                <th className="p-3">Umsatz</th>
                <th className="p-3">Provision gesamt</th>
                <th className="p-3">Offen</th>
                <th className="p-3">Ausgezahlt</th>
              </tr>
            </thead>
            <tbody>
              {studios.map((s) => (
                <tr key={s.studio_id} className="border-b border-admin-line/50">
                  <td className="p-3 font-medium">
                    {s.studio_name || s.studio_code}
                  </td>
                  <td className="p-3">{s.order_count}</td>
                  <td className="p-3">{fmt(s.revenue)}</td>
                  <td className="p-3">{fmt(s.provision_total)}</td>
                  <td className="p-3 text-amber-600">{fmt(s.pending_provision)}</td>
                  <td className="p-3 text-emerald-600">{fmt(s.paid_provision)}</td>
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
