import { defineComponent, h, onMounted, ref } from 'vue'
import { createChangelogApi } from '../api'
import { renderMarkdown } from '../utils/markdown'
import type { ChangelogEntry } from '../types'
import { buildChangelogPath } from '../utils/paths'

export const FeedDetail = defineComponent({
  name: 'FeedDetail',
  props: {
    slug: { type: String, required: true },
    basePath: { type: String, default: '/changelog' },
    baseUrl: { type: String, default: '' },
    apiBasePath: { type: String, default: '/api/changelog' },
  },
  setup(props) {
    const api = createChangelogApi({ baseUrl: props.baseUrl, apiBasePath: props.apiBasePath })
    const entry = ref<ChangelogEntry | null>(null)
    const html = ref('')
    const loading = ref(true)
    const error = ref('')

    onMounted(async () => {
      const result = await api.getEntryBySlug(props.slug)
      if (!result.data || result.data.status !== 'published') {
        error.value = 'Entry not found'
        loading.value = false
        return
      }

      entry.value = result.data
      if (result.data) {
        html.value = await renderMarkdown(entry.value.content)
      }
      loading.value = false
    })

    return () =>
      h('main', { class: 'cl-root cl-section cl-feed-screen' }, [
        loading.value
          ? h('section', { class: 'cl-detail-wrap' }, [
              h('div', { class: 'cl-card cl-detail-card cl-detail-not-found' }, [
                h('div', { class: 'cl-card-header' }, [h('h1', { class: 'cl-card-title' }, 'Loading entry...')]),
              ]),
            ])
          : !entry.value || Boolean(error.value)
            ? h('section', { class: 'cl-detail-wrap' }, [
                h('div', { class: 'cl-card cl-detail-card cl-detail-not-found' }, [
                  h('div', { class: 'cl-card-header' }, [
                    h('h1', { class: 'cl-card-title' }, 'Entry not found'),
                    h('p', { class: 'cl-card-description' }, 'This changelog entry does not exist or is not published yet.'),
                  ]),
                  h('div', { class: 'cl-card-content' }, [
                    h('a', { href: buildChangelogPath(props.basePath), class: 'cl-btn cl-btn-secondary' }, 'Back to changelog'),
                  ]),
                ]),
              ])
            : h('section', { class: 'cl-detail-wrap' }, [
                h('a', { href: buildChangelogPath(props.basePath), class: 'cl-detail-back-link' }, '← Back to all updates'),
                h('article', { class: 'cl-card cl-detail-card' }, [
                h('div', { class: 'cl-card-header cl-detail-header' }, [
                  h('div', { class: 'cl-entry-meta' }, [
                    h('span', { class: 'cl-entry-version' }, `v${entry.value.version}`),
                    h('span', { class: 'cl-entry-date' }, new Date(entry.value.date).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })),
                    entry.value.aiGenerated
                      ? h('span', { class: 'cl-badge cl-badge-secondary cl-entry-ai' }, 'AI Enhanced')
                      : null,
                  ]),
                  h('h1', { class: 'cl-detail-title' }, entry.value.title),
                  h('div', { class: 'cl-entry-tags' }, entry.value.tags.map((tag) => h('span', { class: 'cl-entry-tag', key: tag }, tag))),
                ]),
                h('div', { class: 'cl-card-content cl-detail-content' }, [
                  h('div', { class: 'cl-markdown cl-markdown-strong', innerHTML: html.value }),
                ]),
              ]),
              ]),
      ])
  },
})
