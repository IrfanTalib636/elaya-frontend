import { useCallback, useEffect, useRef, useState } from 'react'
import { ClipboardList, Pencil } from 'lucide-react'
import { getCaseAnamnesis } from '../../api/anamnesis'
import { Card, Button, Spinner } from '../ui'
import { AMPEL_LABELS } from '../../utils/anamnesisAmpel'
import AnamnesisWizardModal from './AnamnesisWizardModal'

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

const CaseAnamnesisPanel = ({ caseId }) => {
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
    if (saved) setData({ ...saved })
    await fetchAnamnesis({ silent: true })
  }

  const ampelStatus = data?.ampel_status
  const ampelMeta = ampelStatus ? AMPEL_LABELS[ampelStatus] : null
  const orangeFragen = data?.orange_fragen ?? []
  const roteFragen = data?.rote_fragen ?? []
  const badgeKey = `${ampelStatus}-${data?.antworten?.zeitstempel ?? ''}-${orangeFragen.length}-${roteFragen.length}`

  return (
    <>
      <Card className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <ClipboardList size={14} className="text-studio-gold shrink-0" />
            <h2 className="text-[13px] font-semibold text-studio-white m-0">Medizinische Anamnese</h2>
          </div>
          {!loading && (
            <Button size="sm" variant="secondary" onClick={() => setWizardOpen(true)}>
              <Pencil size={12} />
              {data?.filled ? 'Bearbeiten' : 'Ausfüllen'}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-6"><Spinner size="sm" /></div>
        ) : error ? (
          <p className="text-studio-w3 text-[12px] m-0">Anamnese konnte nicht geladen werden.</p>
        ) : !data?.filled ? (
          <div className="rounded-[10px] border border-elaya-warning/30 bg-elaya-warning/5 px-4 py-3">
            <p className="text-elaya-warning text-[12px] font-semibold m-0">⚠ Ausstehend</p>
            <p className="text-studio-w3 text-[11px] mt-1 mb-0 leading-relaxed">
              Die medizinische Anamnese wurde noch nicht ausgefüllt.
            </p>
          </div>
        ) : (
          <>
            {ampelMeta && (
              <div
                key={badgeKey}
                className={`rounded-[10px] border px-3 py-2.5 ${ampelMeta.className}`}
              >
                <p className="text-[13px] font-bold m-0">{ampelMeta.emoji} {ampelMeta.label}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 text-[11px] text-studio-w3">
              <p className="m-0">Ausgefüllt: <span className="text-studio-w1">{fmtDateTime(data.antworten?.zeitstempel)}</span></p>
              {data.antworten?.mitarbeiter && (
                <p className="m-0">Mitarbeiter: <span className="text-studio-w1">{data.antworten.mitarbeiter}</span></p>
              )}
            </div>

            {orangeFragen.length > 0 && (
              <div key={`${badgeKey}-orange`}>
                <p className="text-studio-gold text-[10px] font-semibold uppercase tracking-wider m-0 mb-2">Hinweise</p>
                <ul className="m-0 p-0 list-none flex flex-col gap-1">
                  {orangeFragen.map((f) => (
                    <li key={f.frage_text} className="text-[11px] text-studio-w2">
                      · {f.frage_text}: <span className="text-studio-white">{f.antwort}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {roteFragen.length > 0 && (
              <div key={`${badgeKey}-rot`}>
                <p className="text-studio-red text-[10px] font-semibold uppercase tracking-wider m-0 mb-2">Abklärung</p>
                <ul className="m-0 p-0 list-none flex flex-col gap-1">
                  {roteFragen.map((f) => (
                    <li key={f.frage_text} className="text-[11px] text-studio-w2">
                      · {f.frage_text}: <span className="text-studio-white">{f.antwort}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </Card>

      {wizardOpen && (
        <AnamnesisWizardModal
          caseId={caseId}
          initialAnswers={data?.antworten}
          onClose={() => setWizardOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}

export default CaseAnamnesisPanel
