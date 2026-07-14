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
