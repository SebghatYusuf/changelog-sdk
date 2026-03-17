import { defineComponent, h, onMounted, ref } from 'vue'
import type { ChangelogEntry, ChangelogTag, RepoCommit, RepoSettingsView } from '../types'
import { createChangelogApi } from '../api'
import { useToast } from '../composables/toast'
import { Tooltip } from './Tooltip'

function formatDateInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const ALL_TAGS: ChangelogTag[] = [
  'Features',
  'Fixes',
  'Improvements',
  'Breaking',
  'Security',
  'Performance',
  'Docs',
]

type PresetType = 'feature-release' | 'hotfix' | 'maintenance'
type VersionBumpType = 'patch' | 'minor' | 'major'
type AILoadingAction = 'enhance-title' | 'generate-title' | 'enhance-content'

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

export const AdminForm = defineComponent({
  name: 'AdminForm',
  props: {
    entry: { type: Object as () => ChangelogEntry | null, default: null },
    preset: { type: String, default: '' },
    basePath: { type: String, default: '/changelog' },
    baseUrl: { type: String, default: '' },
    apiBasePath: { type: String, default: '/api/changelog' },
  },
  setup(props) {
    const api = createChangelogApi({ baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
    const toast = useToast()

    const title = ref(props.entry?.title || '')
    const content = ref(props.entry?.content || '')
    const version = ref(props.entry?.version || '1.0.0')
    const status = ref<'draft' | 'published'>(props.entry?.status || 'draft')
    const tags = ref<ChangelogTag[]>(props.entry?.tags || [])
    const loading = ref(false)
    const repoSettings = ref<RepoSettingsView | null>(null)
    const repoLoading = ref(true)
    const commitSince = ref(formatDateInput(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
    const commitUntil = ref(formatDateInput(new Date()))
    const commitLimit = ref(50)
    const includeMerges = ref(false)
    const commitPreview = ref<RepoCommit[]>([])
    const commitModalOpen = ref(false)
    const polishWithAI = ref(true)
    const aiLoadingAction = ref<AILoadingAction | null>(null)
    const aiRuntimeLabel = ref('configured AI model')
    const versionError = ref('')

    onMounted(async () => {
      if (!props.entry && props.preset && props.preset in PRESETS) {
        const selectedPreset = PRESETS[props.preset as PresetType]
        title.value = selectedPreset.title
        content.value = selectedPreset.content
        tags.value = selectedPreset.tags
      }

      if (!props.entry) {
        const result = await api.getLatestPublishedVersion()
        if (result.success && result.data?.version) {
          version.value = result.data.version
        }
      }

      const repoResult = await api.getRepoSettings()
      if (repoResult.success && repoResult.data) {
        repoSettings.value = repoResult.data
      }
      repoLoading.value = false

      const aiResult = await api.getAISettings()
      if (aiResult.success && aiResult.data) {
        const providerName = formatProviderName(aiResult.data.provider)
        const modelName = aiResult.data.model?.trim() || 'default'
        aiRuntimeLabel.value = `${providerName} · ${modelName}`
      }
    })

    const toggleTag = (tag: ChangelogTag) => {
      tags.value = tags.value.includes(tag)
        ? tags.value.filter((t) => t !== tag)
        : [...tags.value, tag]
    }

    const submit = async () => {
      if (!title.value.trim()) {
        toast.showToast('Title is required.', 'error')
        return
      }

      if (!content.value.trim()) {
        toast.showToast('Content is required.', 'error')
        return
      }

      if (!version.value.trim()) {
        toast.showToast('Version is required.', 'error')
        return
      }

      loading.value = true
      const payload = {
        title: title.value,
        content: content.value,
        version: version.value,
        status: status.value,
        tags: tags.value,
      }

      const result = props.entry
        ? await api.updateEntry(props.entry._id, payload)
        : await api.createEntry(payload)

      loading.value = false

      if (!result.success) {
        toast.showToast(result.error || 'Failed to save entry', 'error')
        return
      }

      toast.showToast(props.entry ? 'Changelog updated.' : 'Changelog created.', 'success')
    }

    const enhanceField = async (field: 'title' | 'content', source: 'enhance' | 'generate' = 'enhance') => {
      const rawNotes = field === 'title'
        ? (title.value.trim() || content.value.trim())
        : (content.value.trim() || title.value.trim())

      if (!rawNotes) {
        toast.showToast(`Add ${field === 'title' ? 'a title or some content' : 'content or a title'} before enhancing.`, 'error')
        return
      }

      const loadingAction: AILoadingAction =
        field === 'content' ? 'enhance-content' : source === 'generate' ? 'generate-title' : 'enhance-title'

      aiLoadingAction.value = loadingAction
      const result = await api.enhance({ rawNotes, currentVersion: version.value.trim() || undefined })
      aiLoadingAction.value = null

      if (!result.success || !result.data) {
        toast.showToast(result.error || 'AI enhancement failed', 'error')
        return
      }

      if (field === 'title') {
        title.value = result.data.title
      } else {
        content.value = result.data.content
        toast.showToast('Content generated successfully.', 'success')
      }

      tags.value = result.data.tags
    }

    const handleVersionBump = (bumpType: VersionBumpType) => {
      const nextVersion = bumpSemver(version.value, bumpType)
      if (!nextVersion) {
        versionError.value = 'Use semantic version format (e.g. 1.2.3) to apply bump actions.'
        return
      }

      versionError.value = ''
      version.value = nextVersion
    }

    const generateFromCommits = async () => {
      if (!repoSettings.value?.enabled) {
        toast.showToast('Repository integration is not enabled.', 'error')
        return
      }

      if (commitSince.value && commitUntil.value) {
        const sinceDate = new Date(`${commitSince.value}T00:00:00.000Z`)
        const untilDate = new Date(`${commitUntil.value}T00:00:00.000Z`)
        if (!Number.isNaN(sinceDate.getTime()) && !Number.isNaN(untilDate.getTime()) && untilDate < sinceDate) {
          toast.showToast('The "Until" date must be on or after the "Since" date.', 'error')
          return
        }
      }

      const result = await api.generateChangelogFromCommits({
        since: commitSince.value,
        until: commitUntil.value,
        limit: commitLimit.value,
        includeMerges: includeMerges.value,
      })

      if (!result.success || !result.data) {
        toast.showToast(result.error || 'Failed to generate changelog from commits', 'error')
        return
      }

      let nextTitle = result.data.title
      let nextContent = result.data.content
      let nextTags = result.data.tags

      if (polishWithAI.value) {
        const enhance = await api.enhance({ rawNotes: result.data.content, currentVersion: version.value || undefined })
        if (enhance.success && enhance.data) {
          nextTitle = enhance.data.title
          nextContent = enhance.data.content
          nextTags = enhance.data.tags
        } else if (!enhance.success) {
          toast.showToast(enhance.error || 'AI polish failed, using raw commit summary.', 'error')
        }
      }

      title.value = nextTitle
      content.value = nextContent
      tags.value = nextTags
      commitPreview.value = result.data.commits
      commitModalOpen.value = false
      toast.showToast(polishWithAI.value ? 'Generated and polished release notes.' : 'Generated content from commits.', 'success')
    }

    const applyPreset = (preset: 'today' | 'yesterday' | 'last7') => {
      if (preset === 'today') {
        const today = formatDateInput(new Date())
        commitSince.value = today
        commitUntil.value = today
        return
      }

      if (preset === 'yesterday') {
        const date = formatDateInput(new Date(Date.now() - 24 * 60 * 60 * 1000))
        commitSince.value = date
        commitUntil.value = date
        return
      }

      const today = new Date()
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      commitSince.value = formatDateInput(since)
      commitUntil.value = formatDateInput(today)
    }

    return () =>
      h('div', {}, [
        h('form', {
          class: 'cl-card cl-admin-panel cl-admin-form',
          onSubmit: (event: Event) => {
            event.preventDefault()
            submit()
          },
        }, [
          h('div', { class: 'cl-card-header' }, [
            h('h3', { class: 'cl-card-title' }, props.entry ? 'Edit entry' : 'New entry'),
            h('p', { class: 'cl-card-description' }, props.entry ? 'Update this release note and save changes.' : 'Write clear updates, then publish with confidence.'),
          ]),
          h('div', { class: 'cl-card-content cl-admin-form-body' }, [
            versionError.value
              ? h('div', { class: 'cl-alert cl-alert-error' }, [
                  h('div', { class: 'cl-alert-description' }, versionError.value),
                ])
              : null,
            h('div', { class: 'cl-form-group' }, [
              h('div', { class: 'cl-field-label-row' }, [
                h('label', { class: 'cl-form-label' }, 'Title'),
                h('div', { class: 'cl-ai-actions' }, [
                  h(Tooltip, { content: `Enhance title • Uses ${aiRuntimeLabel.value}` }, {
                    default: () => h('button', {
                      type: 'button',
                      class: 'cl-ai-inline-btn',
                      disabled: aiLoadingAction.value !== null,
                      onClick: () => enhanceField('title'),
                    }, aiLoadingAction.value === 'enhance-title' ? 'Enhancing...' : 'Enhance'),
                  }),
                  title.value.trim().length === 0
                    ? h(Tooltip, { content: `Generate title from content • Uses ${aiRuntimeLabel.value}` }, {
                        default: () => h('button', {
                          type: 'button',
                          class: 'cl-ai-inline-btn',
                          disabled: aiLoadingAction.value !== null,
                          onClick: () => enhanceField('title', 'generate'),
                        }, aiLoadingAction.value === 'generate-title' ? 'Generating...' : 'Generate title'),
                      })
                    : null,
                ]),
              ]),
              h('input', {
                class: 'cl-input',
                value: title.value,
                onInput: (event: Event) => {
                  title.value = (event.target as HTMLInputElement).value
                },
              }),
            ]),
            h('div', { class: 'cl-form-group' }, [
              h('div', { class: 'cl-field-label-row cl-version-field-row' }, [
                h('label', { class: 'cl-form-label' }, 'Version'),
                h('div', { class: 'cl-version-bump-group' }, [
                  h('button', { type: 'button', class: 'cl-version-bump-btn', onClick: () => handleVersionBump('patch') }, '+patch'),
                  h('button', { type: 'button', class: 'cl-version-bump-btn', onClick: () => handleVersionBump('minor') }, '+minor'),
                  h('button', { type: 'button', class: 'cl-version-bump-btn', onClick: () => handleVersionBump('major') }, '+major'),
                ]),
              ]),
              h('input', {
                class: 'cl-input',
                value: version.value,
                onInput: (event: Event) => {
                  versionError.value = ''
                  version.value = (event.target as HTMLInputElement).value
                },
              }),
            ]),
            h('div', { class: 'cl-form-group' }, [
              h('div', { class: 'cl-field-label-row' }, [
                h('label', { class: 'cl-form-label' }, 'Content'),
                h(Tooltip, { content: `Enhance content • Uses ${aiRuntimeLabel.value}` }, {
                  default: () => h('button', {
                    type: 'button',
                    class: 'cl-ai-inline-btn',
                    disabled: aiLoadingAction.value !== null,
                    onClick: () => enhanceField('content'),
                  }, aiLoadingAction.value === 'enhance-content' ? 'Enhancing...' : 'Enhance'),
                }),
              ]),
              h('textarea', {
                class: 'cl-textarea',
                rows: 8,
                value: content.value,
                onInput: (event: Event) => {
                  content.value = (event.target as HTMLTextAreaElement).value
                },
              }),
            ]),
            h('div', { class: 'cl-form-group cl-commit-launch' }, [
              h('div', { class: 'cl-commit-launch-row' }, [
                h('div', {}, [
                  h('p', { class: 'cl-commit-launch-title' }, 'Generate from commits'),
                  h('p', { class: 'cl-form-help-text' }, 'Open the commit generator to draft a clean release note.'),
                ]),
                h('button', {
                  type: 'button',
                  class: 'cl-btn cl-btn-secondary cl-btn-sm',
                  disabled: repoLoading.value || !repoSettings.value?.enabled,
                  onClick: () => { commitModalOpen.value = true },
                }, 'Open generator'),
              ]),
              !repoLoading.value && !repoSettings.value?.enabled
                ? h('div', { class: 'cl-alert cl-alert-info' }, [
                    h('div', { class: 'cl-alert-description' }, 'Repository integration is not configured. Add credentials in the Repository settings panel first.'),
                  ])
                : null,
              commitPreview.value.length > 0
                ? h('div', { class: 'cl-commit-preview' }, [
                    h('p', { class: 'cl-commit-preview-title' }, 'Last generated from commits'),
                    h('ul', { class: 'cl-commit-list' },
                      commitPreview.value.slice(0, 4).map((commit) =>
                        h('li', { key: commit.id, class: 'cl-commit-item' }, [
                          h('span', { class: 'cl-commit-summary' }, commit.summary),
                          h('span', { class: 'cl-commit-meta' }, `${commit.author ? `${commit.author} · ` : ''}${commit.date ? commit.date.slice(0, 10) : ''}`),
                        ])
                      )
                    ),
                  ])
                : null,
            ]),
            h('div', { class: 'cl-form-group' }, [
              h('label', { class: 'cl-form-label' }, 'Status'),
              h('select', {
                class: 'cl-select',
                value: status.value,
                onChange: (event: Event) => {
                  status.value = (event.target as HTMLSelectElement).value as 'draft' | 'published'
                },
              }, [
                h('option', { value: 'draft' }, 'Draft'),
                h('option', { value: 'published' }, 'Published'),
              ]),
            ]),
            h('div', { class: 'cl-form-group' }, [
              h('label', { class: 'cl-form-label' }, 'Tags'),
              h('div', { class: 'cl-tag-grid' },
                ALL_TAGS.map((tag) =>
                  h('button', {
                    key: tag,
                    type: 'button',
                    class: `cl-tag-chip ${tags.value.includes(tag) ? 'is-selected' : ''}`,
                    onClick: () => toggleTag(tag),
                  }, tag)
                )
              ),
            ]),
            h('button', { type: 'submit', class: 'cl-btn cl-btn-primary', disabled: loading.value }, loading.value ? 'Saving...' : 'Save entry'),
          ]),
        ]),
        commitModalOpen.value
          ? h('div', {
              class: 'cl-modal-backdrop',
              role: 'dialog',
              'aria-modal': 'true',
              onClick: () => { commitModalOpen.value = false },
            }, [
              h('div', {
                class: 'cl-modal-card',
                onClick: (event: Event) => event.stopPropagation(),
              }, [
                h('div', { class: 'cl-modal-header' }, [
                  h('div', {}, [
                    h('p', { class: 'cl-modal-eyebrow' }, 'Commit generator'),
                    h('h4', { class: 'cl-modal-title' }, 'Draft a release note from commits'),
                    h('p', { class: 'cl-modal-subtitle' }, 'Choose a date range and we will summarize commit history into structured notes.'),
                  ]),
                  h('button', {
                    type: 'button',
                    class: 'cl-modal-close',
                    onClick: () => { commitModalOpen.value = false },
                  }, 'Close'),
                ]),
                h('div', { class: 'cl-modal-body' }, [
                  h('div', { class: 'cl-modal-section' }, [
                    h('p', { class: 'cl-modal-section-title' }, 'Quick ranges'),
                    h('div', { class: 'cl-commit-presets' }, [
                      h('button', { type: 'button', class: 'cl-btn cl-btn-secondary cl-btn-sm', onClick: () => applyPreset('today') }, 'Today'),
                      h('button', { type: 'button', class: 'cl-btn cl-btn-secondary cl-btn-sm', onClick: () => applyPreset('yesterday') }, 'Yesterday'),
                      h('button', { type: 'button', class: 'cl-btn cl-btn-secondary cl-btn-sm', onClick: () => applyPreset('last7') }, 'Last 7 days'),
                    ]),
                  ]),
                  h('div', { class: 'cl-modal-grid' }, [
                    h('div', { class: 'cl-modal-field' }, [
                      h('label', { class: 'cl-form-label' }, 'Since'),
                      h('input', {
                        class: 'cl-input',
                        type: 'date',
                        value: commitSince.value,
                        onInput: (event: Event) => {
                          commitSince.value = (event.target as HTMLInputElement).value
                        },
                      }),
                    ]),
                    h('div', { class: 'cl-modal-field' }, [
                      h('label', { class: 'cl-form-label' }, 'Until'),
                      h('input', {
                        class: 'cl-input',
                        type: 'date',
                        value: commitUntil.value,
                        onInput: (event: Event) => {
                          commitUntil.value = (event.target as HTMLInputElement).value
                        },
                      }),
                    ]),
                    h('div', { class: 'cl-modal-field' }, [
                      h('label', { class: 'cl-form-label' }, 'Commit limit'),
                      h('input', {
                        class: 'cl-input',
                        type: 'number',
                        min: 1,
                        max: 200,
                        value: commitLimit.value,
                        onInput: (event: Event) => {
                          commitLimit.value = Number((event.target as HTMLInputElement).value) || 50
                        },
                      }),
                    ]),
                    h('div', { class: 'cl-modal-field' }, [
                      h('label', { class: 'cl-form-label' }, 'Include merges'),
                      h('select', {
                        class: 'cl-select',
                        value: includeMerges.value ? 'yes' : 'no',
                        onChange: (event: Event) => {
                          includeMerges.value = (event.target as HTMLSelectElement).value === 'yes'
                        },
                      }, [
                        h('option', { value: 'no' }, 'No'),
                        h('option', { value: 'yes' }, 'Yes'),
                      ]),
                    ]),
                  ]),
                  h('div', { class: 'cl-modal-toggle' }, [
                    h('div', {}, [
                      h('p', { class: 'cl-modal-toggle-title' }, 'Polish with AI'),
                      h('p', { class: 'cl-modal-toggle-subtitle' }, 'Improve formatting and keep the tone standard.'),
                    ]),
                    h('label', { class: 'cl-switch' }, [
                      h('input', {
                        type: 'checkbox',
                        checked: polishWithAI.value,
                        onChange: (event: Event) => {
                          polishWithAI.value = (event.target as HTMLInputElement).checked
                        },
                      }),
                      h('span', { class: 'cl-switch-track' }),
                    ]),
                  ]),
                ]),
                h('div', { class: 'cl-modal-footer' }, [
                  h('button', { type: 'button', class: 'cl-btn cl-btn-ghost', onClick: () => { commitModalOpen.value = false } }, 'Cancel'),
                  h('button', { type: 'button', class: 'cl-btn cl-btn-primary', onClick: generateFromCommits }, 'Generate'),
                ]),
              ]),
            ])
          : null,
      ])
  },
})
