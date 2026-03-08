'use client';

import { useLocale as useNextIntlLocale } from 'next-intl';

/**
 * Хук для управления локалью приложения
 * Обёртка над useLocale из next-intl
 */
export function useLocale() {
  const locale = useNextIntlLocale();

  return {
    locale,
  };
}
