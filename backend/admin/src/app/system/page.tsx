// admin/src/app/system/page.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Activity, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Card, PageHeader, LoadingSpinner } from '@/components'
import { serviceStatusColors, formatNumber, cn } from '@/lib/utils'
import { ServiceStatus, OverallStatus } from '@iki/shared'

const overallIcons: Record<OverallStatus, React.ReactNode> = {
  healthy: <CheckCircle className="w-5 h-5 text-green-400" />,
  degraded: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
  down: <XCircle className="w-5 h-5 text-red-400" />,
}

const overallBg: Record<OverallStatus, string> = {
  healthy: 'bg-green-400/5 border-green-400/20',
  degraded: 'bg-yellow-400/5 border-yellow-400/20',
  down: 'bg-red-400/5 border-red-400/20',
}

export default function SystemPage() {
  const { data, isLoading, dataUpdatedAt, refetch, isFetching } = useQuery({
    queryKey: ['system', 'health'],
    queryFn: api.system.health,
    refetchInterval: 30000,
  })

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : 'Never'

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Health"
        subtitle="Real-time service monitoring"
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Last updated: {lastUpdated}</span>
            <button
              onClick={() => refetch()}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors',
                isFetching && 'opacity-50'
              )}
            >
              <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
              Refresh
            </button>
          </div>
        }
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : data ? (
        <>
          {/* Overall Status */}
          <Card className={cn('border', overallBg[data.overall_status])}>
            <div className="flex items-center gap-3">
              {overallIcons[data.overall_status]}
              <div>
                <p className="text-sm font-semibold text-white capitalize">
                  System {data.overall_status}
                </p>
                <p className="text-xs text-gray-400">
                  {data.services.filter(s => s.status === 'healthy').length} of {data.services.length} services operational
                  · {new Date(data.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Services Grid */}
          <div className="grid grid-cols-3 gap-4">
            {data.services.map((svc) => (
              <Card key={svc.name}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-300">{svc.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{svc.details}</p>
                  </div>
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-1',
                    svc.status === 'healthy' ? 'bg-green-400' :
                    svc.status === 'degraded' ? 'bg-yellow-400 animate-pulse' :
                    'bg-red-500 animate-pulse'
                  )} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Response Time</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          svc.response_time < 10 ? 'bg-green-500' :
                          svc.response_time < 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        )}
                        style={{ width: `${Math.min((svc.response_time / 200) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-14 text-right">
                      {svc.response_time.toFixed(1)}ms
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Metrics */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-300 mb-4">System Metrics</h2>
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: 'Queries / min', value: data.metrics.queries_per_min.toFixed(1) },
                { label: 'Cache Hit Rate', value: `${data.metrics.cache_hit_rate}%` },
                { label: 'Error Rate', value: `${data.metrics.error_rate}%` },
                { label: 'Avg Response', value: `${data.metrics.avg_response.toFixed(0)}ms` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-xl font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-6">
              {[
                { label: 'Documents Indexed', value: formatNumber(data.metrics.documents) },
                { label: 'Graph Nodes', value: formatNumber(data.metrics.graph_nodes) },
                { label: 'Vector Embeddings', value: formatNumber(data.metrics.vector_embeddings) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-xl font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  )
}
