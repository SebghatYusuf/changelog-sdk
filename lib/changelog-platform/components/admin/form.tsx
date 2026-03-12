'use client'

import { useEffect, useRef, useState } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Sparkles } from 'lucide-react'
import {
  createChangelog,
  fetchAISettings,
  fetchLatestPublishedVersion,
  fetchRepoSettings,
  generateChangelogFromCommits,
  runAIEnhance,
  updateChangelog,
} from '../../actions/changelog-actions'
import { ChangelogEntry, ChangelogTag, RepoCommit, RepoSettingsView } from '../../types/changelog'
import { useToast } from '../toast/provider'
import Tooltip from '../tooltip/tooltip'
import { buildChangelogPath } from '../paths'

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
  basePath?: string
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

function formatDateInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function CreateForm({ initialEntry, preset, basePath }: CreateFormProps) {
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

  const [selectedTags, setSelectedTags] = useState<ChangelogTag[]>(initialEntry?.tags || [])
  const [aiLoadingAction, setAiLoadingAction] = useState<AILoadingAction | null>(null)
  const [aiError, setAiError] = useState<string>('')
  const [titleValue, setTitleValue] = useState(initialEntry?.title || '')
  const [contentValue, setContentValue] = useState(initialEntry?.content || '')
  const [statusValue, setStatusValue] = useState<'draft' | 'published'>(initialEntry?.status || 'draft')
  const [aiRuntimeLabel, setAiRuntimeLabel] = useState('configured AI model')
  const [versionValue, setVersionValue] = useState(initialEntry?.version || '1.0.0')
  const [versionError, setVersionError] = useState('')
  const [loadingVersionDefaults, setLoadingVersionDefaults] = useState(true)
  const [repoSettings, setRepoSettings] = useState<RepoSettingsView | null>(null)
  const [repoLoading, setRepoLoading] = useState(true)
  const [commitSince, setCommitSince] = useState(() => {
    const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return formatDateInput(date)
  })
  const [commitUntil, setCommitUntil] = useState(() => formatDateInput(new Date()))
  const [commitLimit, setCommitLimit] = useState(50)
  const [includeMerges, setIncludeMerges] = useState(false)
  const [commitError, setCommitError] = useState('')
  const [commitLoading, setCommitLoading] = useState(false)
  const [commitPreview, setCommitPreview] = useState<RepoCommit[]>([])
  const [commitModalOpen, setCommitModalOpen] = useState(false)
  const [polishWithAI, setPolishWithAI] = useState(true)
  const lastAIErrorToastRef = useRef('')
  const aiEnhanceBusyRef = useRef(false)
  const aiEnhanceRequestIdRef = useRef(0)
  const titleValueRef = useRef(titleValue)
  const contentValueRef = useRef(contentValue)

  // Redirect back to admin list after a successful edit
  useEffect(() => {
    if (!isEditing || !formState.success) return
    const t = setTimeout(() => {
      window.location.href = buildChangelogPath(basePath, 'admin')
    }, 1200)
    return () => clearTimeout(t)
  }, [isEditing, formState.success, basePath])

  useEffect(() => {
    if (formState.error) {
      showToast(formState.error, 'error')
      return
    }

    if (formState.success) {
      showToast(successMessage, 'success')
    }
  }, [formState, showToast, successMessage])

  useEffect(() => {
    if (!aiError) return
    if (aiError === lastAIErrorToastRef.current) return

    showToast(aiError, 'error')
    lastAIErrorToastRef.current = aiError
  }, [aiError, showToast])

  useEffect(() => {
    if (!commitError) return
    showToast(commitError, 'error')
  }, [commitError, showToast])

  useEffect(() => {
    titleValueRef.current = titleValue
  }, [titleValue])

  useEffect(() => {
    contentValueRef.current = contentValue
  }, [contentValue])

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
    setTitleValue(selectedPreset.title)
    setContentValue(selectedPreset.content)
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

  useEffect(() => {
    let isMounted = true

    ;(async () => {
      const result = await fetchRepoSettings()
      if (!isMounted) return

      if (result.success && result.data) {
        setRepoSettings(result.data)
      }

      setRepoLoading(false)
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

    const title = titleValue.trim()
    const content = contentValue.trim()
    const version = versionValue.trim()
    const rawNotes = field === 'title' ? title || content : content || title
    const startTitle = titleValue
    const startContent = contentValue

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
        if (field === 'title') {
          const titleChangedDuringRequest = titleValueRef.current !== startTitle
          if (titleChangedDuringRequest) {
            setAiError('Title changed while AI was running. Please try Enhance again.')
            return
          }
          setTitleValue(result.data.title)
        }

        if (field === 'content') {
          const contentChangedDuringRequest = contentValueRef.current !== startContent
          if (contentChangedDuringRequest) {
            setAiError('Content changed while AI was running. Please try Enhance again.')
            return
          }
          setContentValue(result.data.content)
          showToast('Content generated successfully.', 'success')
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

  const handleGenerateFromCommits = async () => {
    if (!repoSettings?.enabled) {
      setCommitError('Repository integration is not enabled.')
      return
    }

    if (commitSince && commitUntil) {
      const sinceDate = new Date(`${commitSince}T00:00:00.000Z`)
      const untilDate = new Date(`${commitUntil}T00:00:00.000Z`)
      if (!Number.isNaN(sinceDate.getTime()) && !Number.isNaN(untilDate.getTime()) && untilDate < sinceDate) {
        setCommitError('The "Until" date must be on or after the "Since" date.')
        return
      }
    }

    setCommitLoading(true)
    setCommitError('')

    const payload = {
      since: commitSince || undefined,
      until: commitUntil || undefined,
      limit: commitLimit,
      includeMerges,
    }

    const result = await generateChangelogFromCommits(payload)
    if (!result.success || !result.data) {
      setCommitLoading(false)
      setCommitError(result.error || 'Failed to generate changelog from commits')
      return
    }

    let title = result.data.title
    let content = result.data.content
    let tags = result.data.tags

    if (polishWithAI) {
      const enhance = await runAIEnhance({ rawNotes: result.data.content, currentVersion: versionValue || undefined })
      if (enhance.success && enhance.data) {
        title = enhance.data.title
        content = enhance.data.content
        tags = enhance.data.tags
      } else if (!enhance.success) {
        showToast(enhance.error || 'AI polish failed, using raw commit summary.', 'error')
      }
    }

    setTitleValue(title)
    setContentValue(content)
    setSelectedTags(tags)
    setCommitPreview(result.data.commits)
    setCommitLoading(false)
    setCommitModalOpen(false)
    showToast(polishWithAI ? 'Generated and polished release notes.' : 'Generated content from commits.', 'success')
  }

  return (
    <form action={formAction} className="cl-card cl-admin-panel cl-admin-form">
      <div className="cl-card-header">
        <h3 className="cl-card-title">{isEditing ? 'Edit entry' : 'New entry'}</h3>
        <p className="cl-card-description">
          {isEditing ? 'Update this release note and save changes.' : 'Write clear updates, then publish with confidence.'}
        </p>
      </div>

      <div className="cl-card-content cl-admin-form-body">
        {versionError && (
          <div className="cl-alert cl-alert-error">
            <div className="cl-alert-description">{versionError}</div>
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
            value={titleValue}
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

        <div className="cl-form-group cl-commit-launch">
          <div className="cl-commit-launch-row">
            <div>
              <p className="cl-commit-launch-title">Generate from commits</p>
              <p className="cl-form-help-text">Open the commit generator to draft a clean release note.</p>
            </div>
            <button
              type="button"
              className="cl-btn cl-btn-secondary cl-btn-sm"
              onClick={() => setCommitModalOpen(true)}
              disabled={repoLoading || !repoSettings?.enabled}
            >
              Open generator
            </button>
          </div>

          {!repoLoading && !repoSettings?.enabled ? (
            <div className="cl-alert cl-alert-info">
              <div className="cl-alert-description">
                Repository integration is not configured. Add credentials in the Repository settings panel first.
              </div>
            </div>
          ) : null}

          {commitPreview.length > 0 ? (
            <div className="cl-commit-preview">
              <p className="cl-commit-preview-title">Last generated from commits</p>
              <ul className="cl-commit-list">
                {commitPreview.slice(0, 4).map((commit) => (
                  <li key={commit.id} className="cl-commit-item">
                    <span className="cl-commit-summary">{commit.summary}</span>
                    <span className="cl-commit-meta">
                      {commit.author ? `${commit.author} · ` : ''}
                      {commit.date ? commit.date.slice(0, 10) : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
            value={contentValue}
            onChange={(e) => setContentValue(e.target.value)}
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
          <select
            name="status"
            value={statusValue}
            onChange={(e) => setStatusValue(e.target.value as 'draft' | 'published')}
            className="cl-select"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="cl-form-actions">
          <SubmitButton isEditing={isEditing} />
          {isEditing ? (
            <a href={buildChangelogPath(basePath, 'admin')} className="cl-btn cl-btn-secondary cl-admin-cancel-edit">
              Cancel
            </a>
          ) : null}
        </div>
      </div>

      {commitModalOpen ? (
        <div className="cl-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setCommitModalOpen(false)}>
          <div className="cl-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="cl-modal-header">
              <div>
                <p className="cl-modal-eyebrow">Commit generator</p>
                <h4 className="cl-modal-title">Draft a release note from commits</h4>
                <p className="cl-modal-subtitle">Choose a date range and we will summarize commit history into structured notes.</p>
              </div>
              <button type="button" className="cl-modal-close" onClick={() => setCommitModalOpen(false)}>
                Close
              </button>
            </div>

            <div className="cl-modal-body">
              <div className="cl-modal-section">
                <p className="cl-modal-section-title">Quick ranges</p>
                <div className="cl-commit-presets">
                  <button
                    type="button"
                    className="cl-btn cl-btn-secondary cl-btn-sm"
                    onClick={() => {
                      const today = formatDateInput(new Date())
                      setCommitSince(today)
                      setCommitUntil(today)
                    }}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    className="cl-btn cl-btn-secondary cl-btn-sm"
                    onClick={() => {
                      const date = new Date(Date.now() - 24 * 60 * 60 * 1000)
                      const value = formatDateInput(date)
                      setCommitSince(value)
                      setCommitUntil(value)
                    }}
                  >
                    Yesterday
                  </button>
                  <button
                    type="button"
                    className="cl-btn cl-btn-secondary cl-btn-sm"
                    onClick={() => {
                      const today = new Date()
                      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      setCommitSince(formatDateInput(since))
                      setCommitUntil(formatDateInput(today))
                    }}
                  >
                    Last 7 days
                  </button>
                </div>
              </div>

              <div className="cl-modal-grid">
                <div className="cl-modal-field">
                  <label className="cl-form-label" htmlFor="commit-since">
                    Since
                  </label>
                  <input
                    id="commit-since"
                    className="cl-input"
                    type="date"
                    value={commitSince}
                    onChange={(e) => setCommitSince(e.target.value)}
                  />
                </div>
                <div className="cl-modal-field">
                  <label className="cl-form-label" htmlFor="commit-until">
                    Until
                  </label>
                  <input
                    id="commit-until"
                    className="cl-input"
                    type="date"
                    value={commitUntil}
                    onChange={(e) => setCommitUntil(e.target.value)}
                  />
                </div>
                <div className="cl-modal-field">
                  <label className="cl-form-label" htmlFor="commit-limit">
                    Commit limit
                  </label>
                  <input
                    id="commit-limit"
                    className="cl-input"
                    type="number"
                    min={1}
                    max={200}
                    value={commitLimit}
                    onChange={(e) => setCommitLimit(Number(e.target.value) || 50)}
                  />
                </div>
                <div className="cl-modal-field">
                  <label className="cl-form-label" htmlFor="commit-merges">
                    Include merges
                  </label>
                  <select
                    id="commit-merges"
                    className="cl-select"
                    value={includeMerges ? 'yes' : 'no'}
                    onChange={(e) => setIncludeMerges(e.target.value === 'yes')}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>

              <div className="cl-modal-toggle">
                <div>
                  <p className="cl-modal-toggle-title">Polish with AI</p>
                  <p className="cl-modal-toggle-subtitle">Improve formatting and keep the tone standard.</p>
                </div>
                <label className="cl-switch">
                  <input
                    type="checkbox"
                    checked={polishWithAI}
                    onChange={(e) => setPolishWithAI(e.target.checked)}
                  />
                  <span className="cl-switch-track" />
                </label>
              </div>

              {commitError ? (
                <div className="cl-alert cl-alert-error">
                  <div className="cl-alert-description">{commitError}</div>
                </div>
              ) : null}
            </div>

            <div className="cl-modal-footer">
              <button type="button" className="cl-btn cl-btn-ghost" onClick={() => setCommitModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="cl-btn cl-btn-primary"
                onClick={handleGenerateFromCommits}
                disabled={commitLoading}
              >
                {commitLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
