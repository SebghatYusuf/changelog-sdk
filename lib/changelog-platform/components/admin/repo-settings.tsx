'use client'

import { useEffect, useRef, useState } from 'react'
import type { RepoProviderKind, RepoSettingsView } from '../../types/changelog'
import { useChangelogApi } from '../../api/context'
import { useToast } from '../toast/provider'

interface RepoSettingsState {
  provider: RepoProviderKind
  repoUrl: string
  workspace: string
  repoSlug: string
  branch: string
  enabled: boolean
  token: string
  clearToken: boolean
  hasToken: boolean
}

const INITIAL_STATE: RepoSettingsState = {
  provider: 'git',
  repoUrl: '',
  workspace: '',
  repoSlug: '',
  branch: 'main',
  enabled: false,
  token: '',
  clearToken: false,
  hasToken: false,
}

function toState(data: RepoSettingsView): RepoSettingsState {
  return {
    provider: data.provider,
    repoUrl: data.repoUrl || '',
    workspace: data.workspace || '',
    repoSlug: data.repoSlug || '',
    branch: data.branch || 'main',
    enabled: data.enabled,
    token: '',
    clearToken: false,
    hasToken: data.hasToken,
  }
}

export default function RepoSettingsPanel() {
  const api = useChangelogApi()
  const { showToast } = useToast()
  const [state, setState] = useState<RepoSettingsState>(INITIAL_STATE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const lastToastKeyRef = useRef('')

  useEffect(() => {
    let mounted = true

    ;(async () => {
      const result = await api.getRepoSettings()
      if (!mounted) return

      if (!result.success || !result.data) {
        setError(result.error || 'Failed to load repository settings')
        setLoading(false)
        return
      }

      setState(toState(result.data))
      setLoading(false)
    })()

    return () => {
      mounted = false
    }
  }, [api])

  useEffect(() => {
    const message = error || success
    if (!message) return

    const tone = error ? 'error' : 'success'
    const key = `${tone}:${message}`
    if (key === lastToastKeyRef.current) return

    showToast(message, tone)
    lastToastKeyRef.current = key
  }, [error, success, showToast])

  const onSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    const payload: Record<string, unknown> = {
      provider: state.provider,
      branch: state.branch,
      enabled: state.enabled,
    }

    if (state.provider === 'git') {
      payload.repoUrl = state.repoUrl
    } else {
      payload.workspace = state.workspace
      payload.repoSlug = state.repoSlug
    }

    if (state.token.trim()) {
      payload.token = state.token
    }

    if (state.clearToken) {
      payload.clearToken = true
    }

    const result = await api.updateRepoSettings(payload)
    if (!result.success || !result.data) {
      setSaving(false)
      setError(result.error || 'Failed to save repository settings')
      return
    }

    setState(toState(result.data))
    setSaving(false)
    setSuccess('Repository settings saved.')
  }

  return (
    <div className="cl-card cl-admin-panel cl-admin-settings-panel">
      <div className="cl-card-header">
        <h3 className="cl-card-title">Repository settings</h3>
        <p className="cl-card-description">Connect a repository to generate changelogs from commits.</p>
      </div>
      <div className="cl-card-content cl-admin-form-body">
        {loading ? (
          <div className="cl-admin-skeleton-body">
            <div className="cl-admin-skeleton-line" />
            <div className="cl-admin-skeleton-line" />
            <div className="cl-admin-skeleton-line" />
          </div>
        ) : null}

        {!loading ? (
          <>
            <div className="cl-form-group">
              <label className="cl-form-label" htmlFor="repo-provider">
                Provider
              </label>
              <select
                id="repo-provider"
                className="cl-select"
                value={state.provider}
                onChange={(e) => setState((prev) => ({ ...prev, provider: e.target.value as RepoProviderKind }))}
              >
                <option value="git">Git (GitHub)</option>
                <option value="bitbucket">Bitbucket</option>
              </select>
            </div>

            {state.provider === 'git' ? (
              <div className="cl-form-group">
                <label className="cl-form-label" htmlFor="repo-url">
                  Repository URL
                </label>
                <input
                  id="repo-url"
                  className="cl-input"
                  type="url"
                  placeholder="https://github.com/org/repo"
                  value={state.repoUrl}
                  onChange={(e) => setState((prev) => ({ ...prev, repoUrl: e.target.value }))}
                />
              </div>
            ) : null}

            {state.provider === 'bitbucket' ? (
              <div className="cl-form-group">
                <label className="cl-form-label" htmlFor="repo-workspace">
                  Workspace
                </label>
                <input
                  id="repo-workspace"
                  className="cl-input"
                  placeholder="workspace-id"
                  value={state.workspace}
                  onChange={(e) => setState((prev) => ({ ...prev, workspace: e.target.value }))}
                />
              </div>
            ) : null}

            {state.provider === 'bitbucket' ? (
              <div className="cl-form-group">
                <label className="cl-form-label" htmlFor="repo-slug">
                  Repository slug
                </label>
                <input
                  id="repo-slug"
                  className="cl-input"
                  placeholder="repo-name"
                  value={state.repoSlug}
                  onChange={(e) => setState((prev) => ({ ...prev, repoSlug: e.target.value }))}
                />
              </div>
            ) : null}

            <div className="cl-form-group">
              <label className="cl-form-label" htmlFor="repo-branch">
                Branch
              </label>
              <input
                id="repo-branch"
                className="cl-input"
                placeholder="main"
                value={state.branch}
                onChange={(e) => setState((prev) => ({ ...prev, branch: e.target.value }))}
              />
            </div>

            <div className="cl-form-group">
              <label className="cl-form-label" htmlFor="repo-token">
                Access token
              </label>
              <input
                id="repo-token"
                className="cl-input"
                type="password"
                placeholder={state.hasToken ? 'Token saved (leave blank to keep)' : 'Paste token'}
                value={state.token}
                onChange={(e) => setState((prev) => ({ ...prev, token: e.target.value, clearToken: false }))}
              />
              <p className="cl-card-description">
                Tokens are stored encrypted using `CHANGELOG_ENCRYPTION_KEY`.
              </p>
            </div>

            {state.hasToken ? (
              <div className="cl-form-group">
                <label className="cl-form-label" htmlFor="repo-clear-token">
                  Clear token
                </label>
                <select
                  id="repo-clear-token"
                  className="cl-select"
                  value={state.clearToken ? 'yes' : 'no'}
                  onChange={(e) => setState((prev) => ({ ...prev, clearToken: e.target.value === 'yes' }))}
                >
                  <option value="no">Keep existing token</option>
                  <option value="yes">Remove token</option>
                </select>
              </div>
            ) : null}

            <div className="cl-form-group">
              <label className="cl-form-label" htmlFor="repo-enabled">
                Integration status
              </label>
              <select
                id="repo-enabled"
                className="cl-select"
                value={state.enabled ? 'enabled' : 'disabled'}
                onChange={(e) => setState((prev) => ({ ...prev, enabled: e.target.value === 'enabled' }))}
              >
                <option value="disabled">Disabled</option>
                <option value="enabled">Enabled</option>
              </select>
            </div>

            <button type="button" className="cl-btn cl-btn-primary cl-admin-submit" onClick={onSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save repository settings'}
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
