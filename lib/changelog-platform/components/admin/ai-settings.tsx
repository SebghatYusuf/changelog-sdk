'use client'

import { useEffect, useState } from 'react'
import { fetchAIProviderModels, fetchAISettings, updateAISettings } from '../../actions/changelog-actions'
import type { AIModelOption, AIProviderKind } from '../../types/changelog'
import { DEFAULT_AI_MODELS } from '../../ai/constants'

interface SettingsState {
  provider: AIProviderKind
  model: string
  ollamaBaseUrl: string
}

const INITIAL_STATE: SettingsState = {
  provider: 'openai',
  model: DEFAULT_AI_MODELS.openai,
  ollamaBaseUrl: 'http://localhost:11434',
}

export default function AISettingsPanel() {
  const [state, setState] = useState<SettingsState>(INITIAL_STATE)
  const [models, setModels] = useState<AIModelOption[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadModels = async (nextState: SettingsState) => {
    setLoadingModels(true)
    setError('')

    const result = await fetchAIProviderModels({
      provider: nextState.provider,
      ollamaBaseUrl: nextState.ollamaBaseUrl || undefined,
    })

    if (!result.success || !result.data) {
      setLoadingModels(false)
      setError(result.error || 'Failed to load models')
      return
    }

    const modelOptions = result.data
    setModels(modelOptions)

    if (!modelOptions.some((m) => m.id === nextState.model)) {
      setState((prev) => ({ ...prev, model: modelOptions[0]?.id || DEFAULT_AI_MODELS[nextState.provider] }))
    }

    setLoadingModels(false)
  }

  useEffect(() => {
    let isMounted = true

    ;(async () => {
      const result = await fetchAISettings()
      if (!isMounted) return

      if (!result.success || !result.data) {
        setError(result.error || 'Failed to load AI settings')
        return
      }

      const loaded: SettingsState = {
        provider: result.data.provider,
        model: result.data.model || DEFAULT_AI_MODELS[result.data.provider],
        ollamaBaseUrl: result.data.ollamaBaseUrl || 'http://localhost:11434',
      }

      setState(loaded)
      await loadModels(loaded)
    })()

    return () => {
      isMounted = false
    }
  }, [])

  const onProviderChange = async (provider: AIProviderKind) => {
    const nextState: SettingsState = {
      ...state,
      provider,
      model: DEFAULT_AI_MODELS[provider],
    }
    setState(nextState)
    await loadModels(nextState)
  }

  const saveSettings = async () => {
    setSaving(true)
    setSuccess('')
    setError('')

    const result = await updateAISettings(state)

    if (!result.success) {
      setError(result.error || 'Failed to save settings')
      setSaving(false)
      return
    }

    setSuccess('AI settings saved.')
    setSaving(false)
  }

  return (
    <div className="cl-card cl-admin-panel cl-ai-settings-panel">
      <div className="cl-card-header">
        <h3 className="cl-card-title">AI settings</h3>
        <p className="cl-card-description">Select provider, load available models, and save defaults for enhancement.</p>
      </div>

      <div className="cl-card-content cl-admin-form-body">
        {error ? (
          <div className="cl-alert cl-alert-error">
            <div className="cl-alert-description">{error}</div>
          </div>
        ) : null}

        {success ? (
          <div className="cl-alert cl-alert-success">
            <div className="cl-alert-description">{success}</div>
          </div>
        ) : null}

        <div className="cl-form-group">
          <label className="cl-form-label" htmlFor="ai-provider">
            Provider
          </label>
          <select
            id="ai-provider"
            className="cl-select"
            value={state.provider}
            onChange={(e) => onProviderChange(e.target.value as AIProviderKind)}
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Google Gemini</option>
            <option value="ollama">Ollama</option>
          </select>
        </div>

        {(state.provider === 'openai' || state.provider === 'gemini') ? (
          <div className="cl-form-group">
            <p className="cl-card-description">
              {state.provider === 'openai'
                ? 'Uses OPENAI_API_KEY from environment variables.'
                : 'Uses GOOGLE_GENERATIVE_AI_API_KEY from environment variables.'}
            </p>
          </div>
        ) : null}

        {state.provider === 'ollama' ? (
          <div className="cl-form-group">
            <label className="cl-form-label" htmlFor="ollama-url">
              Ollama base URL
            </label>
            <input
              id="ollama-url"
              className="cl-input"
              type="url"
              placeholder="http://localhost:11434"
              value={state.ollamaBaseUrl}
              onChange={(e) => setState((prev) => ({ ...prev, ollamaBaseUrl: e.target.value }))}
            />
          </div>
        ) : null}

        <div className="cl-form-group">
          <label className="cl-form-label" htmlFor="ai-model">
            Model
          </label>
          <div className="cl-ai-model-row">
            <select
              id="ai-model"
              className="cl-select"
              value={state.model}
              onChange={(e) => setState((prev) => ({ ...prev, model: e.target.value }))}
            >
              {models.length > 0 ? (
                models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))
              ) : (
                <option value={state.model}>{state.model || DEFAULT_AI_MODELS[state.provider]}</option>
              )}
            </select>

            <button
              type="button"
              className="cl-btn cl-btn-secondary cl-btn-compact"
              onClick={() => loadModels(state)}
              disabled={loadingModels}
            >
              {loadingModels ? 'Loading...' : 'Refresh models'}
            </button>
          </div>
        </div>

        <button type="button" className="cl-btn cl-btn-primary cl-admin-submit" onClick={saveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save AI settings'}
        </button>
      </div>
    </div>
  )
}
