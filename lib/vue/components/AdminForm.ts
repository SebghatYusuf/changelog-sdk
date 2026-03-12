import { defineComponent, h, onMounted, ref } from 'vue'
import type { ChangelogEntry, ChangelogTag, RepoCommit, RepoSettingsView } from '../types'
import { createChangelogApi } from '../api'
import { useToast } from '../composables/toast'

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

export const AdminForm = defineComponent({
  name: 'AdminForm',
  props: {
    entry: { type: Object as () => ChangelogEntry | null, default: null },
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

    onMounted(async () => {
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
    })

    const toggleTag = (tag: ChangelogTag) => {
      tags.value = tags.value.includes(tag)
        ? tags.value.filter((t) => t !== tag)
        : [...tags.value, tag]
    }

    const submit = async () => {
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
      h('div', { class: 'cl-admin-form-wrap' }, [
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
            h('div', { class: 'cl-form-group' }, [
              h('label', { class: 'cl-form-label' }, 'Title'),
              h('input', {
                class: 'cl-input',
                value: title.value,
                onInput: (event: Event) => {
                  title.value = (event.target as HTMLInputElement).value
                },
              }),
            ]),
            h('div', { class: 'cl-form-group' }, [
              h('label', { class: 'cl-form-label' }, 'Content'),
              h('textarea', {
                class: 'cl-textarea',
                rows: 8,
                value: content.value,
                onInput: (event: Event) => {
                  content.value = (event.target as HTMLTextAreaElement).value
                },
              }),
            ]),
            h('div', { class: 'cl-form-group' }, [
              h('label', { class: 'cl-form-label' }, 'Version'),
              h('input', {
                class: 'cl-input',
                value: version.value,
                onInput: (event: Event) => {
                  version.value = (event.target as HTMLInputElement).value
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
