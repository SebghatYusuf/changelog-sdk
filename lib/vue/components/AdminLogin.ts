import { defineComponent, h, ref } from 'vue'
import { createChangelogApi } from '../api'
import { useToast } from '../composables/toast'

export const AdminLogin = defineComponent({
  name: 'AdminLogin',
  props: {
    baseUrl: { type: String, default: '' },
    apiBasePath: { type: String, default: '/api/changelog' },
    redirectPath: { type: String, default: '/changelog/admin' },
  },
  setup(props) {
    const api = createChangelogApi({ baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
    const password = ref('')
    const loading = ref(false)
    const toast = useToast()

    const onSubmit = async () => {
      if (!password.value) {
        toast.showToast('Password is required', 'error')
        return
      }

      loading.value = true
      const result = await api.login(password.value)
      loading.value = false

      if (!result.success) {
        toast.showToast(result.error || 'Authentication failed', 'error')
        return
      }

      window.location.href = props.redirectPath
    }

    return () =>
      h('form', {
        class: 'cl-card cl-login-card',
        onSubmit: (event: Event) => {
          event.preventDefault()
          onSubmit()
        },
      }, [
        h('div', { class: 'cl-card-header' }, [
          h('h1', { class: 'cl-card-title' }, 'Admin Login'),
          h('p', { class: 'cl-card-description' }, 'Enter the admin password to access the portal'),
        ]),
        h('div', { class: 'cl-card-content cl-login-card-content' }, [
          h('div', { class: 'cl-form-group' }, [
            h('label', { class: 'cl-form-label', for: 'password' }, 'Password'),
            h('input', {
              id: 'password',
              type: 'password',
              class: 'cl-input',
              placeholder: 'Enter admin password',
              value: password.value,
              onInput: (event: Event) => {
                password.value = (event.target as HTMLInputElement).value
              },
            }),
          ]),
          h(
            'button',
            { type: 'submit', class: 'cl-btn cl-btn-primary cl-login-submit', disabled: loading.value },
            loading.value ? 'Authenticating...' : 'Sign In'
          ),
        ]),
      ])
  },
})
