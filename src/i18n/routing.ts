import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // Список поддерживаемых локалей
  locales: ['en', 'ru'],

  // Локаль по умолчанию
  defaultLocale: 'en',

  // Без префикса в URL - используем только cookie
  localePrefix: 'never',

  // Настройки cookie
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 60 * 60 * 24 * 365 // 1 год
  },

  // Отключаем авто-обнаружение, используем только cookie
  localeDetection: false
});
