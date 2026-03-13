'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useChangelogApi } from '../../api/context'
import { buildChangelogPath } from '../paths'

/**
 * Admin Login Form Component
 */

export default function LoginForm({ basePath }: { basePath?: string }) {
  const api = useChangelogApi()
  const [error, setError] = useState<string>('')
  const [canRegister, setCanRegister] = useState<boolean | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true

    api.canRegister()
      .then((result) => {
        if (mounted && result.success && result.data) {
          setCanRegister(result.data.canRegister)
        }
      })
      .catch(() => undefined)

    return () => {
      mounted = false
    }
  }, [api])

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Email is required')
      return
    }

    if (!password) {
      setError('Password is required')
      return
    }

    setIsSubmitting(true)
    const result = await api.login({ email, password })
    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error || 'Authentication failed')
      return
    }

    // Redirect to admin portal
    window.location.href = buildChangelogPath(basePath, 'admin')
  }

  return (
    <form onSubmit={handleLogin} className="cl-card cl-login-card">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <SubmitButton disabled={isSubmitting} />
        {canRegister === true && (
          <a href={buildChangelogPath(basePath, 'register')} className="cl-btn cl-btn-secondary cl-login-submit">
            Create Admin Account
          </a>
        )}
      </div>
    </form>
  )
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="cl-btn cl-btn-primary cl-login-submit"
    >
      {disabled ? (
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
