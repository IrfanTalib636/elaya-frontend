import { useEffect, useState } from 'react'
import { Calculator } from 'lucide-react'
import { getCasePricing } from '../../api/cases'
import { Card, Spinner } from '../ui'

const fmtCHF = (n) => (n != null ? `CHF ${Number(n).toFixed(0)}` : '—')

const CasePricingPanel = ({ caseId }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!caseId) return
    let cancelled = false
    setLoading(true)
    setError(false)

    getCasePricing(caseId)
      .then((res) => {
        if (!cancelled) setData(res.data.data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [caseId])

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Calculator size={14} className="text-studio-gold shrink-0" />
        <h3 className="text-[13px] font-semibold text-studio-white m-0">Preiskalkulation</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-4"><Spinner size="sm" /></div>
      ) : error ? (
        <p className="text-studio-w3 text-[12px] m-0">Preis konnte nicht berechnet werden.</p>
      ) : data ? (
        <>
          <div className="rounded-[10px] border border-studio-gold/25 bg-studio-gold/10 px-3 py-2.5">
            <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0 mb-1">Preis pro Sitzung</p>
            <p className="text-studio-white text-[15px] font-bold m-0 tabular-nums">
              {fmtCHF(data.pricePerSession)}
            </p>
          </div>

          {data.area != null && (
            <p className="text-studio-w2 text-[11px] m-0">
              Fläche: <span className="text-studio-white font-medium">{data.area} cm²</span>
            </p>
          )}

          {data.confidence_pct != null && (
            <p className="text-studio-w3 text-[10px] m-0">
              Konfidenz der Schätzung: {data.confidence_pct} %
            </p>
          )}

          {data.multipliers && (
            <p className="text-studio-w3 text-[10px] m-0 leading-relaxed">
              Faktoren: Farbe ×{data.multipliers.color?.toFixed(2) ?? '—'},
              {' '}Alter ×{data.multipliers.age?.toFixed(2) ?? '—'},
              {' '}Haut ×{data.multipliers.skin?.toFixed(2) ?? '—'}
            </p>
          )}
        </>
      ) : null}
    </Card>
  )
}

export default CasePricingPanel
