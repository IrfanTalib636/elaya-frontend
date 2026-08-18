import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScrollText } from 'lucide-react'
import toast from 'react-hot-toast'
import { listStudioActivity } from '../../api/activity'
import { Card, Spinner, EmptyState, Pagination } from '../ui'
import { studioActivity as copy } from '../../content'
import { ActivityIcon, ActivityTag, fmtActivityWhen } from './activityMeta'

const CATEGORY_KEYS = [
  'all',
  'bookings',
  'cancellations',
  'reschedules',
  'no_shows',
  'lockouts',
  'medical',
  'profile',
  'studio',
  'prices',
  'sessions',
]

const RANGE_KEYS = ['all', 'h24', 'h48', 'd7', 'd30', 'm3', 'm6', 'custom']

const toIsoDate = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const rangeToDates = (key) => {
  if (key === 'all' || key === 'custom') return { from: '', to: '' }
  const now = new Date()
  const to = toIsoDate(now)
  const from = new Date(now)
  if (key === 'h24') from.setHours(from.getHours() - 24)
  else if (key === 'h48') from.setHours(from.getHours() - 48)
  else if (key === 'd7') from.setDate(from.getDate() - 7)
  else if (key === 'd30') from.setDate(from.getDate() - 30)
  else if (key === 'm3') from.setMonth(from.getMonth() - 3)
  else if (key === 'm6') from.setMonth(from.getMonth() - 6)
  return { from: toIsoDate(from), to }
}

const Pill = ({ active, tone = 'gold', onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-[6px] rounded-full text-[11px] font-semibold transition-colors border cursor-pointer whitespace-nowrap
      ${
        active
          ? tone === 'blue'
            ? 'bg-sky-400/15 text-sky-300 border-sky-400/40'
            : 'bg-elaya-success/15 text-elaya-success border-elaya-success/40'
          : 'bg-transparent text-studio-w2 border-elaya-border hover:text-studio-white hover:border-elaya-border-strong'
      }`}
  >
    {children}
  </button>
)

const ActivityRow = ({ event, showCustomer, onOpen }) => (
  <button
    type="button"
    onClick={onOpen}
    className="w-full flex items-start gap-3 px-4 py-3 text-left border-0 border-b border-elaya-border last:border-b-0 bg-transparent cursor-pointer hover:bg-studio-bg-4 transition-colors"
  >
    <ActivityIcon category={event.category} />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 flex-wrap">
        <ActivityTag tag={event.tag} />
        {event.case_label ? (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] bg-studio-bg-4 text-studio-w2 text-[10px] font-semibold">
            {event.case_label}
          </span>
        ) : null}
        {showCustomer && event.customer_name ? (
          <span className="text-studio-w2 text-[11px] truncate">{event.customer_name}</span>
        ) : null}
      </div>
      <p className="text-studio-white text-[13px] m-0 mt-1 leading-snug">{event.title}</p>
      {event.details && event.details !== event.title ? (
        <p className="text-studio-w3 text-[11px] m-0 mt-0.5 leading-snug">{event.details}</p>
      ) : null}
    </div>
    <span className="text-studio-w3 text-[11px] tabular-nums shrink-0 pt-0.5">
      {fmtActivityWhen(event.ts)}
    </span>
  </button>
)

const ActivityFeed = ({
  customerId = null,
  showCustomer = true,
  defaultRange = 'd30',
}) => {
  const navigate = useNavigate()
  const [category, setCategory] = useState('all')
  const [range, setRange] = useState(defaultRange)
  const [from, setFrom] = useState(() => rangeToDates(defaultRange).from)
  const [to, setTo] = useState(() => rangeToDates(defaultRange).to)
  const [page, setPage] = useState(1)
  const [events, setEvents] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 50,
        category: category === 'all' ? undefined : category,
        customer_id: customerId || undefined,
      }
      if (from) params.from = from
      if (to) params.to = to
      const res = await listStudioActivity(params)
      setEvents(res.data?.data?.events ?? [])
      setPagination(res.data?.data?.pagination ?? null)
    } catch {
      toast.error(copy.loadError)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [category, customerId, from, to, page])

  useEffect(() => {
    load()
  }, [load])

  const selectRange = (key) => {
    setRange(key)
    setPage(1)
    if (key === 'custom') return
    const next = rangeToDates(key)
    setFrom(next.from)
    setTo(next.to)
  }

  const openEvent = (event) => {
    if (event.case_id) {
      navigate(`/studio/cases/${event.case_id}`)
      return
    }
    if (event.customer_id) {
      navigate(`/studio/customers/${event.customer_id}`)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORY_KEYS.map((key) => (
            <Pill
              key={key}
              active={category === key}
              onClick={() => {
                setCategory(key)
                setPage(1)
              }}
            >
              {copy.categories[key]}
            </Pill>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          {RANGE_KEYS.map((key) => (
            <Pill
              key={key}
              tone="blue"
              active={range === key}
              onClick={() => selectRange(key)}
            >
              {copy.ranges[key]}
            </Pill>
          ))}
        </div>
        {range === 'custom' ? (
          <div className="flex flex-wrap gap-3 items-end">
            <label className="flex flex-col gap-1">
              <span className="text-studio-w3 text-[10px] font-semibold uppercase tracking-wider">{copy.from}</span>
              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value)
                  setPage(1)
                }}
                className="px-3 py-1.5 rounded-[8px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[12px] outline-none focus:border-studio-gold"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-studio-w3 text-[10px] font-semibold uppercase tracking-wider">{copy.to}</span>
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value)
                  setPage(1)
                }}
                className="px-3 py-1.5 rounded-[8px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[12px] outline-none focus:border-studio-gold"
              />
            </label>
          </div>
        ) : null}
      </div>

      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="md" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState icon={ScrollText} title={copy.empty} description={copy.emptyHint} />
        ) : (
          <div>
            {events.map((event) => (
              <ActivityRow
                key={event.source_key || event.id}
                event={event}
                showCustomer={showCustomer}
                onOpen={() => openEvent(event)}
              />
            ))}
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  )
}

export default ActivityFeed
