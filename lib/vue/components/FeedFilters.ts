import { defineComponent, h, ref, watch } from 'vue'
import type { ChangelogTag } from '../types'

const ALL_TAGS: ChangelogTag[] = [
  'Features',
  'Fixes',
  'Improvements',
  'Breaking',
  'Security',
  'Performance',
  'Docs',
]

export const FeedFilters = defineComponent({
  name: 'FeedFilters',
  props: {
    initialSearch: { type: String, default: '' },
    initialTags: { type: Array as () => ChangelogTag[], default: () => [] },
  },
  emits: ['update:filters'],
  setup(props, { emit }) {
    const search = ref(props.initialSearch)
    const selectedTags = ref<ChangelogTag[]>([...props.initialTags])

    watch(
      () => [search.value, selectedTags.value],
      () => {
        emit('update:filters', { search: search.value, tags: selectedTags.value })
      }
    )

    const toggleTag = (tag: ChangelogTag) => {
      if (selectedTags.value.includes(tag)) {
        selectedTags.value = selectedTags.value.filter((t) => t !== tag)
      } else {
        selectedTags.value = [...selectedTags.value, tag]
      }
    }

    const clearFilters = () => {
      search.value = ''
      selectedTags.value = []
    }

    return () =>
      h('div', { class: 'cl-card cl-filter-card' }, [
        h('div', { class: 'cl-filter-body' }, [
          h('div', { class: 'cl-filter-search-row' }, [
            h('input', {
              class: 'cl-input cl-filter-search-input',
              placeholder: 'Search updates and features...',
              value: search.value,
              onInput: (event: Event) => {
                search.value = (event.target as HTMLInputElement).value
              },
            }),
          ]),
          h('div', { class: 'cl-filter-section' }, [
            h('label', { class: 'cl-filter-label' }, 'Filter by category'),
            h('div', { class: 'cl-filter-tags' },
              ALL_TAGS.map((tag) =>
                h(
                  'button',
                  {
                    key: tag,
                    type: 'button',
                    class: `cl-filter-chip ${selectedTags.value.includes(tag) ? 'is-selected' : ''}`,
                    onClick: () => toggleTag(tag),
                  },
                  tag
                )
              )
            ),
          ]),
          search.value || selectedTags.value.length > 0
            ? h('div', { class: 'cl-filter-active' }, [
                h('div', { class: 'cl-filter-active-row' }, [
                  h('span', { class: 'cl-filter-active-info' },
                    `${selectedTags.value.length} filters · Searching "${search.value}"`.trim()
                  ),
                  h('button', { type: 'button', class: 'cl-filter-clear', onClick: clearFilters }, 'Clear all'),
                ]),
              ])
            : null,
        ]),
      ])
  },
})
