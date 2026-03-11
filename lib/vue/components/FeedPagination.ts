import { defineComponent, h } from 'vue'

export const FeedPagination = defineComponent({
  name: 'FeedPagination',
  props: {
    currentPage: { type: Number, required: true },
    hasMore: { type: Boolean, required: true },
    total: { type: Number, required: true },
    pageSize: { type: Number, default: 10 },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const totalPages = Math.max(1, Math.ceil(props.total / props.pageSize))
    const safeCurrentPage = Math.min(Math.max(props.currentPage, 1), totalPages)

    return () =>
      h('div', { class: 'cl-pagination' }, [
        h('p', { class: 'cl-pagination-info' }, `Page ${safeCurrentPage} of ${totalPages}`),
        h('div', { class: 'cl-pagination-actions' }, [
          h(
            'button',
            {
              class: 'cl-btn cl-btn-secondary cl-btn-compact cl-pagination-btn',
              disabled: safeCurrentPage <= 1,
              onClick: () => emit('change', safeCurrentPage - 1),
            },
            'Previous'
          ),
          h(
            'button',
            {
              class: 'cl-btn cl-btn-secondary cl-btn-compact cl-pagination-btn',
              disabled: !props.hasMore || safeCurrentPage >= totalPages,
              onClick: () => emit('change', safeCurrentPage + 1),
            },
            'Next'
          ),
        ]),
      ])
  },
})
