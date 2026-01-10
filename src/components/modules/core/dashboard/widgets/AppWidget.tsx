import React, { useState } from 'react'
import { Settings, X, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/services/utils'

interface AppWidgetProps {
  title: string
  icon?: React.ElementType
  isConfigured: boolean
  onRemove: () => void
  children: React.ReactNode
  configContent: React.ReactNode
  colSpan?: number
  className?: string
  style?: React.CSSProperties
  onMouseDown?: React.MouseEventHandler
  onMouseUp?: React.MouseEventHandler
  onTouchEnd?: React.TouchEventHandler
}

export const AppWidget = React.forwardRef<HTMLDivElement, AppWidgetProps>(({ 
  title, 
  icon: Icon, 
  isConfigured, 
  onRemove, 
  children, 
  configContent,
  colSpan = 1,
  className,
  style,
  onMouseDown,
  onMouseUp,
  onTouchEnd,
  ...props
}, ref) => {
  const [isFlipped, setIsFlipped] = useState(!isConfigured)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      ref={ref}
      className={cn(
        "relative group perspective-1000 transition-shadow duration-300 h-full w-full",
        // Apply theme-aware surface styles
        "surface-card rounded-2xl",
        className
      )}
      style={{ 
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchEnd={onTouchEnd}
      {...props}
    >
      <motion.div
        className="relative w-full h-full preserve-3d transition-all duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Face (App View) */}
        <div 
          className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Header */}
          <div className="drag-handle flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-hover)]/50 cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4 text-[var(--text-muted)]" />}
              <span className="text-xs font-bold uppercase tracking-wider select-none text-[var(--text-main)]">
                {title}
              </span>
            </div>
            
            <div className={cn(
              "flex items-center gap-1 transition-opacity duration-200",
              isHovered ? "opacity-100" : "opacity-0"
            )}>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsFlipped(true) }}
                className="p-1 rounded hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                title="Settings"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove() }}
                className="p-1 rounded hover:bg-[var(--danger)]/10 hover:text-[var(--danger)] transition-colors text-[var(--text-muted)]"
                title="Remove"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 overflow-auto custom-scrollbar relative">
            {children}
          </div>
        </div>

        {/* Back Face (Config View) */}
        <div 
          className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-[var(--bg-surface)]"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-hover)]/50">
            <span className="text-xs font-bold uppercase text-[var(--text-main)]">
              Configure {title}
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsFlipped(false) }}
              className="p-1 rounded hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex-1 p-6 flex flex-col justify-center bg-[var(--bg-surface)]">
            {configContent}
          </div>
        </div>
      </motion.div>
    </div>
  )
})

AppWidget.displayName = 'AppWidget'
