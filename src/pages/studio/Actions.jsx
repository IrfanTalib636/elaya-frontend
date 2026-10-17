import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListTodo } from 'lucide-react'
import { listStudioOpenActions } from '../../api/openActions'
import { markActionOpened, subscribeOpenActionsChanged } from '../../lib/openActionsSync'
import { PageHeader, Card, Button, Spinner, EmptyState } from '../../components/ui'
import useContent from '../../i18n/useContent'

const formatAge = (hours, copy) => {
  if (hours < 1) return copy.ageUnderHour
  if (hours < 24) return copy.ageHours.replace('{{count}}', String(hours))
  const days = Math.max(1, Math.round(hours / 24))
  return copy.ageDays.replace('{{count}}', String(days))
}

const priorityClass = (priority) => {
  if (priority === 'hoch') return 'bg-elaya-error/15 text-elaya-error'
  if (priority === 'niedrig') return 'bg-studio-w4 text-studio-w2'
  return 'bg-studio-gold/15 text-studio-gold-2'
}

const StudioActions = () => {
  const navigate = useNavigate()
  const { studioActions: copy } = useContent()
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState({ open: 0, urgent: 0 })
  const [type, setType] = useState('')
  const [priority, setPriority] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const hasLoaded = useRef(false)

  useEffect(() => subscribeOpenActionsChanged(() => setRevision((n) => n + 1)), [])

  useEffect(() => {
    let cancelled = false
    if (!hasLoaded.current) setLoading(true)
    listStudioOpenActions({
      ...(type ? { type } : {}),
      ...(priority ? { priority } : {}),
    })
      .then((res) => {
        if (cancelled) return
        setRows(res.data?.data?.actions || [])
        setSummary(res.data?.data?.summary || { open: 0, urgent: 0 })
        setError('')
      })
      .catch(() => {
        if (!cancelled) setError(copy.loadError)
      })
      .finally(() => {
        if (!cancelled) {
          hasLoaded.current = true
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [type, priority, revision, copy.loadError])

  const typeOptions = useMemo(() => Object.entries(copy.types || {}), [copy.types])

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="grid grid-cols-2 gap-4 mb-6 max-w-[420px]">
        <Card>
          <p className="text-[24px] font-bold text-studio-white m-0 leading-none">{summary.open}</p>
          <p className="text-studio-w2 text-[12px] m-0 mt-1">{copy.openCount}</p>
        </Card>
        <Card>
          <p className="text-[24px] font-bold text-elaya-error m-0 leading-none">{summary.urgent}</p>
          <p className="text-studio-w2 text-[12px] m-0 mt-1">{copy.urgentCount}</p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-[10px] border border-elaya-border bg-studio-bg-4 px-3 py-2 text-[12px] text-studio-white outline-none"
        >
          <option value="">{copy.filters.allTypes}</option>
          {typeOptions.map(([id, label]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-[10px] border border-elaya-border bg-studio-bg-4 px-3 py-2 text-[12px] text-studio-white outline-none"
        >
          <option value="">{copy.filters.allPriorities}</option>
          {Object.entries(copy.priorities || {}).map(([id, label]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : error ? (
        <p className="text-elaya-error text-[13px]">{error}</p>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState icon={ListTodo} title={copy.empty} description={copy.emptyHint} />
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <Card key={row.key} className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-studio-white text-[14px] font-semibold m-0 truncate">
                  {row.customer_name}
                  {row.case_ref ? <span className="text-studio-w2 font-medium"> · {row.case_ref}</span> : null}
                </p>
                <p className="text-studio-w1 text-[13px] m-0 mt-1">
                  {copy.types?.[row.type] || row.type}
                </p>
                <p className="text-studio-w3 text-[12px] m-0 mt-1">
                  {copy.responsible}: {row.studio_name} · {formatAge(row.age_hours, copy)}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityClass(row.priority)}`}>
                {copy.priorities?.[row.priority] || row.priority}
              </span>
              <Button size="sm" onClick={() => { markActionOpened(); navigate(row.path || '/studio/actions') }}>
                {copy.openButton}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudioActions
