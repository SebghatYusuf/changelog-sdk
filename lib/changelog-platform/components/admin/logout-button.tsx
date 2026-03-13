'use client'

import { type FormEvent } from 'react'
import { useChangelogApi } from '../../api/context'
import { buildChangelogPath } from '../paths'

/**
 * Logout Button - Client Component
 * Handles the logout action and redirect
 */

export default function LogoutButton({ basePath }: { basePath?: string }) {
  const api = useChangelogApi()
  const handleLogout = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await api.logout()
    window.location.href = buildChangelogPath(basePath, 'login')
  }

  return (
    <form onSubmit={handleLogout}>
      <button type="submit" className="cl-btn cl-btn-secondary cl-btn-compact">
        Logout
      </button>
    </form>
  )
}
