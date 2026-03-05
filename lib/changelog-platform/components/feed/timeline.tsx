import { fetchPublishedChangelogs } from '../../actions/changelog-actions'
import { ChangelogEntry, ChangelogTag } from '../../types/changelog'
import ChangelogCard from './card'
import Filters from './filters'
import Pagination from './pagination'

/**
 * Public Changelog Feed Timeline
 */

interface TimelineProps {
  initialPage?: number
  initialTags?: ChangelogTag[]
  initialSearch?: string
}

export default async function ChangelogFeed({
  initialPage = 1,
  initialTags = [],
  initialSearch = '',
}: TimelineProps) {
  const result = await fetchPublishedChangelogs(initialPage, 10, initialTags, initialSearch)
  const { entries, total, page, hasMore } = result.data

  return (
    <div className="cl-root min-h-screen py-12 px-4">
      {/* Hero Header */}
      <div className="mb-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-200">
          <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">Product Updates</span>
        </div>
        <h1 className="cl-h1 mb-6">What's New</h1>
        <p className="cl-p text-lg max-w-2xl mx-auto text-slate-500">
          Stay up to date with the latest features, improvements, and updates to our platform.
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto mb-12">
        <Filters initialSearch={initialSearch} initialTags={initialTags} />
      </div>

      {/* Timeline */}
      <div className="cl-timeline max-w-4xl mx-auto">
        {entries.length === 0 ? (
          <div className="cl-card">
            <div className="cl-card-content text-center py-12">
              <div className="text-6xl mb-4 opacity-20">📝</div>
              <p className="cl-p text-slate-500 font-medium">No changelog entries found.</p>
              <p className="text-sm text-slate-400 mt-2">Try adjusting your search or filters.</p>
            </div>
          </div>
        ) : (
          entries.map((entry: ChangelogEntry) => (
            <div key={entry._id} className="cl-timeline-item">
              <ChangelogCard entry={entry} />
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <Pagination currentPage={page} hasMore={hasMore} total={total} />
    </div>
  )
}
