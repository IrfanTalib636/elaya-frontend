import { Users, ChevronRight } from 'lucide-react'
import { Modal, Button } from '../ui'
import { fmtCHF } from '../../utils/groupBooking'
import { fmtDateDeLong } from '../../utils/time'

const TYPE_LABELS = {
  beratung: 'Beratung',
  treatment: 'Behandlung',
  first: 'Erstbehandlung',
}

/**
 * Detail panel for a Gruppen-Termin — lists sibling cases + rabatt/total.
 * @param {{ appt: object, siblings?: object[], onClose: () => void, onOpenCase: (caseId: string) => void }} props
 */
const GroupDetailModal = ({ appt, siblings = [], onClose, onOpenCase }) => {
  const name = appt.customer
    ? `${appt.customer.vorname ?? ''} ${appt.customer.nachname ?? ''}`.trim()
    : '—'

  const cases = (siblings.length ? siblings : [appt]).map((a) => ({
    apptId: a.id ?? a._id,
    caseId: a.case?._id ?? a.case?.id ?? a.case,
    caseLabel: a.case?.caseId ?? '—',
    title: a.case?.tc_title || a.case?.bodyLabel || a.case?.type || 'Tattoo',
    type: a.case?.type,
  }))

  const n = cases.length || appt.gruppen_cases?.length || 0
  const rabattPct = appt.gruppen_rabatt != null
    ? Math.round(Number(appt.gruppen_rabatt) <= 1
      ? Number(appt.gruppen_rabatt) * 100
      : Number(appt.gruppen_rabatt))
    : 15

  const dateLabel = appt.date
    ? fmtDateDeLong(typeof appt.date === 'string' ? appt.date.slice(0, 10) : toISODate(appt.date))
    : '—'

  return (
    <Modal title="Gruppen-Termin" onClose={onClose} width="max-w-md">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-studio-white text-[18px] font-bold m-0 leading-tight">{name}</p>
          <p className="text-studio-w2 text-[12px] m-0 mt-1">
            {dateLabel} · {appt.time || '—'} Uhr
            {appt.dauer_minuten ? ` · ${appt.dauer_minuten} min` : ''}
          </p>
          <p className="text-studio-w3 text-[11px] m-0 mt-0.5">
            {TYPE_LABELS[appt.type] ?? appt.type} · Status: {appt.status || 'gebucht'}
          </p>
        </div>

        <div className="rounded-[10px] border border-studio-gold/25 bg-studio-gold/5 px-3 py-3">
          <p className="text-studio-gold-2 text-[12px] font-semibold m-0 mb-2 flex items-center gap-1.5">
            <Users size={14} />
            Gruppen-Termin ({n} Fälle)
          </p>

          <div className="flex flex-col gap-1">
            {cases.map((row) => (
              <button
                key={row.apptId || row.caseId}
                type="button"
                onClick={() => row.caseId && onOpenCase(String(row.caseId))}
                className="flex items-center justify-between gap-2 w-full text-left px-2.5 py-2 rounded-[8px]
                  bg-studio-bg-4/80 border border-elaya-border hover:border-studio-gold/30
                  cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-studio-white text-[12px] font-medium m-0 truncate">
                    {row.caseLabel} · {row.title}
                  </p>
                  <p className="text-studio-w3 text-[10px] m-0 mt-0.5">
                    {row.type === 'pmu' ? 'PMU' : 'Tattoo'} · Akte öffnen
                  </p>
                </div>
                <ChevronRight size={14} className="text-studio-w3 shrink-0" />
              </button>
            ))}
          </div>

          <div className="border-t border-elaya-border mt-3 pt-2.5 flex flex-col gap-1">
            <div className="flex justify-between text-[12px]">
              <span className="text-studio-gold-2">Gruppen-Rabatt {rabattPct}%</span>
              <span className="text-studio-w2 tabular-nums">angewendet</span>
            </div>
            <div className="flex justify-between text-[13px] font-semibold">
              <span className="text-studio-white">Gesamt</span>
              <span className="text-studio-white tabular-nums">
                {fmtCHF(appt.gruppen_preis_total)}
              </span>
            </div>
          </div>
        </div>

        <p className="text-studio-w3 text-[11px] m-0 leading-relaxed">
          Jeder Fall braucht weiterhin eine eigene Sitzungsdokumentation.
          Tippen Sie einen Fall an, um die Akte zu öffnen.
        </p>

        <div className="flex justify-end pt-1">
          <Button size="sm" variant="secondary" onClick={onClose}>
            Schliessen
          </Button>
        </div>
      </div>
    </Modal>
  )
}

const toISODate = (d) => {
  const x = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(x.getTime())) return ''
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

export default GroupDetailModal
