import { Suspense } from 'react'
import AdminList from './list'
import CreateForm from './form'
import LogoutButton from './logout-button'

/**
 * Admin Portal Main Component - Server Component
 */

export default function AdminPortal() {
  return (
    <div className="cl-admin-shell">
      <div className="cl-admin-header">
        <div>
          <h1 className="cl-admin-title">Changelog Admin</h1>
          <p className="cl-admin-subtitle">Create, refine, and publish release notes with editorial quality.</p>
        </div>
        <LogoutButton />
      </div>

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
