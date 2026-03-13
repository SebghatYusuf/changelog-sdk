'use client'

import { CodeBlock } from './_components/CodeBlock'
import { InstallBlock } from './_components/InstallBlock'
import { useActiveSection } from './_components/useActiveSection'
import { toSitePath } from '../../src/site-paths'

const SECTION_IDS = [
  'introduction',
  'installation',
  'env-vars',
  'frameworks',
] as const
const FRAMEWORKS_HREF = toSitePath('docs/frameworks/')

const ENV_VARS = [
  { key: 'CHANGELOG_MONGODB_URI',          req: 'Required',     desc: 'MongoDB connection string (Atlas or self-hosted)' },
  { key: 'CHANGELOG_SESSION_SECRET',        req: 'Recommended',  desc: 'Session signing secret (min 32 characters)' },
  { key: 'CHANGELOG_ALLOW_ADMIN_REGISTRATION', req: 'Optional',  desc: 'Set to true to keep admin registration available in the login UI. Fallback: Next.js → NEXT_PUBLIC_ then PUBLIC_; Nuxt → NUXT_PUBLIC_ then PUBLIC_; Express → PUBLIC_ only.' },
  { key: 'CHANGELOG_ENCRYPTION_KEY',        req: 'Required (repo tokens)',  desc: '32-byte key used to encrypt repository access tokens' },
  { key: 'CHANGELOG_AI_PROVIDER',           req: 'Optional',     desc: 'AI provider: openai, gemini, or ollama' },
  { key: 'OPENAI_API_KEY',                  req: 'If OpenAI',    desc: 'API key for OpenAI provider' },
  { key: 'GOOGLE_GENERATIVE_AI_API_KEY',    req: 'If Gemini',    desc: 'API key for Google Gemini provider' },
  { key: 'OLLAMA_BASE_URL',                 req: 'If Ollama',    desc: 'Base URL for local Ollama instance (e.g. http://localhost:11434)' },
  { key: 'CHANGELOG_RATE_LIMIT',            req: 'Optional',     desc: 'AI calls per minute. Default: 10' },
]

export default function DocsPage() {
  const activeSection = useActiveSection(SECTION_IDS)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <main className="docs-main">
        <section id="introduction" className="docs-section">
          <div className="docs-eyebrow">Get Started</div>
          <h1 className="docs-h1">Changelog SDK</h1>
          <p className="docs-p">
            A framework-agnostic, AI-powered changelog SDK with a headless core and production-ready adapters for Next.js, Nuxt 3, Vue 3, and Express.
          </p>
          <p className="docs-p">
            Built for teams that ship fast and care about keeping users informed. Drop in a public changelog feed, a secure admin portal, and AI-assisted release writing — all isolated from your host app&apos;s styles.
          </p>

          <div className="docs-callout">
            <div className="docs-callout-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            </div>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>Requirements: </strong>
              Node.js &gt;= 20, Next.js &gt;= 15 (optimized for 16+), React &gt;= 18, MongoDB database.
            </div>
          </div>

          <h2 className="docs-h2">Package Surfaces</h2>
          <ul className="docs-ul">
            <li><code className="docs-code-inline">changelog-sdk</code> / <code className="docs-code-inline">changelog-sdk/core</code> — framework-agnostic core service, ports, and schemas</li>
            <li><code className="docs-code-inline">changelog-sdk/next</code> — Next.js server actions and React UI components</li>
            <li><code className="docs-code-inline">changelog-sdk/mongoose</code> — MongoDB Mongoose repository adapters</li>
            <li><code className="docs-code-inline">changelog-sdk/nuxt</code> — Nuxt/Nitro server handlers (headless API)</li>
            <li><code className="docs-code-inline">changelog-sdk/vue</code> — Vue 3 UI components (headless API client)</li>
            <li><code className="docs-code-inline">changelog-sdk/express</code> — Express router + handlers for the REST API</li>
            <li><code className="docs-code-inline">changelog-sdk/react</code> — React UI components that talk to any REST backend</li>
          </ul>

          <h2 className="docs-h2">Routes provided</h2>
          <ul className="docs-ul">
            <li><code className="docs-code-inline">/changelog</code> — public changelog timeline with search, tag filters, pagination</li>
            <li><code className="docs-code-inline">/changelog/login</code> — admin login</li>
            <li><code className="docs-code-inline">/changelog/admin</code> — admin dashboard: create, edit, delete, AI-enhance</li>
            <li><code className="docs-code-inline">/changelog/admin/repo</code> — repository connection & commit generator</li>
          </ul>
        </section>

        <section id="installation" className="docs-section">
          <h2 className="docs-h2">Installation</h2>
          <p className="docs-p">Install from npm with your package manager of choice:</p>
          <InstallBlock />

          <h3 className="docs-h3">Optional: AI Enhancement providers</h3>
          <p className="docs-p">If you want AI-powered changelog enhancement, install your provider SDK:</p>
          <CodeBlock
            code={`# OpenAI
bun add ai @ai-sdk/openai

# Google Gemini
bun add ai @ai-sdk/google

# Ollama (local)
bun add ai ollama-ai-provider-v2`}
          />
        </section>

        <section id="env-vars" className="docs-section">
          <h2 className="docs-h2">Environment Variables</h2>
          <p className="docs-p">Create a <code className="docs-code-inline">.env.local</code> file in your project root:</p>
          <CodeBlock
            filename=".env.local"
            code={`# MongoDB
CHANGELOG_MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/changelog

# Session signing secret (min 32 characters)
CHANGELOG_SESSION_SECRET=your-random-secret-at-least-32-chars

# Encryption key for repository tokens (32 bytes, base64 or hex)
CHANGELOG_ENCRYPTION_KEY=base64:your-32-byte-key

# Create the first admin account:
# bun run create:admin your-admin@email.com your-password "Admin"

# Optional: allow registration through UI
# CHANGELOG_ALLOW_ADMIN_REGISTRATION=true
# Next.js fallback (optional): NEXT_PUBLIC_CHANGELOG_ALLOW_ADMIN_REGISTRATION=true
# Nuxt fallback (optional): NUXT_PUBLIC_CHANGELOG_ALLOW_ADMIN_REGISTRATION=true
# Generic fallback (optional): PUBLIC_CHANGELOG_ALLOW_ADMIN_REGISTRATION=true

# AI provider: openai | gemini | ollama
CHANGELOG_AI_PROVIDER=openai

# Provider credentials (only the one you're using)
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...
OLLAMA_BASE_URL=http://localhost:11434

# Optional: rate limit AI calls per minute (default: 10)
CHANGELOG_RATE_LIMIT=10`}
          />

          <div className="code-window" style={{ marginTop: '1.5rem' }}>
            <table className="env-table">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {ENV_VARS.map(v => (
                  <tr key={v.key}>
                    <td>{v.key}</td>
                    <td>
                      <span className={v.req === 'Required' ? 'badge-req' : v.req === 'Optional' ? 'badge-opt' : 'badge-cond'}>
                        {v.req}
                      </span>
                    </td>
                    <td>{v.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="frameworks" className="docs-section">
          <h2 className="docs-h2">Framework Setup</h2>
          <p className="docs-p">
            All framework-specific instructions live on the dedicated Framework Setup page.
          </p>
          <div className="docs-callout">
            <div className="docs-callout-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div>Open <a className="docs-link" href={FRAMEWORKS_HREF}>Framework Setup</a> for Next.js, Nuxt 3, Vue 3, and Express guides.</div>
          </div>
        </section>
      </main>

      <nav className="docs-toc">
        <div className="toc-label">On this page</div>
        <button className={`toc-link${activeSection === 'introduction' ? ' active' : ''}`} onClick={() => scrollTo('introduction')}>Introduction</button>
        <button className={`toc-link toc-link-sub${activeSection === 'introduction' ? ' active' : ''}`} onClick={() => scrollTo('introduction')}>Package surfaces</button>
        <button className={`toc-link${activeSection === 'installation' ? ' active' : ''}`} onClick={() => scrollTo('installation')}>Installation</button>
        <button className={`toc-link${activeSection === 'env-vars' ? ' active' : ''}`} onClick={() => scrollTo('env-vars')}>Environment Variables</button>
        <button className={`toc-link${activeSection === 'frameworks' ? ' active' : ''}`} onClick={() => scrollTo('frameworks')}>Framework Setup</button>
      </nav>
    </>
  )
}
