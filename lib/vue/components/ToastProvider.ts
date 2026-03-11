import { defineComponent, h } from 'vue'
import { provideToast } from '../composables/toast'

export const ToastProvider = defineComponent({
  name: 'ToastProvider',
  setup(_props, { slots }) {
    const toast = provideToast()

    return () =>
      h('div', { class: 'cl-toast-root' }, [
        slots.default ? slots.default() : null,
        h(
          'div',
          { class: 'cl-toast-viewport' },
          toast.toasts.map((item) =>
            h(
              'div',
              { key: item.id, class: `cl-toast-item cl-toast-${item.tone}` },
              h('div', { class: 'cl-toast-description' }, item.message)
            )
          )
        ),
      ])
  },
})
