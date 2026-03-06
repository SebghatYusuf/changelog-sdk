'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type TooltipPlacement = 'top' | 'bottom'

interface TooltipState {
  id: string
  content: string
  x: number
  y: number
  placement: TooltipPlacement
}

interface TooltipContextValue {
  showTooltip: (id: string, content: string, anchorRect: DOMRect, placement?: TooltipPlacement) => void
  updateTooltip: (id: string, anchorRect: DOMRect, placement?: TooltipPlacement) => void
  hideTooltip: (id: string) => void
}

const TooltipContext = createContext<TooltipContextValue | null>(null)

function resolveTooltipPosition(anchorRect: DOMRect, placement: TooltipPlacement): { x: number; y: number } {
  const offset = 10
  const x = anchorRect.left + anchorRect.width / 2
  const y = placement === 'top' ? anchorRect.top - offset : anchorRect.bottom + offset
  return { x, y }
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const showTooltip = useCallback((id: string, content: string, anchorRect: DOMRect, placement: TooltipPlacement = 'top') => {
    if (!content) return

    const next = resolveTooltipPosition(anchorRect, placement)
    setTooltip({ id, content, placement, ...next })
  }, [])

  const updateTooltip = useCallback((id: string, anchorRect: DOMRect, placement: TooltipPlacement = 'top') => {
    setTooltip((current) => {
      if (!current || current.id !== id) return current
      const next = resolveTooltipPosition(anchorRect, placement)
      return { ...current, placement, ...next }
    })
  }, [])

  const hideTooltip = useCallback((id: string) => {
    setTooltip((current) => (current && current.id === id ? null : current))
  }, [])

  useEffect(() => {
    if (!tooltip) return

    const clear = () => setTooltip(null)
    window.addEventListener('scroll', clear, true)
    window.addEventListener('resize', clear)

    return () => {
      window.removeEventListener('scroll', clear, true)
      window.removeEventListener('resize', clear)
    }
  }, [tooltip])

  const value = useMemo<TooltipContextValue>(
    () => ({ showTooltip, updateTooltip, hideTooltip }),
    [showTooltip, updateTooltip, hideTooltip]
  )

  return (
    <TooltipContext.Provider value={value}>
      {children}
      {tooltip ? (
        <div
          className={`cl-tooltip-layer cl-tooltip-${tooltip.placement}`}
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
          role="tooltip"
        >
          <div className="cl-tooltip-content">{tooltip.content}</div>
          <div className="cl-tooltip-arrow" aria-hidden="true" />
        </div>
      ) : null}
    </TooltipContext.Provider>
  )
}

export function useTooltipProvider(): TooltipContextValue {
  const context = useContext(TooltipContext)

  if (!context) {
    throw new Error('useTooltipProvider must be used within TooltipProvider')
  }

  return context
}
