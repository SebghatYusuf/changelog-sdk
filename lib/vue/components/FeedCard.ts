import { defineComponent, h, ref, onMounted } from 'vue'
import type { ChangelogEntry } from '../types'
import { renderMarkdown } from '../utils/markdown'

export const FeedCard = defineComponent({
  name: 'FeedCard',
  props: {
    entry: { type: Object as () => ChangelogEntry, required: true },
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
            h('span', { class: 'cl-entry-date' }, new Date(props.entry.date).toLocaleDateString()),
            h('span', { class: 'cl-entry-version' }, `v${props.entry.version}`),
          ]),
          h('h3', { class: 'cl-card-title cl-entry-title' }, props.entry.title),
        ]),
        h('div', { class: 'cl-card-content' }, [
          h('div', { class: 'cl-entry-tags' },
            props.entry.tags.map((tag) => h('span', { class: 'cl-badge', key: tag }, tag))
          ),
          h('div', { class: 'cl-markdown', innerHTML: html.value }),
        ]),
        h('div', { class: 'cl-card-footer' }, [
          h('a', { class: 'cl-btn cl-btn-ghost', href: `/changelog/${props.entry.slug}` }, 'Read more'),
        ]),
      ])
  },
})
