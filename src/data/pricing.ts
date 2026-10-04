/** Precios oficiales de docs/product-marketing.md (v3, 2026-09-21). */
export type Currency = 'USD' | 'PEN';

export interface CreditPack {
  id: 'escapada' | 'frecuente' | 'nomada';
  credits: number;
  searches: number;
  price: Record<Currency, number>;
}

export const CREDITS_PER_SEARCH = 5;
export const FREE_DAILY_CREDITS = 10;

export const packs: CreditPack[] = [
  { id: 'escapada', credits: 50, searches: 10, price: { USD: 2.49, PEN: 9.9 } },
  { id: 'frecuente', credits: 100, searches: 20, price: { USD: 4.49, PEN: 16.9 } },
  { id: 'nomada', credits: 250, searches: 50, price: { USD: 8.99, PEN: 34.9 } },
];

export const currencySymbol: Record<Currency, string> = {
  USD: '$',
  PEN: 'S/',
};

export function formatPrice(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
