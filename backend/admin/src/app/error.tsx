'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center">
      <ErrorState 
        message={error.message || "A critical application error occurred."} 
        onRetry={() => reset()} 
      />
    </div>
  )
}
