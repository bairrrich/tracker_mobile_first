'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const handleLocaleChange = (newLocale: string) => {
    // Устанавливаем cookie с новой локалью
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    // Используем router.refresh() вместо window.location.reload()
    // для более плавного обновления
    router.refresh();
  };

  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ru">Русский</SelectItem>
      </SelectContent>
    </Select>
  );
}
