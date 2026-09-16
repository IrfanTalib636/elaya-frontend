import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'
import useContent from '../../i18n/useContent'

const buildPageList = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const pages = new Set([1, totalPages, page, page - 1, page + 1, page - 2, page + 2])
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
  const result = []
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('…')
    result.push(sorted[i])
  }
  return result
}

/**
 * Server-driven pagination bar — pass meta from API `pagination` object.
 * Renders nothing when there is only one page (unless forceShow).
 */
const Pagination = ({
  pagination,
  onPageChange,
  className = '',
  showPageNumbers = false,
  forceShow = false,
}) => {
  const { t } = useContent()
  if (!pagination) return null
  if (!forceShow && pagination.totalPages <= 1) return null

  const { page, limit, total, totalPages, hasPrevPage, hasNextPage } = pagination
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  const pages = showPageNumbers ? buildPageList(page, totalPages || 1) : null

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-elaya-border ${className}`}
    >
      <p className="text-studio-w3 text-[12px] m-0 tabular-nums">
        {t('components.pagination.ofTotal', { from, to, total })}
      </p>

      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <Button
          variant="secondary"
          size="sm"
          disabled={!hasPrevPage}
          onClick={() => onPageChange(page - 1)}
          aria-label={t('components.pagination.prevAria')}
        >
          <ChevronLeft size={14} />
          {t('components.pagination.prev')}
        </Button>

        {showPageNumbers ? (
          pages.map((item, index) =>
            item === '…' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-1.5 text-studio-w3 text-[12px]"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? 'page' : undefined}
                className={`min-w-[32px] h-8 px-2 rounded-[8px] text-[12px] font-semibold border cursor-pointer transition-colors tabular-nums ${
                  item === page
                    ? 'bg-studio-gold border-studio-gold text-white'
                    : 'bg-transparent border-elaya-border text-studio-w1 hover:border-studio-gold/40 hover:text-studio-white'
                }`}
              >
                {item}
              </button>
            )
          )
        ) : (
          <span className="text-studio-w2 text-[12px] tabular-nums px-1">
            {t('components.pagination.page', { page, total: totalPages })}
          </span>
        )}

        <Button
          variant="secondary"
          size="sm"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          aria-label={t('components.pagination.nextAria')}
        >
          {t('components.pagination.next')}
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  )
}

export default Pagination
