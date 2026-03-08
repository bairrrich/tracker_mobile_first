import enLocales from '@/messages/en.json';

type Messages = typeof enLocales;

declare global {
  interface IntlMessages extends Messages {}
}

export {};
