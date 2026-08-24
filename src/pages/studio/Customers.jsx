import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, Users, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { listCustomers, createCustomer } from '../../api/customers'
import { Card, Badge, Button, Spinner, PageHeader, EmptyState, Modal, Pagination } from '../../components/ui'
import CustomerForm from '../../components/forms/CustomerForm'
import CustomerAvatar from '../../components/CustomerAvatar'
import { PAGE_SIZE } from '../../constants/pagination'
import { PIPELINE_VALUES } from '../../constants/pipeline'
import useContent from '../../i18n/useContent'

const StudioCustomers = () => {
  const navigate = useNavigate()
  const { t, studioPages } = useContent()
  const copy = studioPages.customers

  const [customers, setCustomers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pipelineFilter, setPipelineFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)

  const pipelineStages = [
    { value: '', label: copy.filterAll },
    ...PIPELINE_VALUES.map((value) => ({ value, label: t(`pipeline.${value}`) })),
  ]

  const tableHeaders = [
    copy.headers.name,
    copy.headers.email,
    copy.headers.phone,
    copy.headers.pipeline,
    copy.headers.source,
    copy.headers.cases,
    '',
  ]

  const load = useCallback(async (q, stage, pageNum) => {
    setLoading(true)
    try {
      const params = { limit: PAGE_SIZE, page: pageNum }
      if (q?.trim()) params.search = q.trim()
      if (stage)     params.pipeline_stufe = stage
      const res = await listCustomers(params)
      setCustomers(res.data.data.customers)
      setPagination(res.data.data.pagination)
    } catch {
      toast.error(copy.loadError)
    } finally {
      setLoading(false)
    }
  }, [copy.loadError])

  useEffect(() => {
    const tmr = setTimeout(() => load(search, pipelineFilter, page), search ? 350 : 0)
    return () => clearTimeout(tmr)
  }, [search, pipelineFilter, page, load])

  useEffect(() => {
    setPage(1)
  }, [search, pipelineFilter])

  const handleCreate = async (form) => {
    setCreating(true)
    try {
      await createCustomer(form)
      toast.success(copy.createSuccess)
      setShowModal(false)
      load(search, pipelineFilter, page)
    } catch (err) {
      toast.error(err.response?.data?.message ?? copy.createError)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader
        title={copy.title}
        subtitle={pagination ? t('studioPages.customers.subtitle', { count: pagination.total }) : ''}
      >
        <Button size="sm" onClick={() => setShowModal(true)}>
          <UserPlus size={14} />
          {copy.newCustomer}
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-w3 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className="w-full pl-8 pr-4 py-[9px] rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[13px] outline-none focus:border-studio-gold transition-colors placeholder:text-studio-w3"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {pipelineStages.map((s) => (
            <button
              key={s.value || 'all'}
              type="button"
              onClick={() => setPipelineFilter(s.value)}
              className={`px-3 py-[7px] rounded-[8px] text-[11px] font-semibold transition-colors border cursor-pointer whitespace-nowrap
                ${pipelineFilter === s.value
                  ? 'bg-studio-gold/15 text-studio-gold-2 border-studio-gold/30'
                  : 'bg-transparent text-studio-w2 border-elaya-border hover:text-studio-white hover:border-elaya-border-strong'
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="md" />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title={copy.emptyTitle}
            description={search ? copy.emptySearch : copy.emptyHint}
          >
            {!search && (
              <Button size="sm" onClick={() => setShowModal(true)} className="mt-2">
                <UserPlus size={13} />
                {copy.newCustomer}
              </Button>
            )}
          </EmptyState>
        ) : (
          <>
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
                  {customers.map((c) => (
                    <tr
                      key={c._id}
                      className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4 cursor-pointer transition-colors"
                      onClick={() => navigate(`/studio/customers/${c._id}`)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <CustomerAvatar vorname={c.vorname} nachname={c.nachname} />
                          <span className="text-studio-white text-[13px] font-medium">
                            {c.vorname} {c.nachname}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-studio-w1 text-[12px]">{c.email}</td>
                      <td className="px-5 py-3 text-studio-w1 text-[12px]">{c.telefon}</td>
                      <td className="px-5 py-3">
                        <Badge variant="pipeline" value={c.pipeline_stufe}>
                          {c.pipeline_stufe ? t(`pipeline.${c.pipeline_stufe}`) : c.pipeline_stufe}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="source" value={c.akquise_quelle}>
                          {copy.sources[c.akquise_quelle] ?? c.akquise_quelle}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-studio-w2 text-[12px]">
                        {t('studioPages.customers.openCases', { count: c.offene_faelle ?? 0 })}
                      </td>
                      <td className="px-5 py-3 text-studio-w3">
                        <ChevronRight size={14} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </Card>

      {showModal && (
        <Modal title={copy.modalTitle} onClose={() => setShowModal(false)} width="max-w-xl">
          <CustomerForm
            onSubmit={handleCreate}
            loading={creating}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}

export default StudioCustomers
