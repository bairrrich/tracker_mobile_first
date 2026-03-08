import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface CollectionCardProps {
  title: string
  subtitle?: string
  image?: string
  icon?: React.ReactNode
  count?: number
  tags?: string[]
  progress?: number
  className?: string
  onClick?: () => void
}

export const CollectionCard = React.forwardRef<HTMLDivElement, CollectionCardProps>(
  ({ title, subtitle, image, icon, count, tags, progress, className, onClick }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          'group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]',
          className
        )}
        onClick={onClick}
      >
        <CardHeader className="p-0">
          {/* Image or Icon */}
          <div className="relative aspect-square overflow-hidden rounded-t-lg bg-neutral-100 dark:bg-neutral-800">
            {image ? (
              <img
                src={image}
                alt={title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl">
                {icon || <span className="text-4xl">📦</span>}
              </div>
            )}
            
            {/* Count badge */}
            {count !== undefined && (
              <div className="absolute right-2 top-2">
                <Badge variant="secondary" className="text-xs">
                  {count}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg truncate">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
          
          {/* Progress bar */}
          {progress !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <div className="text-xs text-muted-foreground">
            Click to view details
          </div>
        </CardFooter>
      </Card>
    )
  }
)
CollectionCard.displayName = 'CollectionCard'
