import { defineComponent, h, onMounted, ref } from 'vue'
import { createChangelogApi } from '../api'
import { AdminForm } from './AdminForm'
import { AdminList } from './AdminList'
import { AdminAISettings } from './AdminAISettings'
import { AdminChangelogSettings } from './AdminChangelogSettings'
import { AdminLogoutButton } from './AdminLogoutButton'
import type { ChangelogEntry } from '../types'

export const AdminPortal = defineComponent({
  name: 'AdminPortal',
  props: {
    section: { type: String, default: 'publish' },
    editId: { type: String, default: '' },
    baseUrl: { type: String, default: '' },
    apiBasePath: { type: String, default: '/api/changelog' },
  },
  setup(props) {
    const api = createChangelogApi({ baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
    const entry = ref<ChangelogEntry | null>(null)

    onMounted(async () => {
      if (props.section === 'edit' && props.editId) {
        const result = await api.getAdminEntryById(props.editId)
        if (result.success && result.data) {
          entry.value = result.data
        }
      }
    })

    const renderContent = () => {
      if (props.section === 'ai') {
        return h(AdminAISettings, { baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
      }

      if (props.section === 'changelog-settings') {
        return h(AdminChangelogSettings, { baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
      }

      if (props.section === 'edit' && props.editId) {
        return h(AdminForm, { entry: entry.value, baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
      }

      return h('div', { class: 'cl-publish-grid' }, [
        h('div', { class: 'cl-publish-col-form' }, [
          h(AdminForm, { baseUrl: props.baseUrl, apiBasePath: props.apiBasePath }),
        ]),
        h('div', { class: 'cl-publish-col-list' }, [
          h(AdminList, { baseUrl: props.baseUrl, apiBasePath: props.apiBasePath }),
        ]),
      ])
    }

    return () =>
      h('div', { class: 'cl-admin-shell' }, [
        h('header', { class: 'cl-admin-header' }, [
          h('div', { class: 'cl-admin-header-left' }, [
            h('div', { class: 'cl-admin-wordmark' }, 'Changelog Admin'),
            h('p', { class: 'cl-admin-subtitle' }, 'Create, refine, and publish release notes.'),
          ]),
          h('div', { class: 'cl-admin-header-right' }, [
            h('a', { href: '/changelog', class: 'cl-btn cl-btn-ghost cl-btn-sm' }, 'View changelog'),
            h(AdminLogoutButton, { baseUrl: props.baseUrl, apiBasePath: props.apiBasePath }),
          ]),
        ]),
        h('div', { class: 'cl-admin-layout' }, [
          h('aside', { class: 'cl-admin-sidebar' }, [
            h('nav', { class: 'cl-admin-nav' }, [
              h('p', { class: 'cl-admin-nav-label' }, 'Navigation'),
              h('a', { href: '/changelog/admin', class: `cl-admin-nav-item ${props.section === 'publish' ? 'is-active' : ''}` }, 'Publishing'),
              h('a', { href: '/changelog/admin/ai', class: `cl-admin-nav-item ${props.section === 'ai' ? 'is-active' : ''}` }, 'AI Settings'),
              h('a', { href: '/changelog/admin/changelog-settings', class: `cl-admin-nav-item ${props.section === 'changelog-settings' ? 'is-active' : ''}` }, 'Feed Settings'),
            ]),
          ]),
          h('main', { class: 'cl-admin-content' }, [renderContent()]),
        ]),
      ])
  },
})
