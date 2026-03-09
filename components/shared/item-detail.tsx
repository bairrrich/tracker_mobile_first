import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export interface ItemDetailProps {
  id?: string
  title: string
  subtitle?: string
  description?: string
  image?: string
  icon?: React.ReactNode
  tags?: string[]
  metrics?: { label: string; value: string | number }[]
  progress?: { label: string; value: number }[]
  notes?: string
  className?: string
}

export const ItemDetail = React.forwardRef<HTMLDivElement, ItemDetailProps>(
  (
    {
      title,
      subtitle,
      description,
      image,
      icon,
      tags,
      metrics,
      progress,
      notes,
      className,
    },
    ref
  ) => {
    return (
      <Card ref={ref} className={cn('overflow-hidden', className)}>
        {/* Header with image/icon */}
        <div className="relative aspect-video w-full overflow-hidden bg-[var(--card)]">
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl">
              {icon || <span>📦</span>}
            </div>
          )}
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Title and subtitle */}
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Metrics */}
          {metrics && metrics.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric, index) => (
                <div key={index} className="rounded-lg bg-[var(--card)] p-4">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Progress */}
          {progress && progress.length > 0 && (
            <div className="space-y-4">
              {progress.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-2" />
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{description}</p>
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)
ItemDetail.displayName = 'ItemDetail'
