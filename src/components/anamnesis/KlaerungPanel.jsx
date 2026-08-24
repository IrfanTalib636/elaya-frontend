import { useState } from 'react'
import toast from 'react-hot-toast'
import { updateKlaerung } from '../../api/anamnesis'
import { getApiErrorMessage } from '../../lib/apiError'
import useContent from '../../i18n/useContent'

const STATUS_VALUES = ['offen', 'in_klaerung', 'geklaert']

const statusStyles = {
  offen: 'border-studio-red/40 bg-studio-red/5',
  in_klaerung: 'border-studio-gold/40 bg-studio-gold/5',
  geklaert: 'border-studio-teal-2/40 bg-studio-teal-2/5',
}

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('de-CH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : ''

const KlaerungItem = ({ caseId, flag, type, klaerung, onUpdated }) => {
  const { components } = useContent()
  const copy = components.anamnesis
  const STATUS_OPTIONS = [
    { value: 'offen', label: copy.klaerungPending },
    { value: 'in_klaerung', label: copy.klaerungMore },
    { value: 'geklaert', label: copy.klaerungDone },
  ]
  const frageKey = `F${flag.frage_nr}`
  const entry = klaerung?.[frageKey] || {}
  const status = entry.status || 'offen'
  const [notiz, setNotiz] = useState(entry.notiz || '')
  const [saving, setSaving] = useState(false)

  const save = async (nextStatus, nextNotiz = notiz) => {
    setSaving(true)
    try {
      const res = await updateKlaerung(caseId, {
        frage_key: frageKey,
        status: nextStatus,
        notiz: nextNotiz,
      })
      onUpdated?.(res.data.data, res.data.case_flags)
      toast.success(copy.klaerungSaved)
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.klaerungError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`rounded-[8px] border px-3 py-2.5 ${statusStyles[status] || statusStyles.offen}`}>
      <p className="text-[12px] text-studio-w3 m-0 mb-2">
        {frageKey} {flag.frage_text}:{' '}
        <span className="text-studio-white font-semibold">{flag.antwort}</span>
      </p>
      <select
        value={status}
        disabled={saving}
        onChange={(e) => save(e.target.value)}
        className="w-full px-2 py-1.5 rounded-[6px] border border-elaya-border bg-studio-bg-3 text-studio-white text-[11px] outline-none cursor-pointer disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {(status === 'in_klaerung' || status === 'geklaert') && (
        <div className="mt-2">
          <textarea
            value={notiz}
            onChange={(e) => setNotiz(e.target.value)}
            onBlur={() => {
              if (notiz !== (entry.notiz || '')) save(status, notiz)
            }}
            rows={2}
            placeholder={copy.klaerungNotePh}
            className="w-full px-2 py-1.5 rounded-[6px] border border-elaya-border bg-studio-bg-2 text-studio-white text-[11px] outline-none resize-y placeholder:text-studio-w4"
          />
          {status === 'geklaert' && entry.datum && (
            <p className="text-[10px] text-studio-teal-2 m-0 mt-1">
              ✓ Geklärt am {fmtDate(entry.datum)}
              {entry.geklaert_von ? ` · ${entry.geklaert_von}` : ''}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

const KlaerungPanel = ({ caseId, roteFragen = [], orangeFragen = [], klaerung = {}, onUpdated }) => {
  if (!roteFragen.length && !orangeFragen.length) return null

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-studio-w3 m-0 mb-1">
          Studio-Klärung
        </p>
        <p className="text-[11px] text-studio-w4 m-0 leading-relaxed">
          Originalantworten bleiben unverändert. Die Klärung wird separat mit Zeitstempel gespeichert.
        </p>
      </div>

      {roteFragen.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-studio-red text-[10px] font-semibold uppercase tracking-wider m-0">
            Abklärung ({roteFragen.length})
          </p>
          {roteFragen.map((f) => (
            <KlaerungItem
              key={`rot-${f.frage_nr}`}
              caseId={caseId}
              flag={f}
              type="rot"
              klaerung={klaerung}
              onUpdated={onUpdated}
            />
          ))}
        </div>
      )}

      {orangeFragen.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-studio-gold text-[10px] font-semibold uppercase tracking-wider m-0">
            Hinweise ({orangeFragen.length})
          </p>
          {orangeFragen.map((f) => (
            <KlaerungItem
              key={`orange-${f.frage_nr}`}
              caseId={caseId}
              flag={f}
              type="orange"
              klaerung={klaerung}
              onUpdated={onUpdated}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default KlaerungPanel
