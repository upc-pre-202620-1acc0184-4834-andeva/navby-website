import type { Locale } from '@/i18n';

const DEFAULT_WEBAPP_URL = '/app';

/**
 * URL pública de la webapp. Por defecto apunta a /app (proxy en vercel.json).
 * Puede sobrescribirse con PUBLIC_WEBAPP_URL en .env (ver .env.example).
 */
export const WEBAPP_URL: string = import.meta.env.PUBLIC_WEBAPP_URL?.trim() || DEFAULT_WEBAPP_URL;

export const ANDEVA_URL = '#';

/**
 * Devuelve la URL hacia la webapp. Si apunta a un origen externo distinto,
 * adjunta ?lang= para conservar el idioma cuando no se comparte localStorage.
 */
export function getWebappUrl(locale: Locale): string {
  if (/^https?:\/\//i.test(WEBAPP_URL)) {
    const url = new URL(WEBAPP_URL);
    url.searchParams.set('lang', locale);
    return url.toString();
  }
  return WEBAPP_URL;
}
