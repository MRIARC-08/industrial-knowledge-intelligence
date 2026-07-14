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
