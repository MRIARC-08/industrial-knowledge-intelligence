// mobile/src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,   // 2 minutes on mobile (save data)
      retry: 1,                    // Less retry on mobile
      refetchOnWindowFocus: false,
    },
  },
})
