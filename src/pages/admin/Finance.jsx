import { useEffect, useState } from 'react'
import { Card, PageHeader, Spinner, EmptyState } from '../../components/ui'
import { getShopFinance } from '../../api/adminShop'
import useContent from '../../i18n/useContent'

const fmt = (n) =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(n || 0)

const AdminFinance = () => {
  const { t, adminPages } = useContent()
  const copy = adminPages.finance

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
        title={copy.title}
        subtitle={t('adminPages.finance.subtitle', {
          pct: data?.provision_percent_default ?? 20,
        })}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-[12px] text-admin-muted m-0">{copy.revenue}</p>
          <p className="text-[20px] font-bold m-0 mt-1">{fmt(totals.revenue)}</p>
        </Card>
        <Card>
          <p className="text-[12px] text-admin-muted m-0">{copy.elayaShare}</p>
          <p className="text-[20px] font-bold m-0 mt-1">{fmt(totals.elaya_total)}</p>
        </Card>
        <Card>
          <p className="text-[12px] text-admin-muted m-0">{copy.provisionOpen}</p>
          <p className="text-[20px] font-bold m-0 mt-1 text-amber-600">
            {fmt(totals.pending_provision)}
          </p>
        </Card>
        <Card>
          <p className="text-[12px] text-admin-muted m-0">{copy.provisionPaid}</p>
          <p className="text-[20px] font-bold m-0 mt-1 text-emerald-600">
            {fmt(totals.paid_provision)}
          </p>
        </Card>
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
                <th className="p-3">{copy.headers.revenue}</th>
                <th className="p-3">{copy.headers.provisionTotal}</th>
                <th className="p-3">{copy.headers.open}</th>
                <th className="p-3">{copy.headers.paid}</th>
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
