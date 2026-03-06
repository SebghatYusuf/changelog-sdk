'use client'

import { useRouter } from 'next/navigation'
import { handleLogoutAction } from '../../actions/logout-actions'
import { normalizeBasePath } from '../../runtime/paths'

/**
 * Logout Button - Client Component
 * Handles the logout action and redirect
 */

export default function LogoutButton({ basePath = '/changelog' }: { basePath?: string }) {
  const router = useRouter()
  const resolvedBasePath = normalizeBasePath(basePath)

  async function handleLogout(_formData: FormData) {
    await handleLogoutAction()
    // Redirect to home
    router.push(resolvedBasePath)
  }

  return (
    <form action={handleLogout}>
      <button type="submit" className="cl-btn cl-btn-secondary cl-btn-compact">
        Logout
      </button>
    </form>
  )
}
