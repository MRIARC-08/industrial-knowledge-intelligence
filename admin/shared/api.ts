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
      // @ts-ignore
      if (typeof __DEV__ !== 'undefined' && __DEV__ || process.env.NODE_ENV === 'development') {
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

export type Api = ReturnType<typeof buildApi>
