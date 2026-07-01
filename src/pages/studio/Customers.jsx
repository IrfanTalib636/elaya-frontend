import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, Users, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { listCustomers, createCustomer } from '../../api/customers'
import { Card, Badge, Button, Spinner, PageHeader, EmptyState, Modal } from '../../components/ui'
import CustomerForm from '../../components/forms/CustomerForm'

const PIPELINE_STAGES = [
  { value: '',                  label: 'Alle'                 },
  { value: 'Neu',               label: 'Neu'                  },
  { value: 'Beratung geplant',  label: 'Beratung geplant'     },
  { value: 'Behandlung aktiv',  label: 'Behandlung aktiv'     },
  { value: 'Beratung erledigt', label: 'Beratung erledigt'    },
]

const SOURCE_LABELS = {
  studio_eigen:         'Studio',
  plattform_vermittelt: 'Plattform',
  studio_wechsel:       'Wechsel',
}

const TABLE_HEADERS = ['Name', 'E-Mail', 'Telefon', 'Pipeline', 'Quelle', 'Fälle', '']

const Avatar = ({ vorname, nachname }) => (
  <div className="w-7 h-7 rounded-full bg-studio-gold/15 flex items-center justify-center text-studio-gold-2 text-[11px] font-bold shrink-0">
    {vorname?.[0]}{nachname?.[0]}
  </div>
)

const StudioCustomers = () => {
  const navigate = useNavigate()

  const [customers, setCustomers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pipelineFilter, setPipelineFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async (q, stage) => {
    setLoading(true)
    try {
      const params = { limit: 50 }
      if (q?.trim()) params.search = q.trim()
      if (stage)     params.pipeline_stufe = stage
      const res = await listCustomers(params)
      setCustomers(res.data.data.customers)
      setPagination(res.data.data.pagination)
    } catch {
      toast.error('Kunden konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => load(search, pipelineFilter), search ? 350 : 0)
    return () => clearTimeout(t)
  }, [search, pipelineFilter, load])

  const handleCreate = async (form) => {
    setCreating(true)
    try {
      await createCustomer(form)
      toast.success('Kunden erfolgreich angelegt.')
      setShowModal(false)
      load(search, pipelineFilter)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Fehler beim Anlegen.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader
        title="Kunden"
        subtitle={pagination ? `${pagination.total} Kunden` : ''}
      >
        <Button size="sm" onClick={() => setShowModal(true)}>
          <UserPlus size={14} />
          Neuer Kunde
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-w3 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, E-Mail oder Telefon…"
            className="w-full pl-8 pr-4 py-[9px] rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[13px] outline-none focus:border-studio-gold transition-colors placeholder:text-studio-w3"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {PIPELINE_STAGES.map((s) => (
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

      {/* Table */}
      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="md" />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Keine Kunden gefunden"
            description={search ? 'Versuche eine andere Suche.' : 'Lege den ersten Kunden an.'}
          >
            {!search && (
              <Button size="sm" onClick={() => setShowModal(true)} className="mt-2">
                <UserPlus size={13} />
                Neuer Kunde
              </Button>
            )}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-elaya-border">
                  {TABLE_HEADERS.map((h, i) => (
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
                        <Avatar vorname={c.vorname} nachname={c.nachname} />
                        <span className="text-studio-white text-[13px] font-medium">
                          {c.vorname} {c.nachname}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-studio-w1 text-[12px]">{c.email}</td>
                    <td className="px-5 py-3 text-studio-w1 text-[12px]">{c.telefon}</td>
                    <td className="px-5 py-3">
                      <Badge variant="pipeline" value={c.pipeline_stufe}>{c.pipeline_stufe}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="source" value={c.akquise_quelle}>
                        {SOURCE_LABELS[c.akquise_quelle] ?? c.akquise_quelle}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-studio-w2 text-[12px]">
                      {c.offene_faelle ?? 0} offen
                    </td>
                    <td className="px-5 py-3 text-studio-w3">
                      <ChevronRight size={14} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showModal && (
        <Modal title="Neuen Kunden anlegen" onClose={() => setShowModal(false)} width="max-w-xl">
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
