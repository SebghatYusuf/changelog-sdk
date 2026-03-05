import { Suspense, type ReactNode } from 'react'
import { checkAdminAuth } from '../actions/changelog-actions'
import ChangelogFeed from './feed/timeline'
import AdminPortal from './admin/portal'
import LoginForm from './auth/login'

/**
 * Main Changelog Manager Component - Server Component
 * Routes between Feed, Login, and Admin views based on URL params
 */

interface ChangelogManagerProps {
  params?: {
    route?: string[]
  }
}

export default function ChangelogManager({ params }: ChangelogManagerProps) {
  const route = params?.route?.[0] || ''

  // Route logic
  if (route === 'admin') {
    return <AdminPortalRoute />
  }

  if (route === 'login') {
    return <LoginRoute />
  }

  // Default: public feed
  return <PublicFeedRoute />
}

/**
 * Public Feed Route
 */
function PublicFeedRoute() {
  return (
    <main className="cl-root cl-section cl-feed-screen">
      <Suspense fallback={<LoadingFallback />}>
        <ChangelogFeed />
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

/**
 * Admin Portal Route
 */
function AdminPortalRoute() {
  return (
    <main className="cl-root cl-section cl-admin-screen">
      <Suspense fallback={<LoadingFallback />}>
        <AdminAuthWrapper>
          <AdminPortal />
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
