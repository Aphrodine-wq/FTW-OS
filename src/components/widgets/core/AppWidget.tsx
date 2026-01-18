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
  mode?: 'mock' | 'real'
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
  mode = 'mock',
  ...props
}, ref) => {
  const [showConfig, setShowConfig] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      ref={ref}
      className={cn(
        "relative group h-full w-full",
        "surface-card rounded-2xl",
        className
      )}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchEnd={onTouchEnd}
      {...props}
    >
      <div className="relative h-full w-full">
        {/* Front Face (App View) */}
        <div 
          className={cn(
            "absolute inset-0 flex flex-col overflow-hidden rounded-2xl transition-all duration-300",
            showConfig ? "opacity-0 pointer-events-none scale-95" : "opacity-100 scale-100"
          )}
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
                onClick={(e) => { e.stopPropagation(); setShowConfig(true) }}
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
          className={cn(
            "absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-[var(--bg-surface)] transition-all duration-300",
            showConfig ? "opacity-100 scale-100 z-10" : "opacity-0 pointer-events-none scale-95"
          )}
        >
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />

          <div className="relative flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-hover)]/50 z-10">
            <div className="flex items-center gap-2">
              <Settings className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <span className="text-xs font-bold uppercase text-[var(--text-main)] tracking-wider">
                Configure
              </span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowConfig(false) }}
              className="p-1 rounded hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-green-500 transition-colors"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
          
          <div className="relative flex-1 p-6 flex flex-col justify-center z-10">
            <div className="mb-6 flex justify-center">
                <div className="h-12 w-12 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center">
                    {Icon ? <Icon className="h-6 w-6 text-[var(--text-main)] opacity-50" /> : <Settings className="h-6 w-6 text-[var(--text-main)] opacity-50" />}
                </div>
            </div>
            {configContent}
          </div>
        </div>
      </div>
    </div>
  )
})

AppWidget.displayName = 'AppWidget'
