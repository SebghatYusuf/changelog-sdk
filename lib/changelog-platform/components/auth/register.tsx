'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useChangelogApi } from '../../api/context'
import { buildChangelogPath } from '../paths'

export default function RegisterForm({ basePath }: { basePath?: string }) {
  const api = useChangelogApi()
  const [error, setError] = useState('')
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

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
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
    const result = await api.register({ email, password })
    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error || 'Authentication failed')
      return
    }

    window.location.href = buildChangelogPath(basePath, 'admin')
  }

  return (
    <form onSubmit={handleRegister} className="cl-card cl-login-card">
      <div className="cl-card-header">
        <h1 className="cl-card-title">Create Admin Account</h1>
        <p className="cl-card-description">Register a new admin account</p>
      </div>

      <div className="cl-card-content cl-login-card-content">
        {error && (
          <div className="cl-alert cl-alert-error">
            <div className="cl-alert-description">{error}</div>
          </div>
        )}

        {canRegister === false && (
          <div className="cl-alert cl-alert-error">
            <div className="cl-alert-description">
              Registration is currently disabled. Ask the site owner to set CHANGELOG_ALLOW_ADMIN_REGISTRATION=true.
            </div>
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
            disabled={canRegister !== true}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

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
            disabled={canRegister !== true}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <SubmitButton disabled={canRegister !== true} isSubmitting={isSubmitting} />
        <a href={buildChangelogPath(basePath, 'login')} className="cl-btn cl-btn-secondary cl-login-submit">
          Back to Login
        </a>
      </div>
    </form>
  )
}

function SubmitButton({ disabled, isSubmitting }: { disabled: boolean; isSubmitting: boolean }) {
  return (
    <button type="submit" disabled={disabled || isSubmitting} className="cl-btn cl-btn-primary cl-login-submit">
      {isSubmitting ? (
        <>
          <span className="cl-spinner cl-spinner-sm cl-spinner-inline" />
          Creating account...
        </>
      ) : (
        'Create Admin Account'
      )}
    </button>
  )
}
