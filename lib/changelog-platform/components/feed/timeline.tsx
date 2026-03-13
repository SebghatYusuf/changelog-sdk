'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
import { ChangelogEntry, ChangelogTag } from '../../types/changelog'
import { useChangelogApi } from '../../api/context'
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

export default function ChangelogFeed({
  initialPage = 1,
  initialTags = [],
  initialSearch = '',
  basePath,
}: TimelineProps) {
  const api = useChangelogApi()
  const [page, setPage] = useState(initialPage)
  const [tags, setTags] = useState<ChangelogTag[]>(initialTags)
  const [search, setSearch] = useState(initialSearch)
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const queryKey = useMemo(
    () => `${page}:${search}:${tags.join(',')}`,
    [page, search, tags]
  )

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')

    api.getFeed({ page, limit: 10, tags, search })
      .then((result) => {
        if (!mounted) return
        if (!result.success) {
          setError('Failed to load changelog entries.')
          return
        }
        setEntries(result.data.entries)
        setTotal(result.data.total)
        setHasMore(result.data.hasMore)
      })
      .catch(() => {
        if (mounted) setError('Failed to load changelog entries.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [api, queryKey, page, tags, search])

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const nextPage = Math.max(1, Number(params.get('page') || 1))
      const nextTags = (params.get('tags') || '').split(',').filter(Boolean) as ChangelogTag[]
      const nextSearch = params.get('search') || ''
      setPage(nextPage)
      setTags(nextTags)
      setSearch(nextSearch)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const updateQueryParams = useCallback((nextPage: number, nextSearch: string, nextTags: ChangelogTag[]) => {
    const params = new URLSearchParams(window.location.search)
    params.set('page', String(nextPage))
    if (nextSearch.trim()) {
      params.set('search', nextSearch.trim())
    } else {
      params.delete('search')
    }
    if (nextTags.length > 0) {
      params.set('tags', nextTags.join(','))
    } else {
      params.delete('tags')
    }
    const nextUrl = `${buildChangelogPath(basePath)}?${params.toString()}`
    window.history.replaceState({}, '', nextUrl)
  }, [basePath])

  const handleFiltersChange = useCallback((nextSearch: string, nextTags: ChangelogTag[]) => {
    setSearch(nextSearch)
    setTags(nextTags)
    setPage(1)
    updateQueryParams(1, nextSearch, nextTags)
  }, [updateQueryParams])

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage)
    updateQueryParams(nextPage, search, tags)
  }, [search, tags, updateQueryParams])

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
        <Filters
          initialSearch={search}
          initialTags={tags}
          onChange={handleFiltersChange}
        />
      </div>

      <div className="cl-timeline cl-feed-timeline">
        {loading ? (
          <div className="cl-card cl-feed-empty-card">
            <div className="cl-card-content cl-feed-empty-content">
              <div className="cl-spinner" />
              <p className="cl-p cl-feed-empty-title">Loading updates...</p>
            </div>
          </div>
        ) : error ? (
          <div className="cl-card cl-feed-empty-card">
            <div className="cl-card-content cl-feed-empty-content">
              <p className="cl-p cl-feed-empty-title">{error}</p>
            </div>
          </div>
        ) : entries.length === 0 ? (
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

      <Pagination
        currentPage={page}
        hasMore={hasMore}
        total={total}
        basePath={basePath}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
