import { defineComponent, h } from 'vue'
import { ToastProvider } from './ToastProvider'
import { FeedTimeline } from './FeedTimeline'
import { FeedDetail } from './FeedDetail'
import { AdminPortal } from './AdminPortal'
import { AdminLogin } from './AdminLogin'
import type { ChangelogTag } from '../types'

interface RouteParams {
  route?: string[]
}

interface SearchParams {
  page?: string
  tags?: string
  search?: string
}

export const ChangelogManager = defineComponent({
  name: 'ChangelogManager',
  props: {
    params: { type: Object as () => RouteParams, default: () => ({}) },
    searchParams: { type: Object as () => SearchParams, default: () => ({}) },
    baseUrl: { type: String, default: '' },
    apiBasePath: { type: String, default: '/api/changelog' },
  },
  setup(props) {
    const route = props.params?.route?.[0] || ''
    const adminSection = props.params?.route?.[1]
    const adminEditId = props.params?.route?.[2]

    const page = Math.max(1, Number(props.searchParams?.page ?? 1))
    const tags = (props.searchParams?.tags ?? '').split(',').filter(Boolean) as ChangelogTag[]
    const search = props.searchParams?.search ?? ''

    const renderRoute = () => {
      if (route === 'admin') {
        return h(AdminPortal, {
          section: adminSection,
          editId: adminEditId,
          baseUrl: props.baseUrl,
          apiBasePath: props.apiBasePath,
        })
      }

      if (route === 'login') {
        return h(AdminLogin, { baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
      }

      if (route) {
        return h(FeedDetail, { slug: route, baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
      }

      return h(FeedTimeline, {
        initialPage: page,
        initialTags: tags,
        initialSearch: search,
        baseUrl: props.baseUrl,
        apiBasePath: props.apiBasePath,
      })
    }

    return () =>
      h(ToastProvider, {}, {
        default: () => renderRoute(),
      })
  },
})
