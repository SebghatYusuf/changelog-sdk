'use client'

import { useMemo } from 'react'
import ChangelogManager from '../changelog-platform/components/manager'
import { ChangelogApiProvider } from '../changelog-platform/api/context'
import { createRestChangelogApi } from '../changelog-platform/api/rest'
import type { ChangelogApiClient } from '../changelog-platform/api/types'

interface ReactChangelogManagerProps {
  params?: { route?: string[] }
  searchParams?: { page?: string; tags?: string; search?: string; preset?: string }
  basePath?: string
  baseUrl?: string
  apiBasePath?: string
  api?: ChangelogApiClient
}

export default function ReactChangelogManager({
  api,
  baseUrl,
  apiBasePath,
  ...props
}: ReactChangelogManagerProps) {
  const apiClient = useMemo(
    () => api || createRestChangelogApi({ baseUrl, apiBasePath }),
    [api, baseUrl, apiBasePath]
  )

  return (
    <ChangelogApiProvider api={apiClient}>
      <ChangelogManager {...props} />
    </ChangelogApiProvider>
  )
}
