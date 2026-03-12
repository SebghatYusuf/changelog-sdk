import { fetchPublishedChangelogs } from '../../actions/changelog-actions'
import { FileText } from 'lucide-react'
import { ChangelogEntry, ChangelogTag } from '../../types/changelog'
import ChangelogCard from './card'
import Filters from './filters'
import Pagination from './pagination'
import { buildChangelogPath } from '../paths'

/**
 * Public Changelog Feed Timeline
 */

interface TimelineProps {
  initialPage?: number
  initialTags?: ChangelogTag[]
  initialSearch?: string
  basePath?: string
}

export default async function ChangelogFeed({
  initialPage = 1,
  initialTags = [],
  initialSearch = '',
  basePath,
}: TimelineProps) {
  const result = await fetchPublishedChangelogs(initialPage, 10, initialTags, initialSearch)
  const { entries, total, page, hasMore } = result.data

  return (
    <div className="cl-root cl-feed-wrap">
      <div className="cl-feed-hero">
        <div className="cl-feed-topbar">
          <a href={buildChangelogPath(basePath, 'admin')} className="cl-btn cl-btn-secondary cl-btn-compact cl-feed-admin-link">
            Admin
          </a>
        </div>
        <div className="cl-feed-kicker">
          <span className="cl-feed-kicker-dot" />
          Product Updates
        </div>
        <h1 className="cl-h1 cl-feed-title">What&rsquo;s New</h1>
        <p className="cl-p cl-feed-subtitle">
          Stay up to date with the latest features, improvements, and updates to our platform.
        </p>
        <div className="cl-feed-hero-stats">
          <span className="cl-feed-stat">
            <span className="cl-feed-stat-value">{total}</span>
            <span className="cl-feed-stat-label">{total === 1 ? 'release' : 'releases'}</span>
          </span>
        </div>
      </div>

      <div className="cl-feed-filters">
        <Filters initialSearch={initialSearch} initialTags={initialTags} />
      </div>

      <div className="cl-timeline cl-feed-timeline">
        {entries.length === 0 ? (
          <div className="cl-card cl-feed-empty-card">
            <div className="cl-card-content cl-feed-empty-content">
              <FileText className="cl-feed-empty-icon" aria-hidden="true" />
              <p className="cl-p cl-feed-empty-title">No changelog entries found.</p>
              <p className="cl-feed-empty-subtitle">Try adjusting your search or filters.</p>
            </div>
          </div>
        ) : (
          entries.map((entry: ChangelogEntry) => (
            <div key={entry._id} className="cl-timeline-item">
              <ChangelogCard entry={entry} basePath={basePath} />
            </div>
          ))
        )}
      </div>

      <Pagination currentPage={page} hasMore={hasMore} total={total} basePath={basePath} />
    </div>
  )
}
