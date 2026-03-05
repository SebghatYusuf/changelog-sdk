import { ChangelogManager } from 'changelog-sdk'

interface ChangelogPageProps {
  params: Promise<{
    route?: string[]
  }>
}

export default async function ChangelogPage({ params }: ChangelogPageProps) {
  const resolvedParams = await params
  return <ChangelogManager params={resolvedParams} />
}
