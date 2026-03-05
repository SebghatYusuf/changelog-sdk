'use client'

import { useRouter } from 'next/navigation'
import { handleLogoutAction } from '../../actions/logout-actions'

/**
 * Logout Button - Client Component
 * Handles the logout action and redirect
 */

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout(_formData: FormData) {
    await handleLogoutAction()
    // Redirect to home
    router.push('/changelog')
  }

  return (
    <form action={handleLogout}>
      <button type="submit" className="cl-btn cl-btn-secondary cl-btn-compact">
        Logout
      </button>
    </form>
  )
}
