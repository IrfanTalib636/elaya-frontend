import { useEffect, useState } from 'react'
import { CalendarClock, Lock, Unlock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getCaseAvailability } from '../../api/cases'
import { fmtDateDeLong } from '../../utils/time'
import { Card, Button, Spinner } from '../ui'
import useContent from '../../i18n/useContent'

const addDaysIso = (iso, days) => {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const CaseAvailabilityPanel = ({ caseId, customerId, compact = false }) => {
  const { t, components } = useContent()
  const copy = components.caseAvailability
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!caseId) return
    let cancelled = false
    setLoading(true)
    setError(false)

    const today = new Date().toISOString().slice(0, 10)
    const to = addDaysIso(today, 120)

    getCaseAvailability(caseId, { from: today, to })
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

  const bookUrl = customerId
    ? `/studio/appointments?case_id=${caseId}&customer_id=${customerId}&book=1`
    : `/studio/appointments?case_id=${caseId}&book=1`

  return (
    <Card className={`flex flex-col gap-3 ${compact ? '' : ''}`}>
      <div className="flex items-center gap-2">
        <CalendarClock size={14} className="text-studio-teal-2 shrink-0" />
        <h3 className="text-[13px] font-semibold text-studio-white m-0">{copy.title}</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-4"><Spinner size="sm" /></div>
      ) : error ? (
        <p className="text-studio-w3 text-[12px] m-0">{copy.error}</p>
      ) : data ? (
        <>
          <div className="rounded-[10px] border border-studio-teal-2/25 bg-studio-teal-2/10 px-3 py-2.5">
            <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0 mb-1">{copy.earliest}</p>
            <p className="text-studio-white text-[15px] font-bold m-0 tabular-nums">
              {fmtDateDeLong(data.fruehestes)}
            </p>
          </div>

          {data.sperren?.length > 0 ? (
            <ul className="flex flex-col gap-2 m-0 p-0 list-none">
              {data.sperren.map((s, i) => (
                <li
                  key={`${s.typ}-${s.von}-${i}`}
                  className="flex gap-2 text-[11px] text-studio-w2 leading-snug"
                >
                  <Lock size={12} className="text-elaya-warning shrink-0 mt-0.5" />
                  <span>
                    {s.grund}
                    {s.bis_string && (
                      <span className="text-studio-w3">
                        {t('components.caseAvailability.lockedUntil', { until: s.bis_string })}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 text-elaya-success text-[12px]">
              <Unlock size={13} />
              <span>{copy.noLockouts}</span>
            </div>
          )}

          {data.frei_fenster?.length > 0 && data.frei_fenster[0] && (
            <p className="text-studio-w3 text-[10px] m-0">
              {t('components.caseAvailability.nextWindow', {
                from: data.frei_fenster[0].von_string ?? fmtDateDeLong(data.frei_fenster[0].von),
              })}
            </p>
          )}

          {!compact && (
            <Button
              size="sm"
              variant="secondary"
              className="w-full mt-1"
              onClick={() => navigate(bookUrl)}
            >
              {copy.book}
            </Button>
          )}
        </>
      ) : null}
    </Card>
  )
}

export default CaseAvailabilityPanel
