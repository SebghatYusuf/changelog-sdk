import { defineComponent, h, ref, onMounted } from 'vue'
import type { ChangelogEntry } from '../types'
import { renderMarkdown } from '../utils/markdown'
import { buildChangelogPath } from '../utils/paths'

export const FeedCard = defineComponent({
  name: 'FeedCard',
  props: {
    entry: { type: Object as () => ChangelogEntry, required: true },
    basePath: { type: String, default: '/changelog' },
  },
  setup(props) {
    const html = ref('')

    onMounted(async () => {
      html.value = await renderMarkdown(props.entry.content)
    })

    return () =>
      h('article', { class: 'cl-card cl-entry-card' }, [
        h('div', { class: 'cl-card-header' }, [
          h('div', { class: 'cl-entry-meta' }, [
            h('span', { class: 'cl-entry-version' }, `v${props.entry.version}`),
            h('span', { class: 'cl-entry-date' }, new Date(props.entry.date).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })),
            props.entry.aiGenerated
              ? h('span', { class: 'cl-badge cl-badge-secondary cl-entry-ai' }, 'AI Enhanced')
              : null,
          ]),
          h('h3', { class: 'cl-card-title cl-entry-title' }, props.entry.title),
        ]),
        h('div', { class: 'cl-card-content' }, [
          h('div', { class: 'cl-entry-tags' },
            props.entry.tags.map((tag) => h('span', { class: 'cl-entry-tag', key: tag }, tag))
          ),
          h('div', { class: 'cl-markdown', innerHTML: html.value }),
        ]),
        h('div', { class: 'cl-card-footer' }, [
          h('a', { class: 'cl-btn cl-btn-ghost', href: buildChangelogPath(props.basePath, props.entry.slug) }, 'Read full update →'),
        ]),
      ])
  },
})
