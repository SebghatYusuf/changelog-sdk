import { Suspense } from 'react'
import AdminList from './list'
import CreateForm from './form'
import LogoutButton from './logout-button'
import AISettingsPanel from './ai-settings'
import ChangelogSettingsPanel from './changelog-settings'
import { fetchAdminChangelogById } from '../../actions/changelog-actions'
import { ChangelogEntry } from '../../types/changelog'

/**
 * Admin Portal Main Component - Server Component
 */

type AdminSection = 'publish' | 'ai' | 'changelog-settings' | 'presets'

interface AdminPortalProps {
  section?: string
  editId?: string
}

const ADMIN_NAV_ITEMS: Array<{ id: AdminSection; label: string; href: string; description: string; icon: string }> = [
  { id: 'publish', label: 'Publishing', href: '/changelog/admin', description: 'Create and manage entries', icon: '✦' },
  { id: 'ai', label: 'AI Settings', href: '/changelog/admin/ai', description: 'Provider, model, runtime', icon: '⚡' },
  { id: 'changelog-settings', label: 'Feed Settings', href: '/changelog/admin/changelog-settings', description: 'Feed and publishing defaults', icon: '⚙' },
  { id: 'presets', label: 'Presets', href: '/changelog/admin/presets', description: 'Reusable templates', icon: '▤' },
]

function normalizeSection(section?: string): AdminSection {
  if (section === 'ai' || section === 'changelog-settings' || section === 'presets') return section
  return 'publish'
}

export default function AdminPortal({ section, editId }: AdminPortalProps) {
  // Edit mode: render a dedicated full-page edit view
  if (section === 'edit' && editId) {
    return <EditEntryView editId={editId} />
  }

  const activeSection = normalizeSection(section)

  return (
    <div className="cl-admin-shell">
      {/* ── Top bar ── */}
      <header className="cl-admin-header">
        <div className="cl-admin-header-left">
          <div className="cl-admin-wordmark">Changelog Admin</div>
          <p className="cl-admin-subtitle">Create, refine, and publish release notes.</p>
        </div>
        <div className="cl-admin-header-right">
          <a href="/changelog" className="cl-btn cl-btn-ghost cl-btn-sm">
            ← View changelog
          </a>
          <LogoutButton />
        </div>
      </header>

      {/* ── Body ── */}
      <div className="cl-admin-layout">

        {/* Sidebar */}
        <aside className="cl-admin-sidebar">
          <nav className="cl-admin-nav">
            <p className="cl-admin-nav-label">Navigation</p>
            {ADMIN_NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`cl-admin-nav-item ${activeSection === item.id ? 'is-active' : ''}`}
              >
                <span className="cl-admin-nav-icon">{item.icon}</span>
                <span className="cl-admin-nav-body">
                  <span className="cl-admin-nav-title">{item.label}</span>
                  <span className="cl-admin-nav-description">{item.description}</span>
                </span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="cl-admin-content">
          {activeSection === 'publish' ? (
            <PublishSection />
          ) : activeSection === 'ai' ? (
            <AISection />
          ) : activeSection === 'changelog-settings' ? (
            <ChangelogSettingsSection />
          ) : (
            <PresetsSection />
          )}
        </main>
      </div>
    </div>
  )
}

/**
 * Dedicated full-page edit view — no list, full-width form with back link
 */
async function EditEntryView({ editId }: { editId: string }) {
  let initialEntry: ChangelogEntry | undefined

  const result = await fetchAdminChangelogById(editId)
  if (result.success && result.data) {
    initialEntry = result.data
  }

  return (
    <div className="cl-admin-shell">
      <header className="cl-admin-header">
        <div className="cl-admin-header-left">
          <a href="/changelog/admin" className="cl-admin-back-link">
            <svg viewBox="0 0 24 24" className="cl-admin-back-icon" fill="none" strokeWidth="2" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Admin
          </a>
          <div className="cl-admin-wordmark">Edit Entry</div>
          {initialEntry && (
            <p className="cl-admin-subtitle">
              v{initialEntry.version} &middot; {initialEntry.title}
            </p>
          )}
        </div>
        <div className="cl-admin-header-right">
          <LogoutButton />
        </div>
      </header>

      <div className="cl-admin-edit-wrap">
        <Suspense fallback={<FormSkeleton />}>
          <CreateForm initialEntry={initialEntry} />
        </Suspense>
      </div>
    </div>
  )
}

/**
 * Publish Section — side-by-side create form + entries list
 */
function PublishSection() {
  return (
    <div className="cl-publish-grid">
      <div className="cl-publish-col-form">
        <Suspense fallback={<FormSkeleton />}>
          <CreateForm />
        </Suspense>
      </div>
      <div className="cl-publish-col-list">
        <Suspense fallback={<ListSkeleton />}>
          <AdminList />
        </Suspense>
      </div>
    </div>
  )
}

function AISection() {
  return (
    <div className="cl-single-col">
      <Suspense fallback={<FormSkeleton />}>
        <AISettingsPanel />
      </Suspense>
    </div>
  )
}

function ChangelogSettingsSection() {
  return (
    <div className="cl-single-col">
      <Suspense fallback={<FormSkeleton />}>
        <ChangelogSettingsPanel />
      </Suspense>
    </div>
  )
}

function PresetsSection() {
  return (
    <div className="cl-card cl-admin-panel cl-admin-settings-panel">
      <div className="cl-card-header">
        <h3 className="cl-card-title">Presets</h3>
        <p className="cl-card-description">Quick-start templates for common release-note types.</p>
      </div>
      <div className="cl-card-content cl-admin-form-body">
        <div className="cl-admin-presets-grid">
          <div className="cl-admin-preset-card">
            <h4 className="cl-admin-preset-title">Feature Release</h4>
            <p className="cl-admin-preset-description">Highlights, migration notes, and rollout details.</p>
          </div>
          <div className="cl-admin-preset-card">
            <h4 className="cl-admin-preset-title">Hotfix</h4>
            <p className="cl-admin-preset-description">Critical bugfix summary with impact scope.</p>
          </div>
          <div className="cl-admin-preset-card">
            <h4 className="cl-admin-preset-title">Maintenance</h4>
            <p className="cl-admin-preset-description">Operational updates and technical maintenance details.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="cl-card cl-admin-panel cl-admin-skeleton">
      <div className="cl-card-header">
        <div className="cl-admin-skeleton-line cl-admin-skeleton-line-sm" />
      </div>
      <div className="cl-card-content cl-admin-skeleton-body">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="cl-admin-skeleton-line" />
        ))}
      </div>
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="cl-card cl-admin-panel cl-admin-skeleton">
      <div className="cl-card-header">
        <div className="cl-admin-skeleton-line cl-admin-skeleton-line-md" />
      </div>
      <div className="cl-card-content cl-admin-skeleton-body">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="cl-admin-skeleton-block" />
        ))}
      </div>
    </div>
  )
}
