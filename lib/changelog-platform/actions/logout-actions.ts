'use server'

import { logoutAdmin } from './changelog-actions'

/**
 * Logout Server Action
 * Extracted to separate file to avoid inline 'use server' in Client Components
 */

export async function handleLogoutAction() {
  await logoutAdmin()
  // Note: Redirect should be handled in the Client Component
  // using useRouter().push() or revalidatePath()
}
