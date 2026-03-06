import { Suspense, type ReactNode } from 'react'
import { checkAdminAuth } from '../actions/changelog-actions'
import ChangelogFeed from './feed/timeline'
import ChangelogDetail from './feed/detail'
import AdminPortal from './admin/portal'
import LoginForm from './auth/login'

/**
 * Main Changelog Manager Component - Server Component
 * Routes between Feed, Login, and Admin views based on URL params
 */

interface RouteParams {
  route?: string[]
}

interface SearchParams {
  page?: string
  tags?: string
  search?: string
}

interface ChangelogManagerProps {
  params?: RouteParams
  searchParams?: SearchParams
}

export default function ChangelogManager({ params, searchParams }: ChangelogManagerProps) {
  const route = params?.route?.[0] || ''
  const adminSection = params?.route?.[1]
  const adminEditId = params?.route?.[2]

  // Route logic
  if (route === 'admin') {
    return <AdminPortalRoute section={adminSection} editId={adminEditId} />
  }

  if (route === 'login') {
    return <LoginRoute />
  }

  if (route) {
    return <DetailRoute slug={route} />
  }

  // Default: public feed
  return <PublicFeedRoute searchParams={searchParams} />
}

/**
 * Public Feed Route
 */
function PublicFeedRoute({ searchParams }: { searchParams?: { page?: string; tags?: string; search?: string } }) {
  const page = Math.max(1, Number(searchParams?.page ?? 1))
  const tags = (searchParams?.tags ?? '').split(',').filter(Boolean) as import('../types/changelog').ChangelogTag[]
  const search = searchParams?.search ?? ''

  return (
    <main className="cl-root cl-section cl-feed-screen">
      <Suspense fallback={<LoadingFallback />}>
        <ChangelogFeed initialPage={page} initialTags={tags} initialSearch={search} />
      </Suspense>
    </main>
  )
}

/**
 * Login Route
 */
function LoginRoute() {
  return (
    <main className="cl-root cl-section cl-login-screen">
      <Suspense fallback={<LoadingFallback />}>
        <LoginForm />
      </Suspense>
    </main>
  )
}

function DetailRoute({ slug }: { slug: string }) {
  return (
    <main className="cl-root cl-section cl-feed-screen">
      <Suspense fallback={<LoadingFallback />}>
        <ChangelogDetail slug={slug} />
      </Suspense>
    </main>
  )
}

/**
 * Admin Portal Route
 */
function AdminPortalRoute({ section, editId }: { section?: string; editId?: string }) {
  return (
    <main className="cl-root cl-section cl-admin-screen">
      <Suspense fallback={<LoadingFallback />}>
        <AdminAuthWrapper>
          <AdminPortal section={section} editId={editId} />
        </AdminAuthWrapper>
      </Suspense>
    </main>
  )
}

/**
 * Admin Auth Wrapper - checks if user is authenticated
 */
async function AdminAuthWrapper({ children }: { children: ReactNode }) {
  const isAdmin = await checkAdminAuth()

  if (!isAdmin) {
    return (
      <div className="cl-card cl-auth-guard-card">
        <div className="cl-card-header">
          <h1 className="cl-card-title">Access Denied</h1>
        </div>
        <div className="cl-card-content">
          <p className="cl-p">Please log in to access the admin portal.</p>
          <a href="/changelog/login" className="cl-btn cl-btn-primary cl-auth-guard-link">
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return children
}

/**
 * Loading Fallback
 */
function LoadingFallback() {
  return (
    <div className="cl-loading-screen">
      <div className="cl-spinner" />
      <span className="cl-loading-label">Loading...</span>
    </div>
  )
}
