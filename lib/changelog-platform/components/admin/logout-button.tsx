'use client'

import { useRouter } from 'next/navigation'
import { handleLogoutAction } from '../../actions/logout-actions'
import { buildChangelogPath } from '../paths'

/**
 * Logout Button - Client Component
 * Handles the logout action and redirect
 */

export default function LogoutButton({ basePath }: { basePath?: string }) {
  const router = useRouter()

  async function handleLogout(_formData: FormData) {
    await handleLogoutAction()
    router.refresh()
    router.push(buildChangelogPath(basePath, 'login'))
  }

  return (
    <form action={handleLogout}>
      <button type="submit" className="cl-btn cl-btn-secondary cl-btn-compact">
        Logout
      </button>
    </form>
  )
}
