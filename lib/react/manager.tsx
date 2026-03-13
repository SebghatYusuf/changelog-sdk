'use client'

import { useEffect, useMemo } from 'react'
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

const isDevRuntime = (() => {
  try {
    return typeof process !== 'undefined' &&
      typeof process.env !== 'undefined' &&
      process.env.NODE_ENV !== 'production'
  } catch {
    return false
  }
})()

export default function ReactChangelogManager({
  api,
  baseUrl,
  apiBasePath,
  ...props
}: ReactChangelogManagerProps) {
  useEffect(() => {
    if (!isDevRuntime) return
    if (api) return
    if (typeof window !== 'undefined' && '__NEXT_DATA__' in window) {
      console.warn(
        '[changelog-sdk] Detected Next.js runtime with changelog-sdk/react. Use changelog-sdk/next or pass api={createNextChangelogApi()} to use server actions.'
      )
    }
  }, [api])

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
