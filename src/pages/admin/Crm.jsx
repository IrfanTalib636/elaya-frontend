import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Smartphone,
  ClipboardList,
  CalendarDays,
  Syringe,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  LayoutDashboard,
  Building2,
  Users,
  FolderOpen,
  Plus,
  ArrowRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Spinner, Modal, Input, Button } from '../../components/ui'
import {
  getAdminCrmOverview,
  createAdminStudioLead,
  advanceAdminStudioLead,
} from '../../api/adminCrm'
import { getApiErrorMessage } from '../../lib/apiError'
import useContent from '../../i18n/useContent'

const PIPELINE_META = [
  { key: 'app_downloaded', Icon: Smartphone },
  { key: 'case_created', Icon: ClipboardList },
  { key: 'appointment_booked', Icon: CalendarDays },
  { key: 'first_session', Icon: Syringe },
  { key: 'active_treatment', Icon: CheckCircle2 },
]

const ACTIVITY_FILTERS = ['all', 'customers', 'studios', 'cases']

const AKQUISE_OPTIONS = ['website_demo', 'website_direkt', 'aussendienst', 'other']
const PAKET_OPTIONS = ['STARTER', 'PRO', 'NETWORK']
const PAYMENT_OPTIONS = ['STRIPE_KARTE', 'RECHNUNG']

const fmtTime = (d) => {
  if (!d) return ''
  try {
    return new Date(d).toLocaleString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

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

const StatCard = ({ label, value }) => (
  <div className="rounded-2xl border border-elaya-border bg-studio-bg-3 px-5 py-4 flex-1 min-w-[140px]">
    <p className="text-[32px] font-bold text-studio-white m-0 leading-none">{value}</p>
    <p className="text-studio-w2 text-[12px] m-0 mt-2">{label}</p>
  </div>
)

const DetailRow = ({ label, value }) => (
  <div className="flex gap-3 py-2 border-b border-elaya-border last:border-0">
    <div className="min-w-[160px] text-studio-w2 text-[12px]">{label}</div>
    <div className="text-studio-white text-[13px] flex-1 break-words">{value || '—'}</div>
  </div>
)

const AdminCrm = () => {
  const { adminPages, t } = useContent()
  const copy = adminPages.crm

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [activityFilter, setActivityFilter] = useState('all')
  const [leadOpen, setLeadOpen] = useState(false)
  const [leadForm, setLeadForm] = useState(EMPTY_LEAD)
  const [savingLead, setSavingLead] = useState(false)
  const [detailLead, setDetailLead] = useState(null)
  const [advancing, setAdvancing] = useState(false)
  const [zahlungsweg, setZahlungsweg] = useState('STRIPE_KARTE')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAdminCrmOverview()
      setData(res.data?.data || null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.loadError))
    } finally {
      setLoading(false)
    }
  }, [copy.loadError])

  useEffect(() => {
    void load()
  }, [load])

  const pipeline = data?.pipeline || {}
  const studios = data?.studios || { active: 0, pending: 0, closed: 0 }
  const leads = data?.leads || []
  const attention = data?.attention || []

  const activity = useMemo(() => {
    const rows = data?.recent_activity || []
    if (activityFilter === 'all') return rows
    return rows.filter((r) => {
      const cat = String(r.category || '').toLowerCase()
      if (activityFilter === 'studios') return cat.includes('studio') || r.title === 'studio_updated'
      if (activityFilter === 'customers') return cat.includes('customer') || cat.includes('kunde')
      if (activityFilter === 'cases') return cat.includes('case') || cat.includes('fall')
      return true
    })
  }, [data, activityFilter])

  const statusLabel = (status) => copy.leadStatus?.[status] || status

  const akquiseLabel = (key) => copy.akquise?.[key] || key || '—'

  const testphaseCell = (lead) => {
    const tp = lead.testphase
    if (!tp?.aktiv) return '—'
    if (tp.abgelaufen && tp.ohneZahlung) {
      return <span className="text-studio-amber">{copy.trialExpired}</span>
    }
    if (tp.abgelaufen) return <span className="text-studio-w3">{copy.trialEnded}</span>
    return t('adminPages.crm.trialDaysLeft', { count: tp.tage })
  }

  const syncDetail = (nextLeads, id) => {
    if (!id) return
    const found = (nextLeads || []).find((l) => l.id === id)
    setDetailLead(found || null)
  }

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
        demo_termin_datum: leadForm.demo_termin_gebucht && leadForm.demo_termin_datum
          ? leadForm.demo_termin_datum
          : null,
      })
      toast.success(copy.leadCreated)
      setLeadOpen(false)
      setLeadForm(EMPTY_LEAD)
      await load()
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
      const resOverview = await getAdminCrmOverview()
      const next = resOverview.data?.data || null
      setData(next)
      if (updated) {
        setDetailLead(updated)
      } else {
        syncDetail(next?.leads, leadId)
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.leadActionError))
    } finally {
      setAdvancing(false)
    }
  }

  const openDetail = (lead) => {
    setZahlungsweg('STRIPE_KARTE')
    setDetailLead(lead)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  const detail = detailLead
  const st = detail?.status

  return (
    <div className="max-w-[1100px] pb-10">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <h1 className="text-[28px] leading-tight font-bold text-studio-white m-0 tracking-tight">
          {copy.title}
        </h1>
        <Link
          to="/admin/studios"
          className="inline-flex items-center gap-2 rounded-[12px] bg-studio-gold text-white text-[13px] font-semibold px-4 py-2.5 no-underline hover:bg-studio-gold-2 transition-colors"
        >
          {copy.manageStudios}
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Customer pipeline */}
      <section className="mb-10">
        <h2 className="text-studio-white text-[15px] font-semibold m-0 mb-4">
          {copy.pipelineTitle}
        </h2>
        <div className="flex flex-wrap items-stretch gap-2">
          {PIPELINE_META.map(({ key, Icon }, index) => (
            <div key={key} className="flex items-center gap-2 flex-1 min-w-[140px]">
              <div className="rounded-2xl border border-elaya-border bg-studio-bg-3 px-4 py-4 flex-1">
                <Icon size={18} className="text-studio-gold-2 mb-3" />
                <p className="text-[28px] font-bold text-studio-white m-0 leading-none">
                  {pipeline[key] ?? 0}
                </p>
                <p className="text-studio-w2 text-[12px] m-0 mt-2 leading-snug">
                  {copy.pipeline?.[key]}
                </p>
              </div>
              {index < PIPELINE_META.length - 1 ? (
                <ChevronRight size={16} className="text-studio-w3 shrink-0 hidden sm:block" />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* Studio registrations */}
      <section className="mb-10">
        <h2 className="text-studio-white text-[15px] font-semibold m-0 mb-4">
          {copy.registrationsTitle}
        </h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <StatCard label={copy.activeStudios} value={studios.active ?? 0} />
          <StatCard label={copy.pendingApprovals} value={studios.pending ?? 0} />
          <StatCard label={copy.closedStudios} value={studios.closed ?? 0} />
        </div>
      </section>

      {/* Studio onboarding */}
      <section className="mb-10">
        <h2 className="text-studio-white text-[15px] font-semibold m-0 mb-2">
          {copy.onboardingTitle}
        </h2>
        <p className="text-studio-w2 text-[13px] m-0 mb-4 max-w-[720px] leading-relaxed">
          {copy.onboardingDesc}
        </p>
        <button
          type="button"
          onClick={() => setLeadOpen(true)}
          className="inline-flex items-center gap-2 rounded-[12px] bg-studio-gold text-white text-[13px] font-semibold px-4 py-2.5 border-0 cursor-pointer hover:bg-studio-gold-2 transition-colors mb-4"
        >
          <Plus size={15} />
          {copy.captureLead}
        </button>

        <div className="rounded-2xl border border-elaya-border bg-studio-bg-3 min-h-[140px] overflow-hidden">
          {leads.length === 0 ? (
            <p className="text-studio-w2 text-[13px] m-0 py-12 text-center">
              {copy.leadsEmpty}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-elaya-border">
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                      {copy.colFirma}
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                      {copy.colContact}
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                      {copy.colAkquise}
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                      {copy.colPaket}
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                      {copy.colStatus}
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                      {copy.colVisible}
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                      {copy.colTrial}
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-studio-w3" />
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const expiredNoPay =
                      lead.testphase?.aktiv &&
                      lead.testphase?.abgelaufen &&
                      lead.testphase?.ohneZahlung &&
                      lead.status !== 'deactivated'
                    return (
                      <tr key={lead.id} className="border-b border-elaya-border last:border-0">
                        <td className="px-4 py-3 text-[13px] text-studio-white font-medium">
                          {lead.firma}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-studio-w1">
                          {lead.kontakt_name || '—'}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-studio-w2">
                          {akquiseLabel(lead.akquise_weg)}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-studio-w2">
                          {lead.gewuenschtes_paket || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-semibold text-studio-gold-2 uppercase tracking-wide">
                            {statusLabel(lead.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px]">
                          {lead.sichtbar_fuer_kunden ? (
                            <span className="text-studio-teal">{copy.visibleYes}</span>
                          ) : (
                            <span className="text-studio-w3">{copy.visibleNo}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-studio-w2">
                          {testphaseCell(lead)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openDetail(lead)}
                            className="rounded-[8px] border border-elaya-border bg-transparent text-studio-white text-[12px] font-semibold px-3 py-1.5 cursor-pointer hover:border-studio-gold/40"
                          >
                            {copy.details}
                          </button>
                          {expiredNoPay ? (
                            <button
                              type="button"
                              disabled={advancing}
                              onClick={() => runAdvance(lead.id, 'deactivate')}
                              className="ml-2 rounded-[8px] border border-studio-amber/50 bg-transparent text-studio-amber text-[12px] font-semibold px-3 py-1.5 cursor-pointer"
                            >
                              {copy.deactivateNow}
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Attention needed */}
      <section className="mb-10">
        <h2 className="text-studio-white text-[15px] font-semibold m-0 mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-studio-amber" />
          {copy.attentionTitle}
        </h2>
        <div className="rounded-2xl border border-elaya-border bg-studio-bg-3 px-5 py-5">
          {attention.length === 0 ? (
            <p className="text-studio-teal text-[13px] m-0 flex items-center gap-2">
              <CheckCircle2 size={16} />
              {copy.attentionOk}
            </p>
          ) : (
            <ul className="m-0 p-0 list-none space-y-2">
              {attention.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2 text-[13px] text-studio-white"
                >
                  <AlertTriangle size={14} className="text-studio-amber shrink-0" />
                  {item.title === 'pending_studios'
                    ? t('adminPages.crm.attentionPendingStudios', { count: item.count })
                    : item.title === 'open_leads'
                      ? t('adminPages.crm.attentionOpenLeads', { count: item.count })
                      : item.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Recent activities */}
      <section>
        <h2 className="text-studio-white text-[15px] font-semibold m-0 mb-4">
          {copy.activityTitle}
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {ACTIVITY_FILTERS.map((key) => {
            const active = activityFilter === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActivityFilter(key)}
                className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold border cursor-pointer transition-colors ${
                  active
                    ? 'bg-studio-gold border-studio-gold text-white'
                    : 'bg-transparent border-elaya-border text-studio-w1 hover:border-studio-gold/40'
                }`}
              >
                {copy.activityFilters?.[key]}
              </button>
            )
          })}
        </div>
        <div className="rounded-2xl border border-elaya-border bg-studio-bg-3 overflow-hidden">
          {activity.length === 0 ? (
            <p className="text-studio-w2 text-[13px] m-0 py-10 text-center">
              {copy.activityEmpty}
            </p>
          ) : (
            <ul className="m-0 p-0 list-none divide-y divide-elaya-border">
              {activity.map((row) => {
                const Icon =
                  String(row.category || '').includes('customer')
                    ? Users
                    : String(row.category || '').includes('case')
                      ? FolderOpen
                      : row.title === 'studio_updated'
                        ? LayoutDashboard
                        : Building2
                const title =
                  row.title === 'studio_updated'
                    ? copy.activityStudioUpdated
                    : row.title
                return (
                  <li key={row.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-studio-bg-4 text-studio-gold-2 border border-elaya-border">
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-studio-white text-[13px] font-medium m-0 truncate">
                        {title}
                      </p>
                      {row.detail ? (
                        <p className="text-studio-w2 text-[12px] m-0 mt-0.5 truncate">
                          {row.detail}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-studio-w3 text-[11px] whitespace-nowrap">
                      {fmtTime(row.ts)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

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
              <Input
                label={copy.leadAddress}
                value={leadForm.adresse}
                onChange={(e) => setLeadForm((p) => ({ ...p, adresse: e.target.value }))}
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
            <label className="flex items-center gap-2 text-[13px] text-studio-w1 cursor-pointer">
              <input
                type="checkbox"
                checked={leadForm.demo_termin_gebucht}
                onChange={(e) =>
                  setLeadForm((p) => ({ ...p, demo_termin_gebucht: e.target.checked }))
                }
              />
              {copy.leadDemoBooked}
            </label>
            {leadForm.demo_termin_gebucht ? (
              <Input
                label={copy.leadDemoDate}
                type="date"
                value={leadForm.demo_termin_datum}
                onChange={(e) =>
                  setLeadForm((p) => ({ ...p, demo_termin_datum: e.target.value }))
                }
              />
            ) : null}
            <Input
              label={copy.leadNote}
              value={leadForm.notiz}
              onChange={(e) => setLeadForm((p) => ({ ...p, notiz: e.target.value }))}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setLeadOpen(false)}
                disabled={savingLead}
              >
                {copy.cancel}
              </Button>
              <Button type="submit" loading={savingLead}>
                {copy.saveLead}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {detail ? (
        <Modal
          onClose={() => !advancing && setDetailLead(null)}
          title={detail.firma || copy.leadUntitled}
          width="max-w-2xl"
        >
          <div className="mb-3 text-[13px] text-studio-w1">
            {copy.colStatus}:{' '}
            <span className="text-studio-gold-2 font-semibold">{statusLabel(detail.status)}</span>
            {' · '}
            {copy.colVisible}:{' '}
            {detail.sichtbar_fuer_kunden ? (
              <span className="text-studio-teal">{copy.visibleYes}</span>
            ) : (
              <span className="text-studio-w3">{copy.visibleNo}</span>
            )}
          </div>

          <DetailRow label={copy.leadContact} value={detail.kontakt_name} />
          <DetailRow label={copy.leadEmail} value={detail.email} />
          <DetailRow label={copy.leadPhone} value={detail.telefon} />
          <DetailRow
            label={copy.leadAddress}
            value={detail.adresse || detail.ort}
          />
          <DetailRow label={copy.leadAkquise} value={akquiseLabel(detail.akquise_weg)} />
          <DetailRow label={copy.leadPaket} value={detail.gewuenschtes_paket} />
          <DetailRow
            label={copy.leadDemoBooked}
            value={
              detail.demo_termin_gebucht
                ? `${copy.visibleYes}${detail.demo_termin_datum ? ` · ${fmtDate(detail.demo_termin_datum)}` : ''}`
                : copy.visibleNo
            }
          />

          <p className="text-studio-w3 text-[11px] uppercase tracking-wide font-semibold m-0 mt-5 mb-1">
            {copy.sectionContract}
          </p>
          <DetailRow label={copy.contractStatus} value={detail.vertrag?.status} />
          <DetailRow label={copy.contractSent} value={fmtDate(detail.vertrag?.versendet_am)} />
          <DetailRow
            label={copy.contractSigned}
            value={fmtDate(detail.vertrag?.unterschrieben_am)}
          />

          <p className="text-studio-w3 text-[11px] uppercase tracking-wide font-semibold m-0 mt-5 mb-1">
            {copy.sectionAbo}
          </p>
          <DetailRow
            label={copy.paymentMethod}
            value={
              detail.abo?.zahlungsweg && detail.abo.zahlungsweg !== 'none'
                ? copy.payment?.[detail.abo.zahlungsweg] || detail.abo.zahlungsweg
                : '—'
            }
          />
          <DetailRow
            label={copy.trialActive}
            value={detail.abo?.gratismonat_aktiv ? copy.visibleYes : copy.visibleNo}
          />
          <DetailRow
            label={copy.colTrial}
            value={
              detail.testphase?.aktiv
                ? detail.testphase.abgelaufen && detail.testphase.ohneZahlung
                  ? copy.trialExpiredNoPay
                  : detail.testphase.abgelaufen
                    ? copy.trialEnded
                    : t('adminPages.crm.trialDaysUntil', {
                        count: detail.testphase.tage,
                        date: fmtDate(detail.abo?.testphase_ende),
                      })
                : '—'
            }
          />

          <div className="flex flex-col gap-2.5 mt-5">
            {st === 'lead' ? (
              <Button
                type="button"
                loading={advancing}
                onClick={() => runAdvance(detail.id, 'send_contract')}
              >
                {copy.actionSendContract}
              </Button>
            ) : null}
            {st === 'contract_sent' || st === 'contract' ? (
              <Button
                type="button"
                loading={advancing}
                onClick={() => runAdvance(detail.id, 'sign_contract')}
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
                      runAdvance(detail.id, 'set_payment', { zahlungsweg })
                    }
                  >
                    {copy.actionSetPayment}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  loading={advancing}
                  onClick={() => runAdvance(detail.id, 'start_trial')}
                >
                  {copy.actionStartTrial}
                </Button>
              </>
            ) : null}
            {st === 'onboarding' ? (
              <Button
                type="button"
                loading={advancing}
                onClick={() => runAdvance(detail.id, 'activate')}
              >
                {copy.actionActivate}
              </Button>
            ) : null}
            {st === 'active' ? (
              <p className="text-studio-teal text-[13px] m-0">{copy.activeHint}</p>
            ) : null}
            {st === 'deactivated' ? (
              <p className="text-studio-w2 text-[13px] m-0">{copy.deactivatedHint}</p>
            ) : null}
            {detail.testphase?.aktiv &&
            detail.testphase?.abgelaufen &&
            detail.testphase?.ohneZahlung &&
            st !== 'deactivated' ? (
              <Button
                type="button"
                variant="ghost"
                loading={advancing}
                onClick={() => runAdvance(detail.id, 'deactivate')}
              >
                {copy.actionDeactivateTrial}
              </Button>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

export default AdminCrm
