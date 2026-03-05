'use client'


/**
 * Pagination Component
 */

interface PaginationProps {
  currentPage: number
  hasMore: boolean
  total: number
}

export default function Pagination({ currentPage, hasMore, total }: PaginationProps) {
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)

  const navigateToPage = (nextPage: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set('page', String(nextPage))
    window.location.href = `/changelog?${params.toString()}`
  }

  const handleNextPage = () => {
    navigateToPage(Math.min(totalPages, safeCurrentPage + 1))
  }

  const handlePrevPage = () => {
    navigateToPage(Math.max(1, safeCurrentPage - 1))
  }

  return (
    <div className="cl-pagination">
      <p className="cl-pagination-info">
        Page {safeCurrentPage} of {totalPages}
      </p>

      <div className="cl-pagination-actions">
        <button
          onClick={handlePrevPage}
          disabled={safeCurrentPage <= 1}
          className="cl-btn cl-btn-secondary cl-btn-compact cl-pagination-btn"
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          disabled={!hasMore || safeCurrentPage >= totalPages}
          className="cl-btn cl-btn-secondary cl-btn-compact cl-pagination-btn"
        >
          Next
        </button>
      </div>
    </div>
  )
}
