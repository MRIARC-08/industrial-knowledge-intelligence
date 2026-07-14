// admin/src/components/layout/TopBar.tsx
'use client'
import { Bell, User } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function TopBar() {
  // Get alert count from compliance gaps + expiring certs
  const { data: gaps } = useQuery({
    queryKey: ['compliance', 'gaps', 'high'],
    queryFn: () => api.compliance.gaps('high', 'open'),
    refetchInterval: 60000,
  })

  const alertCount = gaps?.total ?? 0

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-sm text-gray-400">
        Industrial Knowledge Intelligence Platform
      </h1>
      <div className="flex items-center gap-4">
        {/* Alert bell */}
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>
        {/* User avatar */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">Admin</span>
        </div>
      </div>
    </header>
  )
}
