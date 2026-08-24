import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, List, CheckSquare, Search, ChevronRight, MessageSquare, StickyNote, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCrmPipeline, getCrmTasks, getCrmTemplate } from '../../api/crm'
import { Card, Badge, Spinner, PageHeader, EmptyState, Pagination } from '../../components/ui'
import { PAGE_SIZE, CRM_KANBAN_COLUMN_LIMIT } from '../../constants/pagination'
import CustomerAvatar from '../../components/CustomerAvatar'
import CrmTasksTab from '../../components/crm/CrmTasksTab'
import CrmTaskModal from '../../components/crm/CrmTaskModal'
import CrmNoteModal from '../../components/crm/CrmNoteModal'
import MedicalAmpelDot from '../../components/medical/MedicalAmpelDot'
import { PIPELINE_STAGES } from '../../constants/pipeline'
import { getStageAktionKey, fmtCrmDate, startOfDay } from '../../constants/crm'
import useContent from '../../i18n/useContent'

const STAGE_HEADER_CLASS = {
  'Neu':               'border-studio-w3/30',
  'Beratung geplant':  'border-studio-gold/40',
  'Behandlung aktiv':  'border-elaya-success/40',
  'Beratung erledigt': 'border-studio-w3/20',
}

const QuickActions = ({ customer, onNote, onTask, onCopyTemplate, labels }) => (
  <div className="flex gap-1 mt-2 pt-2 border-t border-elaya-border/60">
    <button
      type="button"
      title={labels.copyMessage}
      onClick={(e) => { e.stopPropagation(); onCopyTemplate(customer) }}
      className="flex-1 py-1 rounded-md border border-elaya-border bg-transparent text-studio-teal-2 text-[10px] cursor-pointer hover:bg-studio-bg-4"
    >
      <MessageSquare size={11} className="inline mr-0.5" />
      {labels.template}
    </button>
    <button
      type="button"
      title={labels.note}
      onClick={(e) => { e.stopPropagation(); onNote(customer) }}
      className="py-1 px-2 rounded-md border border-elaya-border bg-transparent text-studio-w2 text-[10px] cursor-pointer hover:bg-studio-bg-4"
    >
      <StickyNote size={11} />
    </button>
    <button
      type="button"
      title={labels.task}
      onClick={(e) => { e.stopPropagation(); onTask(customer) }}
      className="py-1 px-2 rounded-md border-0 bg-studio-gold/15 text-studio-gold text-[10px] cursor-pointer hover:bg-studio-gold/25"
    >
      <CheckSquare size={11} />
    </button>
  </div>
)

const CrmCard = ({ customer, onClick, onNote, onTask, onCopyTemplate }) => {
  const { t, studioPages } = useContent()
  const copy = studioPages.crm
  const aktionKey = getStageAktionKey(customer.pipeline_stufe, customer.faelle_gesamt ?? customer.offene_faelle)
  const aktion = customer.aktion || (aktionKey ? t(`crm.stageActions.${aktionKey}`) : '')

  return (
    <div className="rounded-[10px] border border-elaya-border bg-studio-bg-3 hover:border-elaya-border-strong transition-colors">
      <button type="button" onClick={onClick} className="w-full text-left p-3 border-0 bg-transparent cursor-pointer">
        <div className="flex items-start gap-2.5">
          <CustomerAvatar vorname={customer.vorname} nachname={customer.nachname} />
          <div className="min-w-0 flex-1">
            <p className="text-studio-white text-[13px] font-semibold m-0 truncate" translate="no">
              {customer.vorname} {customer.nachname}
              {' '}
              <MedicalAmpelDot
                level={customer.worst_medical_flag_level}
                pending={!customer.worst_medical_flag_level && (customer.pending_anamnesis_count ?? 0) > 0}
                count={customer.open_medical_flags_count}
                size="sm"
                labelMode="inline"
              />
            </p>
            <p className="text-studio-w3 text-[11px] m-0 mt-0.5 truncate">{customer.email}</p>
            {aktion && (
              <p className="text-studio-teal-2 text-[10px] m-0 mt-1 truncate">{aktion}</p>
            )}
            <p className="text-studio-w4 text-[10px] m-0 mt-1">
              {customer.stufe_seit_tage === 0
                ? copy.todayInStage
                : t('studioPages.crm.daysInStage', { count: customer.stufe_seit_tage })}
              {customer.offene_faelle > 0 && ` · ${t('studioPages.crm.openCases', { count: customer.offene_faelle })}`}
            </p>
            {customer.naechste_aufgabe && (
              <p className="text-[10px] m-0 mt-1 truncate text-studio-w3">
                📋 {customer.naechste_aufgabe.titel}
              </p>
            )}
          </div>
          <ChevronRight size={14} className="text-studio-w3 shrink-0 mt-0.5" />
        </div>
      </button>
      <div className="px-3 pb-3">
        <QuickActions customer={customer} onNote={onNote} onTask={onTask} onCopyTemplate={onCopyTemplate} labels={copy} />
      </div>
    </div>
  )
}

const ListRow = ({ customer, onClick, onNote, onTask, onCopyTemplate }) => {
  const { studioPages } = useContent()
  const copy = studioPages.crm
  const heute = startOfDay()
  const next = customer.naechste_aufgabe
  const overdue = next && startOfDay(new Date(next.faellig_am)) < heute

  return (
    <tr className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4 transition-colors">
      <td className="px-5 py-3 cursor-pointer" onClick={onClick}>
        <div className="flex items-center gap-2.5">
          <CustomerAvatar vorname={customer.vorname} nachname={customer.nachname} />
          <span className="text-studio-white text-[13px] font-medium" translate="no">
            {customer.vorname} {customer.nachname}
          </span>
        </div>
      </td>
      <td className="px-5 py-3 text-studio-w1 text-[12px] cursor-pointer" onClick={onClick}>{customer.email}</td>
      <td className="px-5 py-3 cursor-pointer" onClick={onClick}>
        <MedicalAmpelDot
          level={customer.worst_medical_flag_level}
          pending={!customer.worst_medical_flag_level && (customer.pending_anamnesis_count ?? 0) > 0}
          count={customer.open_medical_flags_count}
          size="sm"
        />
      </td>
      <td className="px-5 py-3 cursor-pointer" onClick={onClick}>
        <Badge variant="pipeline" value={customer.pipeline_stufe}>{customer.pipeline_stufe}</Badge>
      </td>
      <td className="px-5 py-3 text-studio-w2 text-[12px] tabular-nums cursor-pointer" onClick={onClick}>
        {customer.stufe_seit_tage} T.
      </td>
      <td className="px-5 py-3 text-studio-w2 text-[12px] cursor-pointer" onClick={onClick}>
        {customer.letzter_kontakt ? fmtCrmDate(customer.letzter_kontakt) : '—'}
      </td>
      <td className="px-5 py-3 text-[11px] cursor-pointer" onClick={onClick}>
        {next ? (
          <span className={overdue ? 'text-studio-red' : 'text-studio-w2'}>
            {next.titel}
            {overdue && ' ⚠'}
          </span>
        ) : '—'}
      </td>
      <td className="px-5 py-3">
        <div className="flex gap-1 justify-end">
          <button
            type="button"
            title={copy.copyTemplate}
            onClick={() => onCopyTemplate(customer)}
            className="p-1.5 rounded-md border border-elaya-border bg-transparent text-studio-teal-2 cursor-pointer hover:bg-studio-bg-4"
          >
            <Copy size={13} />
          </button>
          <button
            type="button"
            title={copy.note}
            onClick={() => onNote(customer)}
            className="p-1.5 rounded-md border border-elaya-border bg-transparent text-studio-w2 cursor-pointer hover:bg-studio-bg-4"
          >
            <StickyNote size={13} />
          </button>
          <button
            type="button"
            title={copy.task}
            onClick={() => onTask(customer)}
            className="p-1.5 rounded-md border-0 bg-studio-gold/15 text-studio-gold cursor-pointer hover:bg-studio-gold/25"
          >
            <CheckSquare size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

const StudioCrm = () => {
  const { t, language, studioPages } = useContent()
  const copy = studioPages.crm
  const navigate = useNavigate()

  const [view, setView]           = useState('pipeline')
  const [columns, setColumns]     = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [tasks, setTasks]         = useState([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskModalCustomer, setTaskModalCustomer] = useState(null)
  const [noteModal, setNoteModal] = useState(null)
  const [listPage, setListPage] = useState(1)
  const [columnExpanded, setColumnExpanded] = useState({})

  const loadPipeline = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getCrmPipeline()
      setColumns(res.data.data.columns ?? [])
      setTotal(res.data.data.total ?? 0)
    } catch {
      toast.error(copy.pipelineLoadError)
    } finally {
      setLoading(false)
    }
  }, [copy.pipelineLoadError])

  const loadTasks = useCallback(async () => {
    setTasksLoading(true)
    try {
      const res = await getCrmTasks({ status: 'all' })
      setTasks(res.data.data.tasks ?? [])
    } catch {
      toast.error(copy.tasksLoadError)
    } finally {
      setTasksLoading(false)
    }
  }, [copy.tasksLoadError])

  useEffect(() => { loadPipeline() }, [loadPipeline])

  useEffect(() => {
    if (view === 'tasks') loadTasks()
  }, [view, loadTasks])

  const allCustomers = useMemo(
    () => columns.flatMap((col) => col.customers ?? []),
    [columns]
  )

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return allCustomers
    return allCustomers.filter((c) => {
      const name = `${c.vorname} ${c.nachname}`.toLowerCase()
      return (
        name.includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        (c.telefon ?? '').includes(q)
      )
    })
  }, [allCustomers, search])

  useEffect(() => {
    setListPage(1)
  }, [search, view])

  const listPagination = useMemo(() => {
    const total = filteredList.length
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const page = Math.min(listPage, totalPages)
    return {
      page,
      limit: PAGE_SIZE,
      total,
      totalPages,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
    }
  }, [filteredList.length, listPage])

  const pagedList = useMemo(() => {
    const start = (listPagination.page - 1) * PAGE_SIZE
    return filteredList.slice(start, start + PAGE_SIZE)
  }, [filteredList, listPagination.page])

  const filterColumn = (customers) => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) => {
      const name = `${c.vorname} ${c.nachname}`.toLowerCase()
      return name.includes(q) || (c.email ?? '').toLowerCase().includes(q)
    })
  }

  const openCustomer = (id) => navigate(`/studio/customers/${id}`)

  const handleRefresh = () => {
    loadPipeline()
    if (view === 'tasks') loadTasks()
  }

  const copyTemplate = async (customer) => {
    try {
      const res = await getCrmTemplate(customer.id)
      const text = res.data.data.template_text
      if (!text) {
        toast.error(copy.noTemplate)
        return
      }
      await navigator.clipboard.writeText(text)
      toast.success(copy.templateCopied)
    } catch {
      toast.error(copy.templateError)
    }
  }

  const openTaskModal = (customer = null) => {
    setTaskModalCustomer(customer)
    setTaskModalOpen(true)
  }
  const closeTaskModal = () => {
    setTaskModalOpen(false)
    setTaskModalCustomer(null)
  }
  const openNoteModal = (customer) => setNoteModal(customer)

  const tabBtn = (key, label, Icon) => (
    <button
      type="button"
      onClick={() => setView(key)}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors border-0
        ${view === key
          ? 'bg-studio-gold/15 text-studio-gold-2'
          : 'bg-transparent text-studio-w2 hover:text-studio-white'}
        ${key !== 'pipeline' ? 'border-l border-elaya-border' : ''}`}
    >
      <Icon size={13} />
      {label}
    </button>
  )

  return (
    <div className="p-6 max-w-[1400px]">
      <PageHeader
        title={copy.title}
        subtitle={total ? t('studioPages.crm.subtitle', { count: total }) : ''}
      >
        <div className="flex rounded-[10px] border border-elaya-border overflow-hidden">
          {tabBtn('pipeline', copy.tabPipeline, LayoutGrid)}
          {tabBtn('list', copy.tabList, List)}
          {tabBtn('tasks', copy.tabTasks, CheckSquare)}
        </div>
      </PageHeader>

      {view !== 'tasks' && (
        <div className="relative max-w-sm mb-5">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-w3 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className="w-full pl-8 pr-4 py-[9px] rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[13px] outline-none focus:border-studio-gold transition-colors placeholder:text-studio-w3"
          />
        </div>
      )}

      {loading && view !== 'tasks' ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : view === 'tasks' ? (
        <CrmTasksTab
          tasks={tasks}
          loading={tasksLoading}
          onRefresh={handleRefresh}
          onNewTask={() => openTaskModal(null)}
        />
      ) : total === 0 ? (
        <EmptyState
          title={copy.emptyTitle}
          description={copy.emptyDesc}
        />
      ) : view === 'pipeline' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {PIPELINE_STAGES.map(({ value }) => {
            const label = t(`pipeline.${value}`)
            const col = columns.find((c) => c.stage === value) ?? { customers: [], total: 0 }
            const cards = filterColumn(col.customers ?? [])
            const expanded = columnExpanded[value]
            const hasMore = cards.length > CRM_KANBAN_COLUMN_LIMIT
            const visibleCards = expanded || !hasMore
              ? cards
              : cards.slice(0, CRM_KANBAN_COLUMN_LIMIT)

            return (
              <div key={value} className="flex flex-col min-h-[200px]">
                <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${STAGE_HEADER_CLASS[value] ?? 'border-elaya-border'}`}>
                  <h2 className="text-[12px] font-semibold text-studio-white m-0">{label}</h2>
                  <span className="text-studio-w3 text-[11px] font-mono tabular-nums">{cards.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {cards.length === 0 ? (
                    <p className="text-studio-w4 text-[11px] m-0 py-4 text-center">{copy.noCustomers}</p>
                  ) : (
                    <>
                      {visibleCards.map((c) => (
                        <CrmCard
                          key={c.id}
                          customer={c}
                          onClick={() => openCustomer(c.id)}
                          onNote={openNoteModal}
                          onTask={openTaskModal}
                          onCopyTemplate={copyTemplate}
                        />
                      ))}
                      {hasMore && !expanded && (
                        <button
                          type="button"
                          onClick={() => setColumnExpanded((prev) => ({ ...prev, [value]: true }))}
                          className="py-2 text-[11px] font-semibold text-studio-gold-2 bg-transparent border border-elaya-border rounded-[8px] cursor-pointer hover:bg-studio-bg-4"
                        >
                          {t('studioPages.crm.showMore', { count: cards.length - CRM_KANBAN_COLUMN_LIMIT })}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card padding="none">
          {filteredList.length === 0 ? (
            <div className="py-12 text-center text-studio-w2 text-[13px]">{copy.noHits}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-elaya-border">
                    {[copy.headers.name, copy.headers.email, copy.headers.ampel, copy.headers.stage, copy.headers.inStage, copy.headers.lastContact, copy.headers.nextTask, ''].map((h) => (
                      <th
                        key={h || 'actions'}
                        className="px-5 py-3 text-left text-[10px] font-semibold text-studio-w3 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedList.map((c) => (
                    <ListRow
                      key={c.id}
                      customer={c}
                      onClick={() => openCustomer(c.id)}
                      onNote={openNoteModal}
                      onTask={openTaskModal}
                      onCopyTemplate={copyTemplate}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination pagination={listPagination} onPageChange={setListPage} />
        </Card>
      )}

      {taskModalOpen && (
        <CrmTaskModal
          customer={taskModalCustomer}
          customers={allCustomers}
          onClose={closeTaskModal}
          onSaved={handleRefresh}
        />
      )}

      {noteModal && (
        <CrmNoteModal
          customer={noteModal}
          onClose={() => setNoteModal(null)}
          onSaved={handleRefresh}
        />
      )}
    </div>
  )
}

export default StudioCrm
