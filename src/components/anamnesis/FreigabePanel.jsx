import { useState } from 'react'
import toast from 'react-hot-toast'
import { updateStudioFreigabe } from '../../api/anamnesis'
import { getApiErrorMessage } from '../../lib/apiError'
import { Button } from '../ui'

const STATUS_LABEL = {
  ausstehend: 'Ausstehend',
  freigegeben: 'Freigegeben',
  abgelehnt: 'Abgelehnt',
  nicht_erforderlich: 'Nicht erforderlich',
}

/** Hide values that were accidentally saved from button labels */
const isUiChromeText = (value = '') => {
  const v = String(value).trim().toLowerCase()
  return (
    !v ||
    v === 'jetzt freigeben' ||
    v === 'jetzt ablehnen' ||
    v === '✅ jetzt freigeben' ||
    v === '❌ jetzt ablehnen' ||
    v === 'freigeben' ||
    v === 'ablehnen'
  )
}

const FreigabePanel = ({ caseId, freigabe, onUpdated }) => {
  const [mode, setMode] = useState(null) // null | 'freigeben' | 'ablehnen'
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  if (!freigabe?.erforderlich) return null

  const status = freigabe.status || 'ausstehend'
  const isPending = status === 'ausstehend'
  const isApproved = status === 'freigegeben'
  const isRejected = status === 'abgelehnt'
  const note = freigabe.notiz || freigabe.grund || ''
  const showNote = !isUiChromeText(note)

  const closeForm = () => {
    setMode(null)
    setText('')
  }

  const confirm = async () => {
    if (!isPending || (mode !== 'freigeben' && mode !== 'ablehnen')) return
    setSaving(true)
    try {
      const nextStatus = mode === 'freigeben' ? 'freigegeben' : 'abgelehnt'
      const res = await updateStudioFreigabe(caseId, {
        status: nextStatus,
        notiz: text.trim(),
        grund: mode === 'ablehnen' ? text.trim() : '',
      })
      closeForm()
      onUpdated?.(res.data.data?.anamnesis, {
        studio_freigabe: res.data.data?.studio_freigabe,
      })
      toast.success(nextStatus === 'freigegeben' ? 'Freigabe erteilt' : 'Ablehnung gespeichert')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Freigabe konnte nicht gespeichert werden.'))
    } finally {
      setSaving(false)
    }
  }

  // ── Already decided: status only, never action buttons ──
  if (isApproved || isRejected) {
    return (
      <div
        className={`rounded-[10px] border px-4 py-3 ${
          isApproved
            ? 'border-studio-teal-2/30 bg-studio-teal-2/5'
            : 'border-studio-red/30 bg-studio-red/5'
        }`}
      >
        <p className={`text-[13px] font-bold m-0 ${isApproved ? 'text-studio-teal-2' : 'text-studio-red'}`}>
          {isApproved ? '✅ Medizinische Freigabe erteilt' : '❌ Freigabe abgelehnt'}
        </p>
        <p className="text-[11px] text-studio-w3 m-0 mt-1">
          Status: {STATUS_LABEL[status] || status}
          {freigabe.bearbeitet_von ? ` · ${freigabe.bearbeitet_von}` : ''}
          {freigabe.datum
            ? ` · ${new Date(freigabe.datum).toLocaleString('de-CH', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}`
            : ''}
        </p>
        {showNote && (
          <p className="text-[11px] text-studio-w2 m-0 mt-1">
            Notiz: {note}
          </p>
        )}
      </div>
    )
  }

  // ── Pending: choose or confirm ──
  return (
    <div className="rounded-[10px] border border-studio-red/40 bg-studio-red/8 px-4 py-3">
      {!mode ? (
        <>
          <p className="text-studio-red text-[13px] font-bold m-0 mb-1">
            🔴 Medizinische Freigabe erforderlich — Stufe 2
          </p>
          {(freigabe.ausloeser || []).length > 0 && (
            <p className="text-studio-w3 text-[11px] m-0 mb-3">
              Auslöser: {(freigabe.ausloeser || []).join(', ')}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => setMode('freigeben')}>
              ✅ Freigeben
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setMode('ablehnen')}>
              ❌ Ablehnen
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-[12px] text-studio-w2 m-0">
            {mode === 'freigeben' ? 'Optionale Notiz zur Freigabe:' : 'Ablehnungsgrund (optional):'}
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-[8px] border border-elaya-border bg-studio-bg-3 text-studio-white text-[12px] outline-none resize-y"
            placeholder={
              mode === 'freigeben'
                ? 'z.B. Rücksprache mit Arzt erfolgt'
                : 'z.B. Bitte zuerst Rücksprache mit Arzt halten'
            }
          />
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={closeForm} disabled={saving}>
              Abbrechen
            </Button>
            <Button type="button" size="sm" onClick={confirm} disabled={saving}>
              {mode === 'freigeben' ? 'Bestätigen' : 'Ablehnung speichern'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FreigabePanel
