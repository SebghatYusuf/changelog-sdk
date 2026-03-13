'use client'

import ChangelogFeed from '../changelog-platform/components/feed/timeline'
import { ChangelogApiProvider } from '../changelog-platform/api/context'
import { createNextChangelogApi } from '../changelog-platform/api/next'
import type { ChangelogTag } from '../changelog-platform/types/changelog'

interface NextChangelogFeedProps {
  initialPage?: number
  initialTags?: ChangelogTag[]
  initialSearch?: string
  basePath?: string
}

export default function NextChangelogFeed(props: NextChangelogFeedProps) {
  return (
    <ChangelogApiProvider api={createNextChangelogApi()}>
      <ChangelogFeed {...props} />
    </ChangelogApiProvider>
  )
}
