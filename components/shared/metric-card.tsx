import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

export interface MetricCardProps {
  value: string | number
  label: string
  trend?: {
    value: string | number
    direction: 'up' | 'down' | 'neutral'
  }
  className?: string
}

export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ value, label, trend, className }, ref) => {
    const trendColor = trend?.direction === 'up' 
      ? 'text-success' 
      : trend?.direction === 'down'
        ? 'text-error'
        : 'text-muted-foreground'

    const trendIcon = trend?.direction === 'up' 
      ? '↑' 
      : trend?.direction === 'down'
        ? '↓'
        : '→'

    return (
      <Card ref={ref} className={cn('metric-card', className)}>
        <div className="metric-value">{value}</div>
        <div className="metric-label">{label}</div>
        {trend && (
          <div className={cn('metric-trend', trendColor)}>
            {trendIcon} {trend.value}
          </div>
        )}
      </Card>
    )
  }
)
MetricCard.displayName = 'MetricCard'
