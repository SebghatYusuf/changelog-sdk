import { Teleport, defineComponent, h, ref } from 'vue'

export const Tooltip = defineComponent({
  name: 'Tooltip',
  props: {
    content: { type: String, required: true },
    position: { type: String, default: 'top' },
  },
  setup(props, { slots }) {
    const open = ref(false)
    const x = ref(0)
    const y = ref(0)

    const updatePosition = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return
      const rect = target.getBoundingClientRect()
      x.value = rect.left + rect.width / 2
      y.value = props.position === 'bottom' ? rect.bottom + 10 : rect.top - 10
    }

    const onEnter = (event: Event) => {
      updatePosition(event.currentTarget)
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
          onMousemove: onEnter,
          onMouseleave: onLeave,
          onFocus: onEnter,
          onBlur: onLeave,
        },
        [
          slots.default ? slots.default() : null,
          open.value
            ? h(
                Teleport,
                { to: 'body' },
                h(
                  'span',
                  {
                    class: `cl-tooltip-layer cl-tooltip-${props.position}`,
                    style: { left: `${x.value}px`, top: `${y.value}px` },
                    role: 'tooltip',
                  },
                  [
                    h('span', { class: 'cl-tooltip-content' }, props.content),
                    h('span', { class: 'cl-tooltip-arrow', 'aria-hidden': 'true' }),
                  ]
                )
              )
            : null,
        ]
      )
  },
})
