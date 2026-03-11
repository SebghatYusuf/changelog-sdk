import { defineComponent, h, ref } from 'vue'
import { createChangelogApi } from '../api'

export const AdminLogoutButton = defineComponent({
  name: 'AdminLogoutButton',
  props: {
    baseUrl: { type: String, default: '' },
    apiBasePath: { type: String, default: '/api/changelog' },
    redirectPath: { type: String, default: '/changelog/login' },
  },
  setup(props) {
    const api = createChangelogApi({ baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
    const loading = ref(false)

    const handleLogout = async () => {
      loading.value = true
      await api.logout()
      window.location.href = props.redirectPath
    }

    return () =>
      h(
        'button',
        { type: 'button', class: 'cl-btn cl-btn-ghost cl-btn-sm', onClick: handleLogout, disabled: loading.value },
        loading.value ? 'Logging out...' : 'Logout'
      )
  },
})
