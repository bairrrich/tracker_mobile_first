import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

// Предзагружаем все переводы заранее, чтобы избежать динамического импорта
// который вызывает бесконечную компиляцию в dev-режиме
import enMessages from '../../messages/en.json';
import ruMessages from '../../messages/ru.json';

const messages: Record<string, typeof enMessages> = {
  en: enMessages,
  ru: ruMessages,
};

export default getRequestConfig(async () => {
  // Читаем локаль из cookie или используем 'en' по умолчанию
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';

  // Валидируем локаль
  const validatedLocale = (locale in messages) ? locale : 'en';

  return {
    locale: validatedLocale,
    messages: messages[validatedLocale]
  };
});
