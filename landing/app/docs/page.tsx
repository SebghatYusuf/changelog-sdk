'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toSitePath } from '../../src/site-paths'

const HOME_HREF = toSitePath('')
const DOCS_HREF = toSitePath('docs/')

// ── Icons ────────────────────────────────────────────────────────────────────
const LogoIcon = () => (
  <img src={toSitePath('images/changelog-sdk-icon.svg')} width="28" height="28" alt="Changelog SDK" style={{ display: 'block' }} />
)
const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
)

// ── Code Block ───────────────────────────────────────────────────────────────
function CodeBlock({ code, filename }: { code: string; filename?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className="code-window" style={{ margin: '1.25rem 0' }}>
      {filename && (
        <div className="code-window-header">
          <div className="code-dots">
            <div className="code-dot dot-red" />
            <div className="code-dot dot-yellow" />
            <div className="code-dot dot-green" />
          </div>
          <div className="code-file">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            {filename}
          </div>
          <button
            onClick={copy}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--primary)' : 'var(--text-dim)', padding: 0, display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontFamily: 'var(--font-sans)' }}
          >
            {copied ? (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Copied</>
            ) : (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg> Copy</>
            )}
          </button>
        </div>
      )}
      <div className="code-body">
        <pre style={{ margin: 0, color: 'var(--text-muted)', whiteSpace: 'pre', overflowX: 'auto' }}>{code}</pre>
      </div>
    </div>
  )
}

// ── Install Tabs ─────────────────────────────────────────────────────────────
const PM_TABS = ['bun', 'npm', 'yarn', 'pnpm'] as const
const PM_CMDS: Record<typeof PM_TABS[number], string> = {
  bun:  'bun add github:SebghatYusuf/changelog-sdk#master',
  npm:  'npm install github:SebghatYusuf/changelog-sdk#master',
  yarn: 'yarn add github:SebghatYusuf/changelog-sdk#master',
  pnpm: 'pnpm add github:SebghatYusuf/changelog-sdk#master',
}

function InstallBlock() {
  const [active, setActive] = useState<typeof PM_TABS[number]>('bun')
  return (
    <div className="code-window" style={{ margin: '1.25rem 0' }}>
      <div className="code-window-header" style={{ padding: 0 }}>
        <div className="tabs" style={{ width: '100%', borderBottom: 'none' }}>
          {PM_TABS.map(t => (
            <button key={t} className={`tab${active === t ? ' active' : ''}`} onClick={() => setActive(t)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="code-body">
        <pre style={{ margin: 0, color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--text-dim)', marginRight: '0.75rem' }}>$</span>
          {PM_CMDS[active]}
        </pre>
      </div>
    </div>
  )
}

// ── Framework Code Examples ──────────────────────────────────────────────────
const FW_TABS = ['Next.js', 'Nuxt 3', 'Vue 3', 'Express'] as const
const SECTION_IDS = [
  'introduction',
  'installation',
  'env-vars',
  'frameworks',
  'api-actions',
  'api-types',
  'ai-guide',
  'repo-guide',
  'styling',
] as const

const NEXTJS_LAYOUT = `// app/changelog/layout.tsx
import 'changelog-sdk/styles'

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}`

const NEXTJS_PAGE = `// app/changelog/[[...route]]/page.tsx
import { Suspense } from 'react'
import { ChangelogManager } from 'changelog-sdk/next'

interface ChangelogPageProps {
  params: Promise<{ route?: string[] }>
  searchParams: Promise<{ page?: string; tags?: string; search?: string }>
}

export const metadata = {
  title: 'Changelog',
  description: 'View our latest updates and improvements',
}

export default function ChangelogPage(props: ChangelogPageProps) {
  return (
    <Suspense>
      <ChangelogPageContent {...props} />
    </Suspense>
  )
}

async function ChangelogPageContent({
  params,
  searchParams,
}: ChangelogPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ])
  return (
    <ChangelogManager
      params={resolvedParams}
      searchParams={resolvedSearchParams}
    />
  )
}`

const NUXT_HANDLERS = `// server/api/changelog/feed.get.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.getPublishedFeed

// server/api/changelog/entries.post.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.createEntry

// server/api/changelog/entries/[id].delete.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.deleteEntry

// server/api/changelog/admin/login.post.ts
import { createNuxtChangelogHandlers } from 'changelog-sdk/nuxt'
const handlers = createNuxtChangelogHandlers()
export default handlers.login`

const NUXT_PAGE = `<!-- pages/changelog/[[...route]].vue -->
<script setup lang="ts">
import { ChangelogManager } from 'changelog-sdk/vue'
import 'changelog-sdk/styles'

const route = useRoute()
const params = {
  route: Array.isArray(route.params.route)
    ? route.params.route
    : [String(route.params.route || '')]
}
const searchParams = route.query as {
  page?: string
  tags?: string
  search?: string
}
</script>

<template>
  <ChangelogManager :params="params" :searchParams="searchParams" />
</template>`

const VUE3_SETUP = `// main.ts or in your component
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import 'changelog-sdk/styles'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/changelog/:route(.*)*',
      component: () => import('./pages/Changelog.vue'),
    },
  ],
})`

const VUE3_COMPONENT = `<!-- pages/Changelog.vue -->
<script setup lang="ts">
import { ChangelogManager } from 'changelog-sdk/vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const params = {
  route: Array.isArray(route.params.route)
    ? route.params.route
    : [String(route.params.route || '')]
}
const searchParams = route.query as {
  page?: string
  tags?: string
  search?: string
}
</script>

<template>
  <ChangelogManager
    :params="params"
    :searchParams="searchParams"
    apiBasePath="/api/changelog"
  />
</template>`

const EXPRESS_EXAMPLE = `// server.ts
import express from 'express'
import { createChangelog, fetchPublishedChangelogs } from 'changelog-sdk/core'
import { MongooseChangelogRepository } from 'changelog-sdk/mongoose'

const app = express()
app.use(express.json())

// Initialize repository
const repo = new MongooseChangelogRepository()

// Public feed
app.get('/api/changelog', async (req, res) => {
  const { page = '1', tags, search } = req.query
  const result = await fetchPublishedChangelogs(
    { repository: repo },
    Number(page),
    10,
    tags ? String(tags).split(',') : undefined,
    search ? String(search) : undefined
  )
  res.json(result)
})

// Create entry (protect with your auth middleware)
app.post('/api/changelog', async (req, res) => {
  const result = await createChangelog(
    { repository: repo },
    req.body
  )
  res.json(result)
})

app.listen(3000)`

// ── Env Vars ─────────────────────────────────────────────────────────────────
const ENV_VARS = [
  { key: 'CHANGELOG_MONGODB_URI',          req: 'Required',     desc: 'MongoDB connection string (Atlas or self-hosted)' },
  { key: 'CHANGELOG_SESSION_SECRET',        req: 'Recommended',  desc: 'Session signing secret (min 32 characters)' },
  { key: 'CHANGELOG_ALLOW_ADMIN_REGISTRATION', req: 'Optional',  desc: 'Set to true to keep admin registration available in the login UI' },
  { key: 'CHANGELOG_ENCRYPTION_KEY',        req: 'Required (repo tokens)',  desc: '32-byte key used to encrypt repository access tokens' },
  { key: 'CHANGELOG_AI_PROVIDER',           req: 'Optional',     desc: 'AI provider: openai, gemini, or ollama' },
  { key: 'OPENAI_API_KEY',                  req: 'If OpenAI',    desc: 'API key for OpenAI provider' },
  { key: 'GOOGLE_GENERATIVE_AI_API_KEY',    req: 'If Gemini',    desc: 'API key for Google Gemini provider' },
  { key: 'OLLAMA_BASE_URL',                 req: 'If Ollama',    desc: 'Base URL for local Ollama instance (e.g. http://localhost:11434)' },
  { key: 'CHANGELOG_RATE_LIMIT',            req: 'Optional',     desc: 'AI calls per minute. Default: 10' },
]

// ── Main Page ────────────────────────────────────────────────────────────────
export default function DocsPage() {
  const [activeFramework, setActiveFramework] = useState<typeof FW_TABS[number]>('Next.js')
  const [activeSidebarItem, setActiveSidebarItem] = useState('introduction')

  const scrollTo = (id: string) => {
    setActiveSidebarItem(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const resolveFrameworkId = () => {
      if (activeFramework === 'Nuxt 3') return 'nuxt'
      if (activeFramework === 'Vue 3') return 'vue'
      if (activeFramework === 'Express') return 'express'
      return 'nextjs'
    }

    let ticking = false
    const updateActiveSection = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const offset = 140
        let current = SECTION_IDS[0]
        for (const id of SECTION_IDS) {
          const section = document.getElementById(id)
          if (!section) continue
          const top = section.getBoundingClientRect().top
          if (top - offset <= 0) {
            current = id
          }
        }

        if (current === 'frameworks') {
          setActiveSidebarItem(resolveFrameworkId())
        } else {
          setActiveSidebarItem(current)
        }
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
  }, [activeFramework])

  return (
    <div className="docs-page">
      {/* ── Header ── */}
      <header className="header">
        <div className="container header-inner">
          <Link href={HOME_HREF} className="logo">
            <LogoIcon />
            Changelog SDK
          </Link>
          <nav className="nav-links">
            <Link href={DOCS_HREF} className="nav-link" style={{ color: 'var(--primary)' }}>Docs</Link>
            <Link href={HOME_HREF} className="nav-link">Home</Link>
            <a href="https://github.com/SebghatYusuf/changelog-sdk" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <GithubIcon /> GitHub
            </a>
          </nav>
        </div>
      </header>

      <div className="container docs-layout">
        {/* ── Sidebar ── */}
        <aside className="docs-sidebar">
          <div className="sidebar-group">
            <div className="sidebar-group-title">Getting Started</div>
            <button className={`sidebar-link${activeSidebarItem === 'introduction' ? ' active' : ''}`} onClick={() => scrollTo('introduction')}>Introduction</button>
            <button className={`sidebar-link${activeSidebarItem === 'installation' ? ' active' : ''}`} onClick={() => scrollTo('installation')}>Installation</button>
            <button className={`sidebar-link${activeSidebarItem === 'env-vars' ? ' active' : ''}`} onClick={() => scrollTo('env-vars')}>Environment Variables</button>
          </div>
          <div className="sidebar-group">
            <div className="sidebar-group-title">Framework Setup</div>
            <button className={`sidebar-link${activeSidebarItem === 'nextjs' ? ' active' : ''}`} onClick={() => { setActiveFramework('Next.js'); scrollTo('frameworks') }}>Next.js</button>
            <button className={`sidebar-link${activeSidebarItem === 'nuxt' ? ' active' : ''}`} onClick={() => { setActiveFramework('Nuxt 3'); scrollTo('frameworks') }}>Nuxt 3</button>
            <button className={`sidebar-link${activeSidebarItem === 'vue' ? ' active' : ''}`} onClick={() => { setActiveFramework('Vue 3'); scrollTo('frameworks') }}>Vue 3</button>
            <button className={`sidebar-link${activeSidebarItem === 'express' ? ' active' : ''}`} onClick={() => { setActiveFramework('Express'); scrollTo('frameworks') }}>Express</button>
          </div>
          <div className="sidebar-group">
            <div className="sidebar-group-title">API Reference</div>
            <button className={`sidebar-link${activeSidebarItem === 'api-actions' ? ' active' : ''}`} onClick={() => scrollTo('api-actions')}>Server Actions</button>
            <button className={`sidebar-link${activeSidebarItem === 'api-types' ? ' active' : ''}`} onClick={() => scrollTo('api-types')}>TypeScript Types</button>
          </div>
          <div className="sidebar-group">
            <div className="sidebar-group-title">Guides</div>
            <button className={`sidebar-link${activeSidebarItem === 'ai-guide' ? ' active' : ''}`} onClick={() => scrollTo('ai-guide')}>AI Enhancement</button>
            <button className={`sidebar-link${activeSidebarItem === 'repo-guide' ? ' active' : ''}`} onClick={() => scrollTo('repo-guide')}>Repository Integration</button>
            <button className={`sidebar-link${activeSidebarItem === 'styling' ? ' active' : ''}`} onClick={() => scrollTo('styling')}>Styling & Isolation</button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="docs-main">

          {/* Introduction */}
          <section id="introduction" className="docs-section">
            <div className="docs-eyebrow">Get Started</div>
            <h1 className="docs-h1">Changelog SDK</h1>
            <p className="docs-p">
              A framework-agnostic, AI-powered changelog SDK with a headless core and production-ready adapters for Next.js, Nuxt 3, Vue 3, and Express.
            </p>
            <p className="docs-p">
              Built for teams that ship fast and care about keeping users informed. Drop in a public changelog feed, a secure admin portal, and AI-assisted release writing — all isolated from your host app's styles.
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
            </ul>

            <h2 className="docs-h2">Routes provided</h2>
            <ul className="docs-ul">
              <li><code className="docs-code-inline">/changelog</code> — public changelog timeline with search, tag filters, pagination</li>
              <li><code className="docs-code-inline">/changelog/login</code> — admin login</li>
              <li><code className="docs-code-inline">/changelog/admin</code> — admin dashboard: create, edit, delete, AI-enhance</li>
              <li><code className="docs-code-inline">/changelog/admin/repo</code> — repository connection & commit generator</li>
            </ul>
          </section>

          {/* Installation */}
          <section id="installation" className="docs-section">
            <h2 className="docs-h2">Installation</h2>
            <p className="docs-p">Install directly from GitHub with your package manager of choice:</p>
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

          {/* Environment Variables */}
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

          {/* Framework Setup */}
          <section id="frameworks" className="docs-section">
            <h2 className="docs-h2">Framework Setup</h2>
            <p className="docs-p">Pick your framework and follow the integration steps:</p>

            <div className="tabs" style={{ marginBottom: '1.5rem' }}>
              {FW_TABS.map(fw => (
                <button
                  key={fw}
                  className={`tab${activeFramework === fw ? ' active' : ''}`}
                  onClick={() => setActiveFramework(fw)}
                >
                  {fw}
                </button>
              ))}
            </div>

            {activeFramework === 'Next.js' && (
              <div>
                <h3 className="docs-h3">1. Add changelog layout</h3>
                <p className="docs-p">Create the layout file to load the SDK styles. This must be in the same directory as the catch-all route:</p>
                <CodeBlock filename="app/changelog/layout.tsx" code={NEXTJS_LAYOUT} />

                <h3 className="docs-h3">2. Add the catch-all route</h3>
                <p className="docs-p">
                  Create the page file. <code className="docs-code-inline">ChangelogManager</code> handles all three views: public feed, login, and admin.
                </p>
                <CodeBlock filename="app/changelog/[[...route]]/page.tsx" code={NEXTJS_PAGE} />

                <div className="docs-callout">
                  <div className="docs-callout-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <div>That&apos;s it for the Next.js adapter. Configure your env vars and run <code className="docs-code-inline">bun run dev</code>.</div>
                </div>
              </div>
            )}

            {activeFramework === 'Nuxt 3' && (
              <div>
                <h3 className="docs-h3">1. Install peer dependencies</h3>
                <p className="docs-p">The Nuxt adapter requires <code className="docs-code-inline">h3</code> and <code className="docs-code-inline">vue</code>:</p>
                <CodeBlock code="bun add h3 vue" />

                <h3 className="docs-h3">2. Define server API routes</h3>
                <p className="docs-p">Wire each Nuxt server route to the corresponding handler from <code className="docs-code-inline">changelog-sdk/nuxt</code>:</p>
                <CodeBlock filename="server/api/changelog/*.ts" code={NUXT_HANDLERS} />

                <h3 className="docs-h3">3. Render the Vue UI in your Nuxt page</h3>
                <p className="docs-p">Use the Vue 3 component that ships with the SDK. Extract route params from Nuxt&apos;s <code className="docs-code-inline">useRoute()</code>:</p>
                <CodeBlock filename="pages/changelog/[[...route]].vue" code={NUXT_PAGE} />
              </div>
            )}

            {activeFramework === 'Vue 3' && (
              <div>
                <h3 className="docs-h3">1. Configure Vue Router</h3>
                <p className="docs-p">Register a catch-all route in your Vue Router setup to handle all changelog sub-paths:</p>
                <CodeBlock filename="main.ts" code={VUE3_SETUP} />

                <h3 className="docs-h3">2. Create the Changelog page component</h3>
                <p className="docs-p">Import <code className="docs-code-inline">ChangelogManager</code> from <code className="docs-code-inline">changelog-sdk/vue</code> and pass it the route params:</p>
                <CodeBlock filename="pages/Changelog.vue" code={VUE3_COMPONENT} />

                <div className="docs-callout">
                  <div className="docs-callout-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  </div>
                  <div>
                    The Vue UI expects a backend API at <code className="docs-code-inline">/api/changelog</code>. Use the Nuxt adapter or your own Express server. Override with the <code className="docs-code-inline">apiBasePath</code> and <code className="docs-code-inline">baseUrl</code> props.
                  </div>
                </div>
              </div>
            )}

            {activeFramework === 'Express' && (
              <div>
                <h3 className="docs-h3">Headless API with Express</h3>
                <p className="docs-p">
                  Use the core service and Mongoose adapters directly to build a custom Express API. Pair it with the Vue 3 UI component, or build your own frontend.
                </p>
                <CodeBlock filename="server.ts" code={EXPRESS_EXAMPLE} />

                <div className="docs-callout">
                  <div className="docs-callout-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  </div>
                  <div>
                    The Express integration is headless — there are no pre-built UI components. Use <code className="docs-code-inline">changelog-sdk/vue</code> for the frontend or build your own UI using the API endpoints.
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* API Reference */}
          <section id="api-actions" className="docs-section">
            <h2 className="docs-h2">Server Actions</h2>
            <p className="docs-p">All server actions are imported from <code className="docs-code-inline">changelog-sdk/next</code>. They are fully typed and Zod-validated.</p>

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

            <div className="api-card">
              <div className="api-card-header">
                <span className="api-method api-method-async">async</span>
                <span className="api-fn-name">generateChangelogFromCommits(input)</span>
              </div>
              <div className="api-card-body">
                <p className="docs-p" style={{ marginBottom: '0.75rem' }}>Generate a draft changelog from a repository commit range.</p>
                <CodeBlock code={`import { generateChangelogFromCommits, updateRepoSettings } from 'changelog-sdk/next'

await updateRepoSettings({
  provider: 'git',
  repoUrl: 'https://github.com/org/repo',
  branch: 'main',
  token: 'ghp_...',
  enabled: true,
})

const result = await generateChangelogFromCommits({
  since: '2025-01-01',
  until: '2025-01-07',
  limit: 50,
})`} />
              </div>
            </div>

            <div className="api-card">
              <div className="api-card-header">
                <span className="api-method api-method-async">async</span>
                <span className="api-fn-name">loginAdmin / logoutAdmin / checkAdminAuth</span>
              </div>
              <div className="api-card-body">
                <p className="docs-p" style={{ marginBottom: '0.75rem' }}>Authentication helpers for the admin portal. Uses HTTP-only cookies and MongoDB-backed accounts.</p>
                <CodeBlock code={`import {
  loginAdmin,
  registerAdmin,
  canRegisterAdmin,
  logoutAdmin,
  checkAdminAuth,
} from 'changelog-sdk/next'

const isAdmin = await checkAdminAuth()
const canRegister = await canRegisterAdmin()
if (canRegister.success && canRegister.data?.canRegister) {
  await registerAdmin({ email: 'admin@example.com', password: 'strong-password', displayName: 'Admin' })
}
const result = await loginAdmin({ email: 'admin@example.com', password: 'strong-password' })
await logoutAdmin()`} />
              </div>
            </div>
          </section>

          {/* TypeScript Types */}
          <section id="api-types" className="docs-section">
            <h2 className="docs-h2">TypeScript Types</h2>
            <p className="docs-p">All core types are exported from <code className="docs-code-inline">changelog-sdk/core</code>:</p>
            <CodeBlock code={`import type {
  ChangelogEntry,
  ChangelogStatus,   // 'draft' | 'published'
  ChangelogTag,      // 'Features' | 'Fixes' | 'Improvements' | 'Breaking' | 'Security' | 'Performance' | 'Docs'
  CreateChangelogInput,
  UpdateChangelogInput,
  EnhanceChangelogInput,
  FeedResponse,
} from 'changelog-sdk/core'`} />
          </section>

          {/* AI Enhancement Guide */}
          <section id="ai-guide" className="docs-section">
            <h2 className="docs-h2">AI Enhancement</h2>
            <p className="docs-p">
              The SDK supports three AI providers. Set <code className="docs-code-inline">CHANGELOG_AI_PROVIDER</code> to <code className="docs-code-inline">openai</code>, <code className="docs-code-inline">gemini</code>, or <code className="docs-code-inline">ollama</code>, then supply the appropriate credential.
            </p>

            <h3 className="docs-h3">Workflow</h3>
            <ul className="docs-ul">
              <li>In the admin portal, enter raw release notes in the AI input field</li>
              <li>Click <strong style={{ color: 'var(--text-main)' }}>Enhance with AI</strong></li>
              <li>The SDK calls your configured provider and generates a title, markdown body, and suggested tags</li>
              <li>Review, edit if needed, then publish</li>
            </ul>

            <h3 className="docs-h3">Rate limiting</h3>
            <p className="docs-p">
              Use <code className="docs-code-inline">CHANGELOG_RATE_LIMIT</code> to cap AI calls per minute. Defaults to <code className="docs-code-inline">10</code>.
            </p>

            <h3 className="docs-h3">Ollama (local)</h3>
            <p className="docs-p">For local inference without API costs, set <code className="docs-code-inline">CHANGELOG_AI_PROVIDER=ollama</code> and point <code className="docs-code-inline">OLLAMA_BASE_URL</code> to your running Ollama instance.</p>
            <CodeBlock code={`CHANGELOG_AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434`} filename=".env.local" />
          </section>

          {/* Repository Integration Guide */}
          <section id="repo-guide" className="docs-section">
            <h2 className="docs-h2">Repository Integration</h2>
            <p className="docs-p">
              Connect GitHub or Bitbucket repositories and generate clean release notes from commit history. Tokens are stored encrypted in MongoDB using <code className="docs-code-inline">CHANGELOG_ENCRYPTION_KEY</code>.
            </p>

            <h3 className="docs-h3">Setup</h3>
            <ul className="docs-ul">
              <li>Open <code className="docs-code-inline">/changelog/admin/repo</code> and add your repository details</li>
              <li>Paste an access token with read access to commits</li>
              <li>Save to enable the commit generator in the editor</li>
            </ul>

            <h3 className="docs-h3">Generate from commits</h3>
            <ul className="docs-ul">
              <li>Open the commit generator modal in the admin editor</li>
              <li>Select a date range to keep the draft concise</li>
              <li>Optionally enable AI polish for standardized formatting</li>
            </ul>
          </section>

          {/* Styling */}
          <section id="styling" className="docs-section">
            <h2 className="docs-h2">Styling & CSS Isolation</h2>
            <p className="docs-p">
              All SDK UI classes are prefixed with <code className="docs-code-inline">cl-</code> to avoid conflicts with your existing design system. The stylesheet is imported automatically via the changelog layout file.
            </p>

            <h3 className="docs-h3">Available utility groups</h3>
            <ul className="docs-ul">
              <li><strong style={{ color: 'var(--text-main)' }}>Typography</strong> — <code className="docs-code-inline">cl-h1</code>, <code className="docs-code-inline">cl-h2</code>, <code className="docs-code-inline">cl-p</code>, <code className="docs-code-inline">cl-code</code></li>
              <li><strong style={{ color: 'var(--text-main)' }}>Components</strong> — <code className="docs-code-inline">cl-card</code>, <code className="docs-code-inline">cl-btn</code>, <code className="docs-code-inline">cl-input</code>, <code className="docs-code-inline">cl-badge</code>, <code className="docs-code-inline">cl-alert</code></li>
              <li><strong style={{ color: 'var(--text-main)' }}>Layout</strong> — <code className="docs-code-inline">cl-container</code>, <code className="docs-code-inline">cl-section</code>, <code className="docs-code-inline">cl-grid</code></li>
              <li><strong style={{ color: 'var(--text-main)' }}>Utilities</strong> — <code className="docs-code-inline">cl-transition</code>, <code className="docs-code-inline">cl-truncate</code>, <code className="docs-code-inline">cl-line-clamp-2</code></li>
            </ul>

            <div className="docs-callout">
              <div className="docs-callout-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>Avoid overriding <code className="docs-code-inline">cl-</code> prefixed selectors globally. If you must customize, use the <code className="docs-code-inline">changelog-sdk.css</code> layer import in your global stylesheet.</div>
            </div>
          </section>

        </main>

        {/* ── TOC ── */}
        <nav className="docs-toc">
          <div className="toc-label">On this page</div>
          <button className={`toc-link${activeSidebarItem === 'introduction' ? ' active' : ''}`} onClick={() => scrollTo('introduction')}>Introduction</button>
          <button className={`toc-link toc-link-sub${activeSidebarItem === 'introduction' ? ' active' : ''}`} onClick={() => scrollTo('introduction')}>Package surfaces</button>
          <button className={`toc-link${activeSidebarItem === 'installation' ? ' active' : ''}`} onClick={() => scrollTo('installation')}>Installation</button>
          <button className={`toc-link${activeSidebarItem === 'env-vars' ? ' active' : ''}`} onClick={() => scrollTo('env-vars')}>Environment Variables</button>
          <button className={`toc-link${activeSidebarItem === 'nextjs' || activeSidebarItem === 'nuxt' || activeSidebarItem === 'vue' || activeSidebarItem === 'express' ? ' active' : ''}`} onClick={() => scrollTo('frameworks')}>Framework Setup</button>
          <button className={`toc-link toc-link-sub${activeSidebarItem === 'nextjs' ? ' active' : ''}`} onClick={() => { setActiveFramework('Next.js'); scrollTo('frameworks') }}>Next.js</button>
          <button className={`toc-link toc-link-sub${activeSidebarItem === 'nuxt' ? ' active' : ''}`} onClick={() => { setActiveFramework('Nuxt 3'); scrollTo('frameworks') }}>Nuxt 3</button>
          <button className={`toc-link toc-link-sub${activeSidebarItem === 'vue' ? ' active' : ''}`} onClick={() => { setActiveFramework('Vue 3'); scrollTo('frameworks') }}>Vue 3</button>
          <button className={`toc-link toc-link-sub${activeSidebarItem === 'express' ? ' active' : ''}`} onClick={() => { setActiveFramework('Express'); scrollTo('frameworks') }}>Express</button>
          <button className={`toc-link${activeSidebarItem === 'api-actions' ? ' active' : ''}`} onClick={() => scrollTo('api-actions')}>Server Actions</button>
          <button className={`toc-link${activeSidebarItem === 'api-types' ? ' active' : ''}`} onClick={() => scrollTo('api-types')}>TypeScript Types</button>
          <button className={`toc-link${activeSidebarItem === 'ai-guide' ? ' active' : ''}`} onClick={() => scrollTo('ai-guide')}>AI Enhancement</button>
          <button className={`toc-link${activeSidebarItem === 'repo-guide' ? ' active' : ''}`} onClick={() => scrollTo('repo-guide')}>Repository Integration</button>
          <button className={`toc-link${activeSidebarItem === 'styling' ? ' active' : ''}`} onClick={() => scrollTo('styling')}>Styling</button>
        </nav>
      </div>
    </div>
  )
}
