import { defineComponent, h, ref } from 'vue'
import { createChangelogApi } from '../api'
import { buildChangelogPath } from '../utils/paths'

export const AdminLogoutButton = defineComponent({
  name: 'AdminLogoutButton',
  props: {
    basePath: { type: String, default: '/changelog' },
    baseUrl: { type: String, default: '' },
    apiBasePath: { type: String, default: '/api/changelog' },
  },
  setup(props) {
    const api = createChangelogApi({ baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
    const loading = ref(false)

    const handleLogout = async () => {
      loading.value = true
      await api.logout()
      window.location.href = buildChangelogPath(props.basePath, 'login')
    }

    return () =>
      h(
        'button',
        { type: 'button', class: 'cl-btn cl-btn-secondary cl-btn-compact', onClick: handleLogout, disabled: loading.value },
        loading.value ? 'Logging out...' : 'Logout'
      )
  },
})
