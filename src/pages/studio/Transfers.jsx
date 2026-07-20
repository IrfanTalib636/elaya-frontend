import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { listStudioTransfers } from '../../api/studioTransfers'
import { Card, PageHeader, Spinner, Pagination, EmptyState } from '../../components/ui'
import { PAGE_SIZE } from '../../constants/pagination'

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('de-CH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—'

const STATUS_LABEL = {
  ausstehend: 'Ausstehend (Elaya)',
  genehmigt: 'Genehmigt',
  abgelehnt: 'Abgelehnt',
}

const STATUS_CLASS = {
  ausstehend: 'text-studio-gold-2',
  genehmigt: 'text-studio-teal-2',
  abgelehnt: 'text-[#e05555]',
}

const RICHTUNG_LABEL = {
  eingehend: 'Eingehend',
  ausgehend: 'Ausgehend',
}

const RICHTUNG_CLASS = {
  eingehend: 'text-studio-teal-2 bg-studio-teal/10',
  ausgehend: 'text-[#ff9a3c] bg-[#ff9a3c]/10',
}

const StudioTransfers = () => {
  const [transfers, setTransfers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const load = useCallback(async (pageNum, status, { background = false } = {}) => {
    if (!background) setLoading(true)
    try {
      const params = { page: pageNum, limit: PAGE_SIZE }
      if (status) params.status = status
      const res = await listStudioTransfers(params)
      setTransfers(res.data.data.transfers ?? [])
      setPagination(res.data.data.pagination)
    } catch {
      toast.error('Wechselanfragen konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page, statusFilter, { background: page > 1 })
  }, [page, statusFilter, load])

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader
        title="Studio-Wechsel"
        subtitle="Eingehende und ausgehende Wechselanfragen — Genehmigung durch Elaya"
      />

      <div className="mb-4 px-4 py-3 rounded-[12px] border border-elaya-border bg-studio-bg-4">
        <p className="text-studio-w2 text-[12px] m-0 leading-relaxed">
          Wechselanfragen werden von <strong className="text-studio-white">Elaya Plattform-Admin</strong>{' '}
          geprüft und genehmigt (Handoff §10.15). Studios können Anfragen einsehen, aber nicht
          selbst annehmen. <strong className="text-studio-white">Eingehend</strong> = Kunde wechselt
          zu euch · <strong className="text-studio-white">Ausgehend</strong> = Kunde verlässt euer Studio.
          Nach Genehmigung erscheint der Kunde beim Ziel-Studio inkl. medizinischer Akte und Elaycoins.
          {' '}
          <strong className="text-studio-white">Beitritt</strong> = Kunde trat beim Quell-Studio ein ·{' '}
          <strong className="text-studio-white">Wechsel</strong> = von Elaya genehmigt.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { value: 'ausstehend', label: 'Offen' },
          { value: 'genehmigt', label: 'Genehmigt' },
          { value: 'abgelehnt', label: 'Abgelehnt' },
          { value: '', label: 'Alle' },
        ].map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => {
              setPage(1)
              setStatusFilter(f.value)
            }}
            className={`px-3 py-1.5 rounded-[8px] text-[11px] font-semibold border cursor-pointer transition-colors ${
              statusFilter === f.value
                ? 'bg-studio-gold/15 border-studio-gold text-studio-gold-2'
                : 'bg-studio-bg-3 border-elaya-border text-studio-w2 hover:text-studio-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && transfers.length === 0 ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : transfers.length === 0 ? (
        <EmptyState
          title="Keine Wechselanfragen"
          description="Eingehende Anfragen (Kunden zu euch) und ausgehende Anfragen (Kunden verlassen euch) erscheinen hier."
        />
      ) : (
        <Card
          padding="none"
          className={loading && transfers.length > 0 ? 'opacity-60 pointer-events-none' : ''}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-elaya-border">
                  {['Anfrage', 'Beitritt', 'Wechsel', 'Richtung', 'Kunde', 'Von Studio', 'Zu Studio', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] font-semibold text-studio-w3 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-elaya-border last:border-0 hover:bg-studio-bg-4"
                  >
                    <td className="px-5 py-3 text-studio-w2 text-[12px] font-mono whitespace-nowrap">
                      {fmtDate(t.erstellt_am)}
                    </td>
                    <td className="px-5 py-3 text-studio-w2 text-[12px] font-mono whitespace-nowrap">
                      {fmtDate(t.beitritt_quelle_am)}
                    </td>
                    <td className="px-5 py-3 text-studio-w2 text-[12px] font-mono whitespace-nowrap">
                      {t.status === 'genehmigt'
                        ? fmtDate(t.wechsel_genehmigt_am ?? t.genehmigt_am ?? t.bearbeitet_am)
                        : t.status === 'ausstehend'
                          ? '—'
                          : fmtDate(t.bearbeitet_am)}
                    </td>
                    <td className="px-5 py-3 text-[12px]">
                      {t.richtung ? (
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${RICHTUNG_CLASS[t.richtung] || ''}`}
                        >
                          {RICHTUNG_LABEL[t.richtung] ?? t.richtung}
                        </span>
                      ) : (
                        <span className="text-studio-w4">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-studio-white text-[12px] font-medium">
                      {t.kunde_name || '—'}
                    </td>
                    <td className="px-5 py-3 text-studio-w2 text-[12px] max-w-[180px] truncate">
                      {t.von_firma_name || '—'}
                    </td>
                    <td className="px-5 py-3 text-studio-w2 text-[12px] max-w-[180px] truncate">
                      {t.zu_firma_name || '—'}
                    </td>
                    <td
                      className={`px-5 py-3 text-[12px] font-semibold ${STATUS_CLASS[t.status] || ''}`}
                    >
                      {STATUS_LABEL[t.status] ?? t.status}
                      {t.status === 'abgelehnt' && t.ablehnungsgrund ? (
                        <span
                          className="block text-studio-w4 text-[10px] font-normal mt-0.5 truncate max-w-[160px]"
                          title={t.ablehnungsgrund}
                        >
                          {t.ablehnungsgrund}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </Card>
      )}
    </div>
  )
}

export default StudioTransfers
