'use client'

import { CodeBlock } from '../../_components/CodeBlock'
import { useActiveSection } from '../../_components/useActiveSection'

const SECTION_IDS = ['ai-guide', 'workflow', 'rate-limit', 'ollama'] as const

export default function AIGuidePage() {
  const activeSection = useActiveSection(SECTION_IDS)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <main className="docs-main">
        <section id="ai-guide" className="docs-section">
          <div className="docs-eyebrow">Guide</div>
          <h1 className="docs-h1">AI Enhancement</h1>
          <p className="docs-p">
            The SDK supports three AI providers. Set <code className="docs-code-inline">CHANGELOG_AI_PROVIDER</code> to <code className="docs-code-inline">openai</code>, <code className="docs-code-inline">gemini</code>, or <code className="docs-code-inline">ollama</code>, then supply the appropriate credential.
          </p>
        </section>

        <section id="workflow" className="docs-section">
          <h2 className="docs-h2">Workflow</h2>
          <ul className="docs-ul">
            <li>In the admin portal, enter raw release notes in the AI input field</li>
            <li>Click <strong style={{ color: 'var(--text-main)' }}>Enhance with AI</strong></li>
            <li>The SDK calls your configured provider and generates a title, markdown body, and suggested tags</li>
            <li>Review, edit if needed, then publish</li>
          </ul>
        </section>

        <section id="rate-limit" className="docs-section">
          <h2 className="docs-h2">Rate Limiting</h2>
          <p className="docs-p">
            Use <code className="docs-code-inline">CHANGELOG_RATE_LIMIT</code> to cap AI calls per minute. Defaults to <code className="docs-code-inline">10</code>.
          </p>
        </section>

        <section id="ollama" className="docs-section">
          <h2 className="docs-h2">Ollama (Local)</h2>
          <p className="docs-p">For local inference without API costs, set <code className="docs-code-inline">CHANGELOG_AI_PROVIDER=ollama</code> and point <code className="docs-code-inline">OLLAMA_BASE_URL</code> to your running Ollama instance.</p>
          <CodeBlock code={`CHANGELOG_AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434`} filename=".env.local" />
        </section>
      </main>

      <nav className="docs-toc">
        <div className="toc-label">On this page</div>
        <button className={`toc-link${activeSection === 'ai-guide' ? ' active' : ''}`} onClick={() => scrollTo('ai-guide')}>Overview</button>
        <button className={`toc-link${activeSection === 'workflow' ? ' active' : ''}`} onClick={() => scrollTo('workflow')}>Workflow</button>
        <button className={`toc-link${activeSection === 'rate-limit' ? ' active' : ''}`} onClick={() => scrollTo('rate-limit')}>Rate Limiting</button>
        <button className={`toc-link${activeSection === 'ollama' ? ' active' : ''}`} onClick={() => scrollTo('ollama')}>Ollama (Local)</button>
      </nav>
    </>
  )
}
