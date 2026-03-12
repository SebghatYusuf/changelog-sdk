'use client'

import { CodeBlock } from '../../_components/CodeBlock'
import { useActiveSection } from '../../_components/useActiveSection'

const SECTION_IDS = ['types', 'schemas', 'utilities'] as const

export default function TypesPage() {
  const activeSection = useActiveSection(SECTION_IDS)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <main className="docs-main">
        <section id="types" className="docs-section">
          <div className="docs-eyebrow">API Reference</div>
          <h1 className="docs-h1">TypeScript Types</h1>
          <p className="docs-p">
            All public types and schemas are exported from <code className="docs-code-inline">changelog-sdk/core</code>.
          </p>

          <div className="api-card">
            <div className="api-card-header">
              <span className="api-method">type</span>
              <span className="api-fn-name">ChangelogEntry</span>
            </div>
            <div className="api-card-body">
              <CodeBlock code={`import type {
  ChangelogEntry,
  ChangelogStatus,
  ChangelogTag,
  CreateChangelogInput,
  UpdateChangelogInput,
  EnhanceChangelogInput,
  EnhanceChangelogOutput,
  FeedResponse,
  AISettingsInput,
  AIModelOption,
  AIProviderKind,
} from 'changelog-sdk/core'`} />
            </div>
          </div>
        </section>

        <section id="schemas" className="docs-section">
          <h2 className="docs-h2">Zod Schemas</h2>

          <div className="api-card">
            <div className="api-card-header">
              <span className="api-method">schema</span>
              <span className="api-fn-name">Zod Schemas</span>
            </div>
            <div className="api-card-body">
              <CodeBlock code={`import {
  CreateChangelogSchema,
  UpdateChangelogSchema,
  EnhanceChangelogSchema,
  ChangelogEntrySchema,
  ChangelogTagEnum,
  ChangelogStatusEnum,
  AIProviderEnum,
  AISettingsSchema,
  ChangelogSettingsSchema,
  FeedFiltersSchema,
  LoginSchema,
} from 'changelog-sdk/core'`} />
            </div>
          </div>
        </section>

        <section id="utilities" className="docs-section">
          <h2 className="docs-h2">Version Utilities</h2>
          <p className="docs-p">Helpers for parsing, normalizing, and comparing semantic versions.</p>
          <CodeBlock code={`import { normalizeSemver, parseSemver, compareSemver } from 'changelog-sdk/core'

normalizeSemver('v1.2.3')      // '1.2.3'
parseSemver('1.2.3')           // [1, 2, 3]
compareSemver('1.3.0', '1.2.0') // 1 (a > b)`} />
        </section>
      </main>

      <nav className="docs-toc">
        <div className="toc-label">On this page</div>
        <button className={`toc-link${activeSection === 'types' ? ' active' : ''}`} onClick={() => scrollTo('types')}>TypeScript Types</button>
        <button className={`toc-link${activeSection === 'schemas' ? ' active' : ''}`} onClick={() => scrollTo('schemas')}>Zod Schemas</button>
        <button className={`toc-link${activeSection === 'utilities' ? ' active' : ''}`} onClick={() => scrollTo('utilities')}>Version Utilities</button>
      </nav>
    </>
  )
}
