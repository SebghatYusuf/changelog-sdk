'use client'

import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import { useChangelogApi } from '../../api/context'
import type { ChangelogEntry } from '../../types/changelog'
import { buildChangelogPath } from '../paths'

interface ChangelogDetailProps {
  slug: string
  basePath?: string
}

export default function ChangelogDetail({ slug, basePath }: ChangelogDetailProps) {
  const api = useChangelogApi()
  const [entry, setEntry] = useState<ChangelogEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')

    api.getEntryBySlug(slug)
      .then((result) => {
        if (!mounted) return
        if (result.error || !result.data || result.data.status !== 'published') {
          setError('Entry not found')
          return
        }
        setEntry(result.data)
      })
      .catch(() => {
        if (mounted) setError('Entry not found')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [api, slug])

  if (loading) {
    return (
      <section className="cl-detail-wrap">
        <div className="cl-card cl-detail-card cl-detail-not-found">
          <div className="cl-card-header">
            <h1 className="cl-card-title">Loading entry...</h1>
          </div>
        </div>
      </section>
    )
  }

  if (!entry || error) {
    return (
      <section className="cl-detail-wrap">
        <div className="cl-card cl-detail-card cl-detail-not-found">
          <div className="cl-card-header">
            <h1 className="cl-card-title">Entry not found</h1>
            <p className="cl-card-description">This changelog entry does not exist or is not published yet.</p>
          </div>
          <div className="cl-card-content">
            <a href={buildChangelogPath(basePath)} className="cl-btn cl-btn-secondary">
              Back to changelog
            </a>
          </div>
        </div>
      </section>
    )
  }

  const entryDate = new Date(entry.date)
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <section className="cl-detail-wrap">
      <a href={buildChangelogPath(basePath)} className="cl-detail-back-link">
        ← Back to all updates
      </a>

      <article className="cl-card cl-detail-card">
        <header className="cl-card-header cl-detail-header">
          <div className="cl-entry-meta">
            <span className="cl-entry-version">v{entry.version}</span>
            <time className="cl-entry-date" dateTime={entryDate.toISOString()}>{dateFormatter.format(entryDate)}</time>
            {entry.aiGenerated ? <span className="cl-badge cl-badge-secondary cl-entry-ai">AI Enhanced</span> : null}
          </div>

          <h1 className="cl-detail-title">{entry.title}</h1>

          <div className="cl-entry-tags">
            {entry.tags.map((tag) => (
              <span key={tag} className="cl-entry-tag">
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="cl-card-content cl-detail-content">
          <div className="cl-markdown cl-markdown-strong">
            <Markdown rehypePlugins={[rehypeSanitize]}>{entry.content}</Markdown>
          </div>
        </div>
      </article>
    </section>
  )
}
