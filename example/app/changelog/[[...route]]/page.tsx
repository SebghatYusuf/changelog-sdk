import { Suspense } from 'react'
import { ChangelogManager } from 'changelog-sdk'

interface ChangelogPageProps {
  params: Promise<{
    route?: string[]
  }>
  searchParams: Promise<{
    page?: string
    tags?: string
    search?: string
  }>
}

export default function ChangelogPage(props: ChangelogPageProps) {
  return (
    <Suspense fallback={<ChangelogPageFallback />}>
      <ChangelogPageContent {...props} />
    </Suspense>
  )
}

async function ChangelogPageContent({ params, searchParams }: ChangelogPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams])

  return <ChangelogManager params={resolvedParams} searchParams={resolvedSearchParams} />
}

function ChangelogPageFallback() {
  return (
    <main className="cl-root cl-section cl-feed-screen">
      <div className="cl-loading-screen">
        <div className="cl-spinner" />
        <span className="cl-loading-label">Loading...</span>
      </div>
    </main>
  )
}
