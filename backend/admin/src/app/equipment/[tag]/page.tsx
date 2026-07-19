// admin/src/app/equipment/[tag]/page.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { ArrowLeft, MessageSquare, FileText, AlertTriangle } from 'lucide-react'
import { Card, PageHeader, LoadingSpinner, ErrorState, Badge } from '@/components'
import { formatDate, statusDots, statusColors, cn } from '@/lib/utils'

interface Props {
  params: { tag: string }
}

export default function EquipmentDetailPage({ params }: Props) {
  const router = useRouter()
  const tag = decodeURIComponent(params.tag)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['equipment', 'history', tag],
    queryFn: () => api.equipment.history(tag),
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorState message={`Equipment ${tag} not found`} onRetry={refetch} />
  if (!data) return null

  const { equipment: eq, failures, documents } = data

  return (
    <div className="space-y-6">
      {/* Back button + header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Equipment Registry
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white font-mono">{eq.tag}</h1>
              <div className="flex items-center gap-1.5">
                <div className={cn('w-2 h-2 rounded-full', statusDots[eq.status])} />
                <span className={cn('text-sm capitalize', statusColors[eq.status])}>
                  {eq.status}
                </span>
              </div>
            </div>
            <p className="text-gray-400 mt-1">{eq.name} · {eq.type}</p>
          </div>
          <Link
            href={`/query?equipment=${tag}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Ask AI about {tag}
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Failures', value: eq.failures, highlight: eq.failures > 3 },
          { label: 'Max Temperature', value: `${eq.max_temp}°C`, highlight: false },
          { label: 'Max Pressure', value: `${eq.max_pressure} PSI`, highlight: false },
          { label: 'Max Flow Rate', value: `${eq.max_flow} m³/h`, highlight: false },
        ].map(({ label, value, highlight }) => (
          <Card key={label}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className={cn(
              'text-2xl font-bold mt-1',
              highlight ? 'text-red-400' : 'text-white'
            )}>
              {value}
            </p>
          </Card>
        ))}
      </div>

      {/* Failure History + Documents */}
      <div className="grid grid-cols-2 gap-4">
        {/* Failures */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Failure History ({failures.length})
          </h2>
          {failures.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No failures recorded</p>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-800" />
              <div className="space-y-4">
                {failures.map((f, i) => (
                  <div key={f.id} className="flex gap-4 pl-6 relative">
                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-gray-900 border-2 border-blue-500 z-10" />
                    <div className="flex-1 bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-400">
                          {formatDate(f.date)}
                        </span>
                        <span className="text-xs text-gray-500">#{failures.length - i}</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-1">
                        <span className="text-gray-300 font-medium">Symptoms: </span>
                        {f.symptoms}
                      </p>
                      <p className="text-xs text-gray-400 mb-1">
                        <span className="text-gray-300 font-medium">Root Cause: </span>
                        {f.root_cause}
                      </p>
                      <p className="text-xs text-gray-400">
                        <span className="text-gray-300 font-medium">Action: </span>
                        {f.action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Documents */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            Related Documents ({documents.length})
          </h2>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.doc_id}
                className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">{doc.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="info">{doc.doc_type.replace('_', ' ')}</Badge>
                    <span className="text-xs text-gray-500">{formatDate(doc.date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
