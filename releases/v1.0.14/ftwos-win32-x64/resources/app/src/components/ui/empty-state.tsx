import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/services/utils'
import { useThemeStore } from '@/stores/theme-store'
import { Button } from './button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  actionIcon?: LucideIcon
  onAction?: () => void
  className?: string
  compact?: boolean
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  className,
  compact = false
}: EmptyStateProps) {
  const { mode } = useThemeStore()

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      compact ? "space-y-2 p-3" : "space-y-4 p-6",
      className
    )}>
      <div className={cn(
        "rounded-full flex items-center justify-center",
        compact ? "p-3" : "p-4",
        mode === 'glass' ? "bg-white/10" : "bg-gray-100"
      )}>
        <Icon className={cn(
          compact ? "h-5 w-5" : "h-8 w-8",
          mode === 'glass' ? "text-white/50" : "text-gray-400"
        )} />
      </div>

      <div className={cn(compact ? "space-y-0.5" : "space-y-1")}>
        <p className={cn(
          "font-medium",
          compact ? "text-xs" : "text-sm",
          mode === 'glass' ? "text-white" : "text-gray-900"
        )}>
          {title}
        </p>
        {description && (
          <p className={cn(
            compact ? "text-[10px]" : "text-xs",
            mode === 'glass' ? "text-white/50" : "text-gray-500"
          )}>
            {description}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size={compact ? "sm" : "default"}
          variant="default"
          className={cn(
            "gap-1.5",
            compact ? "text-xs h-7 px-2" : ""
          )}
        >
          {ActionIcon && <ActionIcon className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />}
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
