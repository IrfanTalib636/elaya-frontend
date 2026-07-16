import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Plus, ChevronRight, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCase, updateCase } from '../../api/cases'
import { listSessions } from '../../api/sessions'
import CaseAvailabilityPanel from '../../components/case/CaseAvailabilityPanel'
import CasePricingPanel from '../../components/case/CasePricingPanel'
import CaseAnamnesisPanel from '../../components/anamnesis/CaseAnamnesisPanel'
import CaseSignaturePanel from '../../components/signature/CaseSignaturePanel'
import MedicalAmpelDot from '../../components/medical/MedicalAmpelDot'
import { Card, Badge, Button, Spinner, PageHeader } from '../../components/ui'

// ── Constants ─────────────────────────────────────────────────────────────
const CASE_TYPE_LABELS  = { tattoo: 'Tattoo', pmu: 'PMU' }
const TC_TYPE_LABELS    = { amateur: 'Amateur', cosmetic: 'Kosmetisch', professional: 'Professionell', coverup: 'Cover-up' }
const GOAL_LABELS       = { full_removal: 'Vollständige Entfernung', full: 'Vollständige Entfernung', partial_fade: 'Teilweises Aufhellen', lightening_for_coverup: 'Aufhellen für Cover-up' }
const COVERUP_LABELS    = { none: 'Kein Cover-up', once: 'Einmal', multiple: 'Mehrfach' }

const CASE_STATUSES = [
  { value: 'draft',                    label: 'Entwurf'             },
  { value: 'pending',                  label: 'Ausstehend'          },
  { value: 'active',                   label: 'Aktiv'               },
  { value: 'completed',                label: 'Abgeschlossen'       },
  { value: 'loeschantrag_ausstehend',  label: 'Löschantrag pend.'  },
]

const SESSION_HEADERS = ['Nr.', 'Datum', 'Verbl. %', 'Entf. %', 'Zahlung', 'Status', '']
const ZONE_HEADERS    = ['Zonen-ID', 'Körperstelle', 'Fläche cm²', 'Fortschritt', 'Sitzungen (est.)', '']

// ── Helpers ───────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('de-CH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const fmtCHF = (n) => (n != null ? `CHF ${Number(n).toFixed(2)}` : '—')

const pct = (n) => (n != null ? `${n} %` : '—')

const customerId = (customer) =>
  typeof customer === 'object' && customer?.id ? customer.id : customer

const customerName = (customer) => {
  if (!customer || typeof customer !== 'object') return null
  const name = `${customer.vorname ?? ''} ${customer.nachname ?? ''}`.trim()
  return name || customer.email || null
}

// ── Sub-components ────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-studio-w3 text-[10px] font-semibold uppercase tracking-wider">{label}</span>
    <span className="text-studio-w1 text-[13px]">{value || '—'}</span>
  </div>
)

const StatChip = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 px-4 py-3 rounded-[10px] bg-studio-bg-4 border border-elaya-border">
    <span className="text-studio-w3 text-[10px] font-semibold uppercase tracking-wider">{label}</span>
    <span className="text-studio-white text-[16px] font-bold">{value}</span>
  </div>
)

const SessionProgressBar = ({ done = 0, total = 0 }) => {
  const width = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-[5px] rounded-full bg-white/7">
        <div className="h-full rounded-full bg-studio-gold transition-all" style={{ width: `${width}%` }} />
      </div>
      <span className="text-studio-w3 text-[11px] tabular-nums shrink-0">{done}/{total}</span>
    </div>
  )
}

const SessionRow = ({ s, onClick }) => {
  const statusLabel = s.is_no_show ? 'No-show' : s.is_draft ? 'Entwurf' : 'Abgeschlossen'
  const statusColor = s.is_no_show
    ? 'bg-elaya-error/15 text-elaya-error'
    : s.is_draft
      ? 'bg-studio-gold/15 text-studio-gold-2'
      : 'bg-elaya-success/15 text-elaya-success'

  return (
    <tr
      className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-5 py-3 text-studio-w1 text-[12px] font-mono">#{s.session_number}</td>
      <td className="px-5 py-3 text-studio-w1 text-[12px]">{fmtDate(s.treatment_date)}</td>
      <td className="px-5 py-3 text-studio-w1 text-[12px]">{pct(s.verblassung_prozent)}</td>
      <td className="px-5 py-3 text-studio-w1 text-[12px]">{pct(s.removal_pct)}</td>
      <td className="px-5 py-3 text-studio-w1 text-[12px]">{fmtCHF(s.zahlung?.betragCHF)}</td>
      <td className="px-5 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor}`}>
          {statusLabel}
        </span>
      </td>
      <td className="px-5 py-3 text-studio-w3">
        <ChevronRight size={14} />
      </td>
    </tr>
  )
}

const ZoneRow = ({ z }) => (
  <tr className="border-b border-elaya-border last:border-0">
    <td className="px-5 py-3 text-studio-gold-2 text-[12px] font-mono">{z.zonen_id}</td>
    <td className="px-5 py-3 text-studio-w1 text-[12px]">{z.koerperstelle || z.bezeichnung || '—'}</td>
    <td className="px-5 py-3 text-studio-w1 text-[12px]">{z.flaeche_cm2 != null ? `${z.flaeche_cm2} cm²` : '—'}</td>
    <td className="px-5 py-3 text-studio-w1 text-[12px]">{pct(z.fortschritt_prozent)}</td>
    <td className="px-5 py-3 text-studio-w1 text-[12px]">
      {z.sitzungen_geschaetzt_min != null
        ? `${z.sitzungen_geschaetzt_min}–${z.sitzungen_geschaetzt_max}`
        : '—'}
    </td>
    <td className="px-5 py-3 text-studio-w3">
      <ChevronRight size={14} />
    </td>
  </tr>
)

// ── Page ──────────────────────────────────────────────────────────────────
const CaseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [caseData, setCaseData] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)

  useEffect(() => {
    const msg = location.state?.createdToast
    if (!msg) return
    toast.success(msg)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    const load = async () => {
      try {
        const [caseRes, sessRes] = await Promise.all([
          getCase(id),
          listSessions({ case_id: id, limit: 50 }),
        ])
        const c = caseRes.data.data.case
        setCaseData(c)
        setStatus(c.status)
        setSessions(sessRes.data.data.sessions)
      } catch {
        toast.error('Fall konnte nicht geladen werden.')
        navigate(-1)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate])

  const saveStatus = async () => {
    setSavingStatus(true)
    try {
      await updateCase(id, { status })
      setCaseData((prev) => ({ ...prev, status }))
      toast.success('Status aktualisiert.')
    } catch {
      toast.error('Fehler beim Speichern.')
    } finally {
      setSavingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!caseData) return null

  const caseTitle = caseData.tc_title || CASE_TYPE_LABELS[caseData.type] || caseData.type
  const hasSessions = sessions.length > 0
  const hasZones = caseData.zonen_aktiv && caseData.zonen?.length > 0
  const custId = customerId(caseData.customer)
  const custName = customerName(caseData.customer)
  const headerSubtitle = [caseData.caseId, custName].filter(Boolean).join(' · ')

  return (
    <div className="p-6 max-w-[1100px]">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(custId ? `/studio/customers/${custId}` : -1)}
        className="flex items-center gap-1.5 text-studio-w2 text-[12px] mb-5 hover:text-studio-white transition-colors cursor-pointer bg-transparent border-0"
      >
        <ArrowLeft size={13} />
        {custName ? `Zum Kunden · ${custName}` : 'Zurück'}
      </button>

      <PageHeader title={caseTitle} subtitle={headerSubtitle}>
        <MedicalAmpelDot
          level={caseData.medical_flag_level}
          pending={!caseData.anamnesis_complete}
          count={caseData.open_medical_flags_count}
          labelMode="inline"
        />
        <Badge variant="status" value={caseData.status}>{caseData.status}</Badge>
        <Button size="sm" variant="secondary" onClick={() => navigate(`/studio/appointments?case_id=${id}&customer_id=${custId}&book=1`)}>
          Termin buchen
        </Button>
        <Button size="sm" onClick={() => navigate(`/studio/sessions/new?case_id=${id}`)}>
          <Plus size={13} />
          Neue Sitzung
        </Button>
      </PageHeader>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatChip
          label="Sitzungen"
          value={`${caseData.sessionsDone ?? 0} / ${caseData.sessions ?? 0}`}
        />
        <StatChip
          label="Letzte Sitzung"
          value={fmtDate(caseData.lastSessionDate)}
        />
        <StatChip
          label="Preis / Sitzung"
          value={fmtCHF(caseData.pricePerSession)}
        />
        <StatChip
          label="Ziel"
          value={GOAL_LABELS[caseData.goal_target] ?? caseData.goal_target ?? '—'}
        />
      </div>

      <div className="flex gap-5 items-start">

        {/* ── Left column ── */}
        <div className="flex flex-col gap-5 flex-1 min-w-0">

          {/* Tattoo intake */}
          <Card>
            <h2 className="text-[13px] font-semibold text-studio-white m-0 mb-4 pb-3 border-b border-elaya-border">
              Tattoo-Angaben
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <InfoRow label="Typ"            value={CASE_TYPE_LABELS[caseData.type] ?? caseData.type} />
              <InfoRow label="Körperstelle"   value={caseData.bodyLabel} />
              <InfoRow label="Tätowierungsart" value={TC_TYPE_LABELS[caseData.tc_type] ?? caseData.tc_type} />
              <InfoRow label="Cover-up"        value={COVERUP_LABELS[caseData.tc_coverup] ?? caseData.tc_coverup} />
              <InfoRow label="Größe"
                value={
                  caseData.tc_size_length && caseData.tc_size_width
                    ? `${caseData.tc_size_length} × ${caseData.tc_size_width} cm`
                    : null
                }
              />
              <InfoRow label="Alter (Jahre)"  value={caseData.tc_age_years != null ? `${caseData.tc_age_years} J.` : null} />
              <InfoRow label="Farben"
                value={
                  Array.isArray(caseData.tc_colors_present) && caseData.tc_colors_present.length
                    ? caseData.tc_colors_present.join(', ')
                    : caseData.tc_colors_present ? 'Ja' : 'Nein'
                }
              />
              <InfoRow label="Fitzpatrick"    value={caseData.skin_fitzpatrick ? `Typ ${caseData.skin_fitzpatrick}` : null} />
            </div>

            {/* Session progress inside anamnesis */}
            <div className="mt-5 pt-4 border-t border-elaya-border">
              <p className="text-studio-w3 text-[10px] font-semibold uppercase tracking-wider mb-2">Sitzungsfortschritt</p>
              <SessionProgressBar done={caseData.sessionsDone} total={caseData.sessions} />
              {caseData.sessionsMin != null && (
                <p className="text-studio-w3 text-[11px] mt-1.5 m-0">
                  Geschätzt: {caseData.sessionsMin}–{caseData.sessionsMax} Sitzungen
                </p>
              )}
            </div>
          </Card>

          {/* Medical anamnesis */}
          <CaseAnamnesisPanel
            caseId={id}
            onCaseFlagsChange={(flags) => {
              if (!flags) return
              setCaseData((prev) =>
                prev
                  ? {
                      ...prev,
                      ...(flags.medical_flag_level !== undefined
                        ? { medical_flag_level: flags.medical_flag_level }
                        : {}),
                      ...(flags.open_medical_flags_count !== undefined
                        ? { open_medical_flags_count: flags.open_medical_flags_count }
                        : {}),
                      ...(flags.studio_freigabe
                        ? { studio_freigabe: flags.studio_freigabe }
                        : {}),
                    }
                  : prev
              )
            }}
          />

          {/* TC_08–09 Merkblatt & signature */}
          <CaseSignaturePanel
            caseId={id}
            caseData={caseData}
            onUpdated={async () => {
              const res = await getCase(id)
              setCaseData(res.data.data.case)
            }}
          />

          {/* Sessions log */}
          <Card padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-elaya-border">
              <h2 className="text-[14px] font-semibold text-studio-white m-0">
                Sitzungsprotokoll
                <span className="ml-2 text-studio-w3 text-[12px] font-normal">({sessions.length})</span>
              </h2>
              <Button size="sm" variant="secondary" onClick={() => navigate(`/studio/sessions/new?case_id=${id}`)}>
                <Plus size={13} />
                Neue Sitzung
              </Button>
            </div>

            {!hasSessions ? (
              <div className="py-10 text-center">
                <p className="text-studio-w2 text-[13px] m-0">Noch keine Sitzungen aufgezeichnet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-elaya-border">
                      {SESSION_HEADERS.map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-studio-w3 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <SessionRow
                        key={s.id}
                        s={s}
                        onClick={() => navigate(`/studio/sessions/${s.id}`)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Zones (only if active) */}
          {hasZones && (
            <Card padding="none">
              <div className="px-5 py-4 border-b border-elaya-border">
                <h2 className="text-[14px] font-semibold text-studio-white m-0">
                  Zonen
                  <span className="ml-2 text-studio-w3 text-[12px] font-normal">({caseData.zonen.length})</span>
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-elaya-border">
                      {ZONE_HEADERS.map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-studio-w3 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {caseData.zonen.map((z) => (
                      <ZoneRow key={z.id} z={z} />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="flex flex-col gap-5 w-[260px] shrink-0">

          {/* Status */}
          <Card className="flex flex-col gap-4">
            <h3 className="text-[13px] font-semibold text-studio-white m-0">Status</h3>
            <div className="flex flex-col gap-1.5">
              {CASE_STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[12px] text-left cursor-pointer border transition-colors w-full
                    ${status === s.value
                      ? 'border-studio-gold/40 bg-studio-gold/10 text-studio-white font-semibold'
                      : 'border-elaya-border bg-transparent text-studio-w2 hover:border-elaya-border-strong hover:text-studio-white'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status === s.value ? 'bg-studio-gold' : 'bg-studio-w4'}`} />
                  {s.label}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              variant="secondary"
              loading={savingStatus}
              disabled={status === caseData.status}
              onClick={saveStatus}
              className="w-full"
            >
              Status speichern
            </Button>
          </Card>

          {/* Pricing from rules engine */}
          <CasePricingPanel caseId={id} />

          {/* Lockout / availability from rules engine */}
          <CaseAvailabilityPanel caseId={id} customerId={custId} />

          {/* Legacy UV / med dates on case record */}
          {(caseData.uvBlockDate || caseData.medicationBlockDate) && (
            <Card className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={13} className="text-elaya-warning shrink-0" />
                <h3 className="text-[13px] font-semibold text-studio-white m-0">Fall-Sperren (Daten)</h3>
              </div>
              {caseData.uvBlockDate && (
                <InfoRow label="UV-Sperre bis" value={fmtDate(caseData.uvBlockDate)} />
              )}
              {caseData.medicationBlockDate && (
                <InfoRow label="Medikamenten-Sperre" value={fmtDate(caseData.medicationBlockDate)} />
              )}
            </Card>
          )}

          {/* Pricing */}
          {caseData.pricePerSession != null && (
            <Card className="flex flex-col gap-3">
              <h3 className="text-[13px] font-semibold text-studio-white m-0">Kalkulation</h3>
              <InfoRow label="Preis / Sitzung" value={fmtCHF(caseData.pricePerSession)} />
              {caseData.sessions > 0 && (
                <InfoRow
                  label="Gesamtschätzung"
                  value={fmtCHF(caseData.pricePerSession * caseData.sessions)}
                />
              )}
            </Card>
          )}

        </div>
      </div>
    </div>
  )
}

export default CaseDetail
