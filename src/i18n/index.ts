import es from './es.json';
import en from './en.json';

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

/** El catálogo en español es la referencia: el inglés debe tener exactamente la misma forma. */
export type Dictionary = typeof es;

const dictionaries: Record<Locale, Dictionary> = {
  es,
  en: en satisfies Dictionary,
};

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};

export const htmlLang: Record<Locale, string> = {
  es: 'es',
  en: 'en',
};
