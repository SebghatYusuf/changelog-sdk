import { fetchAdminChangelogs } from '../../actions/changelog-actions'
import { ChangelogEntry } from '../../types/changelog'
import DeleteButton from './delete-button'

/**
 * Admin Changelog List Component
 */

export default async function AdminList() {
  const result = await fetchAdminChangelogs(1, 20)

  if (!result.success) {
    return (
      <div className="cl-card cl-admin-panel cl-admin-error-panel">
        <div className="cl-card-header">
          <h3 className="cl-card-title">Error</h3>
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
        <h3 className="cl-card-title">Recent entries</h3>
        <p className="cl-card-description">Latest changelog drafts and published updates.</p>
      </div>

      <div className="cl-card-content cl-admin-list-wrap">
        {entries.length === 0 ? (
          <p className="cl-p cl-admin-empty-text">No changelog entries yet.</p>
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
        <h4 className="cl-admin-row-title">{entry.title}</h4>
        <div className="cl-admin-row-meta">
          <span className="cl-admin-meta-text">v{entry.version}</span>
          <span className="cl-admin-meta-text">
            {dateFormatter.format(new Date(entry.date))}
          </span>
          <span className={`cl-admin-status ${entry.status === 'published' ? 'is-published' : 'is-draft'}`}>
            {entry.status}
          </span>
        </div>
      </div>

      <div className="cl-admin-row-actions">
        <button className="cl-btn cl-btn-sm cl-btn-secondary cl-btn-compact">Edit</button>
        <DeleteButton id={entry._id} />
      </div>
    </div>
  )
}
