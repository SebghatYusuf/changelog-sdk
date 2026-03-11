import { defineComponent, h, onMounted, ref } from 'vue'
import type { ChangelogEntry, ChangelogTag } from '../types'
import { createChangelogApi } from '../api'
import { FeedFilters } from './FeedFilters'
import { FeedPagination } from './FeedPagination'
import { FeedCard } from './FeedCard'

export const FeedTimeline = defineComponent({
  name: 'FeedTimeline',
  props: {
    initialPage: { type: Number, default: 1 },
    initialTags: { type: Array as () => ChangelogTag[], default: () => [] },
    initialSearch: { type: String, default: '' },
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

    const load = async () => {
      loading.value = true
      const result = await api.getFeed({ page: page.value, limit: 10, tags: tags.value, search: search.value })
      entries.value = result.data.entries
      total.value = result.data.total
      hasMore.value = result.data.hasMore
      loading.value = false
    }

    onMounted(load)

    return () =>
      h('div', { class: 'cl-root cl-feed-wrap' }, [
        h('div', { class: 'cl-feed-hero' }, [
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
              load()
            },
          }),
        ]),
        h('div', { class: 'cl-timeline cl-feed-timeline' }, [
          loading.value
            ? h('div', { class: 'cl-loading-screen' }, [h('div', { class: 'cl-spinner' }), h('span', { class: 'cl-loading-label' }, 'Loading...')])
            : entries.value.length === 0
              ? h('div', { class: 'cl-card cl-feed-empty-card' }, [
                  h('div', { class: 'cl-card-content cl-feed-empty-content' }, [
                    h('p', { class: 'cl-p cl-feed-empty-title' }, 'No changelog entries found.'),
                    h('p', { class: 'cl-feed-empty-subtitle' }, 'Try adjusting your search or filters.'),
                  ]),
                ])
              : entries.value.map((entry) => h('div', { class: 'cl-timeline-item', key: entry._id }, h(FeedCard, { entry }))),
        ]),
        h(FeedPagination, {
          currentPage: page.value,
          hasMore: hasMore.value,
          total: total.value,
          onChange: (next: number) => {
            page.value = next
            load()
          },
        }),
      ])
  },
})
