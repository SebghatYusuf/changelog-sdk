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

export default async function ChangelogPage({ params, searchParams }: ChangelogPageProps) {
  const [resolvedParams, resolvedSearch] = await Promise.all([params, searchParams])
  return <ChangelogManager params={resolvedParams} searchParams={resolvedSearch} />
}
