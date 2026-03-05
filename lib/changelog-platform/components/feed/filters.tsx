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
    <div className="cl-card">
      <div className="p-6 space-y-6">
        {/* Search with icon */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-slate-400"
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
            className="cl-input pl-12 w-full"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">Filter by Category</label>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-md'
                  }`}
                >
                  {tag}
                  {isSelected && (
                    <svg
                      className="ml-1.5 h-3.5 w-3.5"
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
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">
                {selectedTags.length > 0 && `${selectedTags.length} ${selectedTags.length === 1 ? 'filter' : 'filters'} active`}
                {search && selectedTags.length > 0 && ' • '}
                {search && 'Searching...'}
              </span>
              <button
                onClick={() => {
                  setSearch('')
                  setSelectedTags([])
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
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
