'use client'

import { useState } from 'react'
import { ChangelogTag } from '../../types/changelog'

/**
 * Filters Component for Public Feed
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

export default function Filters({ initialSearch = '', initialTags = [] }: FiltersProps) {
  const [search, setSearch] = useState(initialSearch)
  const [selectedTags, setSelectedTags] = useState<ChangelogTag[]>(initialTags)

  const handleToggleTag = (tag: ChangelogTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  // Build query string (in a real app, you'd use a form or router)
  const queryParams = new URLSearchParams()
  if (search) queryParams.set('search', search)
  if (selectedTags.length > 0) queryParams.set('tags', selectedTags.join(','))

  return (
    <div className="cl-card cl-filter-card">
      <div className="cl-filter-body">
        {/* Search with icon */}
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
          <label className="cl-filter-label">Filter by Category</label>
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
                    <svg
                      className="cl-filter-check"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
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

        {/* Active filters count */}
        {(search || selectedTags.length > 0) && (
          <div className="cl-filter-active">
            <div className="cl-filter-active-row">
              <span className="cl-filter-active-info">
                {selectedTags.length > 0 && `${selectedTags.length} ${selectedTags.length === 1 ? 'filter' : 'filters'} active`}
                {search && selectedTags.length > 0 && ' • '}
                {search && 'Searching...'}
              </span>
              <button
                onClick={() => {
                  setSearch('')
                  setSelectedTags([])
                }}
                className="cl-filter-clear"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
