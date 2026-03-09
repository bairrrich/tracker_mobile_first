import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Star } from 'lucide-react'
import type { Book } from '@/lib/db'

export interface BookCardProps {
  book: Book
  className?: string
  onClick?: () => void
}

export const BookCard = React.forwardRef<HTMLDivElement, BookCardProps>(
  ({ book, className, onClick }, ref) => {
    // Calculate progress
    const progress = book.pagesTotal && book.pagesTotal > 0
      ? Math.round(((book.pagesRead || 0) / book.pagesTotal) * 100)
      : 0

    // Status colors
    const statusColors: Record<string, string> = {
      reading: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      completed: 'bg-green-500/10 text-green-600 dark:text-green-400',
      planned: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
      abandoned: 'bg-red-500/10 text-red-600 dark:text-red-400',
    }

    // Status labels
    const statusLabels: Record<string, string> = {
      reading: 'Reading',
      completed: 'Completed',
      planned: 'Planned',
      abandoned: 'Abandoned',
    }

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
          {/* Cover Image */}
          <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg bg-[var(--card)]">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl bg-gradient-to-br from-primary/20 to-primary/5">
                📚
              </div>
            )}

            {/* Status badge */}
            <div className="absolute left-2 top-2">
              <Badge
                variant="secondary"
                className={cn('text-xs', statusColors[book.status])}
              >
                {statusLabels[book.status]}
              </Badge>
            </div>

            {/* Rating */}
            {book.rating && book.rating > 0 && (
              <div className="absolute right-2 top-2 flex items-center gap-1 bg-[var(--border)]/60 text-[var(--text)] px-2 py-1 rounded-full text-xs">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{book.rating}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-3 space-y-2">
          {/* Title */}
          <h3 className="font-semibold text-base line-clamp-2 leading-tight">
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-sm text-muted-foreground line-clamp-1">
            {book.author}
          </p>

          {/* Genre */}
          {book.genre && (
            <Badge variant="outline" className="text-xs">
              {book.genre}
            </Badge>
          )}

          {/* Progress */}
          {book.pagesTotal && book.pagesTotal > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {book.pagesRead} / {book.pagesTotal} {book.pagesRead === 1 ? 'page' : 'pages'}
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}
        </CardContent>

        <CardFooter className="p-3 pt-0">
          <div className="text-xs text-muted-foreground line-clamp-1">
            {book.format && <span className="capitalize">{book.format}</span>}
            {book.publishYear && <span> • {book.publishYear}</span>}
          </div>
        </CardFooter>
      </Card>
    )
  }
)
BookCard.displayName = 'BookCard'
