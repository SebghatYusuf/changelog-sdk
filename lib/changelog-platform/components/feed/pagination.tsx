'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buildChangelogPath } from '../paths'

/**
 * Premium Pagination Component
 */

interface PaginationProps {
  currentPage: number
  hasMore: boolean
  total: number
  basePath?: string
  onPageChange?: (page: number) => void
}

function getVisiblePages(current: number, total: number): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [1]

  if (current > 3) {
    pages.push('ellipsis-start')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push('ellipsis-end')
  }

  pages.push(total)

  return pages
}

export default function Pagination({ currentPage, hasMore, total, basePath, onPageChange }: PaginationProps) {
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)

  const visiblePages = useMemo(
    () => getVisiblePages(safeCurrentPage, totalPages),
    [safeCurrentPage, totalPages]
  )

  const navigateToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return
    if (nextPage === safeCurrentPage) return

    if (onPageChange) {
      onPageChange(nextPage)
      return
    }

    const params = new URLSearchParams(window.location.search)
    params.set('page', String(nextPage))
    const nextUrl = `${buildChangelogPath(basePath)}?${params.toString()}`
    window.history.pushState({}, '', nextUrl)
    window.dispatchEvent(new Event('popstate'))
  }

  const startEntry = (safeCurrentPage - 1) * pageSize + 1
  const endEntry = Math.min(safeCurrentPage * pageSize, total)

  return (
    <div>
      <nav className="cl-pagination" aria-label="Pagination">
        <div className="cl-pagination-actions">
          <button
            onClick={() => navigateToPage(safeCurrentPage - 1)}
            disabled={safeCurrentPage <= 1}
            className="cl-pagination-btn cl-pagination-nav"
            aria-label="Previous page"
          >
            <ChevronLeft aria-hidden="true" style={{ width: '0.875rem', height: '0.875rem' }} />
            Prev
          </button>

          {visiblePages.map((page, idx) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <span key={page} className="cl-pagination-ellipsis" aria-hidden="true">
                  &hellip;
                </span>
              )
            }

            return (
              <button
                key={`${page}-${idx}`}
                onClick={() => navigateToPage(page)}
                className={`cl-pagination-btn ${page === safeCurrentPage ? 'is-active' : ''}`}
                aria-label={`Page ${page}`}
                aria-current={page === safeCurrentPage ? 'page' : undefined}
              >
                {page}
              </button>
            )
          })}

          <button
            onClick={() => navigateToPage(safeCurrentPage + 1)}
            disabled={!hasMore || safeCurrentPage >= totalPages}
            className="cl-pagination-btn cl-pagination-nav"
            aria-label="Next page"
          >
            Next
            <ChevronRight aria-hidden="true" style={{ width: '0.875rem', height: '0.875rem' }} />
          </button>
        </div>
      </nav>
      {total > 0 && (
        <p className="cl-pagination-summary">
          Showing {startEntry}–{endEntry} of {total} releases
        </p>
      )}
    </div>
  )
}
