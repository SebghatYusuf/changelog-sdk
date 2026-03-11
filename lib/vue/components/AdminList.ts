import { defineComponent, h, onMounted, ref } from 'vue'
import { createChangelogApi } from '../api'
import type { ChangelogEntry } from '../types'
import { useToast } from '../composables/toast'

export const AdminList = defineComponent({
  name: 'AdminList',
  props: {
    baseUrl: { type: String, default: '' },
    apiBasePath: { type: String, default: '/api/changelog' },
    editBasePath: { type: String, default: '/changelog/admin/edit' },
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
      const result = await api.getAdminFeed({ page: 1, limit: 20 })
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
      load()
    }

    onMounted(load)

    return () =>
      h('div', { class: 'cl-card cl-admin-panel cl-admin-list' }, [
        h('div', { class: 'cl-card-header' }, [
          h('h3', { class: 'cl-card-title' }, 'All entries'),
          h('p', { class: 'cl-card-description' }, 'Edit or remove published and draft updates.'),
        ]),
        h('div', { class: 'cl-card-content cl-admin-list-body' }, [
          loading.value
            ? h('div', { class: 'cl-loading-screen' }, [h('div', { class: 'cl-spinner' }), h('span', { class: 'cl-loading-label' }, 'Loading...')])
            : error.value
              ? h('p', { class: 'cl-p' }, error.value)
              : entries.value.length === 0
                ? h('p', { class: 'cl-p' }, 'No entries yet.')
                : h('div', { class: 'cl-admin-list-items' },
                    entries.value.map((entry) =>
                      h('div', { class: 'cl-admin-list-item', key: entry._id }, [
                        h('div', { class: 'cl-admin-list-item-body' }, [
                          h('div', { class: 'cl-admin-list-item-title' }, entry.title),
                          h('div', { class: 'cl-admin-list-item-meta' }, `v${entry.version} · ${entry.status}`),
                        ]),
                        h('div', { class: 'cl-admin-list-item-actions' }, [
                          h('a', { class: 'cl-btn cl-btn-secondary cl-btn-compact', href: `${props.editBasePath}/${entry._id}` }, 'Edit'),
                          h(
                            'button',
                            { class: 'cl-btn cl-btn-ghost cl-btn-compact', onClick: () => deleteEntry(entry._id) },
                            'Delete'
                          ),
                        ]),
                      ])
                    )
                  ),
        ]),
      ])
  },
})
