import { useCallback } from 'react'
import { useToast } from '@/hooks/useToast'

export interface ErrorOptions {
  /**
   * Custom error message to show to user
   */
  message?: string
  /**
   * Error title
   */
  title?: string
  /**
   * Whether to log error to console (default: false in production)
   */
  log?: boolean
  /**
   * Duration in ms to show toast (default: 5000)
   */
  duration?: number
  /**
   * Callback to execute on error
   */
  onError?: (error: Error) => void
}

/**
 * Hook for centralized error handling
 * Provides toast notifications and consistent error messages
 */
export const useErrorHandler = () => {
  const { toast } = useToast()

  const handleError = useCallback(
    (error: unknown, options: ErrorOptions = {}) => {
      const {
        message = 'An error occurred',
        title = 'Error',
        log = process.env.NODE_ENV !== 'production',
        duration = 5000,
        onError,
      } = options

      const err = error instanceof Error ? error : new Error(String(error))

      if (log) {
        console.error(`[${title}]`, err)
      }

      // Show toast notification
      toast({
        title,
        description: message,
        variant: 'destructive',
        duration,
      })

      // Call optional callback
      if (onError) {
        onError(err)
      }

      return err
    },
    [toast]
  )

  /**
   * Wrap async operations with error handling
   */
  const handleAsync = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      options: ErrorOptions & { success?: string } = {}
    ): Promise<T | null> => {
      try {
        const result = await fn()

        // Show success message if provided
        if (options.success) {
          toast({
            title: 'Success',
            description: options.success,
            variant: 'default',
            duration: options.duration,
          })
        }

        return result
      } catch (error) {
        handleError(error, options)
        return null
      }
    },
    [handleError, toast]
  )

  return { handleError, handleAsync }
}

export default useErrorHandler
