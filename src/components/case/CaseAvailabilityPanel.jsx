import { useCallback, useEffect, useState } from 'react'
import { CalendarClock, Lock, Unlock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getCaseAvailability } from '../../api/cases'
import usePlatformConfigSocket from '../../hooks/usePlatformConfigSocket'
import { fmtDateLong } from '../../utils/time'
import { lockoutReasonKey } from '../../utils/lockoutReason'
import { Card, Button, Spinner } from '../ui'
import useContent from '../../i18n/useContent'

const CaseAvailabilityPanel = ({ caseId, customerId, compact = false }) => {
  const { t, components, language } = useContent()
  const copy = components.caseAvailability
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!caseId) return
      if (!silent) {
        setLoading(true)
        setError(false)
      }

      try {
        // No from/to: this panel only shows the earliest date, the blocking
        // periods and the next free window, none of which depend on a range.
        // Passing one would make the server build a day-by-day calendar and
        // load the studio schedule for nothing.
        const res = await getCaseAvailability(caseId)
        setData(res.data.data)
        setError(false)
      } catch {
        // A failed background refresh keeps the last known date on screen.
        if (!silent) setError(true)
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [caseId]
  )

  useEffect(() => {
    void load()
  }, [load])

  // Blocking periods are computed across all cases of a customer, so a booking
  // or a documented session anywhere can move this date while the page is open.
  usePlatformConfigSocket({
    enabled: Boolean(caseId),
    onAvailabilityChanged: () => {
      void load({ silent: true })
    },
  })

  const bookUrl = customerId
    ? `/studio/appointments?case_id=${caseId}&customer_id=${customerId}&book=1`
    : `/studio/appointments?case_id=${caseId}&book=1`

  return (
    <Card className="flex flex-col gap-3">
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
              {fmtDateLong(data.fruehestes, language)}
            </p>
          </div>

          {data.sperren?.length > 0 ? (
            <>
              <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0">
                {copy.reasonsTitle}
              </p>
              <ul className="flex flex-col gap-2 m-0 p-0 list-none">
                {data.sperren.map((s, i) => {
                  const { key, params } = lockoutReasonKey(s)
                  return (
                    <li
                      key={`${s.kategorie ?? s.typ}-${s.bis ?? s.von}-${i}`}
                      className="flex gap-2 text-[11px] text-studio-w2 leading-snug"
                    >
                      <Lock size={12} className="text-elaya-warning shrink-0 mt-0.5" />
                      <span>
                        {t(key, params)}
                        {s.bis_string && (
                          <span className="text-studio-w3">
                            {t('components.caseAvailability.lockedUntil', { until: s.bis_string })}
                          </span>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : (
            <div className="flex items-center gap-2 text-elaya-success text-[12px]">
              <Unlock size={13} />
              <span>{copy.noLockouts}</span>
            </div>
          )}

          {data.frei_fenster?.length > 0 && data.frei_fenster[0] && (
            <p className="text-studio-w3 text-[10px] m-0">
              {t('components.caseAvailability.nextWindow', {
                from: data.frei_fenster[0].von_string ?? fmtDateLong(data.frei_fenster[0].von, language),
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
