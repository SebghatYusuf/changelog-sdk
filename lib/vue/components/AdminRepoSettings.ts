import { defineComponent, h, onMounted, ref } from 'vue'
import type { RepoProviderKind, RepoSettingsView } from '../types'
import { createChangelogApi } from '../api'
import { useToast } from '../composables/toast'

interface RepoSettingsState {
  provider: RepoProviderKind
  repoUrl: string
  workspace: string
  repoSlug: string
  branch: string
  enabled: boolean
  token: string
  clearToken: boolean
  hasToken: boolean
}

const INITIAL_STATE: RepoSettingsState = {
  provider: 'git',
  repoUrl: '',
  workspace: '',
  repoSlug: '',
  branch: 'main',
  enabled: false,
  token: '',
  clearToken: false,
  hasToken: false,
}

function toState(data: RepoSettingsView): RepoSettingsState {
  return {
    provider: data.provider,
    repoUrl: data.repoUrl || '',
    workspace: data.workspace || '',
    repoSlug: data.repoSlug || '',
    branch: data.branch || 'main',
    enabled: data.enabled,
    token: '',
    clearToken: false,
    hasToken: data.hasToken,
  }
}

export const AdminRepoSettings = defineComponent({
  name: 'AdminRepoSettings',
  props: {
    baseUrl: { type: String, default: '' },
    apiBasePath: { type: String, default: '/api/changelog' },
  },
  setup(props) {
    const api = createChangelogApi({ baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
    const toast = useToast()
    const state = ref<RepoSettingsState>({ ...INITIAL_STATE })
    const loading = ref(true)
    const saving = ref(false)

    onMounted(async () => {
      const result = await api.getRepoSettings()
      if (result.success && result.data) {
        state.value = toState(result.data)
      }
      loading.value = false
    })

    const saveSettings = async () => {
      saving.value = true

      const payload: Record<string, unknown> = {
        provider: state.value.provider,
        branch: state.value.branch,
        enabled: state.value.enabled,
      }

      if (state.value.provider === 'git') {
        payload.repoUrl = state.value.repoUrl
      } else {
        payload.workspace = state.value.workspace
        payload.repoSlug = state.value.repoSlug
      }

      if (state.value.token.trim()) {
        payload.token = state.value.token
      }

      if (state.value.clearToken) {
        payload.clearToken = true
      }

      const result = await api.updateRepoSettings(payload)
      saving.value = false

      if (!result.success || !result.data) {
        toast.showToast(result.error || 'Failed to save repository settings', 'error')
        return
      }

      state.value = toState(result.data as RepoSettingsView)
      toast.showToast('Repository settings saved.', 'success')
    }

    return () =>
      h('div', { class: 'cl-card cl-admin-panel cl-admin-settings-panel' }, [
        h('div', { class: 'cl-card-header' }, [
          h('h3', { class: 'cl-card-title' }, 'Repository settings'),
          h('p', { class: 'cl-card-description' }, 'Connect a repository to generate changelogs from commits.'),
        ]),
        h('div', { class: 'cl-card-content cl-admin-form-body' }, [
          loading.value
            ? h('div', { class: 'cl-admin-skeleton-body' }, [
                h('div', { class: 'cl-admin-skeleton-line' }),
                h('div', { class: 'cl-admin-skeleton-line' }),
                h('div', { class: 'cl-admin-skeleton-line' }),
              ])
            : h('div', {}, [
                h('div', { class: 'cl-form-group' }, [
                  h('label', { class: 'cl-form-label' }, 'Provider'),
                  h('select', {
                    class: 'cl-select',
                    value: state.value.provider,
                    onChange: (event: Event) => {
                      state.value.provider = (event.target as HTMLSelectElement).value as RepoProviderKind
                    },
                  }, [
                    h('option', { value: 'git' }, 'Git (GitHub)'),
                    h('option', { value: 'bitbucket' }, 'Bitbucket'),
                  ]),
                ]),
                state.value.provider === 'git'
                  ? h('div', { class: 'cl-form-group' }, [
                      h('label', { class: 'cl-form-label' }, 'Repository URL'),
                      h('input', {
                        class: 'cl-input',
                        type: 'url',
                        placeholder: 'https://github.com/org/repo',
                        value: state.value.repoUrl,
                        onInput: (event: Event) => {
                          state.value.repoUrl = (event.target as HTMLInputElement).value
                        },
                      }),
                    ])
                  : null,
                state.value.provider === 'bitbucket'
                  ? h('div', { class: 'cl-form-group' }, [
                      h('label', { class: 'cl-form-label' }, 'Workspace'),
                      h('input', {
                        class: 'cl-input',
                        placeholder: 'workspace-id',
                        value: state.value.workspace,
                        onInput: (event: Event) => {
                          state.value.workspace = (event.target as HTMLInputElement).value
                        },
                      }),
                    ])
                  : null,
                state.value.provider === 'bitbucket'
                  ? h('div', { class: 'cl-form-group' }, [
                      h('label', { class: 'cl-form-label' }, 'Repository slug'),
                      h('input', {
                        class: 'cl-input',
                        placeholder: 'repo-name',
                        value: state.value.repoSlug,
                        onInput: (event: Event) => {
                          state.value.repoSlug = (event.target as HTMLInputElement).value
                        },
                      }),
                    ])
                  : null,
                h('div', { class: 'cl-form-group' }, [
                  h('label', { class: 'cl-form-label' }, 'Branch'),
                  h('input', {
                    class: 'cl-input',
                    placeholder: 'main',
                    value: state.value.branch,
                    onInput: (event: Event) => {
                      state.value.branch = (event.target as HTMLInputElement).value
                    },
                  }),
                ]),
                h('div', { class: 'cl-form-group' }, [
                  h('label', { class: 'cl-form-label' }, 'Access token'),
                  h('input', {
                    class: 'cl-input',
                    type: 'password',
                    placeholder: state.value.hasToken ? 'Token saved (leave blank to keep)' : 'Paste token',
                    value: state.value.token,
                    onInput: (event: Event) => {
                      state.value.token = (event.target as HTMLInputElement).value
                      state.value.clearToken = false
                    },
                  }),
                  h('p', { class: 'cl-card-description' }, 'Tokens are stored encrypted using CHANGELOG_ENCRYPTION_KEY.'),
                ]),
                state.value.hasToken
                  ? h('div', { class: 'cl-form-group' }, [
                      h('label', { class: 'cl-form-label' }, 'Clear token'),
                      h('select', {
                        class: 'cl-select',
                        value: state.value.clearToken ? 'yes' : 'no',
                        onChange: (event: Event) => {
                          state.value.clearToken = (event.target as HTMLSelectElement).value === 'yes'
                        },
                      }, [
                        h('option', { value: 'no' }, 'Keep existing token'),
                        h('option', { value: 'yes' }, 'Remove token'),
                      ]),
                    ])
                  : null,
                h('div', { class: 'cl-form-group' }, [
                  h('label', { class: 'cl-form-label' }, 'Integration status'),
                  h('select', {
                    class: 'cl-select',
                    value: state.value.enabled ? 'enabled' : 'disabled',
                    onChange: (event: Event) => {
                      state.value.enabled = (event.target as HTMLSelectElement).value === 'enabled'
                    },
                  }, [
                    h('option', { value: 'disabled' }, 'Disabled'),
                    h('option', { value: 'enabled' }, 'Enabled'),
                  ]),
                ]),
                h('button', {
                  type: 'button',
                  class: 'cl-btn cl-btn-primary cl-admin-submit',
                  disabled: saving.value,
                  onClick: saveSettings,
                }, saving.value ? 'Saving...' : 'Save repository settings'),
              ]),
        ]),
      ])
  },
})
