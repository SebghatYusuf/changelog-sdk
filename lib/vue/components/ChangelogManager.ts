import { defineComponent, h, onMounted, ref } from 'vue'
import { ToastProvider } from './ToastProvider'
import { FeedTimeline } from './FeedTimeline'
import { FeedDetail } from './FeedDetail'
import { AdminPortal } from './AdminPortal'
import { AdminLogin } from './AdminLogin'
import type { ChangelogTag } from '../types'
import { createChangelogApi } from '../api'
import { buildChangelogPath, normalizeBasePath } from '../utils/paths'

interface RouteParams {
  route?: string[]
}

interface SearchParams {
  page?: string
  tags?: string
  search?: string
  preset?: string
}

export const ChangelogManager = defineComponent({
  name: 'ChangelogManager',
  props: {
    params: { type: Object as () => RouteParams, default: () => ({}) },
    searchParams: { type: Object as () => SearchParams, default: () => ({}) },
    basePath: { type: String, default: '/changelog' },
    baseUrl: { type: String, default: '' },
    apiBasePath: { type: String, default: '/api/changelog' },
  },
  setup(props) {
    const api = createChangelogApi({ baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
    const route = props.params?.route?.[0] || ''
    const adminSection = props.params?.route?.[1]
    const adminEditId = props.params?.route?.[2]
    const preset = props.searchParams?.preset
    const normalizedBasePath = normalizeBasePath(props.basePath)
    const adminAuthState = ref<boolean | null>(route === 'admin' ? null : true)

    const page = Math.max(1, Number(props.searchParams?.page ?? 1))
    const tags = (props.searchParams?.tags ?? '').split(',').filter(Boolean) as ChangelogTag[]
    const search = props.searchParams?.search ?? ''

    onMounted(async () => {
      if (route !== 'admin') return
      try {
        adminAuthState.value = await api.checkAdminAuth()
      } catch {
        adminAuthState.value = false
      }
    })

    const renderRoute = () => {
      if (route === 'admin') {
        if (adminAuthState.value === null) {
          return h('main', { class: 'cl-root cl-section cl-admin-screen' }, [
            h('div', { class: 'cl-loading-screen' }, [
              h('div', { class: 'cl-spinner' }),
              h('span', { class: 'cl-loading-label' }, 'Loading...'),
            ]),
          ])
        }

        if (!adminAuthState.value) {
          return h('main', { class: 'cl-root cl-section cl-admin-screen' }, [
            h('div', { class: 'cl-card cl-auth-guard-card' }, [
              h('div', { class: 'cl-card-header' }, [
                h('h1', { class: 'cl-card-title' }, 'Access Denied'),
              ]),
              h('div', { class: 'cl-card-content' }, [
                h('p', { class: 'cl-p' }, 'Please log in to access the admin portal.'),
                h('a', {
                  href: buildChangelogPath(normalizedBasePath, 'login'),
                  class: 'cl-btn cl-btn-primary cl-auth-guard-link',
                }, 'Go to Login'),
              ]),
            ]),
          ])
        }

        return h('main', { class: 'cl-root cl-section cl-admin-screen' }, [
          h(AdminPortal, {
            section: adminSection,
            editId: adminEditId,
            preset,
            basePath: normalizedBasePath,
            baseUrl: props.baseUrl,
            apiBasePath: props.apiBasePath,
          }),
        ])
      }

      if (route === 'login') {
        return h('main', { class: 'cl-root cl-section cl-login-screen' }, [
          h(AdminLogin, {
            mode: 'login',
            basePath: normalizedBasePath,
            baseUrl: props.baseUrl,
            apiBasePath: props.apiBasePath,
          }),
        ])
      }

      if (route === 'register') {
        return h('main', { class: 'cl-root cl-section cl-login-screen' }, [
          h(AdminLogin, {
            mode: 'register',
            basePath: normalizedBasePath,
            baseUrl: props.baseUrl,
            apiBasePath: props.apiBasePath,
          }),
        ])
      }

      if (route) {
        return h('main', { class: 'cl-root cl-section cl-feed-screen' }, [
          h(FeedDetail, {
            slug: route,
            basePath: normalizedBasePath,
            baseUrl: props.baseUrl,
            apiBasePath: props.apiBasePath,
          }),
        ])
      }

      return h('main', { class: 'cl-root cl-section cl-feed-screen' }, [
        h(FeedTimeline, {
          initialPage: page,
          initialTags: tags,
          initialSearch: search,
          basePath: normalizedBasePath,
          baseUrl: props.baseUrl,
          apiBasePath: props.apiBasePath,
        }),
      ])
    }

    return () =>
      h(ToastProvider, {}, {
        default: () => renderRoute(),
      })
  },
})
