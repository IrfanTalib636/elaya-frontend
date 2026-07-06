import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

/**
 * Server-driven pagination bar — pass meta from API `pagination` object.
 * Renders nothing when there is only one page.
 */
const Pagination = ({ pagination, onPageChange, className = '' }) => {
  if (!pagination || pagination.totalPages <= 1) return null

  const { page, limit, total, totalPages, hasPrevPage, hasNextPage } = pagination
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-elaya-border ${className}`}
    >
      <p className="text-studio-w3 text-[12px] m-0 tabular-nums">
        {from}–{to} von {total}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!hasPrevPage}
          onClick={() => onPageChange(page - 1)}
          aria-label="Vorherige Seite"
        >
          <ChevronLeft size={14} />
          Zurück
        </Button>

        <span className="text-studio-w2 text-[12px] tabular-nums px-1">
          Seite {page} / {totalPages}
        </span>

        <Button
          variant="secondary"
          size="sm"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          aria-label="Nächste Seite"
        >
          Weiter
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  )
}

export default Pagination
