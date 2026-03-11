import { Suspense } from 'react'
import { ChangelogManager } from 'changelog-sdk/next'

interface ChangelogPageProps {
  params: Promise<{ route?: string[] }>
  searchParams: Promise<{ page?: string; tags?: string; search?: string; preset?: string }>
}

export const metadata = {
  title: 'Changelog',
  description: 'View our latest updates and improvements',
}

export default function ChangelogPage(props: ChangelogPageProps) {
  return (
    <Suspense>
      <ChangelogPageContent {...props} />
    </Suspense>
  )
}

async function ChangelogPageContent({ params, searchParams }: ChangelogPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams])
  return <ChangelogManager params={resolvedParams} searchParams={resolvedSearchParams} />
}
