'use client'

import { useEffect, useState } from 'react'

export function useActiveSection(sectionIds: readonly string[], offset = 140) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? '')

  useEffect(() => {
    if (sectionIds.length === 0) return

    let ticking = false
    const updateActiveSection = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        let current = sectionIds[0]
        for (const id of sectionIds) {
          const section = document.getElementById(id)
          if (!section) continue
          const top = section.getBoundingClientRect().top
          if (top - offset <= 0) current = id
        }
        setActiveSection(current)
        ticking = false
      })
    }

    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)
    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [sectionIds, offset])

  return activeSection
}
