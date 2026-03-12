import { Suspense, type ReactNode } from 'react'
import { checkAdminAuth } from '../actions/changelog-actions'
import ChangelogFeed from './feed/timeline'
import ChangelogDetail from './feed/detail'
import AdminPortal from './admin/portal'
import LoginForm from './auth/login'
import RegisterForm from './auth/register'
import { ToastProvider } from './toast/provider'
import { TooltipProvider } from './tooltip/provider'
import { buildChangelogPath, normalizeBasePath } from './paths'

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
  preset?: string
}

interface ChangelogManagerProps {
  params?: RouteParams
  searchParams?: SearchParams
  basePath?: string
}

export default function ChangelogManager({ params, searchParams, basePath }: ChangelogManagerProps) {
  const route = params?.route?.[0] || ''
  const adminSection = params?.route?.[1]
  const adminEditId = params?.route?.[2]
  const normalizedBasePath = normalizeBasePath(basePath)
  let content: ReactNode

  // Route logic
  if (route === 'admin') {
    content = <AdminPortalRoute section={adminSection} editId={adminEditId} preset={searchParams?.preset} basePath={normalizedBasePath} />
  } else if (route === 'login') {
    content = <LoginRoute basePath={normalizedBasePath} />
  } else if (route === 'register') {
    content = <RegisterRoute basePath={normalizedBasePath} />
  } else if (route) {
    content = <DetailRoute slug={route} basePath={normalizedBasePath} />
  } else {
    // Default: public feed
    content = <PublicFeedRoute searchParams={searchParams} basePath={normalizedBasePath} />
  }

  return (
    <TooltipProvider>
      <ToastProvider>{content}</ToastProvider>
    </TooltipProvider>
  )
}

/**
 * Public Feed Route
 */
function PublicFeedRoute({
  searchParams,
  basePath,
}: {
  searchParams?: { page?: string; tags?: string; search?: string }
  basePath: string
}) {
  const page = Math.max(1, Number(searchParams?.page ?? 1))
  const tags = (searchParams?.tags ?? '').split(',').filter(Boolean) as import('../types/changelog').ChangelogTag[]
  const search = searchParams?.search ?? ''

  return (
    <main className="cl-root cl-section cl-feed-screen">
      <Suspense fallback={<LoadingFallback />}>
        <ChangelogFeed initialPage={page} initialTags={tags} initialSearch={search} basePath={basePath} />
      </Suspense>
    </main>
  )
}

/**
 * Login Route
 */
function LoginRoute({ basePath }: { basePath: string }) {
  return (
    <main className="cl-root cl-section cl-login-screen">
      <Suspense fallback={<LoadingFallback />}>
        <LoginForm basePath={basePath} />
      </Suspense>
    </main>
  )
}

function RegisterRoute({ basePath }: { basePath: string }) {
  return (
    <main className="cl-root cl-section cl-login-screen">
      <Suspense fallback={<LoadingFallback />}>
        <RegisterForm basePath={basePath} />
      </Suspense>
    </main>
  )
}

function DetailRoute({ slug, basePath }: { slug: string; basePath: string }) {
  return (
    <main className="cl-root cl-section cl-feed-screen">
      <Suspense fallback={<LoadingFallback />}>
        <ChangelogDetail slug={slug} basePath={basePath} />
      </Suspense>
    </main>
  )
}

/**
 * Admin Portal Route
 */
function AdminPortalRoute({
  section,
  editId,
  preset,
  basePath,
}: {
  section?: string
  editId?: string
  preset?: string
  basePath: string
}) {
  return (
    <main className="cl-root cl-section cl-admin-screen">
      <Suspense fallback={<LoadingFallback />}>
        <AdminAuthWrapper basePath={basePath}>
          <AdminPortal section={section} editId={editId} preset={preset} basePath={basePath} />
        </AdminAuthWrapper>
      </Suspense>
    </main>
  )
}

/**
 * Admin Auth Wrapper - checks if user is authenticated
 */
async function AdminAuthWrapper({ children, basePath }: { children: ReactNode; basePath: string }) {
  const isAdmin = await checkAdminAuth()

  if (!isAdmin) {
    return (
      <div className="cl-card cl-auth-guard-card">
        <div className="cl-card-header">
          <h1 className="cl-card-title">Access Denied</h1>
        </div>
        <div className="cl-card-content">
          <p className="cl-p">Please log in to access the admin portal.</p>
          <a href={buildChangelogPath(basePath, 'login')} className="cl-btn cl-btn-primary cl-auth-guard-link">
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
