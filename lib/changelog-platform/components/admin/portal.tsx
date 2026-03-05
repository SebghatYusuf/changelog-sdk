import { Suspense } from 'react'
import AdminList from './list'
import CreateForm from './form'
import LogoutButton from './logout-button'
import AISettingsPanel from './ai-settings'
import ChangelogSettingsPanel from './changelog-settings'

/**
 * Admin Portal Main Component - Server Component
 */

type AdminSection = 'publish' | 'ai' | 'changelog-settings' | 'presets'

interface AdminPortalProps {
  section?: string
}

const ADMIN_NAV_ITEMS: Array<{ id: AdminSection; label: string; href: string; description: string }> = [
  { id: 'publish', label: 'Publishing', href: '/changelog/admin', description: 'Create and manage release posts' },
  { id: 'ai', label: 'AI Settings', href: '/changelog/admin/ai', description: 'Provider, model, and runtime setup' },
  { id: 'changelog-settings', label: 'Changelog Settings', href: '/changelog/admin/changelog-settings', description: 'Feed and publishing defaults' },
  { id: 'presets', label: 'Presets', href: '/changelog/admin/presets', description: 'Reusable templates and starter blocks' },
]

function normalizeSection(section?: string): AdminSection {
  if (section === 'ai' || section === 'changelog-settings' || section === 'presets') return section
  return 'publish'
}

export default function AdminPortal({ section }: AdminPortalProps) {
  const activeSection = normalizeSection(section)

  return (
    <div className="cl-admin-shell">
      <div className="cl-admin-header">
        <div>
          <h1 className="cl-admin-title">Changelog Admin</h1>
          <p className="cl-admin-subtitle">Create, refine, and publish release notes with editorial quality.</p>
        </div>
        <LogoutButton />
      </div>

      <div className="cl-admin-layout">
        <aside className="cl-admin-sidebar cl-card cl-admin-panel">
          <div className="cl-card-header">
            <h3 className="cl-card-title">Workspace</h3>
            <p className="cl-card-description">Navigate admin pages</p>
          </div>
          <div className="cl-card-content cl-admin-sidebar-nav">
            {ADMIN_NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`cl-admin-nav-item ${activeSection === item.id ? 'is-active' : ''}`}
              >
                <span className="cl-admin-nav-title">{item.label}</span>
                <span className="cl-admin-nav-description">{item.description}</span>
              </a>
            ))}
          </div>
        </aside>

        <div className="cl-admin-content">
          {activeSection === 'publish' ? (
            <PublishSection />
          ) : activeSection === 'ai' ? (
            <AISection />
          ) : activeSection === 'changelog-settings' ? (
            <ChangelogSettingsSection />
          ) : (
            <PresetsSection />
          )}
        </div>
      </div>
    </div>
  )
}

function PublishSection() {
  return (
    <div className="cl-admin-grid">
      <div className="cl-admin-grid-col">
        <Suspense fallback={<FormSkeleton />}>
          <CreateForm />
        </Suspense>
      </div>

      <div className="cl-admin-grid-col">
        <Suspense fallback={<ListSkeleton />}>
          <AdminList />
        </Suspense>
      </div>
    </div>
  )
}

function AISection() {
  return (
    <div className="cl-admin-grid cl-admin-grid-single">
      <div className="cl-admin-grid-col">
        <Suspense fallback={<FormSkeleton />}>
          <AISettingsPanel />
        </Suspense>
      </div>
    </div>
  )
}

function ChangelogSettingsSection() {
  return (
    <div className="cl-admin-grid cl-admin-grid-single">
      <div className="cl-admin-grid-col">
        <Suspense fallback={<FormSkeleton />}>
          <ChangelogSettingsPanel />
        </Suspense>
      </div>
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
