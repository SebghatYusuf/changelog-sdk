'use client'

import { useEffect, useRef, useState } from 'react'
import { fetchChangelogSettings, updateChangelogSettings } from '../../actions/changelog-actions'
import { useToast } from '../toast/provider'

interface SettingsState {
  currentVersion: string
  defaultFeedPageSize: number
  autoPublish: boolean
}

const INITIAL_STATE: SettingsState = {
  currentVersion: '1.0.0',
  defaultFeedPageSize: 10,
  autoPublish: false,
}

export default function ChangelogSettingsPanel() {
  const { showToast } = useToast()
  const [state, setState] = useState<SettingsState>(INITIAL_STATE)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const lastToastKeyRef = useRef('')

  useEffect(() => {
    let isMounted = true

    ;(async () => {
      const result = await fetchChangelogSettings()
      if (!isMounted) return

      if (!result.success || !result.data) {
        setError(result.error || 'Failed to load changelog settings')
        setLoading(false)
        return
      }

      setState({
        currentVersion: result.data.currentVersion,
        defaultFeedPageSize: result.data.defaultFeedPageSize,
        autoPublish: result.data.autoPublish,
      })
      setLoading(false)
    })()

    return () => {
      isMounted = false
    }
  }, [])

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

    const result = await updateChangelogSettings(state)
    if (!result.success || !result.data) {
      setSaving(false)
      setError(result.error || 'Failed to save settings')
      return
    }

    const saved = result.data
    setState({
      currentVersion: saved.currentVersion,
      defaultFeedPageSize: saved.defaultFeedPageSize,
      autoPublish: saved.autoPublish,
    })
    setSaving(false)
    setSuccess('Changelog settings saved.')
  }

  return (
    <div className="cl-card cl-admin-panel cl-admin-settings-panel">
      <div className="cl-card-header">
        <h3 className="cl-card-title">Changelog settings</h3>
        <p className="cl-card-description">Manage versioning defaults and feed behavior from one place.</p>
      </div>
      <div className="cl-card-content cl-admin-form-body">
        {loading ? (
          <div className="cl-admin-skeleton-body">
            <div className="cl-admin-skeleton-line" />
            <div className="cl-admin-skeleton-line" />
            <div className="cl-admin-skeleton-line" />
          </div>
        ) : null}

        {!loading && error ? (
          <div className="cl-alert cl-alert-error">
            <div className="cl-alert-description">{error}</div>
          </div>
        ) : null}

        {!loading && success ? (
          <div className="cl-alert cl-alert-success">
            <div className="cl-alert-description">{success}</div>
          </div>
        ) : null}

        {!loading ? (
          <>
            <div className="cl-form-group">
              <label className="cl-form-label" htmlFor="current-version">
                Current release version
              </label>
              <input
                id="current-version"
                className="cl-input"
                value={state.currentVersion}
                onChange={(e) => setState((prev) => ({ ...prev, currentVersion: e.target.value }))}
                placeholder="e.g. 1.4.2"
              />
            </div>

            <div className="cl-form-group">
              <label className="cl-form-label" htmlFor="default-feed-page-size">
                Default feed page size
              </label>
              <input
                id="default-feed-page-size"
                className="cl-input"
                type="number"
                min={1}
                max={50}
                value={state.defaultFeedPageSize}
                onChange={(e) => setState((prev) => ({ ...prev, defaultFeedPageSize: Number(e.target.value) || 10 }))}
              />
            </div>

            <div className="cl-form-group">
              <label className="cl-form-label" htmlFor="auto-publish">
                Auto-publish new entries
              </label>
              <select
                id="auto-publish"
                className="cl-select"
                value={state.autoPublish ? 'enabled' : 'disabled'}
                onChange={(e) => setState((prev) => ({ ...prev, autoPublish: e.target.value === 'enabled' }))}
              >
                <option value="disabled">Disabled</option>
                <option value="enabled">Enabled</option>
              </select>
            </div>

            <button type="button" className="cl-btn cl-btn-primary cl-admin-submit" onClick={onSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save changelog settings'}
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
