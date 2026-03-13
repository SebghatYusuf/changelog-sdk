'use client'

import ChangelogManager from '../changelog-platform/components/manager'
import { ChangelogApiProvider } from '../changelog-platform/api/context'
import { createNextChangelogApi } from '../changelog-platform/api/next'

interface NextChangelogManagerProps {
  params?: { route?: string[] }
  searchParams?: { page?: string; tags?: string; search?: string; preset?: string }
  basePath?: string
}

export default function NextChangelogManager(props: NextChangelogManagerProps) {
  return (
    <ChangelogApiProvider api={createNextChangelogApi()}>
      <ChangelogManager {...props} />
    </ChangelogApiProvider>
  )
}
