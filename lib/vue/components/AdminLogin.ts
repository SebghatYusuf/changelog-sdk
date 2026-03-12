import { defineComponent, h, ref } from 'vue'
import { createChangelogApi } from '../api'
import { useToast } from '../composables/toast'

export const AdminLogin = defineComponent({
  name: 'AdminLogin',
  props: {
    mode: { type: String as () => 'login' | 'register', default: 'login' },
    baseUrl: { type: String, default: '' },
    apiBasePath: { type: String, default: '/api/changelog' },
    redirectPath: { type: String, default: '/changelog/admin' },
  },
  setup(props) {
    const api = createChangelogApi({ baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
    const canRegister = ref(false)
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

    const onSubmit = async () => {
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
        props.mode === 'register'
          ? await api.register({ email: email.value, password: password.value })
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
          onSubmit()
        },
      }, [
        h('div', { class: 'cl-card-header' }, [
          h('h1', { class: 'cl-card-title' }, props.mode === 'register' ? 'Create Admin Account' : 'Admin Login'),
          h(
            'p',
            { class: 'cl-card-description' },
            props.mode === 'register' ? 'Register a new admin account' : 'Sign in with your admin account'
          ),
        ]),
        h('div', { class: 'cl-card-content cl-login-card-content' }, [
          props.mode === 'register' && !canRegister.value
            ? h('div', { class: 'cl-alert cl-alert-error' }, [
                h(
                  'div',
                  { class: 'cl-alert-description' },
                  'Registration is currently disabled. Ask the site owner to set CHANGELOG_ALLOW_ADMIN_REGISTRATION=true.'
                ),
              ])
            : null,
          h('div', { class: 'cl-form-group' }, [
            h('label', { class: 'cl-form-label', for: 'email' }, 'Email'),
            h('input', {
              id: 'email',
              name: 'email',
              type: 'email',
              class: 'cl-input',
              placeholder: 'Enter admin email',
              value: email.value,
              disabled: props.mode === 'register' && !canRegister.value,
              onInput: (event: Event) => {
                email.value = (event.target as HTMLInputElement).value
              },
            }),
          ]),
          h('div', { class: 'cl-form-group' }, [
            h('label', { class: 'cl-form-label', for: 'password' }, 'Password'),
            h('input', {
              id: 'password',
              name: 'password',
              type: 'password',
              class: 'cl-input',
              placeholder: 'Enter account password',
              value: password.value,
              disabled: props.mode === 'register' && !canRegister.value,
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
              disabled: loading.value || (props.mode === 'register' && !canRegister.value),
              onClick: (event: Event) => {
                event.preventDefault()
                onSubmit()
              },
            },
            loading.value
              ? props.mode === 'register'
                ? 'Creating account...'
                : 'Authenticating...'
              : props.mode === 'register'
                ? 'Create Admin Account'
                : 'Sign In'
          ),
          props.mode === 'login' && canRegister.value
            ? h(
                'a',
                {
                  href: '/changelog/register',
                  class: 'cl-btn cl-btn-secondary cl-login-submit',
                },
                'Create Admin Account'
              )
            : null,
          props.mode === 'register'
            ? h(
                'a',
                {
                  href: '/changelog/login',
                  class: 'cl-btn cl-btn-secondary cl-login-submit',
                },
                'Back to Login'
              )
            : null,
        ]),
      ])
  },
})
