import { defineComponent, h, onMounted, ref } from 'vue'
import { createChangelogApi } from '../api'
import { useToast } from '../composables/toast'

export const AdminChangelogSettings = defineComponent({
  name: 'AdminChangelogSettings',
  props: {
    baseUrl: { type: String, default: '' },
    apiBasePath: { type: String, default: '/api/changelog' },
  },
  setup(props) {
    const api = createChangelogApi({ baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
    const toast = useToast()
    const defaultFeedPageSize = ref(10)
    const autoPublish = ref(false)

    onMounted(async () => {
      const result = await api.getChangelogSettings()
      if (result.success && result.data) {
        defaultFeedPageSize.value = result.data.defaultFeedPageSize
        autoPublish.value = result.data.autoPublish
      }
    })

    const save = async () => {
      const result = await api.updateChangelogSettings({
        defaultFeedPageSize: defaultFeedPageSize.value,
        autoPublish: autoPublish.value,
      })
      if (!result.success) {
        toast.showToast(result.error || 'Failed to save settings', 'error')
        return
      }
      toast.showToast('Settings updated.', 'success')
    }

    return () =>
      h('div', { class: 'cl-card cl-admin-panel cl-admin-settings-panel' }, [
        h('div', { class: 'cl-card-header' }, [
          h('h3', { class: 'cl-card-title' }, 'Changelog settings'),
          h('p', { class: 'cl-card-description' }, 'Feed defaults and publishing preferences.'),
        ]),
        h('div', { class: 'cl-card-content cl-admin-form-body' }, [
          h('div', { class: 'cl-form-group' }, [
            h('label', { class: 'cl-form-label' }, 'Default feed page size'),
            h('input', {
              class: 'cl-input',
              type: 'number',
              min: 1,
              max: 50,
              value: String(defaultFeedPageSize.value),
              onInput: (event: Event) => {
                defaultFeedPageSize.value = Number((event.target as HTMLInputElement).value)
              },
            }),
          ]),
          h('div', { class: 'cl-form-group' }, [
            h('label', { class: 'cl-form-label' }, 'Auto publish new entries'),
            h('input', {
              type: 'checkbox',
              checked: autoPublish.value,
              onChange: (event: Event) => {
                autoPublish.value = (event.target as HTMLInputElement).checked
              },
            }),
          ]),
          h('button', { type: 'button', class: 'cl-btn cl-btn-primary', onClick: save }, 'Save settings'),
        ]),
      ])
  },
})
