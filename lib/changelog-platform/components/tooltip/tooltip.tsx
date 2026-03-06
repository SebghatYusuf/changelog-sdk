'use client'

import { useId, type FocusEvent, type MouseEvent, type ReactNode } from 'react'
import { useTooltipProvider } from './provider'

type TooltipPlacement = 'top' | 'bottom'

interface TooltipProps {
  content: string
  children: ReactNode
  placement?: TooltipPlacement
  disabled?: boolean
}

export default function Tooltip({ content, children, placement = 'top', disabled = false }: TooltipProps) {
  const tooltipId = useId()
  const { showTooltip, updateTooltip, hideTooltip } = useTooltipProvider()

  const show = (target: EventTarget | null) => {
    if (disabled || !content) return
    if (!(target instanceof HTMLElement)) return
    showTooltip(tooltipId, content, target.getBoundingClientRect(), placement)
  }

  const update = (target: EventTarget | null) => {
    if (disabled || !content) return
    if (!(target instanceof HTMLElement)) return
    updateTooltip(tooltipId, target.getBoundingClientRect(), placement)
  }

  const hide = () => hideTooltip(tooltipId)

  return (
    <span
      className="cl-tooltip-trigger"
      onMouseEnter={(event: MouseEvent<HTMLElement>) => show(event.currentTarget)}
      onMouseMove={(event: MouseEvent<HTMLElement>) => update(event.currentTarget)}
      onMouseLeave={() => hide()}
      onFocus={(event: FocusEvent<HTMLElement>) => show(event.currentTarget)}
      onBlur={() => hide()}
    >
      {children}
    </span>
  )
}
