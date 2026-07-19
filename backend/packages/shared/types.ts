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
  properties?: any
}

export interface EquipmentListResponse {
  equipment: Equipment[]
  total: number
}

export interface FailureEvent {
  id: string
  date: string | null
  symptoms: string
  root_cause: string
  action: string
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

// Personnel
export interface PersonnelItem {
  emp_id: string
  full_name: string
  role: string
  discipline: string
  reports_to: string | null
  phone: string
  email: string
}

export interface PersonnelResponse {
  personnel: PersonnelItem[]
  total: number
}

// Work Orders
export interface WorkOrderItem {
  wo_id: string
  equipment_tag: string
  type: string
  lead_emp_id: string | null
  date_executed: string | null
  duration_hours: number | null
  description: string
}

export interface WorkOrderResponse {
  work_orders: WorkOrderItem[]
  total: number
}

// Spare Parts
export interface SparePartItem {
  part_number: string
  name: string
  category: string
  stock_quantity: number
  reorder_level: number | null
  price: number
  supplier: string | null
}

export interface SparePartsResponse {
  parts: SparePartItem[]
  total: number
}

// Supply Chain
export interface PurchaseOrderItem {
  po_number: string
  supplier_name: string
  order_date: string | null
  status: string
  items: any
}

export interface SupplyChainResponse {
  purchase_orders: PurchaseOrderItem[]
  total: number
}
