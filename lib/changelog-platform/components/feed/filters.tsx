'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Check, Search } from 'lucide-react'
import { ChangelogTag } from '../../types/changelog'

/**
 * Filters Component for Public Feed
 * Navigates to the same path with updated ?search= and ?tags= query params,
 * letting the Server Component re-fetch with the new filters.
 */

interface FiltersProps {
  initialSearch?: string
  initialTags?: ChangelogTag[]
  onChange?: (search: string, tags: ChangelogTag[]) => void
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

export default function Filters({ initialSearch = '', initialTags = [], onChange }: FiltersProps) {
  const [search, setSearch] = useState(initialSearch)
  const [selectedTags, setSelectedTags] = useState<ChangelogTag[]>(initialTags)

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInitialMount = useRef(true)
  const searchRef = useRef(initialSearch)
  const selectedTagsRef = useRef(initialTags)

  // Sync external prop changes into local state
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      searchRef.current = initialSearch
      selectedTagsRef.current = initialTags
      return
    }

    setSearch(initialSearch)
    setSelectedTags(initialTags)
    searchRef.current = initialSearch
    selectedTagsRef.current = initialTags
  }, [initialSearch, initialTags])

  const navigateWithFilters = useCallback((newSearch: string, newTags: ChangelogTag[]) => {
    const pathname = window.location.pathname
    const nextUrl = buildUrl(pathname, newSearch, newTags)
    window.history.replaceState({}, '', nextUrl)
  }, [])

  const handleToggleTag = useCallback((tag: ChangelogTag) => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current)

    const next = selectedTagsRef.current.includes(tag)
      ? selectedTagsRef.current.filter((t) => t !== tag)
      : [...selectedTagsRef.current, tag]

    selectedTagsRef.current = next
    setSelectedTags(next)
    navigateWithFilters(searchRef.current, next)
    onChange?.(searchRef.current, next)
  }, [navigateWithFilters, onChange])

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    searchRef.current = val

    if (searchDebounce.current) clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => {
      navigateWithFilters(val, selectedTagsRef.current)
      onChange?.(val, selectedTagsRef.current)
    }, 300)
  }, [navigateWithFilters, onChange])

  const handleClear = useCallback(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current)

    searchRef.current = ''
    selectedTagsRef.current = []
    setSearch('')
    setSelectedTags([])
    navigateWithFilters('', [])
    onChange?.('', [])
  }, [navigateWithFilters, onChange])

  useEffect(
    () => () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current)
    },
    []
  )

  const hasFilters = search.trim().length > 0 || selectedTags.length > 0

  return (
    <div className="cl-card cl-filter-card">
      <div className="cl-filter-body">
        <div className="cl-filter-search-row">
          <div className="cl-filter-search-icon-wrap">
            <Search className="cl-filter-search-icon" aria-hidden="true" />
          </div>
          <input
            type="text"
            placeholder="Search updates and features..."
            value={search}
            onChange={handleSearch}
            disabled={false}
            className="cl-input cl-filter-search-input"
          />
        </div>

        <div className="cl-filter-section">
          <label className="cl-filter-label">Filter by category</label>
          <div className="cl-filter-tags">
            {ALL_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  disabled={false}
                  className={`cl-filter-chip ${isSelected ? 'is-selected' : ''}`}
                >
                  {tag}
                  {isSelected && (
                    <Check className="cl-filter-check" strokeWidth={2.6} aria-hidden="true" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {hasFilters && (
          <div className="cl-filter-active">
            <div className="cl-filter-active-row">
              <span className="cl-filter-active-info">
                {selectedTags.length > 0 && `${selectedTags.length} ${selectedTags.length === 1 ? 'filter' : 'filters'} active`}
                {search && selectedTags.length > 0 && ' · '}
                {search.trim() && `Searching "${search.trim()}"`}
              </span>
              <button type="button" onClick={handleClear} disabled={false} className="cl-filter-clear">
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
