import { useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

/**
 * Hook that wraps window.ipcRenderer.invoke with try/catch and toast on error.
 * Returns null on failure; use for IPC calls where centralised error feedback is desired.
 */
export function useIPC() {
  const { toast } = useToast()

  const invoke = useCallback(
    async <T = unknown>(channel: string, ...args: unknown[]): Promise<T | null> => {
      if (typeof window === 'undefined' || !(window as any).ipcRenderer) {
        toast({
          title: 'Operation Failed',
          description: 'IPC not available',
          variant: 'destructive',
        })
        return null
      }

      try {
        const result = await (window as any).ipcRenderer.invoke(channel, ...args)
        return result as T
      } catch (error: any) {
        toast({
          title: 'Operation Failed',
          description: error?.message || 'An error occurred',
          variant: 'destructive',
        })
        return null
      }
    },
    [toast]
  )

  return { invoke }
}

