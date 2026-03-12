import { Suspense } from 'react'
import { ArrowLeft, FileText, LayoutGrid, Settings, Zap, type LucideIcon } from 'lucide-react'
import AdminList from './list'
import CreateForm from './form'
import LogoutButton from './logout-button'
import AISettingsPanel from './ai-settings'
import ChangelogSettingsPanel from './changelog-settings'
import { fetchAdminChangelogById } from '../../actions/changelog-actions'
import { ChangelogEntry } from '../../types/changelog'
import { buildChangelogPath } from '../paths'

/**
 * Admin Portal Main Component - Server Component
 */

type AdminSection = 'publish' | 'ai' | 'changelog-settings' | 'presets'

interface AdminPortalProps {
  section?: string
  editId?: string
  preset?: string
  basePath?: string
}

const ADMIN_NAV_ITEMS: Array<{ id: AdminSection; label: string; description: string; icon: LucideIcon }> = [
  { id: 'publish', label: 'Publishing', description: 'Create and manage entries', icon: FileText },
  { id: 'ai', label: 'AI Settings', description: 'Provider, model, runtime', icon: Zap },
  { id: 'changelog-settings', label: 'Feed Settings', description: 'Feed and publishing defaults', icon: Settings },
  { id: 'presets', label: 'Presets', description: 'Reusable templates', icon: LayoutGrid },
]

function normalizeSection(section?: string): AdminSection {
  if (section === 'ai' || section === 'changelog-settings' || section === 'presets') return section
  return 'publish'
}

export default function AdminPortal({ section, editId, preset, basePath }: AdminPortalProps) {
  // Edit mode: render a dedicated full-page edit view
  if (section === 'edit' && editId) {
    return <EditEntryView editId={editId} basePath={basePath} />
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
          <a href={buildChangelogPath(basePath)} className="cl-btn cl-btn-ghost cl-btn-sm">
            ← View changelog
          </a>
          <LogoutButton basePath={basePath} />
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
                href={
                  item.id === 'publish'
                    ? buildChangelogPath(basePath, 'admin')
                    : buildChangelogPath(basePath, 'admin', item.id)
                }
                className={`cl-admin-nav-item ${activeSection === item.id ? 'is-active' : ''}`}
              >
                <item.icon className="cl-admin-nav-icon" aria-hidden="true" />
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
            <PublishSection preset={preset} basePath={basePath} />
          ) : activeSection === 'ai' ? (
            <AISection />
          ) : activeSection === 'changelog-settings' ? (
            <ChangelogSettingsSection />
          ) : (
            <PresetsSection basePath={basePath} />
          )}
        </main>
      </div>
    </div>
  )
}

/**
 * Dedicated full-page edit view — no list, full-width form with back link
 */
async function EditEntryView({ editId, basePath }: { editId: string; basePath?: string }) {
  let initialEntry: ChangelogEntry | undefined

  const result = await fetchAdminChangelogById(editId)
  if (result.success && result.data) {
    initialEntry = result.data
  }

  return (
    <div className="cl-admin-shell">
      <header className="cl-admin-header">
        <div className="cl-admin-header-left">
          <a href={buildChangelogPath(basePath, 'admin')} className="cl-admin-back-link">
            <ArrowLeft className="cl-admin-back-icon" aria-hidden="true" />
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
          <LogoutButton basePath={basePath} />
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
function PublishSection({ preset, basePath }: { preset?: string; basePath?: string }) {
  return (
    <div className="cl-publish-grid">
      <div className="cl-publish-col-form">
        <Suspense fallback={<FormSkeleton />}>
          <CreateForm preset={preset} basePath={basePath} />
        </Suspense>
      </div>
      <div className="cl-publish-col-list">
        <Suspense fallback={<ListSkeleton />}>
          <AdminList basePath={basePath} />
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

function PresetsSection({ basePath }: { basePath?: string }) {
  return (
    <div className="cl-card cl-admin-panel cl-admin-settings-panel">
      <div className="cl-card-header">
        <h3 className="cl-card-title">Presets</h3>
        <p className="cl-card-description">Quick-start templates for common release-note types.</p>
      </div>
      <div className="cl-card-content cl-admin-form-body">
        <div className="cl-admin-presets-grid">
          <a href={`${buildChangelogPath(basePath, 'admin')}?preset=feature-release`} className="cl-admin-preset-card">
            <h4 className="cl-admin-preset-title">Feature Release</h4>
            <p className="cl-admin-preset-description">Highlights, migration notes, and rollout details.</p>
          </a>
          <a href={`${buildChangelogPath(basePath, 'admin')}?preset=hotfix`} className="cl-admin-preset-card">
            <h4 className="cl-admin-preset-title">Hotfix</h4>
            <p className="cl-admin-preset-description">Critical bugfix summary with impact scope.</p>
          </a>
          <a href={`${buildChangelogPath(basePath, 'admin')}?preset=maintenance`} className="cl-admin-preset-card">
            <h4 className="cl-admin-preset-title">Maintenance</h4>
            <p className="cl-admin-preset-description">Operational updates and technical maintenance details.</p>
          </a>
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
