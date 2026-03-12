'use client'

import { useActiveSection } from '../../_components/useActiveSection'

const SECTION_IDS = ['styling', 'utilities', 'isolation'] as const

export default function StylingGuidePage() {
  const activeSection = useActiveSection(SECTION_IDS)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <main className="docs-main">
        <section id="styling" className="docs-section">
          <div className="docs-eyebrow">Guide</div>
          <h1 className="docs-h1">Styling & CSS Isolation</h1>
          <p className="docs-p">
            All SDK UI classes are prefixed with <code className="docs-code-inline">cl-</code> to avoid conflicts with your existing design system. The stylesheet is imported automatically via the changelog layout file.
          </p>
        </section>

        <section id="utilities" className="docs-section">
          <h2 className="docs-h2">Available Utility Groups</h2>
          <ul className="docs-ul">
            <li><strong style={{ color: 'var(--text-main)' }}>Typography</strong> — <code className="docs-code-inline">cl-h1</code>, <code className="docs-code-inline">cl-h2</code>, <code className="docs-code-inline">cl-p</code>, <code className="docs-code-inline">cl-code</code></li>
            <li><strong style={{ color: 'var(--text-main)' }}>Components</strong> — <code className="docs-code-inline">cl-card</code>, <code className="docs-code-inline">cl-btn</code>, <code className="docs-code-inline">cl-input</code>, <code className="docs-code-inline">cl-badge</code>, <code className="docs-code-inline">cl-alert</code></li>
            <li><strong style={{ color: 'var(--text-main)' }}>Layout</strong> — <code className="docs-code-inline">cl-container</code>, <code className="docs-code-inline">cl-section</code>, <code className="docs-code-inline">cl-grid</code></li>
            <li><strong style={{ color: 'var(--text-main)' }}>Utilities</strong> — <code className="docs-code-inline">cl-transition</code>, <code className="docs-code-inline">cl-truncate</code>, <code className="docs-code-inline">cl-line-clamp-2</code></li>
          </ul>
        </section>

        <section id="isolation" className="docs-section">
          <div className="docs-callout">
            <div className="docs-callout-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>Avoid overriding <code className="docs-code-inline">cl-</code> prefixed selectors globally. If you must customize, use the <code className="docs-code-inline">changelog-sdk.css</code> layer import in your global stylesheet.</div>
          </div>
        </section>
      </main>

      <nav className="docs-toc">
        <div className="toc-label">On this page</div>
        <button className={`toc-link${activeSection === 'styling' ? ' active' : ''}`} onClick={() => scrollTo('styling')}>Overview</button>
        <button className={`toc-link${activeSection === 'utilities' ? ' active' : ''}`} onClick={() => scrollTo('utilities')}>Utilities</button>
        <button className={`toc-link${activeSection === 'isolation' ? ' active' : ''}`} onClick={() => scrollTo('isolation')}>Isolation</button>
      </nav>
    </>
  )
}
