import { defineComponent, h, onMounted, ref } from 'vue'
import type { AIModelOption, AIProviderKind } from '../types'
import { createChangelogApi } from '../api'
import { useToast } from '../composables/toast'
import { DEFAULT_AI_MODELS } from '../../core/constants'

export const AdminAISettings = defineComponent({
  name: 'AdminAISettings',
  props: {
    baseUrl: { type: String, default: '' },
    apiBasePath: { type: String, default: '/api/changelog' },
  },
  setup(props) {
    const api = createChangelogApi({ baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
    const toast = useToast()
    const provider = ref<AIProviderKind>('openai')
    const model = ref(DEFAULT_AI_MODELS.openai)
    const ollamaBaseUrl = ref('http://localhost:11434')
    const models = ref<AIModelOption[]>([])
    const loadingModels = ref(false)

    const loadModels = async () => {
      loadingModels.value = true
      const result = await api.listModels({ provider: provider.value, ollamaBaseUrl: ollamaBaseUrl.value })
      if (result.success && result.data) {
        models.value = result.data
        if (!models.value.find((m) => m.id === model.value)) {
          model.value = models.value[0]?.id || DEFAULT_AI_MODELS[provider.value]
        }
      }
      loadingModels.value = false
    }

    onMounted(async () => {
      const result = await api.getAISettings()
      if (result.success && result.data) {
        provider.value = result.data.provider
        model.value = result.data.model || DEFAULT_AI_MODELS[result.data.provider]
        ollamaBaseUrl.value = result.data.ollamaBaseUrl || 'http://localhost:11434'
        await loadModels()
      }
    })

    const save = async () => {
      const result = await api.updateAISettings({ provider: provider.value, model: model.value, ollamaBaseUrl: ollamaBaseUrl.value })
      if (!result.success) {
        toast.showToast(result.error || 'Failed to save settings', 'error')
        return
      }
      toast.showToast('AI settings saved.', 'success')
    }

    return () =>
      h('div', { class: 'cl-card cl-admin-panel cl-ai-settings-panel' }, [
        h('div', { class: 'cl-card-header' }, [
          h('h3', { class: 'cl-card-title' }, 'AI settings'),
          h('p', { class: 'cl-card-description' }, 'Select provider, load available models, and save defaults for enhancement.'),
        ]),
        h('div', { class: 'cl-card-content cl-admin-form-body' }, [
          h('div', { class: 'cl-form-group' }, [
            h('label', { class: 'cl-form-label' }, 'Provider'),
            h('select', {
              class: 'cl-select',
              value: provider.value,
              onChange: async (event: Event) => {
                provider.value = (event.target as HTMLSelectElement).value as AIProviderKind
                model.value = DEFAULT_AI_MODELS[provider.value]
                await loadModels()
              },
            }, [
              h('option', { value: 'openai' }, 'OpenAI'),
              h('option', { value: 'gemini' }, 'Google Gemini'),
              h('option', { value: 'ollama' }, 'Ollama'),
            ]),
          ]),
          provider.value === 'ollama'
            ? h('div', { class: 'cl-form-group' }, [
                h('label', { class: 'cl-form-label' }, 'Ollama base URL'),
                h('input', {
                  class: 'cl-input',
                  value: ollamaBaseUrl.value,
                  onInput: (event: Event) => {
                    ollamaBaseUrl.value = (event.target as HTMLInputElement).value
                  },
                }),
              ])
            : null,
          h('div', { class: 'cl-form-group' }, [
            h('label', { class: 'cl-form-label' }, 'Model'),
            h('div', { class: 'cl-ai-model-row' }, [
              h('select', {
                class: 'cl-select',
                value: model.value,
                onChange: (event: Event) => {
                  model.value = (event.target as HTMLSelectElement).value
                },
              }, models.value.length > 0
                ? models.value.map((m) => h('option', { value: m.id, key: m.id }, m.name))
                : [h('option', { value: model.value }, model.value)]
              ),
              h('button', {
                type: 'button',
                class: 'cl-btn cl-btn-secondary cl-btn-compact',
                onClick: loadModels,
                disabled: loadingModels.value,
              }, loadingModels.value ? 'Loading...' : 'Refresh models'),
            ]),
          ]),
          h('button', { type: 'button', class: 'cl-btn cl-btn-primary', onClick: save }, 'Save settings'),
        ]),
      ])
  },
})
