import { defineComponent, h, onMounted, ref } from 'vue'
import { createChangelogApi } from '../api'
import { renderMarkdown } from '../utils/markdown'
import type { ChangelogEntry } from '../types'

export const FeedDetail = defineComponent({
  name: 'FeedDetail',
  props: {
    slug: { type: String, required: true },
    baseUrl: { type: String, default: '' },
    apiBasePath: { type: String, default: '/api/changelog' },
  },
  setup(props) {
    const api = createChangelogApi({ baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
    const entry = ref<ChangelogEntry | null>(null)
    const html = ref('')
    const loading = ref(true)

    onMounted(async () => {
      const result = await api.getEntryBySlug(props.slug)
      entry.value = result.data || null
      if (entry.value) {
        html.value = await renderMarkdown(entry.value.content)
      }
      loading.value = false
    })

    return () =>
      h('main', { class: 'cl-root cl-section cl-feed-screen' }, [
        loading.value
          ? h('div', { class: 'cl-loading-screen' }, [h('div', { class: 'cl-spinner' }), h('span', { class: 'cl-loading-label' }, 'Loading...')])
          : !entry.value
            ? h('div', { class: 'cl-card' }, [
                h('div', { class: 'cl-card-content' }, [h('p', { class: 'cl-p' }, 'Changelog not found.')]),
              ])
            : h('article', { class: 'cl-card cl-entry-detail' }, [
                h('div', { class: 'cl-card-header' }, [
                  h('div', { class: 'cl-entry-meta' }, [
                    h('span', { class: 'cl-entry-date' }, new Date(entry.value.date).toLocaleDateString()),
                    h('span', { class: 'cl-entry-version' }, `v${entry.value.version}`),
                  ]),
                  h('h1', { class: 'cl-h1 cl-entry-title' }, entry.value.title),
                  h('div', { class: 'cl-entry-tags' }, entry.value.tags.map((tag) => h('span', { class: 'cl-badge', key: tag }, tag))),
                ]),
                h('div', { class: 'cl-card-content' }, [
                  h('div', { class: 'cl-markdown', innerHTML: html.value }),
                ]),
              ]),
      ])
  },
})
