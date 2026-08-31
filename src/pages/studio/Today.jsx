import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { listAppointments } from '../../api/appointments'
import { Card, Badge, Button, Spinner, PageHeader, EmptyState } from '../../components/ui'
import useContent from '../../i18n/useContent'

const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const ApptRow = ({ appt, onClick, copy, t }) => {
  const customerName = appt.customer
    ? `${appt.customer.vorname ?? ''} ${appt.customer.nachname ?? ''}`.trim() || '—'
    : '—'

  return (
    <tr
      className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-5 py-3 text-studio-white text-[13px] font-mono font-medium">{appt.time ?? '—'}</td>
      <td className="px-5 py-3 text-studio-white text-[13px]">{customerName}</td>
      <td className="px-5 py-3 text-studio-gold-2 text-[12px] font-mono">{appt.case?.caseId ?? '—'}</td>
      <td className="px-5 py-3 text-studio-w2 text-[12px]">{copy.types[appt.type] ?? appt.type}</td>
      <td className="px-5 py-3 text-studio-w2 text-[12px]">
        {appt.dauer_minuten ? t('studioPages.today.minutes', { count: appt.dauer_minuten }) : '—'}
      </td>
      <td className="px-5 py-3">
        <Badge variant="status" value={appt.status}>
          {copy.statuses[appt.status] ?? appt.status}
        </Badge>
      </td>
      <td className="px-5 py-3 text-studio-w3"><ArrowRight size={14} /></td>
    </tr>
  )
}

const StudioToday = () => {
  const navigate = useNavigate()
  const { t, language, studioPages } = useContent()
  const copy = studioPages.today
  const todayISO = useMemo(() => toISO(new Date()), [])
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString(language === 'en' ? 'en-GB' : 'de-CH', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      }),
    [language]
  )

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const tableHeaders = [
    copy.headers.time,
    copy.headers.customer,
    copy.headers.case,
    copy.headers.type,
    copy.headers.duration,
    copy.headers.status,
    '',
  ]

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await listAppointments({ from: todayISO, to: todayISO, limit: 100 })
        const appts = res.data.data.appointments ?? []
        setAppointments(
          appts.sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
        )
      } catch {
        toast.error(copy.loadError)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [todayISO, copy.loadError])

  const goToCase = (appt) => {
    const caseId = appt.case?._id ?? appt.case?.id ?? appt.case
    if (caseId) navigate(`/studio/cases/${caseId}`)
  }

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader title={copy.title} subtitle={todayLabel}>
        <Button size="sm" variant="secondary" onClick={() => navigate('/studio/appointments')}>
          <Calendar size={14} />
          {copy.calendar}
        </Button>
      </PageHeader>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={copy.emptyTitle}
          description={copy.emptyDesc}
        />
      ) : (
        <Card padding="none">
          <div className="flex items-center justify-between px-5 py-4 border-b border-elaya-border">
            <h2 className="text-[14px] font-semibold text-studio-white m-0">
              {copy.appointments} <span className="ml-2 text-studio-w3 text-[12px] font-normal">({appointments.length})</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-elaya-border">
                  {tableHeaders.map((h, i) => (
                    <th key={`${h}-${i}`} className="px-5 py-3 text-left text-[10px] font-semibold text-studio-w3 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <ApptRow key={a.id ?? a._id} appt={a} onClick={() => goToCase(a)} copy={copy} t={t} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default StudioToday
