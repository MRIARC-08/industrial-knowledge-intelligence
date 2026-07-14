// admin/src/app/compliance/page.tsx
'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Shield, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { Card, PageHeader, LoadingSpinner, Badge } from '@/components'
import { formatDate, daysUntil, severityColors, certStatusColors } from '@/lib/utils'
import { GapSeverity, GapStatus, CertificateStatus } from '@iki/shared'

const certStatusVariant: Record<CertificateStatus, 'success' | 'warning' | 'danger'> = {
  valid: 'success',
  expiring_soon: 'warning',
  expired: 'danger',
}

export default function CompliancePage() {
  const [severityFilter, setSeverityFilter] = useState<GapSeverity | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<GapStatus | 'all'>('open')

  const { data: gapsData, isLoading: gapsLoading } = useQuery({
    queryKey: ['compliance', 'gaps', severityFilter, statusFilter],
    queryFn: () => api.compliance.gaps(
      severityFilter !== 'all' ? severityFilter : undefined,
      statusFilter !== 'all' ? statusFilter : undefined
    ),
    refetchInterval: 60000,
  })

  const { data: certsData, isLoading: certsLoading } = useQuery({
    queryKey: ['compliance', 'certificates'],
    queryFn: api.compliance.certificates,
    refetchInterval: 60000,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance & Certificates"
        subtitle="Regulatory gap detection and certificate tracking"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors">
            <Shield className="w-4 h-4" />
            Export Audit Report
          </button>
        }
      />

      {/* Severity Summary Cards */}
      {gapsData && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-gray-800">
            <p className="text-xs text-gray-400">Total Gaps</p>
            <p className="text-2xl font-bold text-white mt-1">{gapsData.total}</p>
          </Card>
          <Card className="border-red-400/20 bg-red-400/5">
            <p className="text-xs text-red-400">High Severity</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{gapsData.by_severity.high}</p>
          </Card>
          <Card className="border-yellow-400/20 bg-yellow-400/5">
            <p className="text-xs text-yellow-400">Medium Severity</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{gapsData.by_severity.medium}</p>
          </Card>
          <Card className="border-green-400/20 bg-green-400/5">
            <p className="text-xs text-green-400">Low Severity</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{gapsData.by_severity.low}</p>
          </Card>
        </div>
      )}

      {/* Gaps Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-300">Compliance Gaps</h2>
          <div className="flex gap-2">
            {/* Severity filter */}
            {(['all', 'high', 'medium', 'low'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors capitalize ${
                  severityFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
            <div className="w-px bg-gray-700 mx-1" />
            {/* Status filter */}
            {(['all', 'open', 'resolved'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors capitalize ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {gapsLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-3">
            {(gapsData?.gaps ?? []).map((gap) => (
              <div
                key={gap.id}
                className={`p-4 rounded-lg border ${severityColors[gap.severity]}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-200">
                          {gap.regulation}
                        </span>
                        <span className="text-xs text-gray-500">·</span>
                        <span className="text-xs text-gray-400">{gap.clause}</span>
                      </div>
                      <p className="text-sm text-gray-300">{gap.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Equipment: {gap.equipment}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Badge variant={gap.severity === 'high' ? 'danger' : gap.severity === 'medium' ? 'warning' : 'success'}>
                      {gap.severity}
                    </Badge>
                    <Badge variant={gap.status === 'open' ? 'danger' : 'success'}>
                      {gap.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            {(gapsData?.gaps ?? []).length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                No gaps matching current filters
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Certificates */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-300">
            Certificates
          </h2>
          {certsData?.expiring_soon && certsData.expiring_soon > 0 && (
            <Badge variant="warning">
              {certsData.expiring_soon} expiring soon
            </Badge>
          )}
        </div>
        {certsLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Certificate', 'Equipment', 'Standard', 'Expiry', 'Days Left', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {(certsData?.certificates ?? []).map((cert) => {
                  const days = daysUntil(cert.expiry)
                  return (
                    <tr key={cert.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-300">{cert.name}</td>
                      <td className="px-4 py-3 text-sm font-mono text-blue-400">{cert.equipment}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{cert.standard}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{formatDate(cert.expiry)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${
                          days < 0 ? 'text-red-400' :
                          days <= 30 ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={certStatusVariant[cert.status]}>
                          {cert.status.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
