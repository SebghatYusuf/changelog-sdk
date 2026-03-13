'use client'

import { createContext, useContext } from 'react'
import type { ChangelogApiClient } from './types'

const ChangelogApiContext = createContext<ChangelogApiClient | null>(null)

export function ChangelogApiProvider({
  api,
  children,
}: {
  api: ChangelogApiClient
  children: React.ReactNode
}) {
  return (
    <ChangelogApiContext.Provider value={api}>{children}</ChangelogApiContext.Provider>
  )
}

export function useChangelogApi(): ChangelogApiClient {
  const api = useContext(ChangelogApiContext)
  if (!api) {
    throw new Error('ChangelogApiProvider is missing. Wrap your tree with <ChangelogApiProvider api={...} />.')
  }
  return api
}
