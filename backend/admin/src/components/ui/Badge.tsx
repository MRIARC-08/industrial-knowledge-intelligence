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
