'use client'

import { useState } from 'react'
import { useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { canRegisterAdmin, loginAdmin } from '../../actions/changelog-actions'
import { useRouter } from 'next/navigation'
import { buildChangelogPath } from '../paths'

/**
 * Admin Login Form Component
 */

export default function LoginForm({ basePath }: { basePath?: string }) {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [canRegister, setCanRegister] = useState<boolean | null>(null)

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

    if (!email) {
      setError('Email is required')
      return
    }

    if (!password) {
      setError('Password is required')
      return
    }

    const result = await loginAdmin({ email, password })

    if (!result.success) {
      setError(result.error || 'Authentication failed')
      return
    }

    // Redirect to admin portal
    router.push(buildChangelogPath(basePath, 'admin'))
  }

  return (
    <form action={handleLogin} className="cl-card cl-login-card">
      <div className="cl-card-header">
        <h1 className="cl-card-title">Admin Login</h1>
        <p className="cl-card-description">Sign in with your admin account</p>
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
        <SubmitButton />
        {canRegister === true && (
          <a href={buildChangelogPath(basePath, 'register')} className="cl-btn cl-btn-secondary cl-login-submit">
            Create Admin Account
          </a>
        )}
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
