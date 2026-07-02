import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { listAppointments } from '../../api/appointments'
import { Card, Badge, Button, Spinner, PageHeader, EmptyState } from '../../components/ui'

const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const fmtDay = (d) =>
  new Date(d).toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const APPT_TYPE_LABELS = {
  beratung:  'Beratung',
  treatment: 'Behandlung',
  first:     'Ersttermin',
}

const APPT_STATUS_LABELS = {
  gebucht:    'Gebucht',
  storniert:  'Storniert',
  cancelled:  'Storniert',
  completed:  'Abgeschlossen',
}

const TABLE_HEADERS = ['Zeit', 'Kunde', 'Fall', 'Typ', 'Dauer', 'Status', '']

const ApptRow = ({ appt, onClick }) => {
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
      <td className="px-5 py-3 text-studio-w2 text-[12px]">{APPT_TYPE_LABELS[appt.type] ?? appt.type}</td>
      <td className="px-5 py-3 text-studio-w2 text-[12px]">
        {appt.dauer_minuten ? `${appt.dauer_minuten} min` : '—'}
      </td>
      <td className="px-5 py-3">
        <Badge variant="status" value={appt.status}>
          {APPT_STATUS_LABELS[appt.status] ?? appt.status}
        </Badge>
      </td>
      <td className="px-5 py-3 text-studio-w3"><ArrowRight size={14} /></td>
    </tr>
  )
}

const StudioToday = () => {
  const navigate = useNavigate()
  const todayISO = useMemo(() => toISO(new Date()), [])
  const todayLabel = useMemo(() => fmtDay(new Date()), [])

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

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
        toast.error('Termine konnten nicht geladen werden.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [todayISO])

  const goToCase = (appt) => {
    const caseId = appt.case?._id ?? appt.case?.id ?? appt.case
    if (caseId) navigate(`/studio/cases/${caseId}`)
  }

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader title="Heute" subtitle={todayLabel}>
        <Button size="sm" variant="secondary" onClick={() => navigate('/studio/appointments')}>
          <Calendar size={14} />
          Kalender
        </Button>
      </PageHeader>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Keine Termine heute"
          description="Kunden buchen Termine über die App oder im Kalender."
        />
      ) : (
        <Card padding="none">
          <div className="flex items-center justify-between px-5 py-4 border-b border-elaya-border">
            <h2 className="text-[14px] font-semibold text-studio-white m-0">
              Termine <span className="ml-2 text-studio-w3 text-[12px] font-normal">({appointments.length})</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-elaya-border">
                  {TABLE_HEADERS.map((h) => (
                    <th key={h || 'action'} className="px-5 py-3 text-left text-[10px] font-semibold text-studio-w3 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <ApptRow key={a.id ?? a._id} appt={a} onClick={() => goToCase(a)} />
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
