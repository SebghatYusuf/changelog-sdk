import { ChangelogEntry } from '../../types/changelog'
import Markdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

/**
 * Individual Changelog Card Component
 */

interface ChangelogCardProps {
  entry: ChangelogEntry
}

export default function ChangelogCard({ entry }: ChangelogCardProps) {
  const entryDate = new Date(entry.date)
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <article className="cl-card cl-entry-card">
      <a href={`/changelog/${entry.slug}`} className="cl-entry-link" aria-label={`Open changelog entry ${entry.title}`}>
        <div className="cl-card-header cl-entry-header">
          <div className="cl-entry-meta">
            <span className="cl-entry-version">v{entry.version}</span>
            <time className="cl-entry-date" dateTime={entryDate.toISOString()}>{dateFormatter.format(entryDate)}</time>
            {entry.aiGenerated && <span className="cl-badge cl-badge-secondary cl-entry-ai">AI Enhanced</span>}
          </div>

          <h3 className="cl-card-title cl-entry-title">{entry.title}</h3>

          <div className="cl-entry-tags">
            {entry.tags.map((tag) => (
              <span key={tag} className="cl-entry-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="cl-card-content cl-entry-content">
          <div className="cl-markdown cl-markdown-preview cl-markdown-strong">
            <Markdown rehypePlugins={[rehypeSanitize]}>{entry.content}</Markdown>
          </div>
          <span className="cl-entry-readmore">Read full update →</span>
        </div>
      </a>
    </article>
  )
}
