import { defineComponent, h, onMounted, ref } from 'vue'
import { createChangelogApi } from '../api'
import type { ChangelogEntry } from '../types'
import { useToast } from '../composables/toast'
import { buildChangelogPath } from '../utils/paths'

export const AdminList = defineComponent({
  name: 'AdminList',
  props: {
    basePath: { type: String, default: '/changelog' },
    baseUrl: { type: String, default: '' },
    apiBasePath: { type: String, default: '/api/changelog' },
  },
  setup(props) {
    const api = createChangelogApi({ baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
    const entries = ref<ChangelogEntry[]>([])
    const loading = ref(true)
    const error = ref('')
    const toast = useToast()

    const load = async () => {
      loading.value = true
      error.value = ''
      const result = await api.getAdminFeed({ page: 1, limit: 30 })
      if (!result.success || !result.data) {
        error.value = result.error || 'Failed to load entries'
        loading.value = false
        return
      }
      entries.value = result.data.entries
      loading.value = false
    }

    const deleteEntry = async (id: string) => {
      const result = await api.deleteEntry(id)
      if (!result.success) {
        toast.showToast(result.error || 'Failed to delete entry', 'error')
        return
      }
      toast.showToast('Entry deleted.', 'success')
      window.dispatchEvent(new Event('changelog:refresh'))
      load()
    }

    const publishEntry = async (entry: ChangelogEntry) => {
      const result = await api.updateEntry(entry._id, {
        title: entry.title,
        content: entry.content,
        version: entry.version,
        status: 'published',
        tags: entry.tags,
      })

      if (!result.success) {
        toast.showToast(result.error || 'Failed to publish entry', 'error')
        return
      }

      toast.showToast('Entry published.', 'success')
      window.dispatchEvent(new Event('changelog:refresh'))
      load()
    }

    onMounted(load)

    return () =>
      loading.value
        ? h('div', { class: 'cl-card cl-admin-panel cl-admin-error-panel' }, [
            h('div', { class: 'cl-card-header' }, [
              h('h3', { class: 'cl-card-title' }, 'Loading entries...'),
            ]),
          ])
        : error.value
          ? h('div', { class: 'cl-card cl-admin-panel cl-admin-error-panel' }, [
              h('div', { class: 'cl-card-header' }, [
                h('h3', { class: 'cl-card-title' }, 'Error loading entries'),
              ]),
              h('div', { class: 'cl-card-content' }, [
                h('p', { class: 'cl-p cl-admin-error-text' }, error.value),
              ]),
            ])
          : h('div', { class: 'cl-card cl-admin-panel cl-admin-list-panel' }, [
        h('div', { class: 'cl-card-header' }, [
          h('div', { class: 'cl-list-header-row' }, [
            h('div', {}, [
              h('h3', { class: 'cl-card-title' }, 'All entries'),
              h('p', { class: 'cl-card-description' }, `${entries.value.length} release note${entries.value.length !== 1 ? 's' : ''}`),
            ]),
          ]),
        ]),
        h('div', { class: 'cl-card-content cl-admin-list-wrap' }, [
          entries.value.length === 0
            ? h('div', { class: 'cl-admin-empty-state' }, [
                h('p', { class: 'cl-admin-empty-title' }, 'No entries yet'),
                h('p', { class: 'cl-admin-empty-text' }, 'Create your first changelog entry using the form.'),
              ])
            : h('div', { class: 'cl-admin-list' }, entries.value.map((entry) => {
                const dateLabel = new Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }).format(new Date(entry.date))

                return h('div', { class: 'cl-admin-row', key: entry._id }, [
                  h('div', { class: 'cl-admin-row-main' }, [
                    h('div', { class: 'cl-admin-row-top' }, [
                      h('h4', { class: 'cl-admin-row-title' }, entry.title),
                      h('span', {
                        class: `cl-admin-status ${entry.status === 'published' ? 'is-published' : 'is-draft'}`,
                      }, entry.status),
                    ]),
                    h('div', { class: 'cl-admin-row-meta' }, [
                      h('span', { class: 'cl-admin-version-pill' }, `v${entry.version}`),
                      h('span', { class: 'cl-admin-meta-sep' }, '·'),
                      h('span', { class: 'cl-admin-meta-text' }, dateLabel),
                    ]),
                    entry.tags && entry.tags.length > 0
                      ? h('div', { class: 'cl-admin-row-tags' }, [
                          ...entry.tags.slice(0, 4).map((tag) => h('span', { class: 'cl-admin-tag-chip', key: tag }, tag)),
                          entry.tags.length > 4
                            ? h('span', { class: 'cl-admin-tag-chip cl-admin-tag-more' }, `+${entry.tags.length - 4}`)
                            : null,
                        ])
                      : null,
                  ]),
                  h('div', { class: 'cl-admin-row-actions' }, [
                    entry.status === 'draft'
                      ? h('button', {
                          class: 'cl-btn cl-btn-sm cl-btn-secondary cl-btn-compact',
                          onClick: () => publishEntry(entry),
                        }, 'Publish')
                      : null,
                    h('a', {
                      class: 'cl-btn cl-btn-sm cl-btn-secondary cl-btn-compact',
                      href: buildChangelogPath(props.basePath, 'admin', 'edit', entry._id),
                    }, 'Edit'),
                    h('button', {
                      class: 'cl-btn cl-btn-sm cl-btn-ghost cl-btn-compact',
                      onClick: () => deleteEntry(entry._id),
                    }, 'Delete'),
                  ]),
                ])
              })),
        ]),
      ])
  },
})
