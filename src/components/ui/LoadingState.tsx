import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  /**
   * Loading message to display
   */
  message?: string
  /**
   * Show a simple spinner (default) or skeleton UI
   */
  variant?: 'spinner' | 'skeleton'
  /**
   * Size of the spinner
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Optional custom className
   */
  className?: string
  /**
   * Whether to show full screen loading overlay
   */
  fullscreen?: boolean
}

/**
 * Loading state component showing spinner or skeleton
 * Used when data is being fetched or processed
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  variant = 'spinner',
  size = 'md',
  className = '',
  fullscreen = false,
}) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size]

  if (variant === 'skeleton') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClass} animate-spin text-primary`} />
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          {message}
        </p>
      )}
    </div>
  )

  if (fullscreen) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-50 ${className}`}>
        {content}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-[300px] ${className}`}>
      {content}
    </div>
  )
}

export default LoadingState
