/**
 * Virtual List Component
 * Efficiently renders large lists using virtual scrolling
 * Note: For full virtualization, install @tanstack/react-virtual
 * This is a simplified version that works without external dependencies
 */

import React, { useRef, useState, useEffect } from 'react'

interface VirtualListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  estimateSize?: number
  overscan?: number
  className?: string
}

export function VirtualList<T>({
  items,
  renderItem,
  estimateSize = 50,
  overscan = 5,
  className = ''
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 })
  
  useEffect(() => {
    const container = parentRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      const start = Math.max(0, Math.floor(scrollTop / estimateSize) - overscan)
      const end = Math.min(
        items.length,
        Math.ceil((scrollTop + containerHeight) / estimateSize) + overscan
      )
      setVisibleRange({ start, end })
    }

    container.addEventListener('scroll', handleScroll)
    handleScroll() // Initial calculation

    return () => container.removeEventListener('scroll', handleScroll)
  }, [items.length, estimateSize, overscan])

  const visibleItems = items.slice(visibleRange.start, visibleRange.end)
  const totalHeight = items.length * estimateSize
  const offsetY = visibleRange.start * estimateSize

  return (
    <div ref={parentRef} className={`h-full overflow-auto ${className}`}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, idx) => {
            const actualIndex = visibleRange.start + idx
            return (
              <div
                key={actualIndex}
                style={{ height: estimateSize }}
              >
                {renderItem(item, actualIndex)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

