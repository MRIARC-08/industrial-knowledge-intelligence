import { LoadingSpinner } from '@/components'

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12">
      <LoadingSpinner className="scale-150" />
      <p className="mt-4 text-gray-400 font-medium animate-pulse">Loading intelligence...</p>
    </div>
  )
}
