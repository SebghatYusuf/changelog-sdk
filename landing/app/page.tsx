'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toSitePath } from '../src/site-paths'

const HOME_HREF = toSitePath('')
const DOCS_HREF = toSitePath('docs/')

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const ArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)
const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
)
const LogoIcon = () => (
  <img src={toSitePath('images/changelog-sdk-icon.svg')} width="30" height="30" alt="Changelog SDK" className="logo-icon" />
)

const INSTALL_TABS = ['bun', 'npm', 'yarn', 'pnpm'] as const
const INSTALL_CMDS: Record<typeof INSTALL_TABS[number], string> = {
  bun:  'bun add github:SebghatYusuf/changelog-sdk#master',
  npm:  'npm install github:SebghatYusuf/changelog-sdk#master',
  yarn: 'yarn add github:SebghatYusuf/changelog-sdk#master',
  pnpm: 'pnpm add github:SebghatYusuf/changelog-sdk#master',
}

const FEATURES = [
  {
    name: 'Public Changelog Feed',
    desc: 'Beautiful, searchable public timeline at /changelog with tag filtering and pagination built in.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      </svg>
    ),
  },
  {
    name: 'Admin Portal',
    desc: 'Secure admin dashboard at /changelog/admin with HTTP-only cookie sessions and bcrypt auth.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    name: 'AI Enhancement',
    desc: 'Turn raw release notes into polished entries. Supports OpenAI, Google Gemini, and local Ollama.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4M19 17v4M3 5h4M17 19h4" />
      </svg>
    ),
  },
  {
    name: 'Type-Safe API',
    desc: 'Full TypeScript support with Zod-validated server actions. No runtime surprises.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    name: 'MongoDB Backed',
    desc: 'First-class Mongoose adapters for the changelog port. Drop in your URI and you\'re live.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
      </svg>
    ),
  },
  {
    name: 'Style Isolation',
    desc: 'All SDK classes are cl- prefixed. Zero risk of collisions with your existing design system.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
]

const STEPS = [
  {
    title: 'Install the package',
    desc: 'Install via bun, npm, yarn, or pnpm directly from GitHub.',
  },
  {
    title: 'Add the changelog layout',
    desc: 'Create app/changelog/layout.tsx that imports the SDK styles.',
  },
  {
    title: 'Add the catch-all route',
    desc: 'Create app/changelog/[[...route]]/page.tsx and drop in ChangelogManager.',
  },
  {
    title: 'Configure environment variables',
    desc: 'Set CHANGELOG_MONGODB_URI, CHANGELOG_SESSION_SECRET, and optionally your AI provider key.',
  },
]

export default function Home() {
  const [mounted, setMounted]       = useState(false)
  const [activeTab, setActiveTab]   = useState<typeof INSTALL_TABS[number]>('bun')
  const [copied, setCopied]         = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const copy = () => {
    navigator.clipboard.writeText(INSTALL_CMDS[activeTab]).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* ── Header ── */}
      <header className="header">
        <div className="container header-inner">
          <Link href={HOME_HREF} className="logo">
            <LogoIcon />
            Changelog SDK
          </Link>
          <nav className="nav-links">
            <Link href={DOCS_HREF} className="nav-link">Docs</Link>
            <a href="https://github.com/SebghatYusuf/changelog-sdk" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <GithubIcon /> GitHub
            </a>
            <Link href={DOCS_HREF} className="nav-link-cta">Get started</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="hero">
          <div className="hero-radial" />
          <div className="hero-radial-2" />
          <div className="container hero-grid">
            <div>
              <div className="hero-eyebrow">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="5" /></svg>
                AI-Powered · Framework-Agnostic · Open Source
              </div>
              <h1 className="hero-title">
                The changelog<br />your users will<br /><span className="accent">actually read</span>
              </h1>
              <p className="hero-desc">
                Add a public changelog feed, secure admin portal, and AI-assisted release writing to any Next.js, Nuxt, Vue, or Express app in minutes.
              </p>
              <div className="hero-actions">
                <Link href={DOCS_HREF} className="btn btn-primary">
                  Get started <ArrowRight />
                </Link>
                <a href="https://github.com/SebghatYusuf/changelog-sdk" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  <GithubIcon /> View on GitHub
                </a>
              </div>
              <div className="hero-install">
                <span className="prompt">$</span>
                <span className="cmd">{INSTALL_CMDS[activeTab]}</span>
                <button className="hero-install-copy" onClick={copy} title="Copy">
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
            </div>

            <div>
              <div className="code-window">
                <div className="code-window-header">
                  <div className="code-dots">
                    <div className="code-dot dot-red" />
                    <div className="code-dot dot-yellow" />
                    <div className="code-dot dot-green" />
                  </div>
                  <div className="code-file">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    app/changelog/[[...route]]/page.tsx
                  </div>
                  <div />
                </div>
                <div className="code-body">
                  <pre dangerouslySetInnerHTML={{ __html: [
                    `<span class="tok-kw">import</span> <span class="tok-punc">{ </span><span class="tok-fn">Suspense</span><span class="tok-punc"> }</span> <span class="tok-kw">from</span> <span class="tok-str">'react'</span>`,
                    `<span class="tok-kw">import</span> <span class="tok-punc">{ </span><span class="tok-fn">ChangelogManager</span><span class="tok-punc"> }</span> <span class="tok-kw">from</span> <span class="tok-str">'changelog-sdk/next'</span>`,
                    ``,
                    `<span class="tok-kw">export const</span> <span class="tok-fn">metadata</span> <span class="tok-punc">=</span> <span class="tok-punc">{</span>`,
                    `  <span class="tok-fn">title</span><span class="tok-punc">:</span> <span class="tok-str">'Changelog'</span><span class="tok-punc">,</span>`,
                    `<span class="tok-punc">}</span>`,
                    ``,
                    `<span class="tok-kw">export default function</span> <span class="tok-fn">Page</span><span class="tok-punc">(</span>props<span class="tok-punc">) {</span>`,
                    `  <span class="tok-kw">return</span> <span class="tok-punc">(</span>`,
                    `    <span class="tok-punc">&lt;</span><span class="tok-fn">Suspense</span><span class="tok-punc">&gt;</span>`,
                    `      <span class="tok-punc">&lt;</span><span class="tok-fn">ChangelogManager</span> <span class="tok-punc">{...}</span>props<span class="tok-punc"> /&gt;</span>`,
                    `    <span class="tok-punc">&lt;/</span><span class="tok-fn">Suspense</span><span class="tok-punc">&gt;</span>`,
                    `  <span class="tok-punc">)</span>`,
                    `<span class="tok-punc">}</span>`,
                  ].join('\n') }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                {(['Next.js', 'Nuxt', 'Vue 3', 'Express'] as const).map(fw => (
                  <div key={fw} style={{
                    padding: '0.3rem 0.75rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    color: 'var(--text-dim)',
                    fontWeight: 600,
                  }}>{fw}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="features">
          <div className="container">
            <div className="section-label">What's included</div>
            <h2 className="section-title">Everything you need.<br />Nothing you don't.</h2>
            <p className="section-desc">
              A complete changelog system — from public feed to AI-assisted writing — designed for developers who care about the details.
            </p>
            <div className="features-grid">
              {FEATURES.map(f => (
                <div key={f.name} className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <div className="feature-name">{f.name}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Quick Start Steps ── */}
        <section className="steps-section">
          <div className="container">
            <div className="steps-grid">
              <div>
                <div className="section-label">Quick Start</div>
                <h2 className="section-title">Up and running<br />in four steps</h2>
                <p className="section-desc">
                  The SDK is designed to be drop-in. Install, wire two files, add your env vars, and you're live.
                </p>
                <Link href={DOCS_HREF} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                  Read the docs <ArrowRight />
                </Link>
              </div>
              <div>
                <div className="steps-list">
                  {STEPS.map((s, i) => (
                    <div key={i} className="step">
                      <div className="step-num">{i + 1}</div>
                      <div className="step-content">
                        <div className="step-title">{s.title}</div>
                        <div className="step-desc">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Install ── */}
        <section style={{ padding: '6rem 0', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: '720px' }}>
            <div className="section-label">Installation</div>
            <h2 className="section-title">Install the SDK</h2>
            <p className="section-desc">
              Install directly from GitHub with your package manager of choice. No npm registry required.
            </p>

            <div className="code-window install-window">
              <div className="code-window-header" style={{ padding: '0' }}>
                <div className="tabs" style={{ width: '100%', borderBottom: 'none' }}>
                  {INSTALL_TABS.map(t => (
                    <button key={t} className={`tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="code-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <pre style={{ margin: 0, color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--text-dim)', marginRight: '0.75rem' }}>$</span>
                  {INSTALL_CMDS[activeTab]}
                </pre>
                <button className="hero-install-copy" onClick={copy} title="Copy" style={{ marginLeft: '1rem' }}>
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
            </div>

            <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-dim)' }}>
              For AI enhancement, also install your provider:{' '}
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--primary)' }}>bun add ai @ai-sdk/openai</code>
            </p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section">
          <div className="cta-radial" />
          <div className="container">
            <h2 className="cta-title">Start shipping better changelogs</h2>
            <p className="cta-desc">
              One SDK. Public feed, admin portal, and AI writing assistance — all wired up in minutes.
            </p>
            <div className="cta-actions">
              <Link href={DOCS_HREF} className="btn btn-primary">
                Get started <ArrowRight />
              </Link>
              <a href="https://github.com/SebghatYusuf/changelog-sdk" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                <GithubIcon /> View on GitHub
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container footer-inner">
          <Link href={HOME_HREF} className="footer-logo">
            <LogoIcon />
            Changelog SDK
          </Link>
          <div className="footer-links">
            <Link href={DOCS_HREF} className="footer-link">Docs</Link>
            <a href="https://github.com/SebghatYusuf/changelog-sdk" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
            <a href="https://github.com/SebghatYusuf/changelog-sdk/blob/master/LICENSE" target="_blank" rel="noopener noreferrer" className="footer-link">MIT License</a>
          </div>
          <span className="footer-copy">© {new Date().getFullYear()} Changelog SDK</span>
        </div>
      </footer>
    </div>
  )
}
