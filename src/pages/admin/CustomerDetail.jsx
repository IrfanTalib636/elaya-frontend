import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  FolderOpen,
  MessageSquare,
  Coins,
  Pencil,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getCustomer, updateCustomer } from '../../api/customers'
import { listAppointments } from '../../api/appointments'
import { getCustomerElaycoins } from '../../api/elaycoins'
import { getApiErrorMessage } from '../../lib/apiError'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Spinner,
} from '../../components/ui'
import CustomerAvatar from '../../components/CustomerAvatar'
import useContent from '../../i18n/useContent'
import { PIPELINE_VALUES } from '../../constants/pipeline'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../constants/roles'

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

/**
 * Super Admin customer profile — Vollzugriff support surface (prototype parity).
 * Admins stay as Elaya Admin; edits are allowed on admin-permitted fields.
 */
const AdminCustomerDetail = () => {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const { adminPages, t } = useContent()
  const copy = adminPages.customerDetail || {}
  const role = useAuthStore((s) => s.user?.role)
  const canEdit = role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN

  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState(null)
  const [cases, setCases] = useState([])
  const [appointments, setAppointments] = useState([])
  const [coins, setCoins] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    pipeline_stufe: '',
    akquise_quelle: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [custRes, apptRes] = await Promise.all([
        getCustomer(customerId),
        listAppointments({ customer_id: customerId, limit: 20 }),
      ])
      const c = custRes.data?.data?.customer || null
      setCustomer(c)
      setCases(c?.cases || [])
      setAppointments(apptRes.data?.data?.appointments || [])
      setForm({
        vorname: c?.vorname || '',
        nachname: c?.nachname || '',
        email: c?.email || '',
        telefon: c?.telefon || '',
        pipeline_stufe: c?.pipeline_stufe || '',
        akquise_quelle: c?.akquise_quelle || '',
      })
      setCoins({ balance: c?.elaycoins_balance ?? c?.elaycoins?.balance ?? null })
      try {
        const coinRes = await getCustomerElaycoins(customerId)
        setCoins(coinRes.data?.data || { balance: c?.elaycoins_balance })
      } catch {
        /* keep balance from customer */
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.loadError || 'Could not load customer'))
      navigate('/admin/customers', { replace: true })
    } finally {
      setLoading(false)
    }
  }, [customerId, navigate, copy.loadError])

  useEffect(() => {
    void load()
  }, [load])

  const save = async () => {
    if (!canEdit) return
    setSaving(true)
    try {
      await updateCustomer(customerId, {
        vorname: form.vorname,
        nachname: form.nachname,
        email: form.email || undefined,
        telefon: form.telefon || undefined,
        pipeline_stufe: form.pipeline_stufe || undefined,
        akquise_quelle: form.akquise_quelle || undefined,
      })
      toast.success(copy.saved || 'Customer updated')
      setEditOpen(false)
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.saveError || 'Could not save'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!customer) return null

  const name =
    `${customer.vorname || ''} ${customer.nachname || ''}`.trim() ||
    customer.email ||
    'Customer'
  const studioId =
    customer.aktuelle_firma_id ||
    customer.studio_id ||
    customer.firma_id ||
    null
  const studioName = customer.aktuelle_firma_name || customer.studio_name || '—'

  return (
    <div className="max-w-[1100px]">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-[12px] text-studio-w2 hover:text-studio-white bg-transparent border-0 cursor-pointer mb-3 p-0"
      >
        <ArrowLeft size={14} />
        {copy.back || 'Back'}
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <CustomerAvatar vorname={customer.vorname} nachname={customer.nachname} size="lg" />
          <PageHeader
            title={name}
            subtitle={copy.subtitle || 'Elaya Admin support access — actions are audited where applicable.'}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit ? (
            <Button type="button" variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil size={14} />
              {copy.edit || 'Edit'}
            </Button>
          ) : null}
          {studioId ? (
            <Link
              to={`/admin/studios/${encodeURIComponent(studioId)}/workspace`}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-elaya-border bg-studio-bg-4 px-3 py-2 text-[12px] font-semibold text-studio-white no-underline hover:border-studio-gold/40"
            >
              <Building2 size={14} />
              {copy.openStudio || 'Studio workspace'}
            </Link>
          ) : null}
          {studioId ? (
            <Link
              to={`/admin/studio-chat?studioId=${encodeURIComponent(studioId)}`}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-elaya-border bg-studio-bg-4 px-3 py-2 text-[12px] font-semibold text-studio-white no-underline hover:border-studio-gold/40"
            >
              <MessageSquare size={14} />
              {copy.openChat || 'Studio chat'}
            </Link>
          ) : null}
          <Link
            to={`/admin/elaycoins?q=${encodeURIComponent(customer.email || name)}`}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-elaya-border bg-studio-bg-4 px-3 py-2 text-[12px] font-semibold text-studio-white no-underline hover:border-studio-gold/40"
          >
            <Coins size={14} />
            {copy.openCoins || 'Elaycoins'}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <Card className="lg:col-span-2">
          <h3 className="m-0 mb-3 text-[13px] font-semibold text-studio-white">
            {copy.profileHeading || 'Profile'}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <p className="m-0 text-[10px] uppercase text-admin-muted">Email</p>
              <p className="m-0 mt-0.5 text-studio-w1">{customer.email || '—'}</p>
            </div>
            <div>
              <p className="m-0 text-[10px] uppercase text-admin-muted">Phone</p>
              <p className="m-0 mt-0.5 text-studio-w1">{customer.telefon || '—'}</p>
            </div>
            <div>
              <p className="m-0 text-[10px] uppercase text-admin-muted">Studio</p>
              <p className="m-0 mt-0.5 text-studio-w1">{studioName}</p>
            </div>
            <div>
              <p className="m-0 text-[10px] uppercase text-admin-muted">Pipeline</p>
              <p className="m-0 mt-0.5">
                {customer.pipeline_stufe ? (
                  <Badge variant="status" value={customer.pipeline_stufe}>
                    {t(`pipeline.${customer.pipeline_stufe}`, {
                      defaultValue: customer.pipeline_stufe,
                    })}
                  </Badge>
                ) : (
                  '—'
                )}
              </p>
            </div>
            <div>
              <p className="m-0 text-[10px] uppercase text-admin-muted">Acquisition</p>
              <p className="m-0 mt-0.5 text-studio-w1">{customer.akquise_quelle || '—'}</p>
            </div>
            <div>
              <p className="m-0 text-[10px] uppercase text-admin-muted">Elaycoins</p>
              <p className="m-0 mt-0.5 text-studio-w1 tabular-nums">
                {coins?.balance ?? coins?.saldo ?? coins?.coins ?? '—'}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="m-0 mb-2 text-[13px] font-semibold text-studio-white">
            {copy.supportHeading || 'Support mode'}
          </h3>
          <p className="m-0 text-[12px] text-studio-w2 leading-relaxed">
            {copy.supportBody ||
              'You remain logged in as Elaya Admin. Use this profile to support the studio and adjust customer data when needed.'}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card padding="none">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-elaya-border">
            <FolderOpen size={14} className="text-studio-gold-2" />
            <h3 className="m-0 text-[13px] font-semibold">{copy.casesHeading || 'Cases'}</h3>
          </div>
          {cases.length === 0 ? (
            <EmptyState title={copy.noCases || 'No cases'} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-admin-muted border-b border-admin-line">
                    <th className="p-3">Case</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Sessions</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c.id || c._id} className="border-b border-admin-line/50">
                      <td className="p-3 font-mono text-[12px] text-studio-gold-2">
                        {c.caseId || c.id}
                      </td>
                      <td className="p-3">{c.type || c.bodyLabel || '—'}</td>
                      <td className="p-3 tabular-nums">
                        {c.sessionsDone ?? 0}
                        {c.sessions ? `/${c.sessions}` : ''}
                      </td>
                      <td className="p-3">
                        <Badge variant="status" value={c.status}>
                          {c.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card padding="none">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-elaya-border">
            <h3 className="m-0 text-[13px] font-semibold">
              {copy.appointmentsHeading || 'Appointments'}
            </h3>
          </div>
          {appointments.length === 0 ? (
            <EmptyState title={copy.noAppointments || 'No appointments'} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-admin-muted border-b border-admin-line">
                    <th className="p-3">Date</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.id || a._id} className="border-b border-admin-line/50">
                      <td className="p-3">{fmtDate(a.date)}</td>
                      <td className="p-3 tabular-nums">{a.time || '—'}</td>
                      <td className="p-3">
                        {a.consultationOnly ? 'beratung' : a.type || '—'}
                      </td>
                      <td className="p-3">
                        <Badge variant="status" value={a.status}>
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={copy.editTitle || 'Edit customer'}
      >
        <div className="flex flex-col gap-3">
          <Input
            label="First name"
            value={form.vorname}
            onChange={(e) => setForm((f) => ({ ...f, vorname: e.target.value }))}
          />
          <Input
            label="Last name"
            value={form.nachname}
            onChange={(e) => setForm((f) => ({ ...f, nachname: e.target.value }))}
          />
          <Input
            label="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Phone"
            value={form.telefon}
            onChange={(e) => setForm((f) => ({ ...f, telefon: e.target.value }))}
          />
          <label className="flex flex-col gap-1 text-[12px] text-studio-w2">
            Pipeline
            <select
              value={form.pipeline_stufe}
              onChange={(e) => setForm((f) => ({ ...f, pipeline_stufe: e.target.value }))}
              className="rounded-[10px] border border-elaya-border bg-studio-bg-4 px-3 py-2 text-[13px] text-studio-white"
            >
              <option value="">—</option>
              {PIPELINE_VALUES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Acquisition source"
            value={form.akquise_quelle}
            onChange={(e) => setForm((f) => ({ ...f, akquise_quelle: e.target.value }))}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="button" loading={saving} onClick={() => void save()}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminCustomerDetail
