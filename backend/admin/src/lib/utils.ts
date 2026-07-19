// admin/src/lib/utils.ts
// Utility functions used across all components

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { EquipmentStatus, GapSeverity, CertificateStatus, ServiceStatus } from '@iki/shared'

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
