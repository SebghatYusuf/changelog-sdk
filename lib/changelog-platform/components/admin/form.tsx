'use client'

import { useEffect, useRef, useState } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Sparkles } from 'lucide-react'
import { createChangelog, fetchAISettings, fetchLatestPublishedVersion, runAIEnhance, updateChangelog } from '../../actions/changelog-actions'
import { ChangelogEntry, ChangelogTag } from '../../types/changelog'
import { useToast } from '../toast/provider'
import Tooltip from '../tooltip/tooltip'

/**
 * Create/Edit Changelog Form Component
 */

const ALL_TAGS: ChangelogTag[] = [
  'Features',
  'Fixes',
  'Improvements',
  'Breaking',
  'Security',
  'Performance',
  'Docs',
]

interface CreateFormState {
  success?: boolean
  error?: string
}

interface CreateFormProps {
  initialEntry?: ChangelogEntry
  preset?: string
}

type PresetType = 'feature-release' | 'hotfix' | 'maintenance'

const PRESETS: Record<PresetType, { title: string; content: string; tags: ChangelogTag[] }> = {
  'feature-release': {
    title: 'Feature release highlights',
    content: '## Features\n- Added major product capabilities\n\n## Improvements\n- Improved usability and workflows\n\n## Docs\n- Updated guides and examples',
    tags: ['Features', 'Improvements', 'Docs'],
  },
  hotfix: {
    title: 'Critical hotfix update',
    content: '## Fixes\n- Resolved a high-impact production issue\n\n## Performance\n- Stabilized runtime behavior under load\n\n## Security\n- Applied targeted hardening updates',
    tags: ['Fixes', 'Performance', 'Security'],
  },
  maintenance: {
    title: 'Maintenance and reliability update',
    content: '## Improvements\n- Refactored internal modules for maintainability\n\n## Performance\n- Optimized key execution paths\n\n## Fixes\n- Addressed lower-priority defects',
    tags: ['Improvements', 'Performance', 'Fixes'],
  },
}

type VersionBumpType = 'patch' | 'minor' | 'major'
type AILoadingAction = 'enhance-title' | 'generate-title' | 'enhance-content'

function normalizeSemver(value: string): string {
  return value.trim().replace(/^v/i, '')
}

function bumpSemver(version: string, bumpType: VersionBumpType): string | null {
  const normalized = normalizeSemver(version)
  const match = normalized.match(/^(\d+)\.(\d+)\.(\d+)$/)
  if (!match) return null

  const major = Number(match[1])
  const minor = Number(match[2])
  const patch = Number(match[3])

  if (bumpType === 'major') return `${major + 1}.${minor}.${patch}`
  if (bumpType === 'minor') return `${major}.${minor + 1}.${patch}`
  return `${major}.${minor}.${patch + 1}`
}

function formatProviderName(provider: 'openai' | 'gemini' | 'ollama'): string {
  if (provider === 'openai') return 'OpenAI'
  if (provider === 'gemini') return 'Google Gemini'
  return 'Ollama'
}

export default function CreateForm({ initialEntry, preset }: CreateFormProps) {
  const isEditing = Boolean(initialEntry?._id)
  const successMessage = isEditing ? 'Changelog updated successfully!' : 'Changelog created successfully!'
  const { showToast } = useToast()

  const [formState, formAction] = useActionState<CreateFormState, FormData>(
    async (_state, formData) => {
      const title = formData.get('title') as string
      const content = formData.get('content') as string
      const version = formData.get('version') as string
      const status = formData.get('status') as 'draft' | 'published'
      const tagsStr = formData.get('tags') as string
      const tags = tagsStr.split(',').filter(Boolean) as ChangelogTag[]

      const result = isEditing
        ? await updateChangelog({
            id: initialEntry!._id,
            title,
            content,
            version,
            status,
            tags,
          })
        : await createChangelog({
            title,
            content,
            version,
            status,
            tags,
          })

      return result
    },
    { success: false }
  )

  const formRef = useRef<HTMLFormElement>(null)
  const [selectedTags, setSelectedTags] = useState<ChangelogTag[]>(initialEntry?.tags || [])
  const [aiLoadingAction, setAiLoadingAction] = useState<AILoadingAction | null>(null)
  const [aiError, setAiError] = useState<string>('')
  const [titleValue, setTitleValue] = useState(initialEntry?.title || '')
  const [aiRuntimeLabel, setAiRuntimeLabel] = useState('configured AI model')
  const [versionValue, setVersionValue] = useState(initialEntry?.version || '1.0.0')
  const [versionError, setVersionError] = useState('')
  const [loadingVersionDefaults, setLoadingVersionDefaults] = useState(true)
  const lastFormToastKeyRef = useRef('')
  const lastAIErrorToastRef = useRef('')
  const aiEnhanceBusyRef = useRef(false)
  const aiEnhanceRequestIdRef = useRef(0)

  // Redirect back to admin list after a successful edit
  useEffect(() => {
    if (!isEditing || !formState.success) return
    const t = setTimeout(() => {
      window.location.href = '/changelog/admin'
    }, 1200)
    return () => clearTimeout(t)
  }, [isEditing, formState.success])

  useEffect(() => {
    if (formState.error) {
      const key = `error:${formState.error}`
      if (key !== lastFormToastKeyRef.current) {
        showToast(formState.error, 'error')
        lastFormToastKeyRef.current = key
      }
      return
    }

    if (formState.success) {
      const key = `success:${successMessage}`
      if (key !== lastFormToastKeyRef.current) {
        showToast(successMessage, 'success')
        lastFormToastKeyRef.current = key
      }
    }
  }, [formState, showToast, successMessage])

  useEffect(() => {
    if (!aiError) return
    if (aiError === lastAIErrorToastRef.current) return

    showToast(aiError, 'error')
    lastAIErrorToastRef.current = aiError
  }, [aiError, showToast])

  useEffect(() => {
    let isMounted = true

    ;(async () => {
      const result = await fetchLatestPublishedVersion()
      if (!isMounted) return

      if (!isEditing && result.success && result.data?.version) {
        setVersionValue(result.data.version)
      }

      setLoadingVersionDefaults(false)
    })()

    return () => {
      isMounted = false
    }
  }, [isEditing])

  useEffect(() => {
    if (isEditing) return
    if (!preset || !(preset in PRESETS)) return

    const selectedPreset = PRESETS[preset as PresetType]
    const formElement = formRef.current
    if (!formElement) return

    const titleEl = formElement.querySelector('input[name="title"]') as HTMLInputElement | null
    const contentEl = formElement.querySelector('textarea[name="content"]') as HTMLTextAreaElement | null

    if (titleEl) {
      titleEl.value = selectedPreset.title
      setTitleValue(selectedPreset.title)
    }

    if (contentEl) {
      contentEl.value = selectedPreset.content
    }

    setSelectedTags(selectedPreset.tags)
  }, [isEditing, preset])

  useEffect(() => {
    let isMounted = true

    ;(async () => {
      const result = await fetchAISettings()
      if (!isMounted) return

      if (!result.success || !result.data) {
        return
      }

      const providerName = formatProviderName(result.data.provider)
      const modelName = result.data.model?.trim() || 'default'
      setAiRuntimeLabel(`${providerName} · ${modelName}`)
    })()

    return () => {
      isMounted = false
    }
  }, [])

  const handleToggleTag = (tag: ChangelogTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleAIEnhanceField = async (field: 'title' | 'content', source: 'enhance' | 'generate' = 'enhance') => {
    if (aiEnhanceBusyRef.current) {
      return
    }

    const formElement = formRef.current
    if (!formElement) return

    const titleEl = formElement.querySelector('input[name="title"]') as HTMLInputElement | null
    const contentEl = formElement.querySelector('textarea[name="content"]') as HTMLTextAreaElement | null
    const versionEl = formElement.querySelector('input[name="version"]') as HTMLInputElement | null

    const title = titleEl?.value?.trim() || ''
    const content = contentEl?.value?.trim() || ''
    const version = versionEl?.value?.trim() || ''
    const rawNotes = field === 'title' ? title || content : content || title
    const startTitle = titleEl?.value || ''
    const startContent = contentEl?.value || ''

    if (!rawNotes) {
      setAiError(`Add ${field === 'title' ? 'a title or some content' : 'content or a title'} before enhancing.`)
      return
    }

    aiEnhanceBusyRef.current = true
    const requestId = ++aiEnhanceRequestIdRef.current

    setAiError('')
    const loadingAction: AILoadingAction =
      field === 'content' ? 'enhance-content' : source === 'generate' ? 'generate-title' : 'enhance-title'

    setAiLoadingAction(loadingAction)

    try {
      const result = await runAIEnhance({ rawNotes, currentVersion: version || undefined })

      if (requestId !== aiEnhanceRequestIdRef.current) {
        return
      }

      if (result.success && result.data) {
        if (field === 'title' && titleEl) {
          const titleChangedDuringRequest = titleEl.value !== startTitle
          if (titleChangedDuringRequest) {
            setAiError('Title changed while AI was running. Please try Enhance again.')
            return
          }
          titleEl.value = result.data.title
          setTitleValue(result.data.title)
        }

        if (field === 'content' && contentEl) {
          const contentChangedDuringRequest = contentEl.value !== startContent
          if (contentChangedDuringRequest) {
            setAiError('Content changed while AI was running. Please try Enhance again.')
            return
          }
          contentEl.value = result.data.content
        }

        setSelectedTags(result.data.tags)
      } else if (!result.success) {
        setAiError(result.error || 'AI enhancement failed')
      }
    } finally {
      if (requestId === aiEnhanceRequestIdRef.current) {
        setAiLoadingAction(null)
      }
      aiEnhanceBusyRef.current = false
    }
  }

  const handleVersionBump = (bumpType: VersionBumpType) => {
    const nextVersion = bumpSemver(versionValue, bumpType)
    if (!nextVersion) {
      setVersionError('Use semantic version format (e.g. 1.2.3) to apply bump actions.')
      return
    }

    setVersionError('')
    setVersionValue(nextVersion)
  }

  return (
    <form ref={formRef} action={formAction} className="cl-card cl-admin-panel cl-admin-form">
      <div className="cl-card-header">
        <h3 className="cl-card-title">{isEditing ? 'Edit entry' : 'New entry'}</h3>
        <p className="cl-card-description">
          {isEditing ? 'Update this release note and save changes.' : 'Write clear updates, then publish with confidence.'}
        </p>
      </div>

      <div className="cl-card-content cl-admin-form-body">
        {aiError && (
          <div className="cl-alert cl-alert-error">
            <div className="cl-alert-description">{aiError}</div>
          </div>
        )}

        {formState.error && (
          <div className="cl-alert cl-alert-error">
            <div className="cl-alert-description">{formState.error}</div>
          </div>
        )}

        {versionError && (
          <div className="cl-alert cl-alert-error">
            <div className="cl-alert-description">{versionError}</div>
          </div>
        )}

        {formState.success && (
          <div className="cl-alert cl-alert-success">
            <div className="cl-alert-description">{successMessage}</div>
          </div>
        )}

        <div className="cl-form-group">
          <div className="cl-field-label-row">
            <label className="cl-form-label" htmlFor="title">
              Title *
            </label>
            <div className="cl-ai-actions">
              <MagicEnhanceButton
                disabled={aiLoadingAction !== null}
                loading={aiLoadingAction === 'enhance-title'}
                onClick={() => handleAIEnhanceField('title')}
                label="Enhance title"
                tooltip={`Uses ${aiRuntimeLabel}`}
              />
              {titleValue.trim().length === 0 && (
                <Tooltip content={`Generate title from content • Uses ${aiRuntimeLabel}`}>
                  <button
                    type="button"
                    onClick={() => handleAIEnhanceField('title', 'generate')}
                    disabled={aiLoadingAction !== null}
                    className="cl-ai-inline-btn"
                    aria-label={`Generate title from content using ${aiRuntimeLabel}`}
                  >
                    {aiLoadingAction === 'generate-title' ? (
                      <span className="cl-spinner cl-spinner-sm" />
                    ) : (
                      <Sparkles className="cl-ai-icon" strokeWidth={1.9} aria-hidden="true" />
                    )}
                    <span>Generate title</span>
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="e.g., Major performance update"
            className="cl-input"
            defaultValue={initialEntry?.title || ''}
            onChange={(e) => setTitleValue(e.target.value)}
            required
          />
        </div>

        <div className="cl-form-group">
          <div className="cl-field-label-row cl-version-field-row">
            <label className="cl-form-label" htmlFor="version">
              Version *
            </label>
            <div className="cl-version-bump-group">
              <button type="button" className="cl-version-bump-btn" onClick={() => handleVersionBump('patch')}>
                +patch
              </button>
              <button type="button" className="cl-version-bump-btn" onClick={() => handleVersionBump('minor')}>
                +minor
              </button>
              <button type="button" className="cl-version-bump-btn" onClick={() => handleVersionBump('major')}>
                +major
              </button>
            </div>
          </div>
          <input
            id="version"
            name="version"
            type="text"
            placeholder="e.g., 1.2.3"
            className="cl-input"
            value={versionValue}
            onChange={(e) => {
              setVersionError('')
              setVersionValue(e.target.value)
            }}
            required
          />
          <p className="cl-form-help-text">
            {isEditing
              ? 'Edit mode: version will be updated.'
              : loadingVersionDefaults
                ? 'Loading version defaults...'
                : 'Default comes from latest published changelog version.'}
          </p>
        </div>

        <div className="cl-form-group">
          <div className="cl-field-label-row">
            <label className="cl-form-label" htmlFor="content">
              Content (Markdown) *
            </label>
            <MagicEnhanceButton
              disabled={aiLoadingAction !== null}
              loading={aiLoadingAction === 'enhance-content'}
              onClick={() => handleAIEnhanceField('content')}
              label="Enhance content"
              tooltip={`Uses ${aiRuntimeLabel}`}
            />
          </div>
          <textarea
            id="content"
            name="content"
            placeholder={"## Highlights\n- Improved loading performance\n- Fixed login edge cases"}
            className="cl-textarea"
            defaultValue={initialEntry?.content || ''}
            rows={9}
            required
          />
        </div>

        <div className="cl-form-group">
          <label className="cl-form-label cl-form-label-spacing">Tags *</label>
          <div className="cl-tag-grid">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleToggleTag(tag)}
                className={`cl-tag-chip ${selectedTags.includes(tag) ? 'is-active' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>
          <input type="hidden" name="tags" value={selectedTags.join(',')} />
        </div>

        <div className="cl-form-group">
          <label className="cl-form-label" htmlFor="status">
            Status
          </label>
          <select name="status" defaultValue={initialEntry?.status || 'draft'} className="cl-select">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="cl-form-actions">
          <SubmitButton isEditing={isEditing} />
          {isEditing ? (
            <a href="/changelog/admin" className="cl-btn cl-btn-secondary cl-admin-cancel-edit">
              Cancel
            </a>
          ) : null}
        </div>
      </div>
    </form>
  )
}

interface MagicEnhanceButtonProps {
  disabled?: boolean
  loading?: boolean
  onClick: () => void
  label: string
  tooltip: string
}

function MagicEnhanceButton({ disabled, loading, onClick, label, tooltip }: MagicEnhanceButtonProps) {
  return (
    <Tooltip content={`${label} • ${tooltip}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="cl-ai-inline-btn"
        aria-label={`${label}. ${tooltip}`}
      >
        {loading ? (
          <span className="cl-spinner cl-spinner-sm" />
        ) : (
          <Sparkles className="cl-ai-icon" strokeWidth={1.9} aria-hidden="true" />
        )}
        <span>Enhance</span>
      </button>
    </Tooltip>
  )
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="cl-btn cl-btn-primary cl-admin-submit"
    >
      {pending ? (
        <>
          <span className="cl-spinner cl-spinner-sm cl-spinner-inline" />
          Saving...
        </>
      ) : (
        isEditing ? 'Update Entry' : 'Create Entry'
      )}
    </button>
  )
}
