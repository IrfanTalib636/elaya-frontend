import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Camera, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { getSession, updateSession } from '../../api/sessions'
import { fetchPhotoBlobUrl, uploadSessionProgressPhoto } from '../../api/files'
import { analyzeVerblassung } from '../../api/verblassung'
import { Card, Badge, Button, Spinner, PageHeader } from '../../components/ui'

// ── Helpers ───────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

const fmtCHF = (n) => (n != null && n > 0 ? `CHF ${Number(n).toFixed(2)}` : '—')

const PAYMENT_LABELS = { bar: 'Bar', karte: 'Karte', twint: 'TWINT' }

// ── Sub-components ────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-studio-w3 text-[10px] font-semibold uppercase tracking-wider">{label}</span>
    <span className="text-studio-w1 text-[13px]">{value || '—'}</span>
  </div>
)

const Section = ({ title, children }) => (
  <Card className="flex flex-col gap-4">
    <h2 className="text-[13px] font-semibold text-studio-white m-0 pb-3 border-b border-elaya-border">
      {title}
    </h2>
    {children}
  </Card>
)

const ResultBar = ({ label, value = 0, max = 100, unit = '%' }) => {
  const width = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-studio-w2 text-[12px]">{label}</span>
        <span className="text-studio-gold-2 text-[13px] font-bold tabular-nums">{value}{unit}</span>
      </div>
      <div className="h-[5px] rounded-full bg-white/7">
        <div
          className="h-full rounded-full bg-studio-gold transition-all"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

// ── Progress photo ────────────────────────────────────────────────────────
const ProgressPhotoSection = ({ session, onUploaded }) => {
  const inputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const fileId = session.fortschritt_foto_file_id

  useEffect(() => {
    if (!fileId) {
      setPreviewUrl('')
      return undefined
    }

    let cancelled = false
    let objectUrl = ''

    ;(async () => {
      try {
        objectUrl = await fetchPhotoBlobUrl(fileId)
        if (cancelled) {
          URL.revokeObjectURL(objectUrl)
          return
        }
        setPreviewUrl(objectUrl)
      } catch {
        if (!cancelled) setPreviewUrl('')
      }
    })()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [fileId])

  const handleSelect = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      await uploadSessionProgressPhoto(session.id, file)
      toast.success('Fortschritts-Foto gespeichert.')
      onUploaded()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Foto konnte nicht hochgeladen werden.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Section title="Fortschritts-Foto">
      {previewUrl ? (
        <div className="rounded-[12px] border border-elaya-border bg-studio-bg-4 overflow-hidden max-w-[320px]">
          <img src={previewUrl} alt="Fortschritts-Foto" className="w-full object-cover" />
        </div>
      ) : (
        <p className="text-studio-w2 text-[13px] m-0">
          {fileId ? '…' : 'Noch kein Fortschritts-Foto vorhanden.'}
        </p>
      )}
      <div>
        <Button
          size="sm"
          variant="secondary"
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Camera size={13} />
          {fileId ? 'Foto ersetzen' : 'Foto hochladen'}
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleSelect}
      />
    </Section>
  )
}

// ── AI fading analysis ────────────────────────────────────────────────────
const VerblassungKiSection = ({ session, onAnalyzed }) => {
  const [analyzing, setAnalyzing] = useState(false)
  const ki = session.verblassung_ki
  const hasPhoto = !!session.fortschritt_foto_file_id

  const runAnalysis = async () => {
    setAnalyzing(true)
    try {
      await analyzeVerblassung({ session_id: session.id, persist: true })
      toast.success('KI-Verblassungsanalyse gespeichert.')
      onAnalyzed()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'KI-Analyse fehlgeschlagen.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <Section title="KI-Verblassungsanalyse">
      {!ki ? (
        <p className="text-studio-w2 text-[13px] m-0">
          Noch keine Analyse durchgeführt.
          {!hasPhoto && ' Lade zuerst ein Fortschritts-Foto hoch.'}
        </p>
      ) : (
        <>
          {session.verblassung_prozent != null && (
            <ResultBar label="Verblassung (KI)" value={session.verblassung_prozent} />
          )}
          <div className="grid grid-cols-1 gap-4">
            <InfoRow label="Beurteilung"        value={ki.beurteilung} />
            <InfoRow label="Fortschritt"        value={ki.fortschritt} />
            <InfoRow label="Empfehlung Kunde"   value={ki.empfehlung_kunde} />
            <InfoRow label="Empfehlung Studio"  value={ki.empfehlung_studio} />
            <InfoRow label="Lifestyle-Tipps"    value={ki.lifestyle_tipps} />
          </div>
          {ki.wichtiger_hinweis && (
            <div className="flex flex-col gap-1 px-3 py-2 rounded-[8px] bg-elaya-warning/10 border border-elaya-warning/20">
              <span className="text-elaya-warning text-[11px] font-semibold uppercase tracking-wider">Wichtiger Hinweis</span>
              <span className="text-studio-w1 text-[13px]">{ki.wichtiger_hinweis}</span>
            </div>
          )}
          {ki.analysed_at && (
            <p className="text-studio-w3 text-[11px] m-0">
              Analysiert am {fmtDate(ki.analysed_at)}
            </p>
          )}
        </>
      )}
      <div>
        <Button
          size="sm"
          variant={ki ? 'secondary' : 'primary'}
          loading={analyzing}
          disabled={!hasPhoto}
          onClick={runAnalysis}
        >
          <Sparkles size={13} />
          {ki ? 'Erneut analysieren' : 'KI-Analyse starten'}
        </Button>
      </div>
    </Section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────
const SessionDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [finalizing, setFinalizing] = useState(false)

  const reload = useCallback(async () => {
    try {
      const res = await getSession(id)
      setSession(res.data.data.session)
    } catch {
      toast.error('Sitzung konnte nicht geladen werden.')
    }
  }, [id])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSession(id)
        setSession(res.data.data.session)
      } catch {
        toast.error('Sitzung konnte nicht geladen werden.')
        navigate(-1)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  const finalizeDraft = async () => {
    setFinalizing(true)
    try {
      const res = await updateSession(id, { is_draft: false })
      setSession(res.data.data.session)
      toast.success('Sitzung erfolgreich abgeschlossen.')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Fehler beim Finalisieren.')
    } finally {
      setFinalizing(false)
    }
  }

  if (!session) return null

  const statusLabel = session.is_no_show ? 'No-show' : session.is_draft ? 'Entwurf' : 'Abgeschlossen'
  const statusValue = session.is_no_show ? 'storniert' : session.is_draft ? 'ausstehend' : 'aktiv'

  const hasLaser = session.studio_laser_brand || session.studio_laser_model || session.laser_typ
  const hasResults = !session.is_no_show && (session.verblassung_prozent || session.removal_pct || session.endpoint_reaction)
  const hasPayment = session.zahlung?.betragCHF > 0 || session.zahlung?.zahlungsart

  const wavelengths = session.wavelength_nm?.length
    ? session.wavelength_nm.join(', ') + ' nm'
    : null

  return (
    <div className="p-6 max-w-[1100px]">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(`/studio/cases/${session.case}`)}
        className="flex items-center gap-1.5 text-studio-w2 text-[12px] mb-5 hover:text-studio-white transition-colors cursor-pointer bg-transparent border-0"
      >
        <ArrowLeft size={13} />
        Zum Fall
      </button>

      <PageHeader
        title={`Sitzung #${session.session_number}`}
        subtitle={`${fmtDate(session.treatment_date)}${session.treatment_time ? ` · ${session.treatment_time}` : ''}`}
      >
        <Badge variant="status" value={statusValue}>{statusLabel}</Badge>
        {session.is_draft && (
          <Button
            size="sm"
            loading={finalizing}
            onClick={finalizeDraft}
          >
            <Pencil size={13} />
            Sitzung abschliessen
          </Button>
        )}
      </PageHeader>

      <div className="flex gap-5 items-start">

        {/* ── Left column ── */}
        <div className="flex flex-col gap-5 flex-1 min-w-0">

          {/* General info */}
          <Section title="Allgemein">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <InfoRow label="Datum"        value={fmtDate(session.treatment_date)} />
              <InfoRow label="Uhrzeit"      value={session.treatment_time} />
              <InfoRow label="Dauer (Min.)" value={session.dauer_minuten != null ? `${session.dauer_minuten} Min.` : null} />
              <InfoRow label="Sitzungs-ID"  value={session.session_id} />
              <InfoRow label="Mitarbeiter"  value={session.mitarbeiter_name} />
              <InfoRow label="Raum"         value={session.raum_name} />
            </div>
            {session.is_no_show && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-elaya-error/10 border border-elaya-error/20 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-elaya-error shrink-0" />
                <span className="text-elaya-error text-[12px] font-medium">Kunde ist nicht erschienen (No-Show)</span>
              </div>
            )}
          </Section>

          {/* Laser params */}
          {hasLaser && (
            <Section title="Laser-Parameter">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <InfoRow label="Marke"          value={session.studio_laser_brand} />
                <InfoRow label="Modell"         value={session.studio_laser_model} />
                <InfoRow label="Laser-Typ"      value={session.laser_typ} />
                <InfoRow label="Wellenlängen"   value={wavelengths} />
                <InfoRow label="Fluence J/cm²"  value={session.fluence_j_cm2 != null ? `${session.fluence_j_cm2} J/cm²` : null} />
                <InfoRow label="Spot-Größe"     value={session.spot_size_mm != null ? `${session.spot_size_mm} mm` : null} />
                <InfoRow label="Frequenz"       value={session.frequency_hz != null ? `${session.frequency_hz} Hz` : null} />
                <InfoRow label="Passes"         value={session.pass_count != null ? String(session.pass_count) : null} />
              </div>
              {session.cooling_used && (
                <div className="flex items-center gap-2 text-studio-w2 text-[12px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-elaya-success shrink-0" />
                  Kühlung wurde verwendet
                </div>
              )}
            </Section>
          )}

          {/* Treatment results */}
          {hasResults && (
            <Section title="Behandlungsergebnis">
              <ResultBar label="Verblassung"  value={session.verblassung_prozent ?? 0} />
              <ResultBar label="Entfernung"   value={session.removal_pct ?? 0} />
              {session.pain_score_0_10 != null && (
                <ResultBar label="Schmerzskala" value={session.pain_score_0_10} max={10} unit="/10" />
              )}
              {session.endpoint_reaction && (
                <InfoRow label="Endpoint-Reaktion" value={session.endpoint_reaction} />
              )}
              {session.adverse_event_flag && (
                <div className="flex flex-col gap-1 px-3 py-2 rounded-[8px] bg-elaya-error/10 border border-elaya-error/20">
                  <span className="text-elaya-error text-[11px] font-semibold uppercase tracking-wider">Unerwünschtes Ereignis</span>
                  <span className="text-studio-w1 text-[13px]">{session.adverse_event_type || '—'}</span>
                </div>
              )}
            </Section>
          )}

          {/* Progress photo + AI fading analysis */}
          {!session.is_no_show && (
            <>
              <ProgressPhotoSection session={session} onUploaded={reload} />
              <VerblassungKiSection session={session} onAnalyzed={reload} />
            </>
          )}

        </div>

        {/* ── Right sidebar ── */}
        <div className="flex flex-col gap-5 w-[260px] shrink-0">

          {/* Payment */}
          {hasPayment && (
            <Card className="flex flex-col gap-4">
              <h3 className="text-[13px] font-semibold text-studio-white m-0">Zahlung</h3>
              <InfoRow label="Betrag"      value={fmtCHF(session.zahlung?.betragCHF)} />
              <InfoRow label="Methode"     value={PAYMENT_LABELS[session.zahlung?.zahlungsart] ?? session.zahlung?.zahlungsart} />
              {session.zahlung?.rabatt > 0 && (
                <InfoRow label="Rabatt" value={fmtCHF(session.zahlung.rabatt)} />
              )}
            </Card>
          )}

          {/* Notes */}
          {session.special_notes && (
            <Card className="flex flex-col gap-3">
              <h3 className="text-[13px] font-semibold text-studio-white m-0">Notizen</h3>
              <p className="text-studio-w1 text-[13px] m-0 leading-relaxed">{session.special_notes}</p>
            </Card>
          )}

          {/* Meta */}
          <Card className="flex flex-col gap-3">
            <h3 className="text-[13px] font-semibold text-studio-white m-0">Details</h3>
            <InfoRow label="Erstellt am" value={fmtDate(session.createdAt)} />
            {session.session_id && <InfoRow label="Session-ID" value={session.session_id} />}
          </Card>

        </div>
      </div>
    </div>
  )
}

export default SessionDetail
