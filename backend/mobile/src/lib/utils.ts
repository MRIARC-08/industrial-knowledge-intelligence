// mobile/src/lib/utils.ts
import { EquipmentStatus, GapSeverity, CertificateStatus } from '@iki/shared'
import { colors } from './theme'

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'TBD (Planned)'
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
  if (score >= 0.85) return colors.semantic.operational
  if (score >= 0.60) return colors.semantic.warning
  return colors.semantic.critical
}

export function statusColor(status: EquipmentStatus): string {
  if (status === 'operational') return colors.semantic.operational
  if (status === 'warning') return colors.semantic.warning
  return colors.semantic.critical
}

export function severityColor(severity: GapSeverity): string {
  if (severity === 'high') return colors.semantic.critical
  if (severity === 'medium') return colors.semantic.warning
  return colors.semantic.operational
}

export function certStatusColor(status: CertificateStatus): string {
  const map: Record<CertificateStatus, string> = {
    valid: colors.semantic.operational,
    expiring_soon: colors.semantic.warning,
    expired: colors.semantic.critical,
  }
  return map[status]
}
