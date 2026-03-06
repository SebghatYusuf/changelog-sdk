'use client'

import { useTransition, useEffect, useRef, useState, useCallback } from 'react'
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
  const [isPending, startTransition] = useTransition()

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

  const navigateWithFilters = useCallback(
    (newSearch: string, newTags: ChangelogTag[]) => {
      const nextUrl = buildUrl(pathname, newSearch, newTags)
      startTransition(() => {
        router.replace(nextUrl, { scroll: false })
      })
    },
    [pathname, router]
  )

  const handleToggleTag = useCallback(
    (tag: ChangelogTag) => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current)

      const next = selectedTagsRef.current.includes(tag)
        ? selectedTagsRef.current.filter((t) => t !== tag)
        : [...selectedTagsRef.current, tag]

      selectedTagsRef.current = next
      setSelectedTags(next)
      navigateWithFilters(searchRef.current, next)
    },
    [navigateWithFilters]
  )

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setSearch(val)
      searchRef.current = val

      if (searchDebounce.current) clearTimeout(searchDebounce.current)
      searchDebounce.current = setTimeout(() => {
        navigateWithFilters(val, selectedTagsRef.current)
      }, 300)
    },
    [navigateWithFilters]
  )

  const handleClear = useCallback(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current)

    searchRef.current = ''
    selectedTagsRef.current = []
    setSearch('')
    setSelectedTags([])
    navigateWithFilters('', [])
  }, [navigateWithFilters])

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
            disabled={isPending}
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
                  disabled={isPending}
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

        {hasFilters && (
          <div className="cl-filter-active">
            <div className="cl-filter-active-row">
              <span className="cl-filter-active-info">
                {selectedTags.length > 0 && `${selectedTags.length} ${selectedTags.length === 1 ? 'filter' : 'filters'} active`}
                {search && selectedTags.length > 0 && ' · '}
                {search.trim() && `Searching "${search.trim()}"`}
              </span>
              <button type="button" onClick={handleClear} disabled={isPending} className="cl-filter-clear">
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
