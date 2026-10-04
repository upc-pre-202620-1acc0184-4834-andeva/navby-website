import { useId, useState, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  currencySymbol,
  formatPrice,
  packs,
  CREDITS_PER_SEARCH,
  FREE_DAILY_CREDITS,
  type Currency,
} from '@/data/pricing';
import type { Dictionary } from '@/i18n';

interface Props {
  t: Dictionary['pricing'];
  currencyLabel: string;
  numberLocale: string;
  initialCurrency: Currency;
  webappUrl: string;
}

const CURRENCIES: Currency[] = ['USD', 'PEN'];

function Price({
  value,
  currency,
  numberLocale,
}: {
  value: number;
  currency: Currency;
  numberLocale: string;
}) {
  const [whole, cents] = formatPrice(value, numberLocale).split(/([.,]\d{2})$/);
  return (
    <span className="tabular inline-flex items-start leading-none font-extrabold tracking-[-0.03em]">
      <span className="mt-1 mr-1 text-lg font-bold">{currencySymbol[currency]}</span>
      <span className="text-[2.75rem]">{whole}</span>
      <span className="mt-1 text-lg">{cents}</span>
    </span>
  );
}

function Perforation() {
  return (
    <div
      aria-hidden="true"
      className="relative w-px shrink-0 self-stretch max-sm:h-px max-sm:w-auto"
    >
      <span className="absolute inset-0 border-l-2 border-dashed border-current opacity-20 max-sm:border-t-2 max-sm:border-l-0" />
    </div>
  );
}

function PassLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <span data-magnetic className="flex">
      <a
        href={href}
        className={`inline-flex h-11 flex-1 items-center justify-center rounded-full px-5 text-sm font-semibold whitespace-nowrap transition-colors ${className}`}
      >
        <span data-magnetic-label className="inline-flex items-center gap-1.5">
          {children}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </a>
    </span>
  );
}

export default function PricingPasses({
  t,
  currencyLabel,
  numberLocale,
  initialCurrency,
  webappUrl,
}: Props) {
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const groupId = useId();

  return (
    <div>
      <div
        role="group"
        aria-labelledby={groupId}
        className="inline-flex rounded-full bg-card-white p-1 ring-1 ring-black/5 dark:bg-card-black dark:ring-white/10"
      >
        <span id={groupId} className="sr-only">
          {currencyLabel}
        </span>
        {CURRENCIES.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={currency === c}
            onClick={() => setCurrency(c)}
            className={[
              'h-10 rounded-full px-5 text-sm font-bold tracking-wide transition-colors duration-200',
              currency === c
                ? 'bg-primary text-text-white'
                : 'text-text-muted hover:text-text-black dark:text-text-subtitles dark:hover:text-text-white',
            ].join(' ')}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className="mt-10 grid gap-5 lg:grid-cols-2">
        {/* Pase gratuito */}
        <li
          data-pass
          className="relative flex overflow-hidden rounded-2xl bg-primary text-text-white max-sm:flex-col"
        >
          <div className="flex-1 p-6 sm:p-7">
            <p className="text-xs font-bold tracking-[0.14em] text-white uppercase">
              {t.boarding} · {t.class} {t.free.name}
            </p>
            <p className="mt-5 flex items-baseline gap-2">
              <span className="tabular text-6xl font-extrabold tracking-[-0.04em]">
                {FREE_DAILY_CREDITS}
              </span>
              <span className="text-lg font-semibold">
                {t.credits} {t.perDay}
              </span>
            </p>
            <p className="mt-2 text-white">{t.free.searches}</p>
          </div>
          <Perforation />
          <div className="flex flex-col justify-between gap-6 p-6 sm:w-64 sm:p-7">
            <Price value={0} currency={currency} numberLocale={numberLocale} />
            <PassLink href={webappUrl} className="bg-accent text-text-black hover:bg-accent-dark">
              {t.free.cta}
            </PassLink>
          </div>
        </li>

        {packs.map((p, i) => {
          const name = t.packs[i]?.name ?? p.id;
          const perSearch = p.price[currency] / (p.credits / CREDITS_PER_SEARCH);
          return (
            <li
              key={p.id}
              data-pass
              className="relative flex overflow-hidden rounded-2xl bg-card-white ring-1 ring-black/5 max-sm:flex-col dark:bg-card-black dark:ring-white/10"
            >
              <div className="flex-1 p-6 sm:p-7">
                <p className="text-xs font-bold tracking-[0.14em] text-text-muted uppercase dark:text-text-subtitles">
                  {t.boarding} · {t.class} {name}
                </p>
                <p className="mt-5 flex items-baseline gap-2">
                  <span className="tabular text-6xl font-extrabold tracking-[-0.04em]">
                    {p.credits}
                  </span>
                  <span className="text-lg font-semibold">{t.credits}</span>
                </p>
                <p className="mt-2 text-text-muted dark:text-text-subtitles">
                  {p.searches} {t.searches}
                </p>
              </div>
              <Perforation />
              <div className="flex flex-col justify-between gap-6 p-6 sm:w-64 sm:p-7">
                <div>
                  <Price
                    value={p.price[currency]}
                    currency={currency}
                    numberLocale={numberLocale}
                  />
                  <p className="tabular mt-2 text-sm text-text-muted dark:text-text-subtitles">
                    {currencySymbol[currency]} {formatPrice(perSearch, numberLocale)} {t.perSearch}
                  </p>
                </div>
                <PassLink
                  href={webappUrl}
                  className="bg-text-black text-text-white hover:bg-primary dark:bg-card-white dark:text-text-black dark:hover:bg-primary-soft"
                >
                  {t.packCta}
                </PassLink>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
