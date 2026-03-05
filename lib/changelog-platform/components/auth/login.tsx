'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { loginAdmin } from '../../actions/changelog-actions'
import { useRouter } from 'next/navigation'

/**
 * Admin Login Form Component
 */

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string>('')

  async function handleLogin(formData: FormData) {
    const password = formData.get('password') as string

    if (!password) {
      setError('Password is required')
      return
    }

    const result = await loginAdmin(password)

    if (!result.success) {
      setError(result.error || 'Authentication failed')
      return
    }

    // Redirect to admin portal
    router.push('/changelog/admin')
  }

  return (
    <form action={handleLogin} className="cl-card cl-login-card">
      <div className="cl-card-header">
        <h1 className="cl-card-title">Admin Login</h1>
        <p className="cl-card-description">Enter the admin password to access the portal</p>
      </div>

      <div className="cl-card-content cl-login-card-content">
        {/* Error Alert */}
        {error && (
          <div className="cl-alert cl-alert-error">
            <div className="cl-alert-description">{error}</div>
          </div>
        )}

        {/* Password Input */}
        <div className="cl-form-group">
          <label className="cl-form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter admin password"
            className="cl-input"
            required
          />
        </div>

        {/* Submit Button */}
        <SubmitButton />
      </div>
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="cl-btn cl-btn-primary cl-login-submit"
    >
      {pending ? (
        <>
          <span className="cl-spinner cl-spinner-sm cl-spinner-inline" />
          Authenticating...
        </>
      ) : (
        'Sign In'
      )}
    </button>
  )
}
