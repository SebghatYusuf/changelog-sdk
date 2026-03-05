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
  const handleNextPage = () => {
    const params = new URLSearchParams()
    params.set('page', String(currentPage + 1))
    window.location.href = `/changelog?${params.toString()}`
  }

  const handlePrevPage = () => {
    const params = new URLSearchParams()
    params.set('page', String(Math.max(1, currentPage - 1)))
    window.location.href = `/changelog?${params.toString()}`
  }

  return (
    <div className="cl-flex items-center justify-between py-4">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {Math.ceil(total / 10)}
      </p>

      <div className="flex gap-2">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="cl-btn cl-btn-secondary cl-transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          disabled={!hasMore}
          className="cl-btn cl-btn-secondary cl-transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}
