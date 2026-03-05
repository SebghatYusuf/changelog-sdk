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
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="cl-card group">
      <div className="cl-card-header">
        {/* Version & Date Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-sm">
            v{entry.version}
          </div>
          <time className="text-sm text-slate-500 font-medium">
            {dateFormatter.format(new Date(entry.date))}
          </time>
          {entry.aiGenerated && (
            <span className="cl-badge cl-badge-secondary text-[10px] uppercase tracking-wider">
              ✨ AI Enhanced
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="cl-card-title text-xl sm:text-2xl mb-4 group-hover:text-blue-600 transition-colors duration-300">
          {entry.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 cursor-default"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        <div className="cl-markdown">
          <Markdown rehypePlugins={[rehypeSanitize]}>{entry.content}</Markdown>
        </div>
      </div>
    </div>
  )
}
