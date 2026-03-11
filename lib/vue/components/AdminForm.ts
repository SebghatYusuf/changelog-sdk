import { defineComponent, h, onMounted, ref } from 'vue'
import type { ChangelogEntry, ChangelogTag } from '../types'
import { createChangelogApi } from '../api'
import { useToast } from '../composables/toast'

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

    onMounted(async () => {
      if (props.entry) return
      const result = await api.getLatestPublishedVersion()
      if (result.success && result.data?.version) {
        version.value = result.data.version
      }
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

    return () =>
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
      ])
  },
})
