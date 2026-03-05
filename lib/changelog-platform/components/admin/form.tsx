'use client'

import { useEffect, useRef, useState } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createChangelog, fetchChangelogSettings, runAIEnhance } from '../../actions/changelog-actions'
import { ChangelogTag } from '../../types/changelog'

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

type VersionBumpType = 'patch' | 'minor' | 'major'

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

  if (bumpType === 'major') return `${major + 1}.0.0`
  if (bumpType === 'minor') return `${major}.${minor + 1}.0`
  return `${major}.${minor}.${patch + 1}`
}

export default function CreateForm() {
  const [formState, formAction] = useActionState<CreateFormState, FormData>(
    async (_state, formData) => {
      const title = formData.get('title') as string
      const content = formData.get('content') as string
      const version = formData.get('version') as string
      const status = formData.get('status') as 'draft' | 'published'
      const tagsStr = formData.get('tags') as string
      const tags = tagsStr.split(',').filter(Boolean) as ChangelogTag[]

      const result = await createChangelog({
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
  const [selectedTags, setSelectedTags] = useState<ChangelogTag[]>([])
  const [aiLoadingField, setAiLoadingField] = useState<'title' | 'content' | null>(null)
  const [aiError, setAiError] = useState<string>('')
  const [versionValue, setVersionValue] = useState('1.0.0')
  const [versionError, setVersionError] = useState('')
  const [loadingVersionDefaults, setLoadingVersionDefaults] = useState(true)

  useEffect(() => {
    let isMounted = true

    ;(async () => {
      const result = await fetchChangelogSettings()
      if (!isMounted) return

      if (result.success && result.data?.currentVersion) {
        setVersionValue(result.data.currentVersion)
      }

      setLoadingVersionDefaults(false)
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

  const handleAIEnhanceField = async (field: 'title' | 'content') => {
    const formElement = formRef.current
    if (!formElement) return

    const titleEl = formElement.querySelector('input[name="title"]') as HTMLInputElement | null
    const contentEl = formElement.querySelector('textarea[name="content"]') as HTMLTextAreaElement | null
    const versionEl = formElement.querySelector('input[name="version"]') as HTMLInputElement | null

    const title = titleEl?.value?.trim() || ''
    const content = contentEl?.value?.trim() || ''
    const version = versionEl?.value?.trim() || ''
    const rawNotes = field === 'title' ? title || content : content || title

    if (!rawNotes) {
      setAiError(`Add ${field === 'title' ? 'a title or some content' : 'content or a title'} before enhancing.`)
      return
    }

    setAiError('')
    setAiLoadingField(field)

    const result = await runAIEnhance({ rawNotes, currentVersion: version || undefined })

    if (result.success && result.data) {
      if (field === 'title' && titleEl) {
        titleEl.value = result.data.title
      }

      if (field === 'content' && contentEl) {
        contentEl.value = result.data.content
      }

      setSelectedTags(result.data.tags)
    } else if (!result.success) {
      setAiError(result.error || 'AI enhancement failed')
    }

    setAiLoadingField(null)
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
        <h3 className="cl-card-title">Create changelog</h3>
        <p className="cl-card-description">Write clear updates, then publish with confidence.</p>
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
            <div className="cl-alert-description">Changelog created successfully!</div>
          </div>
        )}

        <div className="cl-form-group">
          <div className="cl-field-label-row">
            <label className="cl-form-label" htmlFor="title">
              Title *
            </label>
            <MagicEnhanceButton
              disabled={aiLoadingField !== null}
              loading={aiLoadingField === 'title'}
              onClick={() => handleAIEnhanceField('title')}
              label="Enhance title"
            />
          </div>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="e.g., Major performance update"
            className="cl-input"
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
                + Patch
              </button>
              <button type="button" className="cl-version-bump-btn" onClick={() => handleVersionBump('minor')}>
                + Minor
              </button>
              <button type="button" className="cl-version-bump-btn" onClick={() => handleVersionBump('major')}>
                + Major
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
            {loadingVersionDefaults ? 'Loading version defaults...' : 'Default comes from saved changelog settings in DB.'}
          </p>
        </div>

        <div className="cl-form-group">
          <div className="cl-field-label-row">
            <label className="cl-form-label" htmlFor="content">
              Content (Markdown) *
            </label>
            <MagicEnhanceButton
              disabled={aiLoadingField !== null}
              loading={aiLoadingField === 'content'}
              onClick={() => handleAIEnhanceField('content')}
              label="Enhance content"
            />
          </div>
          <textarea
            id="content"
            name="content"
            placeholder={"## Highlights\n- Improved loading performance\n- Fixed login edge cases"}
            className="cl-textarea"
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
          <select name="status" defaultValue="draft" className="cl-select">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <SubmitButton />
      </div>
    </form>
  )
}

interface MagicEnhanceButtonProps {
  disabled?: boolean
  loading?: boolean
  onClick: () => void
  label: string
}

function MagicEnhanceButton({ disabled, loading, onClick, label }: MagicEnhanceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="cl-ai-inline-btn"
      aria-label={label}
      title={label}
    >
      {loading ? (
        <span className="cl-spinner cl-spinner-sm" />
      ) : (
        <svg viewBox="0 0 24 24" className="cl-ai-icon" fill="none" aria-hidden="true">
          <path
            d="M12 2l1.6 4.4L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.6L12 2zM19 13l.9 2.1L22 16l-2.1.9L19 19l-.9-2.1L16 16l2.1-.9L19 13zM5 14l1 2.5L8.5 18 6 19l-1 2.5L4 19l-2.5-1L4 16.5 5 14z"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
      )}
      <span>Enhance</span>
    </button>
  )
}

function SubmitButton() {
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
          Creating...
        </>
      ) : (
        'Create Entry'
      )}
    </button>
  )
}
