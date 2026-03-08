/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  currency: string = 'EUR',
  locale: string = 'ru-RU'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
}

/**
 * Format a number with compact notation
 */
export function formatCompactNumber(value: number, locale: string = 'ru-RU'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/**
 * Format a date to locale string
 */
export function formatDate(
  date: Date | string,
  locale: string = 'ru-RU',
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }

  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(
    new Date(date)
  )
}

/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string,
  locale: string = 'ru-RU'
): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  const intervals: [number, Intl.RelativeTimeFormatUnit][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [604800, 'week'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ]

  for (const [seconds, unit] of intervals) {
    const interval = Math.floor(diffInSeconds / seconds)
    if (interval >= 1) {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
      return rtf.format(-interval, unit)
    }
  }

  return 'just now'
}

/**
 * Format a number as percentage
 */
export function formatPercent(value: number, locale: string = 'ru-RU'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value)
}

/**
 * Format a number with thousands separator
 */
export function formatNumber(value: number, locale: string = 'ru-RU'): string {
  return new Intl.NumberFormat(locale).format(value)
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Parse percentage string to number
 */
export function parsePercent(value: string): number {
  return parseFloat(value.replace('%', '')) / 100
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '…'
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Convert to title case
 */
export function toTitleCase(text: string): string {
  return text.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}
