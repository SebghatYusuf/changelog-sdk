'use client'

import AdminPortal from '../changelog-platform/components/admin/portal'
import { ChangelogApiProvider } from '../changelog-platform/api/context'
import { createNextChangelogApi } from '../changelog-platform/api/next'

interface NextAdminPortalProps {
  section?: string
  editId?: string
  preset?: string
  basePath?: string
}

export default function NextAdminPortal(props: NextAdminPortalProps) {
  return (
    <ChangelogApiProvider api={createNextChangelogApi()}>
      <AdminPortal {...props} />
    </ChangelogApiProvider>
  )
}
