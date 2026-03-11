import { defineComponent, h, ref } from 'vue'

export const Tooltip = defineComponent({
  name: 'Tooltip',
  props: {
    content: { type: String, required: true },
    position: { type: String, default: 'top' },
  },
  setup(props, { slots }) {
    const open = ref(false)

    const onEnter = () => {
      open.value = true
    }

    const onLeave = () => {
      open.value = false
    }

    return () =>
      h(
        'span',
        {
          class: 'cl-tooltip-trigger',
          onMouseenter: onEnter,
          onMouseleave: onLeave,
          onFocus: onEnter,
          onBlur: onLeave,
        },
        [
          slots.default ? slots.default() : null,
          open.value
            ? h(
                'span',
                { class: `cl-tooltip-layer cl-tooltip-${props.position}` },
                h('span', { class: 'cl-tooltip-content' }, [
                  props.content,
                  h('span', { class: 'cl-tooltip-arrow' }),
                ])
              )
            : null,
        ]
      )
  },
})
