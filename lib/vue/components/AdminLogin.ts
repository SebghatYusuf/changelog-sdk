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
    const canRegister = ref(false)
    const displayName = ref('')
    const email = ref('')
    const password = ref('')
    const loading = ref(false)
    const toast = useToast()

    api.canRegister()
      .then((result) => {
        if (result.success && result.data) {
          canRegister.value = result.data.canRegister
        }
      })
      .catch(() => undefined)

    const onSubmit = async (intent: 'login' | 'register') => {
      if (!email.value) {
        toast.showToast('Email is required', 'error')
        return
      }

      if (!password.value) {
        toast.showToast('Password is required', 'error')
        return
      }

      loading.value = true
      const result =
        intent === 'register'
          ? await api.register({ email: email.value, password: password.value, displayName: displayName.value || undefined })
          : await api.login({ email: email.value, password: password.value })
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
          onSubmit('login')
        },
      }, [
        h('div', { class: 'cl-card-header' }, [
          h('h1', { class: 'cl-card-title' }, 'Admin Login'),
          h(
            'p',
            { class: 'cl-card-description' },
            canRegister.value ? 'Create the first admin account or sign in' : 'Sign in with your admin account'
          ),
        ]),
        h('div', { class: 'cl-card-content cl-login-card-content' }, [
          h('div', { class: 'cl-form-group' }, [
            h('label', { class: 'cl-form-label', for: 'email' }, 'Email'),
            h('input', {
              id: 'email',
              type: 'email',
              class: 'cl-input',
              placeholder: 'Enter admin email',
              value: email.value,
              onInput: (event: Event) => {
                email.value = (event.target as HTMLInputElement).value
              },
            }),
          ]),
          canRegister.value
            ? h('div', { class: 'cl-form-group' }, [
                h('label', { class: 'cl-form-label', for: 'displayName' }, 'Display name (optional)'),
                h('input', {
                  id: 'displayName',
                  type: 'text',
                  class: 'cl-input',
                  placeholder: 'Admin',
                  value: displayName.value,
                  onInput: (event: Event) => {
                    displayName.value = (event.target as HTMLInputElement).value
                  },
                }),
              ])
            : null,
          h('div', { class: 'cl-form-group' }, [
            h('label', { class: 'cl-form-label', for: 'password' }, 'Password'),
            h('input', {
              id: 'password',
              type: 'password',
              class: 'cl-input',
              placeholder: 'Enter account password',
              value: password.value,
              onInput: (event: Event) => {
                password.value = (event.target as HTMLInputElement).value
              },
            }),
          ]),
          h(
            'button',
            {
              type: 'submit',
              class: 'cl-btn cl-btn-primary cl-login-submit',
              disabled: loading.value,
              onClick: (event: Event) => {
                event.preventDefault()
                onSubmit('login')
              },
            },
            loading.value ? 'Authenticating...' : 'Sign In'
          ),
          canRegister.value
            ? h(
                'button',
                {
                  type: 'button',
                  class: 'cl-btn cl-btn-secondary cl-login-submit',
                  disabled: loading.value,
                  onClick: () => onSubmit('register'),
                },
                loading.value ? 'Creating account...' : 'Create Admin Account'
              )
            : null,
        ]),
      ])
  },
})
