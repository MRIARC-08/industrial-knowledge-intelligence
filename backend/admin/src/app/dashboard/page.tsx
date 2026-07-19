// admin/src/app/dashboard/page.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  DollarSign, Clock, Target, Users,
  AlertTriangle, TrendingUp
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts'
import { StatCard, Card, SkeletonCard, PageHeader } from '@/components'
import { formatCurrency, formatNumber, formatRelativeTime, formatDate, daysUntil } from '@/lib/utils'
import { agentNames } from '@/lib/utils'

export default function DashboardPage() {
  // Fetch all dashboard data in parallel
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['analytics', 'kpis'],
    queryFn: api.analytics.kpis,
    refetchInterval: 30000,
  })

  const { data: trends } = useQuery({
    queryKey: ['analytics', 'trends'],
    queryFn: () => api.analytics.trends(),
    refetchInterval: 60000,
  })

  const { data: agents } = useQuery({
    queryKey: ['analytics', 'agents'],
    queryFn: api.analytics.agentPerformance,
    refetchInterval: 60000,
  })

  const { data: activity } = useQuery({
    queryKey: ['analytics', 'activity'],
    queryFn: api.analytics.activityFeed,
    refetchInterval: 15000,  // Refresh every 15s for live feed
  })

  const { data: topEquip } = useQuery({
    queryKey: ['analytics', 'top-equipment'],
    queryFn: () => api.analytics.topEquipment(5),
    refetchInterval: 60000,
  })

  const { data: gaps } = useQuery({
    queryKey: ['compliance', 'gaps'],
    queryFn: () => api.compliance.gaps(),
    refetchInterval: 60000,
  })

  const { data: certs } = useQuery({
    queryKey: ['compliance', 'certs'],
    queryFn: api.compliance.certificates,
    refetchInterval: 60000,
  })

  // Build alert list from compliance data
  const alerts = [
    ...(certs?.certificates
      .filter(c => c.status !== 'valid')
      .map(c => ({
        severity: c.status === 'expired' ? 'high' : 'medium',
        message: `${c.name} — ${c.equipment} — ${
          c.status === 'expired' ? 'EXPIRED' : `expires in ${daysUntil(c.expiry)} days`
        }`,
      })) ?? []),
    ...(gaps?.gaps
      .filter(g => g.status === 'open' && g.severity === 'high')
      .map(g => ({
        severity: 'high',
        message: `${g.regulation}: ${g.description}`,
      })) ?? []),
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Plant-wide knowledge intelligence overview"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              label="Annual Savings"
              value={formatCurrency(kpis?.annual_savings ?? 0)}
              icon={<DollarSign className="w-5 h-5" />}
              trend="up"
              trendLabel="12% vs last month"
            />
            <StatCard
              label="Time Reduction"
              value={`${kpis?.time_reduction ?? 0}%`}
              icon={<Clock className="w-5 h-5" />}
              trend="up"
              trendLabel="5% improvement"
            />
            <StatCard
              label="System Accuracy"
              value={`${kpis?.system_accuracy ?? 0}%`}
              icon={<Target className="w-5 h-5" />}
              trend="up"
              trendLabel="2.1% this week"
            />
            <StatCard
              label="Active Users"
              value={formatNumber(kpis?.active_users ?? 0)}
              icon={<Users className="w-5 h-5" />}
              trend="up"
              trendLabel="8 new this week"
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Query Trends */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300">
              Query Trends (7 days)
            </h2>
            {trends && (
              <span className="text-xs text-gray-500">
                {formatNumber(trends.total_queries)} total
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trends?.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
              />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }}
                labelStyle={{ color: '#9ca3af' }}
                itemStyle={{ color: '#60a5fa' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Agent Performance */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-300 mb-4">
            Agent Performance
          </h2>
          <div className="space-y-3">
            {(agents?.agents ?? []).map((agent) => (
              <div key={agent.agent_type} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-32 shrink-0">
                  {agentNames[agent.agent_type] ?? agent.agent_type}
                </span>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${agent.accuracy}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-300 w-12 text-right">
                  {agent.accuracy}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-2 gap-2">
            {(agents?.agents ?? []).map((agent) => (
              <div key={agent.agent_type} className="flex justify-between text-xs">
                <span className="text-gray-500">{agent.total_queries} queries</span>
                <span className="text-gray-400">{agent.avg_response_time}s avg</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Activity Feed */}
        <Card className="col-span-1">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">
            Live Activity
          </h2>
          <div className="space-y-3">
            {(activity?.events ?? []).slice(0, 6).map((event) => (
              <div key={event.id} className="flex gap-3 text-xs">
                <span className="text-gray-600 shrink-0 mt-0.5">
                  {formatRelativeTime(event.timestamp)}
                </span>
                <div>
                  <span className="text-gray-400">{event.user}</span>
                  <span className="text-gray-600"> · </span>
                  <span className="text-gray-300">{event.details}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Equipment */}
        <Card className="col-span-1">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">
            Most Queried Equipment
          </h2>
          <div className="space-y-3">
            {(topEquip?.equipment ?? []).map((item, i) => (
              <div key={item.equipment_tag} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-300">
                      {item.equipment_tag}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.query_count}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500/60 rounded-full"
                      style={{
                        width: `${(item.query_count / (topEquip?.equipment[0]?.query_count ?? 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts */}
        <Card className="col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300">
              Active Alerts
            </h2>
            {alerts.length > 0 && (
              <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-full border border-red-500/20">
                {alerts.length}
              </span>
            )}
          </div>
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">
                No active alerts ✓
              </p>
            ) : (
              alerts.slice(0, 4).map((alert, i) => (
                <div
                  key={i}
                  className={`flex gap-2 p-2 rounded-lg border text-xs ${
                    alert.severity === 'high'
                      ? 'bg-red-400/5 border-red-400/10'
                      : 'bg-yellow-400/5 border-yellow-400/10'
                  }`}
                >
                  <AlertTriangle className={`w-3 h-3 shrink-0 mt-0.5 ${
                    alert.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                  }`} />
                  <span className="text-gray-300 leading-relaxed">
                    {alert.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
