import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ActivityItemProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  meta?: string
  action?: React.ReactNode
  className?: string
}

export const ActivityItem = React.forwardRef<HTMLDivElement, ActivityItemProps>(
  ({ icon, title, subtitle, meta, action, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('list-item', className)}
      >
        {icon && (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{title}</div>
          {subtitle && (
            <div className="text-sm text-muted-foreground truncate">{subtitle}</div>
          )}
        </div>
        {meta && (
          <div className="text-right flex-shrink-0 ml-2">
            <div className="font-medium truncate">{meta}</div>
            {action && <div className="text-sm">{action}</div>}
          </div>
        )}
      </div>
    )
  }
)
ActivityItem.displayName = 'ActivityItem'
