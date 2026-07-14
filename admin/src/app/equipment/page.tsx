// admin/src/app/equipment/page.tsx
'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Search, ChevronRight } from 'lucide-react'
import { Card, PageHeader, LoadingSpinner, ErrorState, Badge } from '@/components'
import {
  statusColors, statusDots, formatDate, cn
} from '@/lib/utils'
import { EquipmentStatus } from '../../../shared/types'

const statusVariantMap: Record<EquipmentStatus, 'success' | 'warning' | 'danger'> = {
  operational: 'success',
  warning: 'warning',
  critical: 'danger',
}

export default function EquipmentPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'all'>('all')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['equipment', 'list'],
    queryFn: api.equipment.list,
    refetchInterval: 30000,
  })

  const filtered = (data?.equipment ?? []).filter((eq) => {
    const matchSearch =
      eq.tag.toLowerCase().includes(search.toLowerCase()) ||
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      eq.type.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || eq.status === statusFilter
    return matchSearch && matchStatus
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorState message="Failed to load equipment" onRetry={refetch} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipment Registry"
        subtitle={`${data?.total ?? 0} assets tracked in knowledge graph`}
      />

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search tag, name or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {(['all', 'operational', 'warning', 'critical'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'px-3 py-2 rounded-lg text-xs font-medium transition-colors capitalize',
              statusFilter === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-gray-200'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Equipment Table */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {['Tag', 'Name', 'Type', 'Status', 'Failures', 'Last Failure', 'Max Temp', 'Max Pressure', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map((eq) => (
                <tr
                  key={eq.tag}
                  onClick={() => router.push(`/equipment/${eq.tag}`)}
                  className="hover:bg-gray-800/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-medium text-blue-400">
                      {eq.tag}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{eq.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{eq.type}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', statusDots[eq.status])} />
                      <Badge variant={statusVariantMap[eq.status]}>
                        {eq.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'text-sm font-medium',
                      eq.failures > 3 ? 'text-red-400' :
                      eq.failures > 1 ? 'text-yellow-400' :
                      'text-gray-300'
                    )}>
                      {eq.failures}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {eq.last_failure ? formatDate(eq.last_failure) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {eq.max_temp}°C
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {eq.max_pressure} PSI
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">
              No equipment matching your filters
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
