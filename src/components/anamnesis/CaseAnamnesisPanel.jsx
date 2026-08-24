import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, ClipboardList, Pencil } from 'lucide-react'
import { getCaseAnamnesis } from '../../api/anamnesis'
import { Card, Button, Spinner } from '../ui'
import { AMPEL_LABELS } from '../../utils/anamnesisAmpel'
import AnamnesisWizardModal from './AnamnesisWizardModal'
import KlaerungPanel from './KlaerungPanel'
import FreigabePanel from './FreigabePanel'
import useContent from '../../i18n/useContent'

const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('de-CH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('de-CH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—'

const MedicalTimeline = ({ timeline }) => {
  const { components } = useContent()
  const copy = components.anamnesis
  const labelFor = (typ) => {
    if (typ === 'confirmed_unchanged') return copy.unchangedConfirmed
    return copy.history?.[typ]
  }
  return (
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-wider text-studio-w3 m-0 mb-2">
      {copy.medicalTimeline}
    </p>
    <ul className="m-0 p-0 list-none flex flex-col gap-2">
      {timeline.map((entry, i) => (
        <li
          key={`${entry.zeitstempel}-${entry.typ}-${i}`}
          className="rounded-[10px] border border-elaya-border bg-studio-bg-4 px-3 py-2.5"
        >
          <p className="text-[11px] text-studio-white font-semibold m-0">
            {labelFor(entry.typ) || entry.details || entry.typ}
          </p>
          <p className="text-[10px] text-studio-w3 m-0 mt-0.5">
            {fmtDateTime(entry.zeitstempel)}
            {entry.case_label ? ` · ${entry.case_label}` : ''}
            {entry.bestaetigung?.hat_unterschrift || entry.hat_unterschrift
              ? copy.signaturePresent
              : ''}
          </p>
          {(entry.aenderungen || []).length > 0 ? (
            <ul className="m-0 mt-1.5 p-0 list-none">
              {entry.aenderungen.map((change) => (
                <li key={`${change.frage_key}-${change.von}`} className="text-[11px] text-studio-w2">
                  {change.frage_text}: {change.von} → {change.nach}
                </li>
              ))}
            </ul>
          ) : null}
          {entry.bestaetigung?.unterschrift_data &&
          entry.bestaetigung.unterschrift_data !== '[stored]' ? (
            <img
              src={entry.bestaetigung.unterschrift_data}
              alt={copy.signatureAlt}
              className="mt-2 max-h-16 rounded-[6px] bg-white"
            />
          ) : null}
        </li>
      ))}
    </ul>
  </div>
  )
}

const CaseAnamnesisPanel = ({ caseId, onCaseFlagsChange }) => {
  const { t, components } = useContent()
  const copy = components.anamnesis
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const fetchSeq = useRef(0)

  const fetchAnamnesis = useCallback(async ({ silent = false } = {}) => {
    if (!caseId) return null

    const seq = ++fetchSeq.current
    if (!silent) {
      setLoading(true)
      setError(false)
    }

    try {
      const res = await getCaseAnamnesis(caseId)
      if (seq !== fetchSeq.current) return null
      const next = res.data.data
      setData(next)
      return next
    } catch {
      if (seq === fetchSeq.current) setError(true)
      return null
    } finally {
      if (seq === fetchSeq.current && !silent) setLoading(false)
    }
  }, [caseId])

  useEffect(() => {
    fetchAnamnesis()
    return () => {
      fetchSeq.current += 1
    }
  }, [fetchAnamnesis])

  const handleSaved = async (saved) => {
    setWizardOpen(false)
    if (saved) setData((prev) => ({ ...prev, ...saved }))
    await fetchAnamnesis({ silent: true })
  }

  const handleKlaerungUpdated = (anamnesis, caseFlags) => {
    if (anamnesis) setData((prev) => ({ ...prev, ...anamnesis }))
    onCaseFlagsChange?.(caseFlags)
  }

  const handleFreigabeUpdated = (anamnesis, caseFlags) => {
    if (anamnesis) setData((prev) => ({ ...prev, ...anamnesis }))
    else if (caseFlags?.studio_freigabe) {
      setData((prev) =>
        prev ? { ...prev, studio_freigabe: caseFlags.studio_freigabe } : prev
      )
    }
    onCaseFlagsChange?.(caseFlags)
  }

  const ampelStatus = data?.ampel_status
  const ampelMeta = ampelStatus ? AMPEL_LABELS[ampelStatus] : null
  const orangeFragen = data?.orange_fragen ?? []
  const roteFragen = data?.rote_fragen ?? []
  const answerRows = data?.answer_rows ?? []
  const timeline = data?.customer_medical_timeline?.length
    ? data.customer_medical_timeline
    : data?.medical_history ?? []
  const filledAt = data?.antworten?.zeitstempel
  const badgeKey = `${ampelStatus}-${filledAt ?? ''}-${orangeFragen.length}-${roteFragen.length}`

  return (
    <>
      <Card className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <ClipboardList size={14} className="text-studio-gold shrink-0" />
            <h2 className="text-[13px] font-semibold text-studio-white m-0 uppercase tracking-wide">
              {copy.title}
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {data?.filled && filledAt ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-elaya-success">
                <CheckCircle2 size={13} />
                {t('components.anamnesis.filledOn', { date: fmtDate(filledAt) })}
              </span>
            ) : null}
            {!loading && (
              <Button size="sm" variant="secondary" onClick={() => setWizardOpen(true)}>
                <Pencil size={12} />
                {data?.filled ? copy.edit : copy.fill}
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-6"><Spinner size="sm" /></div>
        ) : error ? (
          <p className="text-studio-w3 text-[12px] m-0">{copy.loadError}</p>
        ) : !data?.filled ? (
          <>
            <div className="rounded-[10px] border border-elaya-warning/30 bg-elaya-warning/5 px-4 py-3">
              <p className="text-elaya-warning text-[12px] font-semibold m-0">{copy.pendingTitle}</p>
              <p className="text-studio-w3 text-[11px] mt-1 mb-0 leading-relaxed">
                {copy.pendingDesc}
                {data?.previous_anamnesis
                  ? ` ${copy.customerCanConfirm}`
                  : ''}
              </p>
            </div>
            {timeline.length > 0 ? (
              <MedicalTimeline timeline={timeline} />
            ) : null}
          </>
        ) : (
          <>
            {ampelMeta && (
              <div
                key={badgeKey}
                className={`rounded-[10px] border px-3 py-2.5 ${ampelMeta.className}`}
              >
                <p className="text-[13px] font-bold m-0">{ampelMeta.emoji} {ampelMeta.label}</p>
                {data.open_medical_flags_count > 0 && (
                  <p className="text-[10px] m-0 mt-1 opacity-80">
                    {t('components.anamnesis.flagsOpen', {
                      count: data.open_medical_flags_count,
                      suffix: data.open_medical_flags_count === 1 ? '' : 's',
                    })}
                  </p>
                )}
              </div>
            )}

            <FreigabePanel
              caseId={caseId}
              freigabe={data.studio_freigabe}
              onUpdated={handleFreigabeUpdated}
            />

            {answerRows.length > 0 ? (
              <ol className="m-0 p-0 list-none flex flex-col">
                {answerRows.map((row) => (
                  <li
                    key={row.key}
                    className="flex items-baseline justify-between gap-4 py-2 border-b border-elaya-border last:border-0"
                  >
                    <span className="text-studio-w2 text-[12px]">
                      <span className="text-studio-w3 tabular-nums mr-2">{row.nr}.</span>
                      {row.label}
                    </span>
                    <span className={`text-[12px] font-semibold text-right ${
                      String(row.value).startsWith('Ja') || row.value === 'Unsicher'
                        ? 'text-studio-white'
                        : 'text-studio-w1'
                    }`}>
                      {row.value}
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}

            <KlaerungPanel
              caseId={caseId}
              roteFragen={roteFragen}
              orangeFragen={orangeFragen}
              klaerung={data.klaerung || {}}
              onUpdated={handleKlaerungUpdated}
            />

            {timeline.length > 0 ? <MedicalTimeline timeline={timeline} /> : null}
          </>
        )}
      </Card>

      {wizardOpen && (
        <AnamnesisWizardModal
          caseId={caseId}
          initialAnswers={data?.antworten || data?.previous_anamnesis?.antworten}
          onClose={() => setWizardOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}

export default CaseAnamnesisPanel
