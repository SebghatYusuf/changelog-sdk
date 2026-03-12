import Link from 'next/link'
import { IBM_Plex_Mono, Syne } from 'next/font/google'
import styles from './page.module.css'

const quickLinks = [
  {
    href: '/changelog',
    label: 'Public changelog feed',
    path: '/changelog',
    detail: 'Browse published releases with search, tags, and pagination.',
  },
  {
    href: '/changelog/login',
    label: 'Admin login',
    path: '/changelog/login',
    detail: 'Authenticate with the configured admin password and session cookie.',
  },
  {
    href: '/changelog/admin',
    label: 'Admin portal',
    path: '/changelog/admin',
    detail: 'Create entries, edit versions, and manage AI-backed drafting tools.',
  },
]

const syne = Syne({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--font-display',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
})

export default function RootPage() {
  return (
    <main className={`${styles.page} ${syne.variable} ${plexMono.variable}`}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>C</span>
            <span>Changelog SDK / Next.js</span>
          </div>
          <p className={styles.topNote}>App Router integration example for the package surface, not a local source shortcut.</p>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroPanel}>
            <div className={styles.ambientRing} />
            <span className={styles.eyebrow}>
              <span className={styles.dot} />
              Integration Ready
            </span>
            <h1 className={styles.headline} style={{ fontFamily: 'var(--font-display)' }}>
              Your changelog should feel shipped, not bolted on.
            </h1>
            <p className={styles.lede}>
              This example shows the Next.js adapter in its intended shape: package imports, App Router routing, isolated styles,
              and a dedicated admin surface for changelog publishing.
            </p>

            <div className={styles.heroFooter}>
              <Link href="/changelog" className={styles.primaryLink}>
                Open changelog feed
                <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/changelog/admin" className={styles.secondaryLink}>
                Inspect admin flow
              </Link>
            </div>

            <div className={styles.signalStrip}>
              <div className={styles.signal}>
                <span className={styles.signalLabel}>Surface</span>
                <strong className={styles.signalValue}>`changelog-sdk/next`</strong>
              </div>
              <div className={styles.signal}>
                <span className={styles.signalLabel}>Routing</span>
                <strong className={styles.signalValue}>Catch-all App Router</strong>
              </div>
              <div className={styles.signal}>
                <span className={styles.signalLabel}>Styling</span>
                <strong className={styles.signalValue}>Isolated SDK CSS</strong>
              </div>
            </div>
          </div>

          <aside className={styles.statusPanel}>
            <div className={styles.statusHeader}>
              <h2 className={styles.statusTitle}>Integration snapshot</h2>
              <span className={styles.statusBadge}>Next 16</span>
            </div>

            <div className={styles.codeWindow}>
              <code>{`import { ChangelogManager } from 'changelog-sdk/next'
import 'changelog-sdk/styles'`}</code>
            </div>

            <div className={styles.statusList}>
              <div className={styles.statusItem}>
                <strong>Package-backed imports</strong>
                <span>The example validates the same surface consumers use after installing from GitHub.</span>
              </div>
              <div className={styles.statusItem}>
                <strong>Protected admin flow</strong>
                <span>Login and admin routes are already wired to the SDK server actions and session handling.</span>
              </div>
              <div className={styles.statusItem}>
                <strong>Minimal host setup</strong>
                <span>One layout import for styles, one catch-all page, and the rest is handled by the SDK.</span>
              </div>
            </div>
          </aside>
        </section>

        <section className={styles.details}>
          <div className={styles.detailCard}>
            <span className={styles.sectionLabel}>Why this example exists</span>
            <h2 className={styles.detailTitle} style={{ fontFamily: 'var(--font-display)' }}>
              A clean host app with a fully opinionated changelog surface.
            </h2>
            <p className={styles.detailBody}>
              The goal is to make the integration obvious at a glance. You can jump into the public feed, test the login route,
              or enter the admin area and see how the SDK behaves inside a real Next.js app without extra scaffolding.
            </p>
          </div>

          <div className={styles.routeGrid}>
            {quickLinks.map((item, index) => (
              <Link key={item.href} href={item.href} className={styles.routeCard}>
                <span className={styles.routeIndex}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.routeText}>
                  <span className={styles.routeLabel}>{item.label}</span>
                  <span className={styles.routePath}>{item.path}</span>
                  <span className={styles.detailBody}>{item.detail}</span>
                </span>
                <span className={styles.routeArrow} aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}