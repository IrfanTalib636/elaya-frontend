import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Plus,
  Search,
  Users,
  ClipboardList,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Spinner, Modal, Input, Button } from '../../components/ui'
import {
  getAdminCrmFunnel,
  getAdminCrmOverview,
  listAdminCrmCustomers,
  getAdminCrmCustomer,
  listAdminCrmStudioLeads,
  getAdminCrmStudioLead,
  listAdminCrmTasks,
  createAdminCrmTask,
  updateAdminCrmTask,
  createAdminCrmNote,
  createAdminStudioLead,
  advanceAdminStudioLead,
} from '../../api/adminCrm'
import { getApiErrorMessage } from '../../lib/apiError'
import useContent from '../../i18n/useContent'
import {
  CUSTOMER_FUNNEL_STAGES,
  STUDIO_FUNNEL_STAGES,
  CUSTOMER_DROPOFFS,
  STUDIO_DROPOFFS,
  defaultDueDate,
} from '../../constants/platformCrm'

const TABS = ['customers', 'studios', 'dropoffs', 'tasks', 'leads']
const AKQUISE_OPTIONS = ['website_demo', 'website_direkt', 'aussendienst', 'other']
const PAKET_OPTIONS = ['STARTER', 'PRO', 'NETWORK']
const PAYMENT_OPTIONS = ['STRIPE_KARTE', 'RECHNUNG']

const EMPTY_LEAD = {
  firma: '',
  kontakt_name: '',
  email: '',
  telefon: '',
  ort: '',
  adresse: '',
  akquise_weg: 'aussendienst',
  gewuenschtes_paket: 'STARTER',
  demo_termin_gebucht: false,
  demo_termin_datum: '',
  notiz: '',
}

const fieldClass =
  'w-full rounded-[10px] border border-elaya-border bg-studio-bg-4 text-studio-white text-[13px] px-3 py-2 outline-none focus:border-studio-gold/50'

const fmtDate = (d) => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

const fmtTime = (d) => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

const DetailRow = ({ label, value }) => (
  <div className="flex gap-3 py-2 border-b border-elaya-border last:border-0">
    <div className="min-w-[140px] text-studio-w2 text-[12px]">{label}</div>
    <div className="text-studio-white text-[13px] flex-1 break-words">{value || '—'}</div>
  </div>
)

const FunnelCard = ({ label, value, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-2xl border px-3.5 py-3.5 text-left cursor-pointer transition-colors min-w-[118px] flex-1 ${
      active
        ? 'border-studio-gold bg-studio-gold/10'
        : 'border-elaya-border bg-studio-bg-3 hover:border-studio-gold/40'
    }`}
  >
    <p className="text-[26px] font-bold text-studio-white m-0 leading-none">{value}</p>
    <p className="text-studio-w2 text-[11px] m-0 mt-2 leading-snug">{label}</p>
  </button>
)

const AdminCrm = () => {
  const { adminPages, t } = useContent()
  const copy = adminPages.crm

  const [tab, setTab] = useState('customers')
  const [funnel, setFunnel] = useState(null)
  const [overview, setOverview] = useState(null)
  const [loadingFunnel, setLoadingFunnel] = useState(true)

  const [customerStage, setCustomerStage] = useState('')
  const [customerDropoff, setCustomerDropoff] = useState('')
  const [customerQ, setCustomerQ] = useState('')
  const [customers, setCustomers] = useState([])
  const [customerPag, setCustomerPag] = useState(null)
  const [loadingCustomers, setLoadingCustomers] = useState(false)

  const [studioStage, setStudioStage] = useState('')
  const [studioDropoff, setStudioDropoff] = useState('')
  const [studioQ, setStudioQ] = useState('')
  const [studioLeads, setStudioLeads] = useState([])
  const [studioPag, setStudioPag] = useState(null)
  const [loadingStudios, setLoadingStudios] = useState(false)

  const [tasks, setTasks] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(false)

  const [customerDetail, setCustomerDetail] = useState(null)
  const [studioDetail, setStudioDetail] = useState(null)
  const [detailKind, setDetailKind] = useState(null) // 'customer' | 'studio_lead'
  const [detailLoading, setDetailLoading] = useState(false)

  const [taskForm, setTaskForm] = useState({ titel: '', faellig_am: defaultDueDate() })
  const [noteForm, setNoteForm] = useState({ inhalt: '', typ: 'anruf' })
  const [savingFollowup, setSavingFollowup] = useState(false)

  const [leadOpen, setLeadOpen] = useState(false)
  const [leadForm, setLeadForm] = useState(EMPTY_LEAD)
  const [savingLead, setSavingLead] = useState(false)
  const [detailLead, setDetailLead] = useState(null)
  const [advancing, setAdvancing] = useState(false)
  const [zahlungsweg, setZahlungsweg] = useState('STRIPE_KARTE')

  const loadFunnel = useCallback(async () => {
    setLoadingFunnel(true)
    try {
      const [funnelRes, overviewRes] = await Promise.all([
        getAdminCrmFunnel(),
        getAdminCrmOverview(),
      ])
      setFunnel(funnelRes.data?.data || null)
      setOverview(overviewRes.data?.data || null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.loadError))
    } finally {
      setLoadingFunnel(false)
    }
  }, [copy.loadError])

  const loadCustomers = useCallback(
    async (page = 1) => {
      setLoadingCustomers(true)
      try {
        const res = await listAdminCrmCustomers({
          page,
          limit: 20,
          stage: customerStage || undefined,
          dropoff: customerDropoff || undefined,
          q: customerQ.trim() || undefined,
        })
        setCustomers(res.data?.data?.customers || [])
        setCustomerPag(res.data?.data?.pagination || null)
      } catch (err) {
        toast.error(getApiErrorMessage(err, copy.loadError))
      } finally {
        setLoadingCustomers(false)
      }
    },
    [customerStage, customerDropoff, customerQ, copy.loadError]
  )

  const loadStudios = useCallback(
    async (page = 1) => {
      setLoadingStudios(true)
      try {
        const res = await listAdminCrmStudioLeads({
          page,
          limit: 20,
          stage: studioStage || undefined,
          dropoff: studioDropoff || undefined,
          q: studioQ.trim() || undefined,
        })
        setStudioLeads(res.data?.data?.leads || [])
        setStudioPag(res.data?.data?.pagination || null)
      } catch (err) {
        toast.error(getApiErrorMessage(err, copy.loadError))
      } finally {
        setLoadingStudios(false)
      }
    },
    [studioStage, studioDropoff, studioQ, copy.loadError]
  )

  const loadTasks = useCallback(async () => {
    setLoadingTasks(true)
    try {
      const res = await listAdminCrmTasks({ status: 'open', limit: 50 })
      setTasks(res.data?.data?.tasks || [])
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.loadError))
    } finally {
      setLoadingTasks(false)
    }
  }, [copy.loadError])

  useEffect(() => {
    void loadFunnel()
  }, [loadFunnel])

  useEffect(() => {
    if (tab === 'customers' || tab === 'dropoffs') void loadCustomers()
  }, [tab, loadCustomers])

  useEffect(() => {
    if (tab === 'studios' || tab === 'dropoffs') void loadStudios()
  }, [tab, loadStudios])

  useEffect(() => {
    if (tab === 'tasks') void loadTasks()
  }, [tab, loadTasks])

  const openCustomer = async (id) => {
    setDetailKind('customer')
    setStudioDetail(null)
    setDetailLoading(true)
    setCustomerDetail(null)
    setTaskForm({ titel: '', faellig_am: defaultDueDate() })
    setNoteForm({ inhalt: '', typ: 'anruf' })
    try {
      const res = await getAdminCrmCustomer(id)
      setCustomerDetail(res.data?.data || null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.loadError))
      setDetailKind(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const openStudioLead = async (id) => {
    setDetailKind('studio_lead')
    setCustomerDetail(null)
    setDetailLoading(true)
    setStudioDetail(null)
    setTaskForm({ titel: '', faellig_am: defaultDueDate() })
    setNoteForm({ inhalt: '', typ: 'anruf' })
    try {
      const res = await getAdminCrmStudioLead(id)
      setStudioDetail(res.data?.data || null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.loadError))
      setDetailKind(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const subjectFromDetail = () => {
    if (customerDetail?.customer) {
      return {
        subject_type: 'customer',
        subject_id: customerDetail.customer.id,
      }
    }
    if (studioDetail?.lead) {
      return {
        subject_type: 'studio_lead',
        subject_id: studioDetail.lead.id,
      }
    }
    return null
  }

  const submitTask = async (e) => {
    e?.preventDefault()
    const subject = subjectFromDetail()
    if (!subject || !taskForm.titel.trim()) return
    setSavingFollowup(true)
    try {
      await createAdminCrmTask({
        ...subject,
        titel: taskForm.titel.trim(),
        faellig_am: taskForm.faellig_am,
        typ: 'followup',
      })
      toast.success(copy.taskCreated)
      setTaskForm({ titel: '', faellig_am: defaultDueDate() })
      if (subject.subject_type === 'customer') await openCustomer(subject.subject_id)
      else await openStudioLead(subject.subject_id)
      void loadFunnel()
      if (tab === 'tasks') void loadTasks()
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.loadError))
    } finally {
      setSavingFollowup(false)
    }
  }

  const submitNote = async (e) => {
    e?.preventDefault()
    const subject = subjectFromDetail()
    if (!subject || !noteForm.inhalt.trim()) return
    setSavingFollowup(true)
    try {
      await createAdminCrmNote({
        ...subject,
        inhalt: noteForm.inhalt.trim(),
        typ: noteForm.typ,
      })
      toast.success(copy.noteCreated)
      setNoteForm({ inhalt: '', typ: 'anruf' })
      if (subject.subject_type === 'customer') await openCustomer(subject.subject_id)
      else await openStudioLead(subject.subject_id)
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.loadError))
    } finally {
      setSavingFollowup(false)
    }
  }

  const markTaskDone = async (taskId) => {
    try {
      await updateAdminCrmTask(taskId, { erledigt: true })
      toast.success(copy.taskDone)
      const subject = subjectFromDetail()
      if (subject?.subject_type === 'customer') await openCustomer(subject.subject_id)
      else if (subject?.subject_type === 'studio_lead') await openStudioLead(subject.subject_id)
      void loadTasks()
      void loadFunnel()
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.loadError))
    }
  }

  const statusLabel = (status) => copy.leadStatus?.[status] || status
  const akquiseLabel = (key) => copy.akquise?.[key] || key || '—'

  const submitLead = async (e) => {
    e?.preventDefault()
    if (!leadForm.firma.trim()) {
      toast.error(copy.leadFirmaRequired)
      return
    }
    setSavingLead(true)
    try {
      await createAdminStudioLead({
        ...leadForm,
        demo_termin_datum:
          leadForm.demo_termin_gebucht && leadForm.demo_termin_datum
            ? leadForm.demo_termin_datum
            : null,
      })
      toast.success(copy.leadCreated)
      setLeadOpen(false)
      setLeadForm(EMPTY_LEAD)
      await loadFunnel()
      if (tab === 'studios' || tab === 'leads') void loadStudios()
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.leadCreateError))
    } finally {
      setSavingLead(false)
    }
  }

  const runAdvance = async (leadId, action, extra = {}) => {
    setAdvancing(true)
    try {
      const res = await advanceAdminStudioLead(leadId, { action, ...extra })
      const updated = res.data?.data?.lead
      toast.success(copy.leadActionOk)
      await loadFunnel()
      if (updated) setDetailLead(updated)
      void loadStudios()
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.leadActionError))
    } finally {
      setAdvancing(false)
    }
  }

  const selectCustomerStage = (stage) => {
    setCustomerDropoff('')
    setCustomerStage((prev) => (prev === stage ? '' : stage))
    setTab('customers')
  }

  const selectStudioStage = (stage) => {
    setStudioDropoff('')
    setStudioStage((prev) => (prev === stage ? '' : stage))
    setTab('studios')
  }

  const selectCustomerDropoff = (key) => {
    setCustomerStage('')
    setCustomerDropoff(key)
    setTab('customers')
  }

  const selectStudioDropoff = (key) => {
    setStudioStage('')
    setStudioDropoff(key)
    setTab('studios')
  }

  const customerStages = funnel?.customers?.stages || {}
  const studioStages = funnel?.studios?.stages || {}
  const customerDropoffCounts = funnel?.customers?.dropoffs || {}
  const studioDropoffCounts = funnel?.studios?.dropoffs || {}
  const overviewLeads = overview?.leads || []

  const renderFollowupForms = () => (
    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <form onSubmit={submitTask} className="rounded-[12px] border border-elaya-border p-3 space-y-2">
        <p className="text-studio-white text-[12px] font-semibold m-0">{copy.addTask}</p>
        <Input
          label={copy.taskTitle}
          value={taskForm.titel}
          onChange={(e) => setTaskForm((p) => ({ ...p, titel: e.target.value }))}
          required
        />
        <Input
          label={copy.taskDue}
          type="date"
          value={taskForm.faellig_am}
          onChange={(e) => setTaskForm((p) => ({ ...p, faellig_am: e.target.value }))}
          required
        />
        <Button type="submit" loading={savingFollowup} className="w-full">
          {copy.saveTask}
        </Button>
      </form>
      <form onSubmit={submitNote} className="rounded-[12px] border border-elaya-border p-3 space-y-2">
        <p className="text-studio-white text-[12px] font-semibold m-0">{copy.addNote}</p>
        <Input
          label={copy.noteBody}
          value={noteForm.inhalt}
          onChange={(e) => setNoteForm((p) => ({ ...p, inhalt: e.target.value }))}
          required
        />
        <Button type="submit" loading={savingFollowup} variant="ghost" className="w-full">
          {copy.saveNote}
        </Button>
      </form>
    </div>
  )

  if (loadingFunnel && !funnel) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  const leadDetail = detailLead
  const st = leadDetail?.status

  return (
    <div className="max-w-[1180px] pb-10">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-[28px] leading-tight font-bold text-studio-white m-0 tracking-tight">
            {copy.title}
          </h1>
          <p className="text-studio-w2 text-[13px] m-0 mt-1">{copy.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setLeadOpen(true)}
            className="inline-flex items-center gap-2 rounded-[12px] border border-elaya-border bg-transparent text-studio-white text-[13px] font-semibold px-4 py-2.5 cursor-pointer hover:border-studio-gold/40"
          >
            <Plus size={15} />
            {copy.captureLead}
          </button>
          <Link
            to="/admin/studios"
            className="inline-flex items-center gap-2 rounded-[12px] bg-studio-gold text-white text-[13px] font-semibold px-4 py-2.5 no-underline hover:bg-studio-gold-2 transition-colors"
          >
            {copy.manageStudios}
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((key) => {
          const active = tab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold border cursor-pointer transition-colors ${
                active
                  ? 'bg-studio-gold border-studio-gold text-white'
                  : 'bg-transparent border-elaya-border text-studio-w1 hover:border-studio-gold/40'
              }`}
            >
              {copy.tabs?.[key] || key}
              {key === 'tasks' && funnel?.open_tasks
                ? ` (${funnel.open_tasks})`
                : ''}
            </button>
          )
        })}
      </div>

      {(tab === 'customers' || tab === 'dropoffs') && (
        <section className="mb-6">
          <h2 className="text-studio-white text-[15px] font-semibold m-0 mb-3">
            {copy.customerFunnelTitle}
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {CUSTOMER_FUNNEL_STAGES.map((stage, i) => (
              <div key={stage} className="flex items-center gap-1.5 flex-1 min-w-[110px]">
                <FunnelCard
                  label={copy.customerStages?.[stage] || stage}
                  value={customerStages[stage] ?? 0}
                  active={customerStage === stage && !customerDropoff}
                  onClick={() => selectCustomerStage(stage)}
                />
                {i < CUSTOMER_FUNNEL_STAGES.length - 1 ? (
                  <ChevronRight size={14} className="text-studio-w3 shrink-0 hidden lg:block" />
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {(tab === 'studios' || tab === 'dropoffs') && (
        <section className="mb-6">
          <h2 className="text-studio-white text-[15px] font-semibold m-0 mb-3">
            {copy.studioFunnelTitle}
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {STUDIO_FUNNEL_STAGES.map((stage) => (
              <FunnelCard
                key={stage}
                label={copy.studioStages?.[stage] || stage}
                value={studioStages[stage] ?? 0}
                active={studioStage === stage && !studioDropoff}
                onClick={() => selectStudioStage(stage)}
              />
            ))}
          </div>
        </section>
      )}

      {tab === 'dropoffs' && (
        <section className="mb-8 space-y-5">
          <p className="text-studio-w2 text-[12px] m-0">
            {t('adminPages.crm.stuckHint', { days: funnel?.stuck_days ?? 7 })}
          </p>
          <div>
            <h3 className="text-studio-white text-[13px] font-semibold m-0 mb-2">
              {copy.dropoffCustomers}
            </h3>
            <div className="flex flex-wrap gap-2">
              {CUSTOMER_DROPOFFS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectCustomerDropoff(key)}
                  className={`rounded-[10px] border px-3 py-2 text-[12px] cursor-pointer ${
                    customerDropoff === key
                      ? 'border-studio-amber bg-studio-amber/10 text-studio-amber'
                      : 'border-elaya-border bg-studio-bg-3 text-studio-w1'
                  }`}
                >
                  {copy.customerDropoffs?.[key] || key}
                  <span className="ml-2 font-bold">{customerDropoffCounts[key] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-studio-white text-[13px] font-semibold m-0 mb-2">
              {copy.dropoffStudios}
            </h3>
            <div className="flex flex-wrap gap-2">
              {STUDIO_DROPOFFS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectStudioDropoff(key)}
                  className={`rounded-[10px] border px-3 py-2 text-[12px] cursor-pointer ${
                    studioDropoff === key
                      ? 'border-studio-amber bg-studio-amber/10 text-studio-amber'
                      : 'border-elaya-border bg-studio-bg-3 text-studio-w1'
                  }`}
                >
                  {copy.studioDropoffs?.[key] || key}
                  <span className="ml-2 font-bold">{studioDropoffCounts[key] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {(tab === 'customers' || (tab === 'dropoffs' && customerDropoff)) && (
        <section className="mb-8">
          <div className="flex flex-wrap gap-2 mb-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-w3"
              />
              <input
                className={`${fieldClass} pl-9`}
                placeholder={copy.searchPlaceholder}
                value={customerQ}
                onChange={(e) => setCustomerQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void loadCustomers(1)
                }}
              />
            </div>
            <Button type="button" variant="ghost" onClick={() => loadCustomers(1)}>
              {copy.tabs?.customers}
            </Button>
            {(customerStage || customerDropoff) && (
              <button
                type="button"
                className="text-[12px] text-studio-gold border-0 bg-transparent cursor-pointer"
                onClick={() => {
                  setCustomerStage('')
                  setCustomerDropoff('')
                }}
              >
                {copy.clearFilter}
              </button>
            )}
          </div>
          <div className="rounded-2xl border border-elaya-border bg-studio-bg-3 overflow-hidden min-h-[120px]">
            {loadingCustomers ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : customers.length === 0 ? (
              <p className="text-studio-w2 text-[13px] m-0 py-10 text-center">{copy.emptyList}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-elaya-border">
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase text-studio-w3">
                        {copy.colName}
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase text-studio-w3">
                        {copy.colEmail}
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase text-studio-w3">
                        {copy.colStage}
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase text-studio-w3">
                        {copy.colDays}
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase text-studio-w3">
                        {copy.colAction}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-elaya-border last:border-0 cursor-pointer hover:bg-studio-bg-4/50"
                        onClick={() => openCustomer(c.id)}
                      >
                        <td className="px-4 py-3 text-[13px] text-studio-white font-medium">
                          <span className="inline-flex items-center gap-2">
                            <Users size={14} className="text-studio-gold-2" />
                            {c.vorname} {c.nachname}
                          </span>
                          <p className="text-studio-w3 text-[11px] m-0 mt-0.5">
                            {c.studio_name || '—'} ·{' '}
                            {t('adminPages.crm.casesCount', { count: c.cases_count ?? 0 })}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-studio-w1">{c.email}</td>
                        <td className="px-4 py-3 text-[12px] text-studio-gold-2 font-semibold">
                          {copy.customerStages?.[c.funnel_stage] || c.funnel_stage || '—'}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-studio-w2">
                          {t('adminPages.crm.daysInStage', { count: c.days_in_stage ?? 0 })}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-studio-teal-2 max-w-[200px] truncate">
                          {c.recommended_action || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {customerPag?.totalPages > 1 ? (
            <div className="flex justify-end gap-2 mt-3">
              <Button
                type="button"
                variant="ghost"
                disabled={!customerPag.hasPrevPage}
                onClick={() => loadCustomers(customerPag.page - 1)}
              >
                ‹
              </Button>
              <span className="text-studio-w2 text-[12px] self-center">
                {customerPag.page}/{customerPag.totalPages}
              </span>
              <Button
                type="button"
                variant="ghost"
                disabled={!customerPag.hasNextPage}
                onClick={() => loadCustomers(customerPag.page + 1)}
              >
                ›
              </Button>
            </div>
          ) : null}
        </section>
      )}

      {(tab === 'studios' || (tab === 'dropoffs' && studioDropoff)) && (
        <section className="mb-8">
          <div className="flex flex-wrap gap-2 mb-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-w3"
              />
              <input
                className={`${fieldClass} pl-9`}
                placeholder={copy.searchStudioPlaceholder}
                value={studioQ}
                onChange={(e) => setStudioQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void loadStudios(1)
                }}
              />
            </div>
            <Button type="button" variant="ghost" onClick={() => loadStudios(1)}>
              {copy.tabs?.studios}
            </Button>
            {(studioStage || studioDropoff) && (
              <button
                type="button"
                className="text-[12px] text-studio-gold border-0 bg-transparent cursor-pointer"
                onClick={() => {
                  setStudioStage('')
                  setStudioDropoff('')
                }}
              >
                {copy.clearFilter}
              </button>
            )}
          </div>
          <div className="rounded-2xl border border-elaya-border bg-studio-bg-3 overflow-hidden min-h-[120px]">
            {loadingStudios ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : studioLeads.length === 0 ? (
              <p className="text-studio-w2 text-[13px] m-0 py-10 text-center">{copy.emptyList}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-elaya-border">
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase text-studio-w3">
                        {copy.colFirma}
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase text-studio-w3">
                        {copy.colContact}
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase text-studio-w3">
                        {copy.colStage}
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase text-studio-w3">
                        {copy.colDays}
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase text-studio-w3">
                        {copy.missingSteps}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {studioLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-elaya-border last:border-0 cursor-pointer hover:bg-studio-bg-4/50"
                        onClick={() => openStudioLead(lead.id)}
                      >
                        <td className="px-4 py-3 text-[13px] text-studio-white font-medium">
                          <span className="inline-flex items-center gap-2">
                            <Building2 size={14} className="text-studio-gold-2" />
                            {lead.firma}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-studio-w1">
                          {lead.kontakt_name || lead.email || '—'}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-studio-gold-2 font-semibold">
                          {copy.studioStages?.[lead.funnel_stage] || lead.funnel_stage || '—'}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-studio-w2">
                          {t('adminPages.crm.daysInStage', { count: lead.days_in_stage ?? 0 })}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-studio-w2">
                          {(lead.missing_steps || []).join(', ') || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'tasks' && (
        <section className="mb-8">
          <h2 className="text-studio-white text-[15px] font-semibold m-0 mb-3 flex items-center gap-2">
            <ClipboardList size={16} className="text-studio-gold-2" />
            {copy.openTasks}
          </h2>
          <div className="rounded-2xl border border-elaya-border bg-studio-bg-3 overflow-hidden">
            {loadingTasks ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-studio-w2 text-[13px] m-0 py-10 text-center">{copy.noTasks}</p>
            ) : (
              <ul className="m-0 p-0 list-none divide-y divide-elaya-border">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-studio-white text-[13px] font-medium m-0">{task.titel}</p>
                      <p className="text-studio-w3 text-[11px] m-0 mt-0.5">
                        {task.customer
                          ? `${task.customer.vorname} ${task.customer.nachname}`
                          : task.studio_lead?.firma || task.subject_type}
                        {' · '}
                        {fmtDate(task.faellig_am)}
                      </p>
                    </div>
                    <Button type="button" variant="ghost" onClick={() => markTaskDone(task.id)}>
                      {copy.markDone}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {tab === 'leads' && (
        <section className="mb-8">
          <h2 className="text-studio-white text-[15px] font-semibold m-0 mb-2">
            {copy.onboardingTitle}
          </h2>
          <p className="text-studio-w2 text-[13px] m-0 mb-4 max-w-[720px] leading-relaxed">
            {copy.onboardingDesc}
          </p>
          <div className="rounded-2xl border border-elaya-border bg-studio-bg-3 min-h-[140px] overflow-hidden">
            {overviewLeads.length === 0 ? (
              <p className="text-studio-w2 text-[13px] m-0 py-12 text-center">{copy.leadsEmpty}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-elaya-border">
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase text-studio-w3">
                        {copy.colFirma}
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase text-studio-w3">
                        {copy.colContact}
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase text-studio-w3">
                        {copy.colStatus}
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase text-studio-w3" />
                    </tr>
                  </thead>
                  <tbody>
                    {overviewLeads.map((lead) => (
                      <tr key={lead.id} className="border-b border-elaya-border last:border-0">
                        <td className="px-4 py-3 text-[13px] text-studio-white font-medium">
                          {lead.firma}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-studio-w1">
                          {lead.kontakt_name || '—'}
                        </td>
                        <td className="px-4 py-3 text-[11px] font-semibold text-studio-gold-2 uppercase">
                          {statusLabel(lead.status)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => {
                              setZahlungsweg('STRIPE_KARTE')
                              setDetailLead(lead)
                            }}
                            className="rounded-[8px] border border-elaya-border bg-transparent text-studio-white text-[12px] font-semibold px-3 py-1.5 cursor-pointer"
                          >
                            {copy.details}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {detailKind === 'customer' && (
        <Modal
          onClose={() => {
            if (savingFollowup) return
            setCustomerDetail(null)
            setDetailKind(null)
          }}
          title={
            customerDetail?.customer
              ? `${customerDetail.customer.vorname} ${customerDetail.customer.nachname}`
              : '…'
          }
          width="max-w-3xl"
        >
          {detailLoading || !customerDetail ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : (
            <>
              <DetailRow
                label={copy.colStage}
                value={
                  copy.customerStages?.[customerDetail.customer.funnel_stage] ||
                  customerDetail.customer.funnel_stage
                }
              />
              <DetailRow label={copy.colEmail} value={customerDetail.customer.email} />
              <DetailRow label={copy.leadPhone} value={customerDetail.customer.telefon} />
              <DetailRow
                label={copy.colFirma}
                value={customerDetail.customer.studio?.firma || customerDetail.customer.studio_name}
              />
              <DetailRow
                label={copy.recommended}
                value={customerDetail.customer.recommended_action}
              />
              <DetailRow
                label={copy.lastActivity}
                value={fmtTime(customerDetail.customer.last_activity_at)}
              />
              <DetailRow
                label={copy.colDays}
                value={t('adminPages.crm.daysInStage', {
                  count: customerDetail.customer.days_in_stage ?? 0,
                })}
              />

              <p className="text-studio-w3 text-[11px] uppercase tracking-wide font-semibold m-0 mt-4 mb-1">
                {copy.detailCases}
              </p>
              {(customerDetail.cases || []).length === 0 ? (
                <p className="text-studio-w3 text-[12px] m-0">—</p>
              ) : (
                customerDetail.cases.map((c) => (
                  <DetailRow
                    key={c.id}
                    label={c.caseId || c.id}
                    value={`${c.status} · ${fmtDate(c.createdAt)}`}
                  />
                ))
              )}

              <p className="text-studio-w3 text-[11px] uppercase tracking-wide font-semibold m-0 mt-4 mb-1">
                {copy.detailTasks}
              </p>
              {(customerDetail.tasks || []).filter((x) => !x.erledigt).length === 0 ? (
                <p className="text-studio-w3 text-[12px] m-0">{copy.noTasks}</p>
              ) : (
                customerDetail.tasks
                  .filter((x) => !x.erledigt)
                  .map((task) => (
                    <div key={task.id} className="flex items-center gap-2 py-1.5">
                      <span className="text-studio-white text-[12px] flex-1">{task.titel}</span>
                      <Button type="button" variant="ghost" onClick={() => markTaskDone(task.id)}>
                        {copy.markDone}
                      </Button>
                    </div>
                  ))
              )}

              <p className="text-studio-w3 text-[11px] uppercase tracking-wide font-semibold m-0 mt-4 mb-1">
                {copy.detailNotes}
              </p>
              {(customerDetail.notes || []).length === 0 ? (
                <p className="text-studio-w3 text-[12px] m-0">{copy.noNotes}</p>
              ) : (
                customerDetail.notes.slice(0, 8).map((n) => (
                  <DetailRow key={n.id} label={fmtTime(n.createdAt)} value={n.inhalt} />
                ))
              )}

              {renderFollowupForms()}
            </>
          )}
        </Modal>
      )}

      {detailKind === 'studio_lead' && (
        <Modal
          onClose={() => {
            if (savingFollowup) return
            setStudioDetail(null)
            setDetailKind(null)
          }}
          title={studioDetail?.lead?.firma || copy.leadUntitled}
          width="max-w-3xl"
        >
          {detailLoading || !studioDetail?.lead ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : (
            <>
              <DetailRow
                label={copy.colStage}
                value={
                  copy.studioStages?.[studioDetail.lead.funnel_stage] ||
                  studioDetail.lead.funnel_stage
                }
              />
              <DetailRow label={copy.colStatus} value={statusLabel(studioDetail.lead.status)} />
              <DetailRow label={copy.leadContact} value={studioDetail.lead.kontakt_name} />
              <DetailRow label={copy.leadEmail} value={studioDetail.lead.email} />
              <DetailRow label={copy.leadPhone} value={studioDetail.lead.telefon} />
              <DetailRow
                label={copy.missingSteps}
                value={(studioDetail.lead.missing_steps || []).join(', ') || '—'}
              />
              <DetailRow
                label={copy.recommended}
                value={studioDetail.lead.recommended_action}
              />
              <DetailRow
                label={copy.colDays}
                value={t('adminPages.crm.daysInStage', {
                  count: studioDetail.lead.days_in_stage ?? 0,
                })}
              />

              <p className="text-studio-w3 text-[11px] uppercase tracking-wide font-semibold m-0 mt-4 mb-1">
                {copy.detailTasks}
              </p>
              {(studioDetail.tasks || []).filter((x) => !x.erledigt).length === 0 ? (
                <p className="text-studio-w3 text-[12px] m-0">{copy.noTasks}</p>
              ) : (
                studioDetail.tasks
                  .filter((x) => !x.erledigt)
                  .map((task) => (
                    <div key={task.id} className="flex items-center gap-2 py-1.5">
                      <span className="text-studio-white text-[12px] flex-1">{task.titel}</span>
                      <Button type="button" variant="ghost" onClick={() => markTaskDone(task.id)}>
                        {copy.markDone}
                      </Button>
                    </div>
                  ))
              )}

              <p className="text-studio-w3 text-[11px] uppercase tracking-wide font-semibold m-0 mt-4 mb-1">
                {copy.detailNotes}
              </p>
              {(studioDetail.notes || []).length === 0 ? (
                <p className="text-studio-w3 text-[12px] m-0">{copy.noNotes}</p>
              ) : (
                studioDetail.notes.slice(0, 8).map((n) => (
                  <DetailRow key={n.id} label={fmtTime(n.createdAt)} value={n.inhalt} />
                ))
              )}

              {renderFollowupForms()}
            </>
          )}
        </Modal>
      )}

      {leadOpen ? (
        <Modal
          onClose={() => !savingLead && setLeadOpen(false)}
          title={copy.captureLead}
          width="max-w-2xl"
        >
          <form onSubmit={submitLead} className="flex flex-col gap-3">
            <p className="text-studio-w2 text-[12px] m-0 -mt-1 mb-1">{copy.captureLeadHint}</p>
            <Input
              label={`${copy.leadFirma} *`}
              value={leadForm.firma}
              onChange={(e) => setLeadForm((p) => ({ ...p, firma: e.target.value }))}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={copy.leadContact}
                value={leadForm.kontakt_name}
                onChange={(e) => setLeadForm((p) => ({ ...p, kontakt_name: e.target.value }))}
              />
              <Input
                label={copy.leadEmail}
                type="email"
                value={leadForm.email}
                onChange={(e) => setLeadForm((p) => ({ ...p, email: e.target.value }))}
              />
              <Input
                label={copy.leadPhone}
                value={leadForm.telefon}
                onChange={(e) => setLeadForm((p) => ({ ...p, telefon: e.target.value }))}
              />
              <div>
                <label className="block text-studio-w2 text-[12px] mb-1.5">{copy.leadAkquise}</label>
                <select
                  className={fieldClass}
                  value={leadForm.akquise_weg}
                  onChange={(e) => setLeadForm((p) => ({ ...p, akquise_weg: e.target.value }))}
                >
                  {AKQUISE_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {akquiseLabel(k)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-studio-w2 text-[12px] mb-1.5">{copy.leadPaket}</label>
                <select
                  className={fieldClass}
                  value={leadForm.gewuenschtes_paket}
                  onChange={(e) =>
                    setLeadForm((p) => ({ ...p, gewuenschtes_paket: e.target.value }))
                  }
                >
                  {PAKET_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Input
              label={copy.leadNote}
              value={leadForm.notiz}
              onChange={(e) => setLeadForm((p) => ({ ...p, notiz: e.target.value }))}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setLeadOpen(false)}>
                {copy.cancel}
              </Button>
              <Button type="submit" loading={savingLead}>
                {copy.saveLead}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {leadDetail ? (
        <Modal
          onClose={() => !advancing && setDetailLead(null)}
          title={leadDetail.firma || copy.leadUntitled}
          width="max-w-2xl"
        >
          <div className="mb-3 text-[13px] text-studio-w1">
            {copy.colStatus}:{' '}
            <span className="text-studio-gold-2 font-semibold">
              {statusLabel(leadDetail.status)}
            </span>
          </div>
          <DetailRow label={copy.leadContact} value={leadDetail.kontakt_name} />
          <DetailRow label={copy.leadEmail} value={leadDetail.email} />
          <DetailRow label={copy.leadPhone} value={leadDetail.telefon} />
          <div className="flex flex-col gap-2.5 mt-5">
            {st === 'lead' ? (
              <Button
                type="button"
                loading={advancing}
                onClick={() => runAdvance(leadDetail.id, 'send_contract')}
              >
                {copy.actionSendContract}
              </Button>
            ) : null}
            {st === 'contract_sent' || st === 'contract' ? (
              <Button
                type="button"
                loading={advancing}
                onClick={() => runAdvance(leadDetail.id, 'sign_contract')}
              >
                {copy.actionSignContract}
              </Button>
            ) : null}
            {st === 'contract_signed' ? (
              <>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-studio-w2 text-[12px] mb-1.5">
                      {copy.paymentMethod}
                    </label>
                    <select
                      className={fieldClass}
                      value={zahlungsweg}
                      onChange={(e) => setZahlungsweg(e.target.value)}
                    >
                      {PAYMENT_OPTIONS.map((k) => (
                        <option key={k} value={k}>
                          {copy.payment?.[k] || k}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    loading={advancing}
                    onClick={() =>
                      runAdvance(leadDetail.id, 'set_payment', { zahlungsweg })
                    }
                  >
                    {copy.actionSetPayment}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  loading={advancing}
                  onClick={() => runAdvance(leadDetail.id, 'start_trial')}
                >
                  {copy.actionStartTrial}
                </Button>
              </>
            ) : null}
            {st === 'onboarding' ? (
              <Button
                type="button"
                loading={advancing}
                onClick={() => runAdvance(leadDetail.id, 'activate')}
              >
                {copy.actionActivate}
              </Button>
            ) : null}
            {st === 'active' ? (
              <p className="text-studio-teal text-[13px] m-0 flex items-center gap-2">
                <CheckCircle2 size={16} />
                {copy.activeHint}
              </p>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

export default AdminCrm
