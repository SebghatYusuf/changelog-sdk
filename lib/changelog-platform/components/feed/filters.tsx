'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ChangelogTag } from '../../types/changelog'

/**
 * Filters Component for Public Feed
 * Navigates to the same path with updated ?search= and ?tags= query params,
 * letting the Server Component re-fetch with the new filters.
 */

interface FiltersProps {
  initialSearch?: string
  initialTags?: ChangelogTag[]
}

const ALL_TAGS: ChangelogTag[] = [
  'Features',
  'Fixes',
  'Improvements',
  'Breaking',
  'Security',
  'Performance',
  'Docs',
]

function buildUrl(pathname: string, search: string, tags: ChangelogTag[]): string {
  const params = new URLSearchParams()
  if (search.trim()) params.set('search', search.trim())
  if (tags.length > 0) params.set('tags', tags.join(','))
  const qs = params.toString()
  return pathname + (qs ? `?${qs}` : '')
}

export default function Filters({ initialSearch = '', initialTags = [] }: FiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState(initialSearch)
  const [selectedTags, setSelectedTags] = useState<ChangelogTag[]>(initialTags)
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Navigate immediately when tags change
  const navigateWithFilters = useCallback(
    (newSearch: string, newTags: ChangelogTag[]) => {
      router.push(buildUrl(pathname, newSearch, newTags))
    },
    [router, pathname]
  )

  const handleToggleTag = (tag: ChangelogTag) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]
    setSelectedTags(next)
    navigateWithFilters(search, next)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    if (searchDebounce.current) clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => {
      navigateWithFilters(val, selectedTags)
    }, 400)
  }

  const handleClear = () => {
    setSearch('')
    setSelectedTags([])
    router.push(pathname)
  }

  // Clean up debounce on unmount
  useEffect(() => () => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current)
  }, [])

  const hasFilters = search.trim().length > 0 || selectedTags.length > 0

  return (
    <div className="cl-card cl-filter-card">
      <div className="cl-filter-body">
        {/* Search */}
        <div className="cl-filter-search-row">
          <div className="cl-filter-search-icon-wrap">
            <svg
              className="cl-filter-search-icon"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search updates and features..."
            value={search}
            onChange={handleSearch}
            className="cl-input cl-filter-search-input"
          />
        </div>

        {/* Tags */}
        <div className="cl-filter-section">
          <label className="cl-filter-label">Filter by category</label>
          <div className="cl-filter-tags">
            {ALL_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className={`cl-filter-chip ${isSelected ? 'is-selected' : ''}`}
                >
                  {tag}
                  {isSelected && (
                    <svg className="cl-filter-check" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Active filters summary */}
        {hasFilters && (
          <div className="cl-filter-active">
            <div className="cl-filter-active-row">
              <span className="cl-filter-active-info">
                {selectedTags.length > 0 && `${selectedTags.length} ${selectedTags.length === 1 ? 'filter' : 'filters'} active`}
                {search && selectedTags.length > 0 && ' · '}
                {search.trim() && `Searching "${search.trim()}"`}
              </span>
              <button onClick={handleClear} className="cl-filter-clear">
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
