'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { toSitePath } from '../../../src/site-paths'

const HOME_HREF = toSitePath('')
const DOCS_HREF = toSitePath('docs/')
const DOCS_FRAMEWORKS = toSitePath('docs/frameworks/')
const DOCS_API_ACTIONS = toSitePath('docs/api/server-actions/')
const DOCS_API_TYPES = toSitePath('docs/api/types/')
const DOCS_GUIDE_AI = toSitePath('docs/guides/ai/')
const DOCS_GUIDE_REPO = toSitePath('docs/guides/repo/')
const DOCS_GUIDE_STYLING = toSitePath('docs/guides/styling/')

const LogoIcon = () => (
  <img src={toSitePath('images/changelog-sdk-icon.svg')} width="28" height="28" alt="Changelog SDK" style={{ display: 'block' }} />
)

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
)

function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, '')
}

export default function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const current = normalizePathname(pathname || '')
  const [activeHash, setActiveHash] = useState('')

  const isActive = (href: string) => normalizePathname(href) === current
  const isFrameworks = isActive(DOCS_FRAMEWORKS)

  useEffect(() => {
    const update = () => setActiveHash(typeof window === 'undefined' ? '' : window.location.hash)
    update()
    window.addEventListener('hashchange', update)
    window.addEventListener('popstate', update)
    return () => {
      window.removeEventListener('hashchange', update)
      window.removeEventListener('popstate', update)
    }
  }, [])

  return (
    <div className="docs-page">
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
        <aside className="docs-sidebar">
          <div className="sidebar-group">
            <div className="sidebar-group-title">Getting Started</div>
            <Link className={`sidebar-link${isActive(DOCS_HREF) ? ' active' : ''}`} href={DOCS_HREF}>Overview</Link>
            <a className="sidebar-link" href={`${DOCS_HREF}#installation`}>Installation</a>
            <a className="sidebar-link" href={`${DOCS_HREF}#env-vars`}>Environment Variables</a>
          </div>
          <div className="sidebar-group">
            <div className="sidebar-group-title">Framework Setup</div>
            <Link className={`sidebar-link${isFrameworks ? ' active' : ''}`} href={DOCS_FRAMEWORKS}>Framework Overview</Link>
            <a className={`sidebar-link${isFrameworks && activeHash === '#nextjs' ? ' active' : ''}`} href={`${DOCS_FRAMEWORKS}#nextjs`}>Next.js</a>
            <a className={`sidebar-link${isFrameworks && activeHash === '#nuxt' ? ' active' : ''}`} href={`${DOCS_FRAMEWORKS}#nuxt`}>Nuxt 3</a>
            <a className={`sidebar-link${isFrameworks && activeHash === '#vue' ? ' active' : ''}`} href={`${DOCS_FRAMEWORKS}#vue`}>Vue 3</a>
            <a className={`sidebar-link${isFrameworks && activeHash === '#express' ? ' active' : ''}`} href={`${DOCS_FRAMEWORKS}#express`}>Express</a>
          </div>
          <div className="sidebar-group">
            <div className="sidebar-group-title">API Reference</div>
            <Link className={`sidebar-link${isActive(DOCS_API_ACTIONS) ? ' active' : ''}`} href={DOCS_API_ACTIONS}>Server Actions</Link>
            <Link className={`sidebar-link${isActive(DOCS_API_TYPES) ? ' active' : ''}`} href={DOCS_API_TYPES}>TypeScript Types</Link>
          </div>
          <div className="sidebar-group">
            <div className="sidebar-group-title">Guides</div>
            <Link className={`sidebar-link${isActive(DOCS_GUIDE_AI) ? ' active' : ''}`} href={DOCS_GUIDE_AI}>AI Enhancement</Link>
            <Link className={`sidebar-link${isActive(DOCS_GUIDE_REPO) ? ' active' : ''}`} href={DOCS_GUIDE_REPO}>Repository Integration</Link>
            <Link className={`sidebar-link${isActive(DOCS_GUIDE_STYLING) ? ' active' : ''}`} href={DOCS_GUIDE_STYLING}>Styling & Isolation</Link>
          </div>
        </aside>

        {children}
      </div>
    </div>
  )
}
