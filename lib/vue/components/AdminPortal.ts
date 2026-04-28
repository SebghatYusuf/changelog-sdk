import { defineComponent, h, onMounted, ref } from 'vue'
import { createChangelogApi } from '../api'
import { AdminForm } from './AdminForm'
import { AdminList } from './AdminList'
import { AdminAISettings } from './AdminAISettings'
import { AdminChangelogSettings } from './AdminChangelogSettings'
import { AdminRepoSettings } from './AdminRepoSettings'
import { AdminLogoutButton } from './AdminLogoutButton'
import type { ChangelogEntry } from '../types'
import { buildChangelogPath } from '../utils/paths'

type AdminSection = 'publish' | 'ai' | 'changelog-settings' | 'repo' | 'presets'

function normalizeSection(section?: string): AdminSection {
  if (section === 'ai' || section === 'changelog-settings' || section === 'repo' || section === 'presets') {
    return section
  }
  return 'publish'
}

export const AdminPortal = defineComponent({
  name: 'AdminPortal',
  props: {
    section: { type: String, default: 'publish' },
    editId: { type: String, default: '' },
    preset: { type: String, default: '' },
    basePath: { type: String, default: '/changelog' },
    baseUrl: { type: String, default: '' },
    apiBasePath: { type: String, default: '/api/changelog' },
  },
  setup(props) {
    const api = createChangelogApi({ baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
    const entry = ref<ChangelogEntry | null>(null)
    const loading = ref(false)

    const activeSection = normalizeSection(props.section)

    onMounted(async () => {
      if (props.section === 'edit' && props.editId) {
        loading.value = true
        const result = await api.getAdminEntryById(props.editId)
        if (result.success && result.data) {
          entry.value = result.data
        }
        loading.value = false
      }
    })

    if (props.section === 'edit' && props.editId) {
      return () =>
        h('div', { class: 'cl-admin-shell' }, [
          h('header', { class: 'cl-admin-header' }, [
            h('div', { class: 'cl-admin-header-left' }, [
              h('a', {
                href: buildChangelogPath(props.basePath, 'admin'),
                class: 'cl-admin-back-link',
              }, 'Back to Admin'),
              h('div', { class: 'cl-admin-wordmark' }, 'Edit Entry'),
              entry.value
                ? h('p', { class: 'cl-admin-subtitle' }, `v${entry.value.version} · ${entry.value.title}`)
                : null,
            ]),
            h('div', { class: 'cl-admin-header-right' }, [
              h(AdminLogoutButton, { basePath: props.basePath, baseUrl: props.baseUrl, apiBasePath: props.apiBasePath }),
            ]),
          ]),
          h('div', { class: 'cl-admin-edit-wrap' }, [
            loading.value
              ? h('div', { class: 'cl-card cl-admin-panel cl-admin-skeleton' }, [
                  h('div', { class: 'cl-card-header' }, [h('div', { class: 'cl-admin-skeleton-line cl-admin-skeleton-line-sm' })]),
                  h('div', { class: 'cl-card-content cl-admin-skeleton-body' }, [
                    h('div', { class: 'cl-admin-skeleton-line' }),
                    h('div', { class: 'cl-admin-skeleton-line' }),
                    h('div', { class: 'cl-admin-skeleton-line' }),
                    h('div', { class: 'cl-admin-skeleton-line' }),
                  ]),
                ])
              : h(AdminForm, { entry: entry.value, basePath: props.basePath, baseUrl: props.baseUrl, apiBasePath: props.apiBasePath }),
          ]),
        ])
    }

    const renderContent = () => {
      if (activeSection === 'ai') {
        return h(AdminAISettings, { baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
      }

      if (activeSection === 'changelog-settings') {
        return h(AdminChangelogSettings, { baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
      }

      if (activeSection === 'repo') {
        return h(AdminRepoSettings, { baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
      }

      if (activeSection === 'presets') {
        return h('div', { class: 'cl-card cl-admin-panel cl-admin-settings-panel' }, [
          h('div', { class: 'cl-card-header' }, [
            h('h3', { class: 'cl-card-title' }, 'Presets'),
            h('p', { class: 'cl-card-description' }, 'Quick-start templates for common release-note types.'),
          ]),
          h('div', { class: 'cl-card-content cl-admin-form-body' }, [
            h('div', { class: 'cl-admin-presets-grid' }, [
              h('a', { href: `${buildChangelogPath(props.basePath, 'admin')}?preset=feature-release`, class: 'cl-admin-preset-card' }, [
                h('h4', { class: 'cl-admin-preset-title' }, 'Feature Release'),
                h('p', { class: 'cl-admin-preset-description' }, 'Highlights, migration notes, and rollout details.'),
              ]),
              h('a', { href: `${buildChangelogPath(props.basePath, 'admin')}?preset=hotfix`, class: 'cl-admin-preset-card' }, [
                h('h4', { class: 'cl-admin-preset-title' }, 'Hotfix'),
                h('p', { class: 'cl-admin-preset-description' }, 'Critical bugfix summary with impact scope.'),
              ]),
              h('a', { href: `${buildChangelogPath(props.basePath, 'admin')}?preset=maintenance`, class: 'cl-admin-preset-card' }, [
                h('h4', { class: 'cl-admin-preset-title' }, 'Maintenance'),
                h('p', { class: 'cl-admin-preset-description' }, 'Operational updates and technical maintenance details.'),
              ]),
            ]),
          ]),
        ])
      }

      return h('div', { class: 'cl-publish-grid' }, [
        h('div', { class: 'cl-publish-col-form' }, [
          h(AdminForm, { preset: props.preset, basePath: props.basePath, baseUrl: props.baseUrl, apiBasePath: props.apiBasePath }),
        ]),
        h('div', { class: 'cl-publish-col-list' }, [
          h(AdminList, { basePath: props.basePath, baseUrl: props.baseUrl, apiBasePath: props.apiBasePath }),
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
            h('a', { href: buildChangelogPath(props.basePath), class: 'cl-btn cl-btn-ghost cl-btn-sm' }, '← View changelog'),
            h(AdminLogoutButton, { basePath: props.basePath, baseUrl: props.baseUrl, apiBasePath: props.apiBasePath }),
          ]),
        ]),
        h('div', { class: 'cl-admin-layout' }, [
          h('aside', { class: 'cl-admin-sidebar' }, [
            h('nav', { class: 'cl-admin-nav' }, [
              h('p', { class: 'cl-admin-nav-label' }, 'Navigation'),
              h('a', { href: buildChangelogPath(props.basePath, 'admin'), class: `cl-admin-nav-item ${activeSection === 'publish' ? 'is-active' : ''}`, 'aria-current': activeSection === 'publish' ? 'page' : undefined }, [
                h('span', { class: 'cl-admin-nav-body' }, [
                  h('span', { class: 'cl-admin-nav-title' }, 'Publishing'),
                  h('span', { class: 'cl-admin-nav-description' }, 'Create and manage entries'),
                ]),
              ]),
              h('a', { href: buildChangelogPath(props.basePath, 'admin', 'ai'), class: `cl-admin-nav-item ${activeSection === 'ai' ? 'is-active' : ''}`, 'aria-current': activeSection === 'ai' ? 'page' : undefined }, [
                h('span', { class: 'cl-admin-nav-body' }, [
                  h('span', { class: 'cl-admin-nav-title' }, 'AI Settings'),
                  h('span', { class: 'cl-admin-nav-description' }, 'Provider, model, runtime'),
                ]),
              ]),
              h('a', { href: buildChangelogPath(props.basePath, 'admin', 'changelog-settings'), class: `cl-admin-nav-item ${activeSection === 'changelog-settings' ? 'is-active' : ''}`, 'aria-current': activeSection === 'changelog-settings' ? 'page' : undefined }, [
                h('span', { class: 'cl-admin-nav-body' }, [
                  h('span', { class: 'cl-admin-nav-title' }, 'Feed Settings'),
                  h('span', { class: 'cl-admin-nav-description' }, 'Feed and publishing defaults'),
                ]),
              ]),
              h('a', { href: buildChangelogPath(props.basePath, 'admin', 'repo'), class: `cl-admin-nav-item ${activeSection === 'repo' ? 'is-active' : ''}`, 'aria-current': activeSection === 'repo' ? 'page' : undefined }, [
                h('span', { class: 'cl-admin-nav-body' }, [
                  h('span', { class: 'cl-admin-nav-title' }, 'Repository'),
                  h('span', { class: 'cl-admin-nav-description' }, 'Connect commits to changelogs'),
                ]),
              ]),
              h('a', { href: buildChangelogPath(props.basePath, 'admin', 'presets'), class: `cl-admin-nav-item ${activeSection === 'presets' ? 'is-active' : ''}`, 'aria-current': activeSection === 'presets' ? 'page' : undefined }, [
                h('span', { class: 'cl-admin-nav-body' }, [
                  h('span', { class: 'cl-admin-nav-title' }, 'Presets'),
                  h('span', { class: 'cl-admin-nav-description' }, 'Reusable templates'),
                ]),
              ]),
            ]),
          ]),
          h('main', { class: 'cl-admin-content' }, [renderContent()]),
        ]),
      ])
  },
})
