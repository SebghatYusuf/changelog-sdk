import { fetchAdminChangelogs } from '../../actions/changelog-actions'
import { ClipboardList } from 'lucide-react'
import { ChangelogEntry } from '../../types/changelog'
import DeleteButton from './delete-button'

/**
 * Admin Changelog List Component
 */

export default async function AdminList() {
  const result = await fetchAdminChangelogs(1, 30)

  if (!result.success) {
    return (
      <div className="cl-card cl-admin-panel cl-admin-error-panel">
        <div className="cl-card-header">
          <h3 className="cl-card-title">Error loading entries</h3>
        </div>
        <div className="cl-card-content">
          <p className="cl-p cl-admin-error-text">{result.error}</p>
        </div>
      </div>
    )
  }

  const { entries } = result.data!

  return (
    <div className="cl-card cl-admin-panel cl-admin-list-panel">
      <div className="cl-card-header">
        <div className="cl-list-header-row">
          <div>
            <h3 className="cl-card-title">All entries</h3>
            <p className="cl-card-description">{entries.length} release note{entries.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="cl-card-content cl-admin-list-wrap">
        {entries.length === 0 ? (
          <div className="cl-admin-empty-state">
            <ClipboardList className="cl-admin-empty-icon" aria-hidden="true" />
            <p className="cl-admin-empty-title">No entries yet</p>
            <p className="cl-admin-empty-text">Create your first changelog entry using the form.</p>
          </div>
        ) : (
          <div className="cl-admin-list">
            {entries.map((entry: ChangelogEntry) => (
              <AdminListItem key={entry._id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Individual List Item
 */
function AdminListItem({ entry }: { entry: ChangelogEntry }) {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="cl-admin-row">
      <div className="cl-admin-row-main">
        <div className="cl-admin-row-top">
          <h4 className="cl-admin-row-title">{entry.title}</h4>
          <span className={`cl-admin-status ${entry.status === 'published' ? 'is-published' : 'is-draft'}`}>
            {entry.status}
          </span>
        </div>
        <div className="cl-admin-row-meta">
          <span className="cl-admin-version-pill">v{entry.version}</span>
          <span className="cl-admin-meta-sep">·</span>
          <span className="cl-admin-meta-text">
            {dateFormatter.format(new Date(entry.date))}
          </span>
        </div>
        {entry.tags && entry.tags.length > 0 && (
          <div className="cl-admin-row-tags">
            {entry.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="cl-admin-tag-chip">{tag}</span>
            ))}
            {entry.tags.length > 4 && (
              <span className="cl-admin-tag-chip cl-admin-tag-more">+{entry.tags.length - 4}</span>
            )}
          </div>
        )}
      </div>

      <div className="cl-admin-row-actions">
        <a href={`/changelog/admin/edit/${entry._id}`} className="cl-btn cl-btn-sm cl-btn-secondary cl-btn-compact">
          Edit
        </a>
        <DeleteButton id={entry._id} />
      </div>
    </div>
  )
}
