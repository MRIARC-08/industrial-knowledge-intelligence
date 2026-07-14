# Industrial Knowledge Intelligence — Complete Implementation Guide

## For AI-Assisted One-Day Build

---

## Pre-Build Setup (Do This First — 30 minutes)

```
BEFORE YOU START CODING ANYTHING:

1. Create project structure
2. Set up all environment variables
3. Verify backend is running and endpoints work
4. Test every endpoint with curl
5. Have sample industrial documents ready for demo

FOLDER STRUCTURE TO CREATE:
ikip/
├── admin/          ← Next.js admin app
├── mobile/         ← React Native app
├── shared/         ← Shared types and API client
└── README.md
```

---

## Environment Variables — Set These Up First

```bash
# admin/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_KEY=your-secret-key-here

# mobile/.env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_API_KEY=your-secret-key-here
```

---

# PHASE 1: Shared Foundation
## Estimated Time: 45 minutes
## What This Does: Creates the API client and TypeScript types used by BOTH apps

---

### Step 1.1 — Create Shared Types File

```
FILE: shared/types.ts
PURPOSE: TypeScript interfaces matching every API response exactly
WHY FIRST: Both apps depend on these — build once, use everywhere
```

```typescript
// shared/types.ts
// Every type maps exactly to the API documentation

// ─── REQUEST TYPES ────────────────────────────────────────────────

export interface QueryRequest {
  query: string                    // 3-500 characters, required
  user_id: string                  // max 100 chars, required
  user_role?: 'engineer' | 'technician' | 'manager'  // default: engineer
  equipment_context?: string       // equipment tag like "P-101A"
}

export interface ROIParams {
  team_size: number                // > 0, required
  avg_salary: number               // > 0, required
  downtime_incidents: number       // >= 0, required
}

// ─── RESPONSE TYPES ───────────────────────────────────────────────

export interface QuerySource {
  doc_id: string
  chunk_text: string               // first 200 chars of relevant text
  score: number                    // relevance score 0-1
  equipment_tags: string[]
}

export interface QueryResponse {
  answer: string
  confidence: number               // 0.0 to 1.0
  sources: QuerySource[]
  response_time_ms: number
}

export interface TranscribeResponse {
  text: string
}

// Analytics
export interface KPIsResponse {
  annual_savings: number
  time_reduction: number
  system_accuracy: number
  active_users: number
}

export interface TrendDataPoint {
  date: string                     // ISO 8601
  count: number
}

export interface QueryTrendsResponse {
  data: TrendDataPoint[]
  total_queries: number
}

export interface AgentMetric {
  agent_type: 'copilot' | 'maintenance_rca' | 'compliance' | 'lessons_learned'
  accuracy: number
  avg_response_time: number
  total_queries: number
}

export interface AgentPerformanceResponse {
  agents: AgentMetric[]
}

export interface ActivityEvent {
  id: string
  timestamp: string
  user: string
  action: string
  details: string
}

export interface ActivityFeedResponse {
  events: ActivityEvent[]
}

export interface ROIResponse {
  annual_savings: number
  time_saved_hours: number
  cost_per_query: number
  roi_percentage: number
  break_even_months: number
  team_size: number
  avg_salary: number
  downtime_incidents: number
}

export interface TopEquipmentItem {
  equipment_tag: string
  equipment_name: string
  query_count: number
}

export interface TopEquipmentResponse {
  equipment: TopEquipmentItem[]
}

// Equipment
export type EquipmentStatus = 'operational' | 'warning' | 'critical'

export interface Equipment {
  tag: string
  name: string
  type: string
  status: EquipmentStatus
  failures: number
  last_failure: string | null
  max_temp: number
  max_pressure: number
  max_flow: number
}

export interface EquipmentListResponse {
  equipment: Equipment[]
  total: number
}

export interface FailureRecord {
  id: string
  date: string
  symptoms: string
  root_cause: string
  action: string
}

export interface EquipmentDocument {
  doc_id: string
  title: string
  doc_type: string
  date: string
}

export interface EquipmentHistoryResponse {
  equipment: Equipment
  failures: FailureRecord[]
  documents: EquipmentDocument[]
}

// Compliance
export type GapSeverity = 'high' | 'medium' | 'low'
export type GapStatus = 'open' | 'resolved'

export interface ComplianceGap {
  id: string
  severity: GapSeverity
  regulation: string
  clause: string
  description: string
  equipment: string
  status: GapStatus
}

export interface GapsBySeverity {
  high: number
  medium: number
  low: number
}

export interface ComplianceGapsResponse {
  gaps: ComplianceGap[]
  total: number
  by_severity: GapsBySeverity
}

export type CertificateStatus = 'valid' | 'expiring_soon' | 'expired'

export interface Certificate {
  id: string
  name: string
  equipment: string
  standard: string
  expiry: string
  status: CertificateStatus
}

export interface CertificatesResponse {
  certificates: Certificate[]
  total: number
  expiring_soon: number
}

// Documents
export type DocumentStatus = 'processing' | 'completed' | 'failed'

export interface DocumentRecord {
  id: string
  name: string
  type: string
  upload_date: string
  status: DocumentStatus
}

export interface DocumentsListResponse {
  documents: DocumentRecord[]
  total: number
}

export interface DocumentUploadResponse {
  id: string
  name: string
  status: DocumentStatus
  message: string
}

// System Health
export type ServiceStatus = 'healthy' | 'degraded' | 'down'
export type OverallStatus = 'healthy' | 'degraded' | 'down'

export interface ServiceHealth {
  name: string
  status: ServiceStatus
  response_time: number
  details: string
}

export interface SystemMetrics {
  queries_per_min: number
  avg_response: number
  cache_hit_rate: number
  error_rate: number
  documents: number
  graph_nodes: number
  vector_embeddings: number
}

export interface SystemHealthResponse {
  overall_status: OverallStatus
  services: ServiceHealth[]
  metrics: SystemMetrics
  timestamp: string
}
```

---

### Step 1.2 — Create Shared API Client

```
FILE: shared/api.ts
PURPOSE: All API calls in one place, typed, with error handling
WHY: Import this in both admin and mobile — no duplication
```

```typescript
// shared/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios'
import {
  QueryRequest, QueryResponse, TranscribeResponse,
  KPIsResponse, QueryTrendsResponse, AgentPerformanceResponse,
  ActivityFeedResponse, ROIResponse, ROIParams, TopEquipmentResponse,
  EquipmentListResponse, EquipmentHistoryResponse,
  ComplianceGapsResponse, GapSeverity, GapStatus, CertificatesResponse,
  DocumentsListResponse, DocumentUploadResponse,
  SystemHealthResponse
} from './types'

// ─── API CLIENT FACTORY ───────────────────────────────────────────
// Call this once in each app with the correct base URL and key

export function createApiClient(baseURL: string, apiKey: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 30000,              // 30 second timeout for LLM calls
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    }
  })

  // Request interceptor — log every request in dev
  client.interceptors.request.use(
    (config) => {
      if (__DEV__ || process.env.NODE_ENV === 'development') {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor — normalize errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status = error.response?.status
      const detail = (error.response?.data as any)?.detail

      if (status === 401) throw new Error('Invalid API key')
      if (status === 429) throw new Error('Rate limit exceeded — please wait')
      if (status === 422) throw new Error(`Validation error: ${detail}`)
      if (status === 404) throw new Error('Resource not found')
      if (status === 500) throw new Error('Server error — try again')

      throw new Error(detail || error.message || 'Unknown error')
    }
  )

  return client
}

// ─── API FUNCTIONS ────────────────────────────────────────────────
// Each function is a clean async call returning typed data

export function buildApi(client: AxiosInstance) {
  return {

    // ── Query ──────────────────────────────────────────────────
    query: async (body: QueryRequest): Promise<QueryResponse> => {
      const { data } = await client.post<QueryResponse>('/api/v1/query', body)
      return data
    },

    transcribe: async (audioFile: File | Blob): Promise<TranscribeResponse> => {
      const form = new FormData()
      form.append('file', audioFile)
      const { data } = await client.post<TranscribeResponse>(
        '/api/v1/transcribe',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      return data
    },

    // ── Analytics ──────────────────────────────────────────────
    analytics: {
      kpis: async (): Promise<KPIsResponse> => {
        const { data } = await client.get<KPIsResponse>('/api/v1/analytics/kpis')
        return data
      },

      trends: async (startDate?: string, endDate?: string): Promise<QueryTrendsResponse> => {
        const { data } = await client.get<QueryTrendsResponse>(
          '/api/v1/analytics/query-trends',
          { params: { start_date: startDate, end_date: endDate } }
        )
        return data
      },

      agentPerformance: async (): Promise<AgentPerformanceResponse> => {
        const { data } = await client.get<AgentPerformanceResponse>(
          '/api/v1/analytics/agent-performance'
        )
        return data
      },

      activityFeed: async (): Promise<ActivityFeedResponse> => {
        const { data } = await client.get<ActivityFeedResponse>(
          '/api/v1/analytics/activity-feed'
        )
        return data
      },

      roi: async (params: ROIParams): Promise<ROIResponse> => {
        const { data } = await client.get<ROIResponse>(
          '/api/v1/analytics/roi',
          { params }
        )
        return data
      },

      topEquipment: async (limit = 10): Promise<TopEquipmentResponse> => {
        const { data } = await client.get<TopEquipmentResponse>(
          '/api/v1/analytics/top-equipment',
          { params: { limit } }
        )
        return data
      },
    },

    // ── Equipment ──────────────────────────────────────────────
    equipment: {
      list: async (): Promise<EquipmentListResponse> => {
        const { data } = await client.get<EquipmentListResponse>(
          '/api/v1/equipment/list'
        )
        return data
      },

      history: async (tag: string): Promise<EquipmentHistoryResponse> => {
        const { data } = await client.get<EquipmentHistoryResponse>(
          `/api/v1/equipment/${encodeURIComponent(tag)}/history`
        )
        return data
      },
    },

    // ── Compliance ─────────────────────────────────────────────
    compliance: {
      gaps: async (
        severity?: GapSeverity,
        status?: GapStatus
      ): Promise<ComplianceGapsResponse> => {
        const { data } = await client.get<ComplianceGapsResponse>(
          '/api/v1/compliance/gaps',
          { params: { severity, status } }
        )
        return data
      },

      certificates: async (): Promise<CertificatesResponse> => {
        const { data } = await client.get<CertificatesResponse>(
          '/api/v1/compliance/certificates'
        )
        return data
      },
    },

    // ── Documents ──────────────────────────────────────────────
    documents: {
      list: async (): Promise<DocumentsListResponse> => {
        const { data } = await client.get<DocumentsListResponse>(
          '/api/v1/documents/list'
        )
        return data
      },

      upload: async (file: File): Promise<DocumentUploadResponse> => {
        const form = new FormData()
        form.append('file', file)
        const { data } = await client.post<DocumentUploadResponse>(
          '/api/v1/documents/upload',
          form,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        return data
      },
    },

    // ── System ─────────────────────────────────────────────────
    system: {
      health: async (): Promise<SystemHealthResponse> => {
        const { data } = await client.get<SystemHealthResponse>(
          '/api/v1/system/health'
        )
        return data
      },
    },
  }
}

// Type export for the API object
export type Api = ReturnType<typeof buildApi>
```

---

# PHASE 2: Admin Web App (Next.js)
## Estimated Time: 4 hours
## Build Order: Layout → Dashboard → Equipment → Compliance → Documents → Analytics → Query → System

---

### Step 2.1 — Project Initialization

```bash
# Run these commands exactly

npx create-next-app@latest admin \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd admin

# Install all dependencies at once
npm install \
  axios \
  @tanstack/react-query \
  @tanstack/react-query-devtools \
  zustand \
  recharts \
  lucide-react \
  date-fns \
  react-dropzone \
  clsx \
  tailwind-merge \
  @radix-ui/react-dialog \
  @radix-ui/react-select \
  @radix-ui/react-tabs \
  @radix-ui/react-progress \
  @radix-ui/react-badge
```

---

### Step 2.2 — API Context Setup

```
FILE: admin/src/lib/api.ts
PURPOSE: Initialize API client for the admin app
```

```typescript
// admin/src/lib/api.ts
import { createApiClient, buildApi } from '../../shared/api'

const client = createApiClient(
  process.env.NEXT_PUBLIC_API_URL!,
  process.env.NEXT_PUBLIC_API_KEY!
)

export const api = buildApi(client)
export type { Api } from '../../shared/api'
```

```typescript
// admin/src/lib/queryClient.ts
// React Query client configuration
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // Data fresh for 1 minute
      retry: 2,                     // Retry failed requests twice
      refetchOnWindowFocus: false,  // Don't refetch on tab focus
    },
  },
})
```

```typescript
// admin/src/lib/utils.ts
// Utility functions used across all components

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { EquipmentStatus, GapSeverity, CertificateStatus, ServiceStatus } from '../../shared/types'

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Format large numbers
export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toString()
}

// Format date strings
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format relative time
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

// Days until expiry
export function daysUntil(dateStr: string): number {
  const date = new Date(dateStr)
  const now = new Date()
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

// Status color mappings
export const statusColors: Record<EquipmentStatus, string> = {
  operational: 'text-green-400 bg-green-400/10',
  warning: 'text-yellow-400 bg-yellow-400/10',
  critical: 'text-red-400 bg-red-400/10',
}

export const statusDots: Record<EquipmentStatus, string> = {
  operational: 'bg-green-400',
  warning: 'bg-yellow-400',
  critical: 'bg-red-500 animate-pulse',
}

export const severityColors: Record<GapSeverity, string> = {
  high: 'text-red-400 bg-red-400/10 border-red-400/20',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  low: 'text-green-400 bg-green-400/10 border-green-400/20',
}

export const certStatusColors: Record<CertificateStatus, string> = {
  valid: 'text-green-400 bg-green-400/10',
  expiring_soon: 'text-yellow-400 bg-yellow-400/10',
  expired: 'text-red-400 bg-red-400/10',
}

export const serviceStatusColors: Record<ServiceStatus, string> = {
  healthy: 'text-green-400',
  degraded: 'text-yellow-400',
  down: 'text-red-400',
}

// Confidence level label
export function confidenceLabel(score: number): { label: string; color: string } {
  if (score >= 0.85) return { label: 'HIGH', color: 'text-green-400' }
  if (score >= 0.60) return { label: 'MEDIUM', color: 'text-yellow-400' }
  return { label: 'LOW', color: 'text-red-400' }
}

// Agent display names
export const agentNames: Record<string, string> = {
  copilot: 'Expert Copilot',
  maintenance_rca: 'Maintenance & RCA',
  compliance: 'Compliance',
  lessons_learned: 'Lessons Learned',
}
```

---

### Step 2.3 — Root Layout with Sidebar

```
FILE: admin/src/app/layout.tsx
PURPOSE: Root layout — wraps every page with sidebar + providers
```

```typescript
// admin/src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Industrial Knowledge Intelligence — Admin',
  description: 'Plant Operations Brain — Admin Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100 antialiased`}>
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
```

```typescript
// admin/src/components/Providers.tsx
'use client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

```typescript
// admin/src/components/layout/Sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Wrench, Shield, FileText,
  BarChart3, MessageSquare, Activity, Factory
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/equipment',  label: 'Equipment',   icon: Wrench },
  { href: '/compliance', label: 'Compliance',  icon: Shield },
  { href: '/documents',  label: 'Documents',   icon: FileText },
  { href: '/analytics',  label: 'Analytics',   icon: BarChart3 },
  { href: '/query',      label: 'Query',       icon: MessageSquare },
  { href: '/system',     label: 'System',      icon: Activity },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <Factory className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">KnowledgeAI</p>
            <p className="text-xs text-gray-500 mt-0.5">Industrial Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-600 text-center">v0.1.0 — Admin Panel</p>
      </div>
    </aside>
  )
}
```

```typescript
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
```

---

### Step 2.4 — Reusable UI Components

```
FILE: admin/src/components/ui/*.tsx
PURPOSE: Building blocks used on every page
BUILD THESE BEFORE ANY PAGE COMPONENT
```

```typescript
// admin/src/components/ui/Card.tsx
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-8' }
  return (
    <div className={cn(
      'bg-gray-900 border border-gray-800 rounded-xl',
      paddings[padding],
      className
    )}>
      {children}
    </div>
  )
}

// Stat card used on dashboard
interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
}

export function StatCard({ label, value, sub, icon, trend, trendLabel }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
          {trendLabel && (
            <p className={cn(
              'text-xs font-medium mt-2',
              trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
            )}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendLabel}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2.5 bg-blue-600/10 rounded-lg text-blue-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
```

```typescript
// admin/src/components/ui/Badge.tsx
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

const variantStyles = {
  default: 'bg-gray-700 text-gray-300',
  success: 'bg-green-400/10 text-green-400 border border-green-400/20',
  warning: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20',
  danger: 'bg-red-400/10 text-red-400 border border-red-400/20',
  info: 'bg-blue-400/10 text-blue-400 border border-blue-400/20',
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      variantStyles[variant]
    )}>
      {children}
    </span>
  )
}
```

```typescript
// admin/src/components/ui/LoadingSpinner.tsx
import { cn } from '@/lib/utils'

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// Skeleton loader for cards
export function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-1/3 mb-3" />
      <div className="h-8 bg-gray-700 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-800 rounded w-1/4" />
    </div>
  )
}
```

```typescript
// admin/src/components/ui/ErrorState.tsx
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  message = 'Something went wrong',
  onRetry
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
      <p className="text-gray-400 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  )
}
```

```typescript
// admin/src/components/ui/PageHeader.tsx
interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-gray-400 mt-1 text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
```

---

### Step 2.5 — Dashboard Page

```
FILE: admin/src/app/dashboard/page.tsx
ENDPOINTS: kpis, query-trends, agent-performance, activity-feed, top-equipment, compliance/gaps, compliance/certificates
```

```typescript
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
```

---

### Step 2.6 — Equipment Pages

```typescript
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
```

```typescript
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
```

---

### Step 2.7 — Compliance Page

```typescript
// admin/src/app/compliance/page.tsx
'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Shield, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { Card, PageHeader, LoadingSpinner, Badge } from '@/components'
import { formatDate, daysUntil, severityColors, certStatusColors } from '@/lib/utils'
import { GapSeverity, GapStatus, CertificateStatus } from '../../../shared/types'

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
```

---

### Step 2.8 — Documents Page

```typescript
// admin/src/app/documents/page.tsx
'use client'
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import { api } from '@/lib/api'
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Card, PageHeader, LoadingSpinner, Badge } from '@/components'
import { formatDate, cn } from '@/lib/utils'
import { DocumentStatus } from '../../../shared/types'

const statusConfig: Record<DocumentStatus, {
  icon: React.ReactNode
  variant: 'success' | 'warning' | 'danger' | 'info'
  label: string
}> = {
  completed: {
    icon: <CheckCircle className="w-4 h-4 text-green-400" />,
    variant: 'success',
    label: 'Indexed'
  },
  processing: {
    icon: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
    variant: 'info',
    label: 'Processing'
  },
  failed: {
    icon: <XCircle className="w-4 h-4 text-red-400" />,
    variant: 'danger',
    label: 'Failed'
  },
}

export default function DocumentsPage() {
  const qc = useQueryClient()
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['documents', 'list'],
    queryFn: api.documents.list,
    refetchInterval: 10000,  // Poll for processing updates
  })

  const uploadMutation = useMutation({
    mutationFn: api.documents.upload,
    onSuccess: (result) => {
      setUploadProgress(`✅ ${result.name} uploaded — processing started`)
      qc.invalidateQueries({ queryKey: ['documents'] })
      setTimeout(() => setUploadProgress(null), 5000)
    },
    onError: (err: Error) => {
      setUploadProgress(`❌ Upload failed: ${err.message}`)
      setTimeout(() => setUploadProgress(null), 5000)
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    if (!file.name.endsWith('.pdf')) {
      setUploadProgress('❌ Only PDF files are supported')
      return
    }
    setUploadProgress(`⏳ Uploading ${file.name}...`)
    uploadMutation.mutate(file)
  }, [uploadMutation])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  // Separate processing docs for queue display
  const processing = (data?.documents ?? []).filter(d => d.status === 'processing')
  const rest = (data?.documents ?? []).filter(d => d.status !== 'processing')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Library"
        subtitle={`${data?.total ?? 0} documents indexed in knowledge base`}
      />

      {/* Upload Zone */}
      <Card>
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200',
            isDragActive
              ? 'border-blue-500 bg-blue-500/5'
              : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/30'
          )}
        >
          <input {...getInputProps()} />
          <Upload className={cn(
            'w-10 h-10 mx-auto mb-3',
            isDragActive ? 'text-blue-400' : 'text-gray-600'
          )} />
          <p className="text-gray-300 font-medium mb-1">
            {isDragActive ? 'Drop PDF here' : 'Drag & drop PDF documents'}
          </p>
          <p className="text-gray-500 text-sm">or click to browse files</p>
          <p className="text-gray-600 text-xs mt-2">Supported: PDF only · Max 50MB</p>
        </div>

        {/* Upload status message */}
        {uploadProgress && (
          <div className="mt-3 p-3 bg-gray-800 rounded-lg text-sm text-gray-300">
            {uploadProgress}
          </div>
        )}
      </Card>

      {/* Processing Queue */}
      {processing.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-300 mb-3">
            Processing Queue ({processing.length})
          </h2>
          <div className="space-y-2">
            {processing.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 bg-blue-400/5 border border-blue-400/10 rounded-lg">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-300">{doc.name}</p>
                  <p className="text-xs text-gray-500">
                    Extracting text → NER → Chunking → Embedding → Graph update
                  </p>
                </div>
                <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Document List */}
      <Card padding="sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-300">All Documents</h2>
          <span className="text-xs text-gray-500">{data?.total ?? 0} total</span>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="divide-y divide-gray-800/50">
            {rest.map((doc) => {
              const config = statusConfig[doc.status]
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-gray-800/30 transition-colors"
                >
                  <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {doc.type} · Uploaded {formatDate(doc.upload_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {config.icon}
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                </div>
              )
            })}
            {rest.length === 0 && !isLoading && (
              <div className="text-center py-12 text-gray-500 text-sm">
                No documents yet — upload your first PDF above
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
```

---

### Step 2.9 — Analytics Page

```typescript
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
```

---

### Step 2.10 — Query Page

```typescript
// admin/src/app/query/page.tsx
'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Send, Bot, User, FileText, AlertCircle } from 'lucide-react'
import { Card, PageHeader } from '@/components'
import { confidenceLabel, cn } from '@/lib/utils'
import { QueryResponse } from '../../../shared/types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  response?: QueryResponse
  timestamp: Date
}

function QueryInterface() {
  const searchParams = useSearchParams()
  const defaultEquipment = searchParams.get('equipment') ?? ''

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [equipment, setEquipment] = useState(defaultEquipment)
  const [role, setRole] = useState<'engineer' | 'technician' | 'manager'>('engineer')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const queryMutation = useMutation({
    mutationFn: api.query,
    onSuccess: (data, variables) => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.answer,
          response: data,
          timestamp: new Date(),
        }
      ])
    },
    onError: (err: Error) => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Error: ${err.message}`,
          timestamp: new Date(),
        }
      ])
    },
  })

  const sendMessage = () => {
    const trimmed = input.trim()
    if (!trimmed || queryMutation.isPending) return

    // Add user message
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      }
    ])
    setInput('')

    // Send to API
    queryMutation.mutate({
      query: trimmed,
      user_id: 'admin_user',
      user_role: role,
      equipment_context: equipment || undefined,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <PageHeader
        title="Knowledge Query"
        subtitle="Ask anything about your plant — powered by AI agents"
      />

      {/* Context controls */}
      <div className="flex gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Equipment Context</label>
          <input
            type="text"
            placeholder="e.g. P-101A (optional)"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500 w-48"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="engineer">Engineer</option>
            <option value="technician">Technician</option>
            <option value="manager">Manager</option>
          </select>
        </div>
      </div>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col min-h-0" padding="sm">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <Bot className="w-12 h-12 text-blue-400 mb-4" />
              <p className="text-gray-300 font-medium mb-2">Industrial Knowledge Assistant</p>
              <p className="text-gray-500 text-sm max-w-sm">
                Ask about equipment history, maintenance procedures, compliance requirements, or operational guidance.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-6 max-w-md">
                {[
                  'What caused P-101A to fail last time?',
                  'Is V-301 compliant with OISD-118?',
                  'What are bearing replacement intervals?',
                  'Show compliance gaps for CDU unit',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div key={msg.id} className={cn(
              'flex gap-3',
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
              )}

              <div className={cn(
                'max-w-2xl rounded-xl',
                msg.role === 'user'
                  ? 'bg-blue-600 px-4 py-3'
                  : 'bg-gray-800/80 border border-gray-700/50 px-4 py-4'
              )}>
                <p className={cn(
                  'text-sm leading-relaxed whitespace-pre-wrap',
                  msg.role === 'user' ? 'text-white' : 'text-gray-300'
                )}>
                  {msg.content}
                </p>

                {/* Assistant metadata */}
                {msg.role === 'assistant' && msg.response && (
                  <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-3">
                    {/* Confidence */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden max-w-24">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${msg.response.confidence * 100}%` }}
                        />
                      </div>
                      <span className={cn(
                        'text-xs font-medium',
                        confidenceLabel(msg.response.confidence).color
                      )}>
                        {(msg.response.confidence * 100).toFixed(0)}% {confidenceLabel(msg.response.confidence).label}
                      </span>
                      <span className="text-xs text-gray-600 ml-2">
                        {msg.response.response_time_ms}ms
                      </span>
                    </div>

                    {/* Sources */}
                    {msg.response.sources.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Sources:</p>
                        <div className="space-y-1">
                          {msg.response.sources.slice(0, 3).map((src, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <FileText className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-blue-400">{src.doc_id}</span>
                                <span className="text-gray-500 ml-1">
                                  (score: {src.score.toFixed(2)})
                                </span>
                                {src.equipment_tags.length > 0 && (
                                  <span className="text-gray-600 ml-1">
                                    · {src.equipment_tags.join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {queryMutation.isPending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div className="bg-gray-800/80 border border-gray-700/50 rounded-xl px-4 py-3">
                <div className="flex gap-1 items-center h-5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about equipment, procedures, compliance, incidents... (Enter to send)"
              rows={2}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || queryMutation.isPending}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl text-white transition-colors self-end"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function QueryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QueryInterface />
    </Suspense>
  )
}
```

---

### Step 2.11 — System Health Page

```typescript
// admin/src/app/system/page.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Activity, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Card, PageHeader, LoadingSpinner } from '@/components'
import { serviceStatusColors, formatNumber, cn } from '@/lib/utils'
import { ServiceStatus, OverallStatus } from '../../../shared/types'

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
```

---

# PHASE 3: Mobile App (React Native + Expo)
## Estimated Time: 3 hours
## Build Order: Setup → Navigation → Home → Ask (Voice) → Equipment → Alerts

---

### Step 3.1 — Project Initialization

```bash
# Run from the root ikip/ directory

npx create-expo-app@latest mobile \
  --template blank-typescript

cd mobile

npm install \
  @react-navigation/native \
  @react-navigation/bottom-tabs \
  @react-navigation/stack \
  react-native-screens \
  react-native-safe-area-context \
  react-native-gesture-handler \
  @tanstack/react-query \
  axios \
  expo-av \
  expo-file-system \
  expo-document-picker \
  expo-haptics \
  @expo/vector-icons

npx expo install expo-dev-client
```

---

### Step 3.2 — Mobile API Client

```typescript
// mobile/src/lib/api.ts
import { createApiClient, buildApi } from '../../shared/api'

// React Native uses different env variable syntax
const client = createApiClient(
  process.env.EXPO_PUBLIC_API_URL!,
  process.env.EXPO_PUBLIC_API_KEY!
)

export const api = buildApi(client)
```

```typescript
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
```

---

### Step 3.3 — Mobile Theme & Utilities

```typescript
// mobile/src/lib/theme.ts
// Consistent design tokens across mobile app

export const colors = {
  bg: {
    primary: '#030712',      // Near black — main background
    secondary: '#0f172a',    // Card background
    tertiary: '#1e293b',     // Input / elevated background
    border: '#1e293b',       // Border color
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    muted: '#475569',
    inverse: '#030712',
  },
  accent: {
    blue: '#3b82f6',
    blueDark: '#1d4ed8',
    green: '#22c55e',
    yellow: '#eab308',
    red: '#ef4444',
  },
  status: {
    operational: '#22c55e',
    warning: '#eab308',
    critical: '#ef4444',
  },
  severity: {
    high: '#ef4444',
    medium: '#eab308',
    low: '#22c55e',
  },
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
}

export const typography = {
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
}
```

```typescript
// mobile/src/lib/utils.ts
import { EquipmentStatus, GapSeverity, CertificateStatus } from '../../shared/types'
import { colors } from './theme'

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

export function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

export function confidencePercent(score: number): string {
  return `${(score * 100).toFixed(0)}%`
}

export function confidenceColor(score: number): string {
  if (score >= 0.85) return colors.accent.green
  if (score >= 0.60) return colors.accent.yellow
  return colors.accent.red
}

export function statusColor(status: EquipmentStatus): string {
  return colors.status[status] ?? colors.text.secondary
}

export function severityColor(severity: GapSeverity): string {
  return colors.severity[severity] ?? colors.text.secondary
}

export function certStatusColor(status: CertificateStatus): string {
  const map: Record<CertificateStatus, string> = {
    valid: colors.accent.green,
    expiring_soon: colors.accent.yellow,
    expired: colors.accent.red,
  }
  return map[status]
}
```

---

### Step 3.4 — Mobile Reusable Components

```typescript
// mobile/src/components/Card.tsx
import React from 'react'
import { View, ViewStyle, StyleSheet } from 'react-native'
import { colors, spacing, radius } from '@/lib/theme'

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  padding?: number
}

export function Card({ children, style, padding = spacing.md }: CardProps) {
  return (
    <View style={[styles.card, { padding }, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bg.border,
  },
})
```

```typescript
// mobile/src/components/Typography.tsx
import React from 'react'
import { Text, TextStyle, StyleSheet } from 'react-native'
import { colors, typography } from '@/lib/theme'

interface TextProps {
  children: React.ReactNode
  style?: TextStyle
  numberOfLines?: number
}

export function Title({ children, style }: TextProps) {
  return <Text style={[styles.title, style]}>{children}</Text>
}

export function Subtitle({ children, style }: TextProps) {
  return <Text style={[styles.subtitle, style]}>{children}</Text>
}

export function Body({ children, style, numberOfLines }: TextProps) {
  return <Text style={[styles.body, style]} numberOfLines={numberOfLines}>{children}</Text>
}

export function Caption({ children, style }: TextProps) {
  return <Text style={[styles.caption, style]}>{children}</Text>
}

export function Mono({ children, style }: TextProps) {
  return <Text style={[styles.mono, style]}>{children}</Text>
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  body: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    color: colors.text.primary,
    lineHeight: typography.sizes.base * 1.5,
  },
  caption: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
    color: colors.text.muted,
  },
  mono: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.accent.blue,
    fontFamily: 'monospace',
  },
})
```

```typescript
// mobile/src/components/Badge.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, radius, typography } from '@/lib/theme'

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'default'

const variantColors: Record<Variant, { bg: string; text: string; border: string }> = {
  success: { bg: '#052e16', text: colors.accent.green, border: '#14532d' },
  warning: { bg: '#422006', text: colors.accent.yellow, border: '#713f12' },
  danger: { bg: '#450a0a', text: colors.accent.red, border: '#7f1d1d' },
  info: { bg: '#172554', text: colors.accent.blue, border: '#1e3a8a' },
  default: { bg: colors.bg.tertiary, text: colors.text.secondary, border: colors.bg.border },
}

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const c = variantColors[variant]
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.text, { color: c.text }]}>
        {children}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    textTransform: 'capitalize',
  },
})
```

```typescript
// mobile/src/components/LoadingSpinner.tsx
import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { colors } from '@/lib/theme'

export function LoadingSpinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent.blue} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
})
```

---

### Step 3.5 — Navigation Setup

```typescript
// mobile/src/navigation/index.tsx
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/lib/theme'

// Screens
import HomeScreen from '@/screens/HomeScreen'
import AskScreen from '@/screens/AskScreen'
import EquipmentListScreen from '@/screens/EquipmentListScreen'
import EquipmentDetailScreen from '@/screens/EquipmentDetailScreen'
import AlertsScreen from '@/screens/AlertsScreen'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

// Stack for Equipment (list → detail)
function EquipmentStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg.secondary },
        headerTintColor: colors.text.primary,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="EquipmentList"
        component={EquipmentListScreen}
        options={{ title: 'Equipment' }}
      />
      <Stack.Screen
        name="EquipmentDetail"
        component={EquipmentDetailScreen}
        options={({ route }) => ({
          title: (route.params as any)?.tag ?? 'Equipment Detail'
        })}
      />
    </Stack.Navigator>
  )
}

// Bottom tab navigator
export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: colors.bg.secondary },
          headerTintColor: colors.text.primary,
          headerTitleStyle: { fontWeight: '600', fontSize: 17 },
          tabBarStyle: {
            backgroundColor: colors.bg.secondary,
            borderTopColor: colors.bg.border,
            paddingTop: 4,
            height: 84,
            paddingBottom: 20,
          },
          tabBarActiveTintColor: colors.accent.blue,
          tabBarInactiveTintColor: colors.text.muted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
          tabBarIcon: ({ focused, color, size }) => {
            const icons: Record<string, { focused: string; unfocused: string }> = {
              Home: { focused: 'home', unfocused: 'home-outline' },
              Ask: { focused: 'mic', unfocused: 'mic-outline' },
              Equipment: { focused: 'construct', unfocused: 'construct-outline' },
              Alerts: { focused: 'notifications', unfocused: 'notifications-outline' },
            }
            const icon = icons[route.name]
            return (
              <Ionicons
                name={(focused ? icon?.focused : icon?.unfocused) as any}
                size={size}
                color={color}
              />
            )
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Overview' }} />
        <Tab.Screen name="Ask" component={AskScreen} options={{ title: 'Ask AI' }} />
        <Tab.Screen name="Equipment" component={EquipmentStack} options={{ headerShown: false }} />
        <Tab.Screen name="Alerts" component={AlertsScreen} options={{ title: 'Alerts' }} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
```

---

### Step 3.6 — App.tsx Entry Point

```typescript
// mobile/App.tsx
import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native'
import { queryClient } from '@/lib/queryClient'
import { AppNavigator } from '@/navigation'

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" backgroundColor="#030712" />
          <AppNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
})
```

---

### Step 3.7 — Home Screen

```typescript
// mobile/src/screens/HomeScreen.tsx
import React from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { Card } from '@/components/Card'
import { colors, spacing, radius, typography } from '@/lib/theme'
import { formatDate, daysUntil } from '@/lib/utils'

export default function HomeScreen() {
  const navigation = useNavigation<any>()
  const [refreshing, setRefreshing] = React.useState(false)

  const { data: kpis, refetch: refetchKpis } = useQuery({
    queryKey: ['analytics', 'kpis'],
    queryFn: api.analytics.kpis,
    refetchInterval: 60000,
  })

  const { data: certs, refetch: refetchCerts } = useQuery({
    queryKey: ['compliance', 'certificates'],
    queryFn: api.compliance.certificates,
    refetchInterval: 60000,
  })

  const { data: gaps, refetch: refetchGaps } = useQuery({
    queryKey: ['compliance', 'gaps', 'high'],
    queryFn: () => api.compliance.gaps('high', 'open'),
    refetchInterval: 60000,
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetchKpis(), refetchCerts(), refetchGaps()])
    setRefreshing(false)
  }

  // Build combined alerts
  const alerts = [
    ...(certs?.certificates
      .filter(c => c.status !== 'valid')
      .map(c => ({
        id: c.id,
        severity: c.status === 'expired' ? 'high' : 'medium',
        title: `${c.name}`,
        message: c.status === 'expired'
          ? 'Certificate has expired'
          : `Expires in ${daysUntil(c.expiry)} days`,
        equipment: c.equipment,
      })) ?? []),
    ...(gaps?.gaps
      .slice(0, 2)
      .map(g => ({
        id: g.id,
        severity: g.severity,
        title: g.regulation,
        message: g.description,
        equipment: g.equipment,
      })) ?? []),
  ]

  const quickActions = [
    {
      icon: 'mic-outline',
      label: 'Ask Aloud',
      color: colors.accent.blue,
      onPress: () => navigation.navigate('Ask'),
    },
    {
      icon: 'construct-outline',
      label: 'Find Equipment',
      color: colors.accent.green,
      onPress: () => navigation.navigate('Equipment'),
    },
    {
      icon: 'notifications-outline',
      label: 'My Alerts',
      color: colors.accent.yellow,
      badge: alerts.length,
      onPress: () => navigation.navigate('Alerts'),
    },
    {
      icon: 'shield-outline',
      label: 'Compliance',
      color: '#a855f7',
      onPress: () => navigation.navigate('Alerts'),
    },
  ]

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.blue}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="hardware-chip-outline" size={20} color={colors.accent.blue} />
          </View>
          <View>
            <Text style={styles.headerTitle}>KnowledgeAI</Text>
            <Text style={styles.headerSub}>Field Technician View</Text>
          </View>
        </View>

        {/* Alerts Banner */}
        {alerts.length > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => navigation.navigate('Alerts')}
            activeOpacity={0.8}
          >
            <Ionicons name="warning-outline" size={18} color={colors.accent.yellow} />
            <Text style={styles.alertBannerText}>
              {alerts.length} active alert{alerts.length > 1 ? 's' : ''} — tap to view
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.accent.yellow} />
          </TouchableOpacity>
        )}

        {/* KPI Strip */}
        {kpis && (
          <View style={styles.kpiStrip}>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{kpis.system_accuracy}%</Text>
              <Text style={styles.kpiLabel}>Accuracy</Text>
            </View>
            <View style={styles.kpiDivider} />
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{kpis.time_reduction}%</Text>
              <Text style={styles.kpiLabel}>Faster</Text>
            </View>
            <View style={styles.kpiDivider} />
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{kpis.active_users}</Text>
              <Text style={styles.kpiLabel}>Users</Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.quickAction}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
                {action.badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{action.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Alerts Preview */}
        {alerts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            <View style={styles.alertsList}>
              {alerts.slice(0, 2).map((alert) => (
                <TouchableOpacity
                  key={alert.id}
                  onPress={() => navigation.navigate('Alerts')}
                  activeOpacity={0.8}
                >
                  <Card style={[
                    styles.alertCard,
                    { borderColor: alert.severity === 'high' ? colors.accent.red + '40' : colors.accent.yellow + '40' }
                  ]}>
                    <View style={styles.alertCardHeader}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color={alert.severity === 'high' ? colors.accent.red : colors.accent.yellow}
                      />
                      <Text style={[
                        styles.alertCardTitle,
                        { color: alert.severity === 'high' ? colors.accent.red : colors.accent.yellow }
                      ]}>
                        {alert.title}
                      </Text>
                    </View>
                    <Text style={styles.alertCardMsg} numberOfLines={2}>{alert.message}</Text>
                    <Text style={styles.alertCardEquipment}>Equipment: {alert.equipment}</Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accent.blue + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  headerSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent.yellow + '15',
    borderColor: colors.accent.yellow + '30',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    marginBottom: spacing.md,
  },
  alertBannerText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.accent.yellow,
    fontWeight: typography.weights.medium,
  },
  kpiStrip: {
    flexDirection: 'row',
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bg.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  kpiItem: { flex: 1, alignItems: 'center' },
  kpiDivider: { width: 1, backgroundColor: colors.bg.border },
  kpiValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.accent.blue,
  },
  kpiLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickAction: {
    width: '47%',
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bg.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  quickActionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: typography.weights.bold,
  },
  alertsList: { gap: spacing.sm, marginBottom: spacing.md },
  alertCard: { gap: spacing.xs },
  alertCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  alertCardTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  alertCardMsg: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * 1.5,
  },
  alertCardEquipment: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
})
```

---

### Step 3.8 — Ask Screen (Voice + Text Query — CORE SCREEN)

```typescript
// mobile/src/screens/AskScreen.tsx
import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMutation } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import * as Haptics from 'expo-haptics'
import { api } from '@/lib/api'
import { Card } from '@/components/Card'
import { colors, spacing, radius, typography } from '@/lib/theme'
import { confidencePercent, confidenceColor } from '@/lib/utils'
import { QueryResponse } from '../../shared/types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  response?: QueryResponse
}

const SUGGESTIONS = [
  'First checks for high vibration on P-101A?',
  'What caused the last P-101A failure?',
  'Safe startup pressure for the feed pump?',
  'Is V-301 certificate still valid?',
]

export default function AskScreen() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [equipmentCtx, setEquipmentCtx] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const scrollRef = useRef<ScrollView>(null)
  const recordingRef = useRef<Audio.Recording | null>(null)
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Pulse animation for recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start()
    } else {
      pulseAnim.setValue(1)
    }
  }, [isRecording])

  // Query mutation
  const queryMutation = useMutation({
    mutationFn: api.query,
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.answer,
        response: data,
      }])
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
    },
    onError: (err: Error) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
      }])
    },
  })

  // Transcribe mutation
  const transcribeMutation = useMutation({
    mutationFn: async (uri: string) => {
      const blob = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      })
      // Create a blob-like object for the API
      const file = {
        uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as unknown as File
      return api.transcribe(file)
    },
    onSuccess: (data) => {
      if (data.text) {
        setInput(data.text)
      }
    },
  })

  const sendQuery = (queryText: string) => {
    const trimmed = queryText.trim()
    if (!trimmed) return

    setMessages(prev => [...prev, {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: trimmed,
    }])
    setInput('')
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)

    queryMutation.mutate({
      query: trimmed,
      user_id: 'field_tech_mobile',
      user_role: 'technician',
      equipment_context: equipmentCtx || undefined,
    })
  }

  const startRecording = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== 'granted') return

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const recording = new Audio.Recording()
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      )
      await recording.startAsync()
      recordingRef.current = recording
      setIsRecording(true)
    } catch (err) {
      console.error('Failed to start recording:', err)
    }
  }

  const stopRecording = async () => {
    if (!recordingRef.current) return
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      await recordingRef.current.stopAndUnloadAsync()
      const uri = recordingRef.current.getURI()
      recordingRef.current = null
      setIsRecording(false)

      if (uri) {
        transcribeMutation.mutate(uri)
      }
    } catch (err) {
      console.error('Failed to stop recording:', err)
      setIsRecording(false)
    }
  }

  const isLoading = queryMutation.isPending || transcribeMutation.isPending

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        {/* Context selector */}
        <View style={styles.contextBar}>
          <Ionicons name="hardware-chip-outline" size={14} color={colors.text.muted} />
          <TextInput
            value={equipmentCtx}
            onChangeText={setEquipmentCtx}
            placeholder="Equipment tag (e.g. P-101A)"
            placeholderTextColor={colors.text.muted}
            style={styles.contextInput}
            autoCapitalize="characters"
          />
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Empty state */}
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.botIcon}>
                <Ionicons name="hardware-chip-outline" size={32} color={colors.accent.blue} />
              </View>
              <Text style={styles.emptyTitle}>Ask Anything</Text>
              <Text style={styles.emptySub}>
                Voice or text queries about equipment, procedures, and compliance
              </Text>
              <View style={styles.suggestions}>
                {SUGGESTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={styles.suggestionChip}
                    onPress={() => sendQuery(s)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestionText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Message bubbles */}
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.aiBubble
              ]}
            >
              {msg.role === 'assistant' && (
                <View style={styles.aiLabel}>
                  <Ionicons name="hardware-chip" size={12} color={colors.accent.blue} />
                  <Text style={styles.aiLabelText}>AI</Text>
                </View>
              )}

              <Text style={[
                styles.messageText,
                msg.role === 'user' && styles.userMessageText
              ]}>
                {msg.content}
              </Text>

              {/* AI response metadata */}
              {msg.role === 'assistant' && msg.response && (
                <View style={styles.responseMeta}>
                  {/* Confidence bar */}
                  <View style={styles.confidenceRow}>
                    <Text style={styles.metaLabel}>Confidence</Text>
                    <View style={styles.confidenceBar}>
                      <View style={[
                        styles.confidenceFill,
                        {
                          width: `${msg.response.confidence * 100}%` as any,
                          backgroundColor: confidenceColor(msg.response.confidence),
                        }
                      ]} />
                    </View>
                    <Text style={[
                      styles.confidenceValue,
                      { color: confidenceColor(msg.response.confidence) }
                    ]}>
                      {confidencePercent(msg.response.confidence)}
                    </Text>
                  </View>

                  {/* Sources */}
                  {msg.response.sources.length > 0 && (
                    <View style={styles.sources}>
                      <Text style={styles.metaLabel}>Sources:</Text>
                      {msg.response.sources.slice(0, 2).map((src, i) => (
                        <View key={i} style={styles.sourceItem}>
                          <Ionicons name="document-text-outline" size={11} color={colors.accent.blue} />
                          <Text style={styles.sourceText} numberOfLines={1}>
                            {src.doc_id}
                          </Text>
                          <Text style={styles.sourceScore}>
                            {src.score.toFixed(2)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <Text style={styles.responseTime}>
                    {msg.response.response_time_ms}ms
                  </Text>
                </View>
              )}
            </View>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <View style={styles.aiBubble}>
              <View style={styles.aiLabel}>
                <Ionicons name="hardware-chip" size={12} color={colors.accent.blue} />
                <Text style={styles.aiLabelText}>AI</Text>
              </View>
              <View style={styles.typingIndicator}>
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    style={[styles.dot, { opacity: isLoading ? 1 : 0.3 }]}
                  />
                ))}
              </View>
              {transcribeMutation.isPending && (
                <Text style={styles.transcribingText}>Transcribing audio...</Text>
              )}
            </View>
          )}
        </ScrollView>

        {/* Input area */}
        <View style={styles.inputArea}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your question..."
            placeholderTextColor={colors.text.muted}
            style={styles.textInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendQuery(input)}
          />

          {/* Send button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={() => sendQuery(input)}
            disabled={!input.trim() || isLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>

          {/* Voice button */}
          <TouchableOpacity
            onPressIn={startRecording}
            onPressOut={stopRecording}
            activeOpacity={0.8}
            style={styles.voiceButtonWrapper}
          >
            <Animated.View style={[
              styles.voiceButton,
              isRecording && styles.voiceButtonActive,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              <Ionicons
                name={isRecording ? 'mic' : 'mic-outline'}
                size={22}
                color={isRecording ? '#fff' : colors.accent.blue}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {isRecording && (
          <View style={styles.recordingBanner}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording... Release to send</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.primary },
  container: { flex: 1 },
  contextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.border,
    backgroundColor: colors.bg.secondary,
  },
  contextInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  messagesList: { flex: 1 },
  messagesContent: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.lg },
  emptyState: { alignItems: 'center', paddingTop: spacing.xxl },
  botIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.accent.blue + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptySub: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: typography.sizes.sm * 1.6,
    marginBottom: spacing.lg,
  },
  suggestions: { gap: spacing.xs, width: '100%' },
  suggestionChip: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bg.border,
    padding: spacing.sm + 4,
  },
  suggestionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  messageBubble: {
    maxWidth: '90%',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent.blue,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.bg.border,
    width: '95%',
  },
  aiLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  aiLabelText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.accent.blue,
  },
  messageText: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    lineHeight: typography.sizes.base * 1.5,
  },
  userMessageText: { color: '#fff' },
  responseMeta: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.bg.border,
    gap: spacing.xs,
  },
  metaLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: 2,
  },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confidenceBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.bg.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: { height: '100%', borderRadius: 2 },
  confidenceValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    width: 36,
    textAlign: 'right',
  },
  sources: { gap: 4 },
  sourceItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sourceText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.accent.blue,
  },
  sourceScore: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  responseTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: 'right',
  },
  typingIndicator: { flexDirection: 'row', gap: 4, paddingVertical: 4 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.blue,
  },
  transcribingText: {
    fontSize: typography.sizes.xs,
    color: colors.accent.blue,
    fontStyle: 'italic',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.bg.border,
    backgroundColor: colors.bg.secondary,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.bg.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { backgroundColor: colors.bg.tertiary },
  voiceButtonWrapper: {},
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accent.blue + '20',
    borderWidth: 1,
    borderColor: colors.accent.blue + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonActive: {
    backgroundColor: colors.accent.red,
    borderColor: colors.accent.red,
  },
  recordingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent.red + '20',
    borderTopWidth: 1,
    borderTopColor: colors.accent.red + '40',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.red,
  },
  recordingText: {
    fontSize: typography.sizes.sm,
    color: colors.accent.red,
    fontWeight: typography.weights.medium,
  },
})
```

---

### Step 3.9 — Equipment Screens (Mobile)

```typescript
// mobile/src/screens/EquipmentListScreen.tsx
import React, { useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, StyleSheet, RefreshControl
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Badge } from '@/components/Badge'
import { colors, spacing, radius, typography } from '@/lib/theme'
import { statusColor } from '@/lib/utils'
import { Equipment, EquipmentStatus } from '../../shared/types'

const statusVariant = (s: EquipmentStatus) =>
  s === 'operational' ? 'success' : s === 'warning' ? 'warning' : 'danger'

export default function EquipmentListScreen() {
  const navigation = useNavigation<any>()
  const [search, setSearch] = useState('')

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['equipment', 'list'],
    queryFn: api.equipment.list,
    refetchInterval: 30000,
  })

  const filtered = (data?.equipment ?? []).filter(eq =>
    eq.tag.toLowerCase().includes(search.toLowerCase()) ||
    eq.name.toLowerCase().includes(search.toLowerCase())
  )

  const renderItem = ({ item: eq }: { item: Equipment }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('EquipmentDetail', { tag: eq.tag })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.tagRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor(eq.status) }]} />
          <Text style={styles.tag}>{eq.tag}</Text>
        </View>
        <Badge variant={statusVariant(eq.status)}>{eq.status}</Badge>
      </View>
      <Text style={styles.name} numberOfLines={1}>{eq.name}</Text>
      <Text style={styles.type}>{eq.type}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.statChip}>
          <Ionicons name="warning-outline" size={11} color={
            eq.failures > 3 ? colors.accent.red : colors.text.muted
          } />
          <Text style={[
            styles.statText,
            { color: eq.failures > 3 ? colors.accent.red : colors.text.muted }
          ]}>
            {eq.failures} failures
          </Text>
        </View>
        <View style={styles.statChip}>
          <Ionicons name="thermometer-outline" size={11} color={colors.text.muted} />
          <Text style={styles.statText}>{eq.max_temp}°C</Text>
        </View>
        <View style={styles.statChip}>
          <Ionicons name="speedometer-outline" size={11} color={colors.text.muted} />
          <Text style={styles.statText}>{eq.max_pressure} PSI</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (isLoading) return <LoadingSpinner />

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={colors.text.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search tag or name..."
          placeholderTextColor={colors.text.muted}
          style={styles.searchInput}
          autoCapitalize="characters"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.tag}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.accent.blue}
          />
        }
        ListHeaderComponent={
          <Text style={styles.count}>{filtered.length} equipment</Text>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No equipment found</Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: spacing.md,
    padding: spacing.sm + 4,
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bg.border,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  count: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bg.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  tag: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.accent.blue,
    fontFamily: 'monospace',
  },
  name: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  type: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  cardFooter: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  empty: {
    textAlign: 'center',
    color: colors.text.muted,
    fontSize: typography.sizes.base,
    padding: spacing.xl,
  },
})
```

```typescript
// mobile/src/screens/EquipmentDetailScreen.tsx
import React from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { colors, spacing, radius, typography } from '@/lib/theme'
import { statusColor, formatDate } from '@/lib/utils'

export default function EquipmentDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { tag } = route.params

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['equipment', 'history', tag],
    queryFn: () => api.equipment.history(tag),
  })

  if (isLoading) return <LoadingSpinner />
  if (!data) return null

  const { equipment: eq, failures, documents } = data

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.accent.blue}
        />
      }
    >
      {/* Status header */}
      <Card style={styles.headerCard}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor(eq.status) }]} />
          <Text style={[styles.statusText, { color: statusColor(eq.status) }]}>
            {eq.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.equipName}>{eq.name}</Text>
        <Text style={styles.equipType}>{eq.type}</Text>
      </Card>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        {[
          { label: 'Failures', value: eq.failures.toString(), warn: eq.failures > 3 },
          { label: 'Max Temp', value: `${eq.max_temp}°C`, warn: false },
          { label: 'Max Pressure', value: `${eq.max_pressure} PSI`, warn: false },
          { label: 'Max Flow', value: `${eq.max_flow} m³/h`, warn: false },
        ].map(({ label, value, warn }) => (
          <Card key={label} style={styles.statCard}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, warn && { color: colors.accent.red }]}>
              {value}
            </Text>
          </Card>
        ))}
      </View>

      {/* Ask AI button */}
      <TouchableOpacity
        style={styles.askButton}
        onPress={() => navigation.navigate('Ask')}
        activeOpacity={0.8}
      >
        <Ionicons name="mic-outline" size={18} color="#fff" />
        <Text style={styles.askButtonText}>Ask AI about {tag}</Text>
      </TouchableOpacity>

      {/* Failure History */}
      <Text style={styles.sectionTitle}>Failure History ({failures.length})</Text>
      {failures.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No failures recorded</Text>
        </Card>
      ) : (
        failures.map((f, i) => (
          <Card key={f.id} style={styles.failureCard}>
            <View style={styles.failureHeader}>
              <View style={styles.failureDot} />
              <Text style={styles.failureDate}>{formatDate(f.date)}</Text>
              <Text style={styles.failureNum}>#{failures.length - i}</Text>
            </View>
            <Text style={styles.failureField}>
              <Text style={styles.failureLabel}>Symptoms: </Text>
              {f.symptoms}
            </Text>
            <Text style={styles.failureField}>
              <Text style={styles.failureLabel}>Root Cause: </Text>
              {f.root_cause}
            </Text>
            <Text style={styles.failureField}>
              <Text style={styles.failureLabel}>Action: </Text>
              {f.action}
            </Text>
          </Card>
        ))
      )}

      {/* Documents */}
      <Text style={styles.sectionTitle}>Documents ({documents.length})</Text>
      {documents.map((doc) => (
        <Card key={doc.doc_id} style={styles.docCard}>
          <Ionicons name="document-text-outline" size={16} color={colors.accent.blue} />
          <View style={styles.docInfo}>
            <Text style={styles.docTitle} numberOfLines={1}>{doc.title}</Text>
            <View style={styles.docMeta}>
              <Badge variant="info">{doc.doc_type.replace('_', ' ')}</Badge>
              <Text style={styles.docDate}>{formatDate(doc.date)}</Text>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  headerCard: { gap: spacing.xs },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold },
  equipName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  equipType: { fontSize: typography.sizes.sm, color: colors.text.secondary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: { width: '47%', gap: 4 },
  statLabel: { fontSize: typography.sizes.xs, color: colors.text.muted },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent.blue,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  askButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#fff',
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  failureCard: { gap: spacing.xs },
  failureHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  failureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.blue,
  },
  failureDate: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.accent.blue,
    flex: 1,
  },
  failureNum: { fontSize: typography.sizes.xs, color: colors.text.muted },
  failureField: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * 1.5,
  },
  failureLabel: { color: colors.text.primary, fontWeight: typography.weights.medium },
  emptyCard: { alignItems: 'center', padding: spacing.lg },
  emptyText: { fontSize: typography.sizes.sm, color: colors.text.muted },
  docCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  docInfo: { flex: 1, gap: 4 },
  docTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  docMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  docDate: { fontSize: typography.sizes.xs, color: colors.text.muted },
})
```

---

### Step 3.10 — Alerts Screen (Mobile)

```typescript
// mobile/src/screens/AlertsScreen.tsx
import React from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Card } from '@/components/Card'
import { colors, spacing, radius, typography } from '@/lib/theme'
import { daysUntil, formatDate } from '@/lib/utils'

interface Alert {
  id: string
  type: 'certificate' | 'compliance_gap'
  severity: 'high' | 'medium' | 'low'
  title: string
  subtitle: string
  message: string
  equipment: string
  actionText: string
}

export default function AlertsScreen() {
  const { data: certs, refetch: refetchCerts, isRefetching: r1 } = useQuery({
    queryKey: ['compliance', 'certificates'],
    queryFn: api.compliance.certificates,
    refetchInterval: 60000,
  })

  const { data: gaps, refetch: refetchGaps, isRefetching: r2 } = useQuery({
    queryKey: ['compliance', 'gaps'],
    queryFn: () => api.compliance.gaps(undefined, 'open'),
    refetchInterval: 60000,
  })

  const onRefresh = () => {
    refetchCerts()
    refetchGaps()
  }

  // Build unified alerts list
  const alerts: Alert[] = [
    // Expiring / expired certificates
    ...(certs?.certificates
      .filter(c => c.status !== 'valid')
      .map(c => ({
        id: c.id,
        type: 'certificate' as const,
        severity: c.status === 'expired' ? 'high' as const : 'medium' as const,
        title: c.name,
        subtitle: c.standard,
        message: c.status === 'expired'
          ? `Certificate EXPIRED on ${formatDate(c.expiry)}`
          : `Expires in ${daysUntil(c.expiry)} days (${formatDate(c.expiry)})`,
        equipment: c.equipment,
        actionText: 'Schedule Inspection',
      })) ?? []),
    // Compliance gaps
    ...(gaps?.gaps.map(g => ({
      id: g.id,
      type: 'compliance_gap' as const,
      severity: g.severity,
      title: g.regulation,
      subtitle: g.clause,
      message: g.description,
      equipment: g.equipment,
      actionText: 'View Details',
    })) ?? []),
  ].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.severity] - order[b.severity]
  })

  const severityConfig = {
    high: {
      color: colors.accent.red,
      icon: 'alert-circle' as const,
      bg: colors.accent.red + '15',
      border: colors.accent.red + '30',
    },
    medium: {
      color: colors.accent.yellow,
      icon: 'warning' as const,
      bg: colors.accent.yellow + '15',
      border: colors.accent.yellow + '30',
    },
    low: {
      color: colors.accent.green,
      icon: 'information-circle' as const,
      bg: colors.accent.green + '15',
      border: colors.accent.green + '30',
    },
  }

  const renderAlert = ({ item }: { item: Alert }) => {
    const cfg = severityConfig[item.severity]
    return (
      <View style={[styles.alertCard, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
        <View style={styles.alertHeader}>
          <Ionicons name={cfg.icon} size={18} color={cfg.color} />
          <View style={styles.alertHeaderText}>
            <Text style={[styles.alertTitle, { color: cfg.color }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.alertSubtitle}>{item.subtitle}</Text>
          </View>
          <View style={[styles.severityBadge, { backgroundColor: cfg.color + '20' }]}>
            <Text style={[styles.severityText, { color: cfg.color }]}>
              {item.severity.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.alertMessage}>{item.message}</Text>
        <View style={styles.alertFooter}>
          <View style={styles.equipmentTag}>
            <Ionicons name="hardware-chip-outline" size={11} color={colors.text.muted} />
            <Text style={styles.equipmentTagText}>{item.equipment}</Text>
          </View>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: cfg.color + '50' }]}>
            <Text style={[styles.actionBtnText, { color: cfg.color }]}>
              {item.actionText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (!certs && !gaps) return <LoadingSpinner />

  return (
    <View style={styles.container}>
      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: colors.accent.red }]}>
            {alerts.filter(a => a.severity === 'high').length}
          </Text>
          <Text style={styles.summaryLabel}>High</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: colors.accent.yellow }]}>
            {alerts.filter(a => a.severity === 'medium').length}
          </Text>
          <Text style={styles.summaryLabel}>Medium</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: colors.accent.green }]}>
            {alerts.filter(a => a.severity === 'low').length}
          </Text>
          <Text style={styles.summaryLabel}>Low</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: colors.text.primary }]}>
            {alerts.length}
          </Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
      </View>

      <FlatList
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        refreshControl={
          <RefreshControl
            refreshing={r1 || r2}
            onRefresh={onRefresh}
            tintColor={colors.accent.blue}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color={colors.accent.green} />
            <Text style={styles.emptyTitle}>All Clear</Text>
            <Text style={styles.emptySubtitle}>No active alerts</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: colors.bg.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.border,
    padding: spacing.md,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  summaryLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  summaryDivider: { width: 1, backgroundColor: colors.bg.border },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  alertCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  alertHeaderText: { flex: 1, gap: 2 },
  alertTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  alertSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  severityText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  alertMessage: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * 1.5,
  },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  equipmentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  equipmentTagText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontFamily: 'monospace',
  },
  actionBtn: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  emptySubtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
})
```

---

# PHASE 4: Final Integration & Demo Prep
## Estimated Time: 30 minutes

---

### Step 4.1 — Component Index Files

```typescript
// admin/src/components/index.ts
// Export everything from one place — clean imports across all pages
export { Card, StatCard } from './ui/Card'
export { Badge } from './ui/Badge'
export { LoadingSpinner, SkeletonCard } from './ui/LoadingSpinner'
export { ErrorState } from './ui/ErrorState'
export { PageHeader } from './ui/PageHeader'
```

```typescript
// mobile/src/components/index.ts
export { Card } from './Card'
export { Badge } from './Badge'
export { LoadingSpinner } from './LoadingSpinner'
export { Title, Subtitle, Body, Caption, Mono } from './Typography'
```

---

### Step 4.2 — Admin Dashboard Redirect

```typescript
// admin/src/app/page.tsx
// Root page redirects to dashboard
import { redirect } from 'next/navigation'
export default function RootPage() {
  redirect('/dashboard')
}
```

---

### Step 4.3 — Demo Script Checklist

```
DEMO ORDER FOR JUDGES (15 minutes):

MINUTE 0-2: THE PROBLEM
  "A plant has 7-12 disconnected systems.
   A pump fails at 2AM. Technician has no context.
   35% of engineer time is spent searching for info.
   This is what we solve."

MINUTE 2-5: DOCUMENT INGESTION (Admin Web)
  → Navigate to /documents
  → Upload a sample PDF work order
  → Show processing queue appearing
  → Navigate to /system/health — show graph nodes increasing
  "In 30 seconds, that document is queryable across all agents"

MINUTE 5-9: QUERY INTELLIGENCE (Admin Web → Mobile)
  Admin Web /query:
  → Type: "What caused P-101A to fail last time?"
  → Show answer streaming in
  → Show confidence score (94%) + sources with doc names
  → Show follow-up suggestion appearing

  Mobile App — Ask Screen:
  → Hold mic button
  → Say: "What are the first checks for high vibration?"
  → Show transcription appearing
  → Show AI answer with numbered steps (field tech format)
  → Show confidence bar
  "Same intelligence. Phone. Voice. Field-ready."

MINUTE 9-12: PROACTIVE INTELLIGENCE
  Admin Web /compliance:
  → Show 3 high-severity gaps with regulation references
  → Show certificate expiring in 15 days — red badge
  Mobile Alerts screen:
  → Show same alerts pushed to field tech
  "The system found these compliance gaps automatically.
   Nobody had to ask. That's the operational brain."

MINUTE 12-14: EQUIPMENT INTELLIGENCE
  Admin Web /equipment/P-101A:
  → Show failure timeline (Jan 2024, Mar 2023, Sep 2022)
  → Show pattern: 3 failures in 18 months
  → Show related documents automatically linked
  → Click "Ask AI about P-101A" → auto-fills context
  → Ask: "Is there a pattern in these failures?"

MINUTE 14-15: BUSINESS IMPACT
  Admin Web /analytics:
  → ROI Calculator: team=50, salary=80000, incidents=10
  → Show: Annual Savings: $X, ROI: 900%, Break Even: 1.2 months
  "This is the financial case. This is why it matters."

DEMO BACKUP PLAN (if backend is slow):
  → Have screenshots of all screens ready
  → Have pre-recorded video as fallback
  → Cache responses in Redis mean repeat queries are instant
```

---

### Step 4.4 — Environment Setup Files

```bash
# admin/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_KEY=your-api-key-here

# mobile/.env
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000
# USE YOUR MACHINE'S LOCAL IP FOR MOBILE
# NOT localhost — mobile device is a different machine
EXPO_PUBLIC_API_KEY=your-api-key-here
```

```bash
# Start commands

# Terminal 1: Backend (Python)
cd intelligence
uvicorn main:app --reload --port 8000

# Terminal 2: Admin (Next.js)
cd admin
npm run dev
# Opens at http://localhost:3000

# Terminal 3: Mobile (Expo)
cd mobile
npx expo start
# Scan QR code with Expo Go app on phone
```

---

### Step 4.5 — tsconfig Paths Setup

```json
// admin/tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

```json
// mobile/tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.d.ts", "expo-env.d.ts"]
}
```

---

## Complete File Checklist

```
VERIFY THESE FILES EXIST BEFORE RUNNING:

SHARED (copy to both apps or use as reference):
✅ shared/types.ts
✅ shared/api.ts

ADMIN:
✅ admin/.env.local
✅ admin/src/app/layout.tsx
✅ admin/src/app/page.tsx (redirect)
✅ admin/src/app/dashboard/page.tsx
✅ admin/src/app/equipment/page.tsx
✅ admin/src/app/equipment/[tag]/page.tsx
✅ admin/src/app/compliance/page.tsx
✅ admin/src/app/documents/page.tsx
✅ admin/src/app/analytics/page.tsx
✅ admin/src/app/query/page.tsx
✅ admin/src/app/system/page.tsx
✅ admin/src/components/Providers.tsx
✅ admin/src/components/layout/Sidebar.tsx
✅ admin/src/components/layout/TopBar.tsx
✅ admin/src/components/ui/Card.tsx
✅ admin/src/components/ui/Badge.tsx
✅ admin/src/components/ui/LoadingSpinner.tsx
✅ admin/src/components/ui/ErrorState.tsx
✅ admin/src/components/ui/PageHeader.tsx
✅ admin/src/components/index.ts
✅ admin/src/lib/api.ts
✅ admin/src/lib/queryClient.ts
✅ admin/src/lib/utils.ts

MOBILE:
✅ mobile/.env
✅ mobile/App.tsx
✅ mobile/src/navigation/index.tsx
✅ mobile/src/lib/api.ts
✅ mobile/src/lib/queryClient.ts
✅ mobile/src/lib/theme.ts
✅ mobile/src/lib/utils.ts
✅ mobile/src/components/Card.tsx
✅ mobile/src/components/Badge.tsx
✅ mobile/src/components/LoadingSpinner.tsx
✅ mobile/src/components/Typography.tsx
✅ mobile/src/components/index.ts
✅ mobile/src/screens/HomeScreen.tsx
✅ mobile/src/screens/AskScreen.tsx
✅ mobile/src/screens/EquipmentListScreen.tsx
✅ mobile/src/screens/EquipmentDetailScreen.tsx
✅ mobile/src/screens/AlertsScreen.tsx
```

---

## Known Issues & Fixes

```
ISSUE 1: Mobile can't reach backend
FIX: Use machine's LAN IP (192.168.x.x) not localhost in mobile .env

ISSUE 2: CORS error in admin
FIX: Backend already has CORS configured — check ALLOWED_ORIGINS env var
     Add http://localhost:3000 to ALLOWED_ORIGINS

ISSUE 3: Audio recording fails on iOS simulator
FIX: Test voice on a real device — simulator mic doesn't work

ISSUE 4: React Query showing stale data
FIX: Call queryClient.invalidateQueries() after mutations
     Already handled in documents upload mutation

ISSUE 5: Equipment tag with slash in URL
FIX: Already using encodeURIComponent() in api.ts equipment.history call

ISSUE 6: Charts not rendering on first load
FIX: Add loading check before rendering Recharts components
     Already handled with data?.field ?? [] fallback pattern

ISSUE 7: TypeScript errors on shared types import
FIX: Copy shared/types.ts directly into each app
     Or set up a proper monorepo with npm workspaces
```