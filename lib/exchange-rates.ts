// Currency exchange rates service
const API_BASE = 'https://api.exchangerate-api.com/v4/latest'
export type CurrencyCode = 'RUB' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY'
export interface ExchangeRates { base: CurrencyCode; date: string; rates: Record<CurrencyCode, number> }
const CACHE_KEY = 'exchange_rates_cache', CACHE_DURATION = 24 * 60 * 60 * 1000

export async function getExchangeRates(baseCurrency: CurrencyCode = 'RUB'): Promise<ExchangeRates | null> {
  const cached = getCachedRates(baseCurrency); if (cached) return cached
  try {
    const response = await fetch(`${API_BASE}/${baseCurrency}`); if (!response.ok) throw new Error('Failed to fetch')
    const data = await response.json()
    const rates: ExchangeRates = { base: data.base, date: data.date, rates: { RUB: data.rates.RUB, USD: data.rates.USD, EUR: data.rates.EUR, GBP: data.rates.GBP, JPY: data.rates.JPY, CNY: data.rates.CNY } }
    cacheRates(rates); return rates
  } catch (error) { console.error('Error fetching exchange rates:', error); return getDefaultRates(baseCurrency) }
}

export function convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode, rates: ExchangeRates): number {
  if (from === to) return amount; const fromRate = rates.rates[from], toRate = rates.rates[to]
  if (!fromRate || !toRate) return amount; return (amount / fromRate) * toRate
}

export function formatCurrency(amount: number, currency: CurrencyCode, locale = 'ru-RU'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
}

function getCachedRates(base: CurrencyCode): ExchangeRates | null {
  if (typeof window === 'undefined') return null
  try { const c = localStorage.getItem(`${CACHE_KEY}_${base}`); if (!c) return null; const { rates, timestamp } = JSON.parse(c)
    if (Date.now() - timestamp > CACHE_DURATION) { localStorage.removeItem(`${CACHE_KEY}_${base}`); return null }; return rates
  } catch { return null }
}

function cacheRates(rates: ExchangeRates): void {
  if (typeof window === 'undefined') return; try { localStorage.setItem(`${CACHE_KEY}_${rates.base}`, JSON.stringify({ rates, timestamp: Date.now() })) } catch (e) { console.error(e) }
}

function getDefaultRates(base: CurrencyCode): ExchangeRates {
  const d: Record<CurrencyCode, Record<CurrencyCode, number>> = {
    RUB: { RUB: 1, USD: 0.011, EUR: 0.010, GBP: 0.0087, JPY: 0.17, CNY: 0.080 },
    USD: { RUB: 90, USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150, CNY: 7.2 },
    EUR: { RUB: 98, USD: 1.09, EUR: 1, GBP: 0.86, JPY: 163, CNY: 7.8 },
    GBP: { RUB: 115, USD: 1.27, EUR: 1.16, GBP: 1, JPY: 190, CNY: 9.1 },
    JPY: { RUB: 0.60, USD: 0.0067, EUR: 0.0061, GBP: 0.0053, JPY: 1, CNY: 0.048 },
    CNY: { RUB: 12.5, USD: 0.14, EUR: 0.13, GBP: 0.11, JPY: 21, CNY: 1 }
  }; return { base, date: new Date().toISOString().split('T')[0] || '', rates: d[base] || d.RUB }
}