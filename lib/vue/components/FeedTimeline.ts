import { defineComponent, h, onMounted, onUnmounted, ref } from 'vue'
import type { ChangelogEntry, ChangelogTag } from '../types'
import { createChangelogApi } from '../api'
import { FeedFilters } from './FeedFilters'
import { FeedPagination } from './FeedPagination'
import { FeedCard } from './FeedCard'
import { buildChangelogPath } from '../utils/paths'

export const FeedTimeline = defineComponent({
  name: 'FeedTimeline',
  props: {
    initialPage: { type: Number, default: 1 },
    initialTags: { type: Array as () => ChangelogTag[], default: () => [] },
    initialSearch: { type: String, default: '' },
    basePath: { type: String, default: '/changelog' },
    baseUrl: { type: String, default: '' },
    apiBasePath: { type: String, default: '/api/changelog' },
  },
  setup(props) {
    const api = createChangelogApi({ baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
    const entries = ref<ChangelogEntry[]>([])
    const total = ref(0)
    const page = ref(props.initialPage)
    const hasMore = ref(false)
    const tags = ref<ChangelogTag[]>([...props.initialTags])
    const search = ref(props.initialSearch)
    const loading = ref(true)
    const error = ref('')

    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      page.value = Math.max(1, Number(params.get('page') || 1))
      tags.value = (params.get('tags') || '').split(',').filter(Boolean) as ChangelogTag[]
      search.value = params.get('search') || ''
    }

    const updateUrl = (nextPage: number, nextSearch: string, nextTags: ChangelogTag[]) => {
      const params = new URLSearchParams(window.location.search)
      params.set('page', String(nextPage))
      if (nextSearch.trim()) {
        params.set('search', nextSearch.trim())
      } else {
        params.delete('search')
      }
      if (nextTags.length > 0) {
        params.set('tags', nextTags.join(','))
      } else {
        params.delete('tags')
      }
      const nextUrl = `${buildChangelogPath(props.basePath)}?${params.toString()}`
      window.history.replaceState({}, '', nextUrl)
    }

    const load = async () => {
      loading.value = true
      error.value = ''
      const result = await api.getFeed({ page: page.value, limit: 10, tags: tags.value, search: search.value })
      if (!result.success) {
        entries.value = []
        total.value = 0
        hasMore.value = false
        error.value = 'Failed to load changelog entries.'
        loading.value = false
        return
      }
      entries.value = result.data.entries
      total.value = result.data.total
      hasMore.value = result.data.hasMore
      loading.value = false
    }

    const onPopState = () => {
      syncFromUrl()
      load()
    }

    onMounted(() => {
      window.addEventListener('popstate', onPopState)
      load()
    })

    onUnmounted(() => {
      window.removeEventListener('popstate', onPopState)
    })

    return () =>
      h('div', { class: 'cl-root cl-feed-wrap' }, [
        h('div', { class: 'cl-feed-hero' }, [
          h('div', { class: 'cl-feed-topbar' }, [
            h('a', {
              href: buildChangelogPath(props.basePath, 'admin'),
              class: 'cl-btn cl-btn-secondary cl-btn-compact cl-feed-admin-link',
            }, 'Admin'),
          ]),
          h('div', { class: 'cl-feed-kicker' }, [h('span', { class: 'cl-feed-kicker-dot' }), 'Product Updates']),
          h('h1', { class: 'cl-h1 cl-feed-title' }, "What's New"),
          h('p', { class: 'cl-p cl-feed-subtitle' }, 'Stay up to date with the latest features, improvements, and updates to our platform.'),
          h('div', { class: 'cl-feed-hero-stats' }, [
            h('span', { class: 'cl-feed-stat' }, [
              h('span', { class: 'cl-feed-stat-value' }, String(total.value)),
              h('span', { class: 'cl-feed-stat-label' }, total.value === 1 ? 'release' : 'releases'),
            ]),
          ]),
        ]),
        h('div', { class: 'cl-feed-filters' }, [
          h(FeedFilters, {
            initialSearch: props.initialSearch,
            initialTags: props.initialTags,
            onUpdateFilters: (payload: { search: string; tags: ChangelogTag[] }) => {
              search.value = payload.search
              tags.value = payload.tags
              page.value = 1
              updateUrl(1, payload.search, payload.tags)
              load()
            },
          }),
        ]),
        h('div', { class: 'cl-timeline cl-feed-timeline' }, [
          loading.value
            ? h('div', { class: 'cl-card cl-feed-empty-card' }, [
                h('div', { class: 'cl-card-content cl-feed-empty-content' }, [
                  h('div', { class: 'cl-spinner' }),
                  h('p', { class: 'cl-p cl-feed-empty-title' }, 'Loading updates...'),
                ]),
              ])
            : error.value
              ? h('div', { class: 'cl-card cl-feed-empty-card' }, [
                  h('div', { class: 'cl-card-content cl-feed-empty-content' }, [
                    h('p', { class: 'cl-p cl-feed-empty-title' }, error.value),
                  ]),
                ])
            : entries.value.length === 0
              ? h('div', { class: 'cl-card cl-feed-empty-card' }, [
                  h('div', { class: 'cl-card-content cl-feed-empty-content' }, [
                    h('p', { class: 'cl-p cl-feed-empty-title' }, 'No changelog entries found.'),
                    h('p', { class: 'cl-feed-empty-subtitle' }, 'Try adjusting your search or filters.'),
                  ]),
                ])
              : entries.value.map((entry) => h('div', { class: 'cl-timeline-item', key: entry._id }, h(FeedCard, { entry, basePath: props.basePath }))),
        ]),
        h(FeedPagination, {
          currentPage: page.value,
          hasMore: hasMore.value,
          total: total.value,
          onChange: (next: number) => {
            page.value = next
            updateUrl(next, search.value, tags.value)
            load()
          },
        }),
      ])
  },
})
