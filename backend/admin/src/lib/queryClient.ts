// admin/src/lib/queryClient.ts
// React Query client configuration
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // Data fresh for 1 minute
      retry: 2,                     // Retry failed requests twice
      refetchOnWindowFocus: false,  // Don't refetch on tab focus
    },
  },
})
