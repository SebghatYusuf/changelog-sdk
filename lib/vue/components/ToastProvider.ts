import { defineComponent, h } from 'vue'
import { provideToast } from '../composables/toast'

export const ToastProvider = defineComponent({
  name: 'ToastProvider',
  setup(_props, { slots }) {
    const toast = provideToast()

    return () =>
      h('div', {}, [
        slots.default ? slots.default() : null,
        h(
          'div',
          { class: 'cl-toast-viewport', 'aria-live': 'polite', 'aria-atomic': 'true' },
          toast.toasts.map((item) =>
            h(
              'div',
              {
                key: item.id,
                class: `cl-alert ${item.tone === 'success' ? 'cl-alert-success' : 'cl-alert-error'} cl-toast-item`,
              },
              h('div', { class: 'cl-alert-description' }, item.message)
            )
          )
        ),
      ])
  },
})
