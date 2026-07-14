// admin/src/app/analytics/page.tsx
'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { Card, PageHeader, LoadingSpinner } from '@/components'
import { formatCurrency, formatNumber, agentNames } from '@/lib/utils'

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7']

export default function AnalyticsPage() {
  // ROI calculator state
  const [roi, setRoi] = useState({ team_size: 10, avg_salary: 95000, downtime_incidents: 5 })

  const { data: trends } = useQuery({
    queryKey: ['analytics', 'trends'],
    queryFn: () => api.analytics.trends(),
  })

  const { data: agents } = useQuery({
    queryKey: ['analytics', 'agents'],
    queryFn: api.analytics.agentPerformance,
  })

  const { data: topEquip } = useQuery({
    queryKey: ['analytics', 'top-equipment', 10],
    queryFn: () => api.analytics.topEquipment(10),
  })

  const { data: roiData, isLoading: roiLoading, refetch: calcRoi } = useQuery({
    queryKey: ['analytics', 'roi', roi],
    queryFn: () => api.analytics.roi(roi),
    enabled: false,  // Only fetch when user clicks Calculate
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics & ROI" subtitle="System performance and business impact metrics" />

      {/* ROI Calculator */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-300 mb-4">ROI Calculator</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Team Size</label>
            <input
              type="number"
              value={roi.team_size}
              onChange={(e) => setRoi(r => ({ ...r, team_size: Number(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Average Salary (USD/yr)</label>
            <input
              type="number"
              value={roi.avg_salary}
              onChange={(e) => setRoi(r => ({ ...r, avg_salary: Number(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Downtime Incidents / Year</label>
            <input
              type="number"
              value={roi.downtime_incidents}
              onChange={(e) => setRoi(r => ({ ...r, downtime_incidents: Number(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => calcRoi()}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white font-medium transition-colors"
            >
              {roiLoading ? 'Calculating...' : 'Calculate ROI →'}
            </button>
          </div>
        </div>

        {/* ROI Results */}
        {roiData && (
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-800">
            {[
              { label: 'Annual Savings', value: formatCurrency(roiData.annual_savings) },
              { label: 'Hours Saved / Year', value: `${formatNumber(roiData.time_saved_hours)} hrs` },
              { label: 'ROI', value: `${roiData.roi_percentage.toFixed(0)}%` },
              { label: 'Break Even', value: `${roiData.break_even_months.toFixed(1)} months` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-green-400/5 border border-green-400/10 rounded-lg p-4">
                <p className="text-xs text-green-400 mb-1">{label}</p>
                <p className="text-xl font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Query Trends */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-300 mb-4">
            Query Trends
            {trends && <span className="text-gray-500 font-normal ml-2">({trends.total_queries} total)</span>}
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trends?.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }}
              />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Equipment Bar Chart */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Top Queried Equipment</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={topEquip?.equipment ?? []}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis dataKey="equipment_tag" type="category" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }}
              />
              <Bar dataKey="query_count" radius={[0, 4, 4, 0]}>
                {(topEquip?.equipment ?? []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Agent Performance Table */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Agent Performance Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {['Agent', 'Accuracy', 'Avg Response Time', 'Total Queries', 'Performance'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {(agents?.agents ?? []).map((agent) => (
                <tr key={agent.agent_type} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {agentNames[agent.agent_type] ?? agent.agent_type}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-green-400">
                    {agent.accuracy}%
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{agent.avg_response_time}s</td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {formatNumber(agent.total_queries)}
                  </td>
                  <td className="px-4 py-3 w-40">
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${agent.accuracy}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
