'use client'

import { useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { canRegisterAdmin, registerAdmin } from '../../actions/changelog-actions'
import { useRouter } from 'next/navigation'
import { buildChangelogPath } from '../paths'

export default function RegisterForm({ basePath }: { basePath?: string }) {
  const router = useRouter()
  const [error, setError] = useState('')
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

  async function handleRegister(formData: FormData) {
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

    const result = await registerAdmin({ email, password })

    if (!result.success) {
      setError(result.error || 'Authentication failed')
      return
    }

    router.push(buildChangelogPath(basePath, 'admin'))
  }

  return (
    <form action={handleRegister} className="cl-card cl-login-card">
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
          />
        </div>

        <SubmitButton disabled={canRegister !== true} />
        <a href={buildChangelogPath(basePath, 'login')} className="cl-btn cl-btn-secondary cl-login-submit">
          Back to Login
        </a>
      </div>
    </form>
  )
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending || disabled} className="cl-btn cl-btn-primary cl-login-submit">
      {pending ? (
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
