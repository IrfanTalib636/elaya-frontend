import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ListTodo } from 'lucide-react'
import { listAdminOpenActions } from '../../api/openActions'
import { markActionOpened, subscribeOpenActionsChanged } from '../../lib/openActionsSync'
import { listAdminStudios } from '../../api/adminStudios'
import { PageHeader, Card, Button, Spinner, EmptyState } from '../../components/ui'
import useContent from '../../i18n/useContent'
import useAuthStore from '../../store/authStore'
import { getApiErrorMessage } from '../../lib/apiError'

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

const AdminActions = () => {
  const navigate = useNavigate()
  const { adminActions: copy, studioActions: shared } = useContent()
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState({ open: 0, urgent: 0 })
  const [studios, setStudios] = useState([])
  const [studioId, setStudioId] = useState('')
  const [type, setType] = useState('')
  const [priority, setPriority] = useState('')
  const [minAge, setMinAge] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openingKey, setOpeningKey] = useState('')
  const [revision, setRevision] = useState(0)
  const hasLoaded = useRef(false)
  const enterStudioWorkspace = useAuthStore((s) => s.enterStudioWorkspace)
  const enableStudioWorkspaceEdit = useAuthStore((s) => s.enableStudioWorkspaceEdit)

  useEffect(() => {
    listAdminStudios({ limit: 100 })
      .then((res) => setStudios(res.data?.data?.studios || []))
      .catch(() => setStudios([]))
  }, [])

  useEffect(() => subscribeOpenActionsChanged(() => setRevision((n) => n + 1)), [])

  useEffect(() => {
    let cancelled = false
    if (!hasLoaded.current) setLoading(true)
    listAdminOpenActions({
      ...(studioId ? { studio_id: studioId } : {}),
      ...(type ? { type } : {}),
      ...(priority ? { priority } : {}),
      ...(minAge ? { min_age_hours: minAge } : {}),
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
  }, [studioId, type, priority, minAge, revision, copy.loadError])

  const openRow = async (row) => {
    const path = row.path || '/studio/dashboard'
    if (!row.studio_id) {
      markActionOpened()
      navigate(path)
      return
    }
    setOpeningKey(row.key)
    try {
      await enterStudioWorkspace(row.studio_id)
      try {
        await enableStudioWorkspaceEdit('Complete open studio action')
      } catch {
        // The screen still opens. Editing can be enabled from the workspace banner.
      }
      markActionOpened()
      navigate(path)
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.loadError))
    } finally {
      setOpeningKey(null)
    }
  }

  return (
    <div className="p-6 max-w-[1200px]">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="grid grid-cols-2 gap-4 mb-6 max-w-[420px]">
        <Card>
          <p className="text-[24px] font-bold text-studio-white m-0 leading-none">{summary.open}</p>
          <p className="text-studio-w2 text-[12px] m-0 mt-1">{shared.openCount}</p>
        </Card>
        <Card>
          <p className="text-[24px] font-bold text-elaya-error m-0 leading-none">{summary.urgent}</p>
          <p className="text-studio-w2 text-[12px] m-0 mt-1">{shared.urgentCount}</p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={studioId}
          onChange={(e) => setStudioId(e.target.value)}
          className="rounded-[10px] border border-elaya-border bg-studio-bg-4 px-3 py-2 text-[12px] text-studio-white outline-none"
        >
          <option value="">{copy.allStudios}</option>
          {studios.map((studio) => (
            <option key={studio.id || studio._id} value={studio.id || studio._id}>
              {studio.firma || studio.studio_code}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-[10px] border border-elaya-border bg-studio-bg-4 px-3 py-2 text-[12px] text-studio-white outline-none"
        >
          <option value="">{copy.allTypes}</option>
          {Object.entries(shared.types || {}).map(([id, label]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-[10px] border border-elaya-border bg-studio-bg-4 px-3 py-2 text-[12px] text-studio-white outline-none"
        >
          <option value="">{copy.allPriorities}</option>
          {Object.entries(shared.priorities || {}).map(([id, label]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
        <select
          value={minAge}
          onChange={(e) => setMinAge(e.target.value)}
          className="rounded-[10px] border border-elaya-border bg-studio-bg-4 px-3 py-2 text-[12px] text-studio-white outline-none"
        >
          <option value="">{copy.anyAge}</option>
          <option value="24">{copy.age24}</option>
          <option value="72">{copy.age72}</option>
        </select>
        <span className="rounded-full border border-elaya-border px-3 py-2 text-[12px] text-studio-w1">
          {copy.statusOpen}
        </span>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : error ? (
        <p className="text-elaya-error text-[13px]">{error}</p>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState icon={ListTodo} title={copy.empty} />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-studio-w3 text-[11px] uppercase tracking-wide border-b border-elaya-border">
                  <th className="px-4 py-3 font-medium">{copy.columns.customer}</th>
                  <th className="px-4 py-3 font-medium">{copy.columns.case}</th>
                  <th className="px-4 py-3 font-medium">{copy.columns.action}</th>
                  <th className="px-4 py-3 font-medium">{copy.columns.priority}</th>
                  <th className="px-4 py-3 font-medium">{copy.columns.age}</th>
                  <th className="px-4 py-3 font-medium">{copy.columns.studio}</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-b border-elaya-border/70 last:border-0">
                    <td className="px-4 py-3 text-studio-white font-medium">{row.customer_name}</td>
                    <td className="px-4 py-3 text-studio-w1">{row.case_ref || '—'}</td>
                    <td className="px-4 py-3 text-studio-w1">{shared.types?.[row.type] || row.type}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityClass(row.priority)}`}>
                        {shared.priorities?.[row.priority] || row.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-studio-w2">{formatAge(row.age_hours, shared)}</td>
                    <td className="px-4 py-3 text-studio-w1">{row.studio_name}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={openingKey === row.key}
                        onClick={() => openRow(row)}
                      >
                        {shared.openButton}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default AdminActions
