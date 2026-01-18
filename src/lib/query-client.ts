import { QueryClient } from '@tanstack/react-query'

// Optimized for 10 users - aggressive caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache time (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: false, // Don't refetch on reconnect
      retry: 1, // Only retry once on failure
      retryDelay: 1000, // Wait 1 second before retry
    },
    mutations: {
      retry: 0, // Don't retry mutations
    }
  }
})
