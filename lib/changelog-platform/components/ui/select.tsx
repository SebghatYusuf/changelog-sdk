'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  description?: string
}

interface SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  id?: string
  className?: string
  searchable?: boolean
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = 'Select option',
  label,
  disabled = false,
  id,
  className = '',
  searchable = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)
  const filteredOptions = search
    ? options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()))
    : options

  const close = useCallback(() => {
    setIsOpen(false)
    setSearch('')
    setActiveIndex(-1)
  }, [])

  const toggle = useCallback(() => {
    if (disabled) return
    setIsOpen((prev) => {
      if (!prev && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        const dropdownHeight = Math.min(options.length * 38 + 60, 260)
        const spaceBelow = window.innerHeight - rect.bottom - 8
        const spaceAbove = rect.top - 8
        const opensUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow

        setDropdownStyle({
          position: 'fixed',
          left: rect.left,
          width: rect.width,
          top: opensUpward ? undefined : rect.bottom + 4,
          bottom: opensUpward ? window.innerHeight - rect.top + 4 : undefined,
          zIndex: 9999,
        })
      }
      if (prev) {
        setSearch('')
        setActiveIndex(-1)
      }
      return !prev
    })
  }, [disabled, options.length])

  const selectOption = useCallback(
    (optValue: string) => {
      onChange(optValue)
      close()
    },
    [onChange, close]
  )

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (dropdownRef.current?.contains(target)) return
      if (triggerRef.current?.contains(target)) return
      close()
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }

    function handleScroll() {
      if (!triggerRef.current || !isOpen) return
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownStyle((prev) => ({
        ...prev,
        left: rect.left,
        width: rect.width,
        top: prev.top !== undefined ? rect.bottom + 4 : undefined,
        bottom: prev.bottom !== undefined ? window.innerHeight - rect.top + 4 : undefined,
      }))
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [isOpen, close])

  useEffect(() => {
    if (isOpen && searchable) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [isOpen, searchable])

  useEffect(() => {
    if (!isOpen) return
    setActiveIndex(-1)
  }, [search, isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        toggle()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1))
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, 0))
        break
      }
      case 'Enter': {
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          selectOption(filteredOptions[activeIndex].value)
        }
        break
      }
      case 'Tab': {
        close()
        break
      }
    }
  }

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.children
      if (items[activeIndex]) {
        const el = items[activeIndex] as HTMLElement
        el.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex])

  const dropdown = isOpen && createPortal(
    <div
      ref={dropdownRef}
      className="cl-custom-select-dropdown"
      style={dropdownStyle}
    >
      {searchable && (
        <div className="cl-custom-select-search">
          <input
            ref={searchInputRef}
            type="text"
            className="cl-custom-select-search-input"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault()
                if (e.key === 'ArrowDown') setActiveIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1))
                if (e.key === 'ArrowUp') setActiveIndex((prev) => Math.max(prev - 1, 0))
              }
            }}
          />
        </div>
      )}
      <ul ref={listRef} className="cl-custom-select-list" role="listbox">
        {filteredOptions.length === 0 ? (
          <li className="cl-custom-select-empty">No options found</li>
        ) : (
          filteredOptions.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={`cl-custom-select-option ${option.value === value ? 'is-selected' : ''} ${index === activeIndex ? 'is-focused' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                selectOption(option.value)
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span className="cl-custom-select-option-label">{option.label}</span>
              {option.description && (
                <span className="cl-custom-select-option-desc">{option.description}</span>
              )}
              {option.value === value && (
                <span className="cl-custom-select-check" aria-hidden="true" />
              )}
            </li>
          ))
        )}
      </ul>
    </div>,
    document.body
  )

  return (
    <div className="cl-custom-select-wrapper" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="cl-form-label">
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={`cl-custom-select-trigger ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? id : undefined}
      >
        <span className={`cl-custom-select-value ${!selectedOption ? 'is-placeholder' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`cl-custom-select-chevron ${isOpen ? 'is-open' : ''}`}
          aria-hidden="true"
        />
      </button>
      {dropdown}
    </div>
  )
}
