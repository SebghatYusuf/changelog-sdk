'use client'

import { useState } from 'react'
import { useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { canRegisterAdmin, loginAdmin, registerAdmin } from '../../actions/changelog-actions'
import { useRouter } from 'next/navigation'

/**
 * Admin Login Form Component
 */

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [canRegister, setCanRegister] = useState(false)

  useEffect(() => {
    let mounted = true

    canRegisterAdmin()
      .then((result) => {
        if (mounted && result.success && result.data) {
          setCanRegister(result.data.canRegister)
        }
      })
      .catch(() => undefined)

    return () => {
      mounted = false
    }
  }, [])

  async function handleLogin(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const displayName = formData.get('displayName') as string | null
    const intent = (formData.get('intent') as string) || 'login'

    if (!email) {
      setError('Email is required')
      return
    }

    if (!password) {
      setError('Password is required')
      return
    }

    const result =
      intent === 'register'
        ? await registerAdmin({ email, password, displayName: displayName || undefined })
        : await loginAdmin({ email, password })

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
        <p className="cl-card-description">
          {canRegister ? 'Create the first admin account or sign in' : 'Sign in with your admin account'}
        </p>
      </div>

      <div className="cl-card-content cl-login-card-content">
        {/* Error Alert */}
        {error && (
          <div className="cl-alert cl-alert-error">
            <div className="cl-alert-description">{error}</div>
          </div>
        )}

        <div className="cl-form-group">
          <label className="cl-form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter admin email"
            className="cl-input"
            required
          />
        </div>

        {canRegister && (
          <div className="cl-form-group">
            <label className="cl-form-label" htmlFor="displayName">
              Display name (optional)
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="Admin"
              className="cl-input"
            />
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
            placeholder="Enter account password"
            className="cl-input"
            required
          />
        </div>

        {/* Submit Button */}
        <SubmitButton canRegister={canRegister} />
      </div>
    </form>
  )
}

function SubmitButton({ canRegister }: { canRegister: boolean }) {
  const { pending } = useFormStatus()

  return (
    <>
      <button
        type="submit"
        name="intent"
        value="login"
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
      {canRegister && (
        <button
          type="submit"
          name="intent"
          value="register"
          disabled={pending}
          className="cl-btn cl-btn-secondary cl-login-submit"
        >
          {pending ? 'Creating account...' : 'Create Admin Account'}
        </button>
      )}
    </>
  )
}
