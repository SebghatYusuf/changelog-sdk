'use client'

import { CodeBlock } from '../../_components/CodeBlock'
import { useActiveSection } from '../../_components/useActiveSection'

const SECTION_IDS = ['server-actions', 'core-crud', 'ai-enhance', 'repo-commits'] as const

export default function ServerActionsPage() {
  const activeSection = useActiveSection(SECTION_IDS)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <main className="docs-main">
        <section id="server-actions" className="docs-section">
          <div className="docs-eyebrow">API Reference</div>
          <h1 className="docs-h1">Server Actions</h1>
          <p className="docs-p">All server actions are imported from <code className="docs-code-inline">changelog-sdk/next</code>. They are fully typed and Zod-validated.</p>
        </section>

        <section id="core-crud" className="docs-section">
          <h2 className="docs-h2">Core CRUD</h2>

          <div className="api-card">
            <div className="api-card-header">
              <span className="api-method api-method-async">async</span>
              <span className="api-fn-name">createChangelog(input)</span>
            </div>
            <div className="api-card-body">
              <p className="docs-p" style={{ marginBottom: '0.75rem' }}>Create a new changelog entry. Returns the created entry or an error.</p>
              <CodeBlock code={`import { createChangelog } from 'changelog-sdk/next'

const result = await createChangelog({
  title: 'v1.2.0 Released',
  content: '## Features\\n- New feature\\n\\n## Fixes\\n- Bug fix',
  version: '1.2.0',
  status: 'published',
  tags: ['Features', 'Fixes'],
})`} />
            </div>
          </div>

          <div className="api-card">
            <div className="api-card-header">
              <span className="api-method api-method-async">async</span>
              <span className="api-fn-name">fetchPublishedChangelogs(page, limit, tags?, search?)</span>
            </div>
            <div className="api-card-body">
              <p className="docs-p" style={{ marginBottom: '0.75rem' }}>Fetch paginated published entries with optional tag and search filtering.</p>
              <CodeBlock code={`import { fetchPublishedChangelogs } from 'changelog-sdk/next'

const result = await fetchPublishedChangelogs(
  1,       // page
  10,      // limit
  ['Features', 'Fixes'], // tags filter (optional)
  'dark mode'            // search query (optional)
)`} />
            </div>
          </div>
        </section>

        <section id="ai-enhance" className="docs-section">
          <h2 className="docs-h2">AI Enhancement</h2>

          <div className="api-card">
            <div className="api-card-header">
              <span className="api-method api-method-async">async</span>
              <span className="api-fn-name">runAIEnhance(input)</span>
            </div>
            <div className="api-card-body">
              <p className="docs-p" style={{ marginBottom: '0.75rem' }}>Enhance raw release notes into a polished changelog entry using the configured AI provider.</p>
              <CodeBlock code={`import { runAIEnhance } from 'changelog-sdk/next'

const result = await runAIEnhance({
  rawNotes: 'Fixed auth bug, added dark mode, improved performance',
  currentVersion: '1.2.0',
})
// result: { title, content, tags, version }`} />
            </div>
          </div>
        </section>

        <section id="repo-commits" className="docs-section">
          <h2 className="docs-h2">Repository Commits</h2>

          <div className="api-card">
            <div className="api-card-header">
              <span className="api-method api-method-async">async</span>
              <span className="api-fn-name">generateChangelogFromCommits(input)</span>
            </div>
            <div className="api-card-body">
              <p className="docs-p" style={{ marginBottom: '0.75rem' }}>Generate a draft changelog from repository commits in a date range.</p>
              <CodeBlock code={`import { generateChangelogFromCommits } from 'changelog-sdk/next'

const result = await generateChangelogFromCommits({
  since: '2025-01-01',
  until: '2025-01-07',
  limit: 50,
})`} />
            </div>
          </div>
        </section>
      </main>

      <nav className="docs-toc">
        <div className="toc-label">On this page</div>
        <button className={`toc-link${activeSection === 'server-actions' ? ' active' : ''}`} onClick={() => scrollTo('server-actions')}>Server Actions</button>
        <button className={`toc-link${activeSection === 'core-crud' ? ' active' : ''}`} onClick={() => scrollTo('core-crud')}>Core CRUD</button>
        <button className={`toc-link${activeSection === 'ai-enhance' ? ' active' : ''}`} onClick={() => scrollTo('ai-enhance')}>AI Enhancement</button>
        <button className={`toc-link${activeSection === 'repo-commits' ? ' active' : ''}`} onClick={() => scrollTo('repo-commits')}>Repository Commits</button>
      </nav>
    </>
  )
}
