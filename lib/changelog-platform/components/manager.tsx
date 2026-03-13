'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { useChangelogApi } from '../api/context'
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
      <ChangelogFeed initialPage={page} initialTags={tags} initialSearch={search} basePath={basePath} />
    </main>
  )
}

/**
 * Login Route
 */
function LoginRoute({ basePath }: { basePath: string }) {
  return (
    <main className="cl-root cl-section cl-login-screen">
      <LoginForm basePath={basePath} />
    </main>
  )
}

function RegisterRoute({ basePath }: { basePath: string }) {
  return (
    <main className="cl-root cl-section cl-login-screen">
      <RegisterForm basePath={basePath} />
    </main>
  )
}

function DetailRoute({ slug, basePath }: { slug: string; basePath: string }) {
  return (
    <main className="cl-root cl-section cl-feed-screen">
      <ChangelogDetail slug={slug} basePath={basePath} />
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
      <AdminAuthWrapper basePath={basePath}>
        <AdminPortal section={section} editId={editId} preset={preset} basePath={basePath} />
      </AdminAuthWrapper>
    </main>
  )
}

/**
 * Admin Auth Wrapper - checks if user is authenticated
 */
function AdminAuthWrapper({ children, basePath }: { children: ReactNode; basePath: string }) {
  const api = useChangelogApi()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true
    api.checkAdminAuth()
      .then((result) => {
        if (mounted) setIsAdmin(Boolean(result))
      })
      .catch(() => {
        if (mounted) setIsAdmin(false)
      })
    return () => {
      mounted = false
    }
  }, [api])

  if (isAdmin === null) {
    return <LoadingFallback />
  }

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
