# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro 5 (SSG, islands) + TypeScript + Tailwind CSS v4 + GSAP/ScrollTrigger + Lenis, React 19 only for interactive islands, deployed on Vercel. Source of truth: `docs/navby-website-documentation.md`. Confirmed by the user ("construye como se tenía contemplado").

## Users

Spanish-speaking (and global) independent travelers aged 20–55: pragmatic leisure travelers, digital nomads, family trip planners and freelancers who buy their own tickets. They arrive tired of comparing 10–15 tabs and of prices that rise at checkout.

## Product Purpose

Navby is a web app (by Andeva) that recommends the best flight at the best price by evaluating price, layovers and duration together, quoting live market fares and linking directly to the airline. The website exists to turn visitors into webapp users: click "Planificar vuelo" or register to unlock 10 free daily credits.

## Positioning

Not a list of 150 results sorted by one extreme: one curated recommendation that balances price, stops and speed, with zero added commissions and a direct link to the official seller.

## Capabilities and Constraints

- One-way and round-trip searches only (no complex multi-city).
- 10 free credits per day (renewed every 24h); a full search costs 5 credits → 2 free searches/day.
- Prepaid, non-expiring packs via Mercado Pago: 50 credits $2.49 USD / S/ 9.90; 100 credits $4.49 USD / S/ 16.90; 250 credits $8.99 USD / S/ 34.90. No subscriptions.
- 3,000+ airports covered; 0% commission on fares.
- Route shown on a flat 2D map in the webapp.
- Open: the production webapp URL (set via `PUBLIC_WEBAPP_URL`).

## Brand Commitments

- Slogan: «El mejor vuelo. Al mejor precio.»
- Palette, Albert Sans, Raptor V3 isologo and logo files in `docs/design-system.md` and `docs/branding/`.
- Voice: trustworthy, pragmatic, close; concise sentences; Swiss-minimalist hierarchy.
- Forbidden words in copy: nodos, vértices, aristas, OpenFlights, FlightAPI, Dijkstra, BFS, A-Star, programación dinámica, complejidad asintótica, "el más barato vs el más rápido", proyecto de cátedra.
- Hero (pinned by the user): frontal airplane approaching, headline «El mejor vuelo. Al mejor precio.», CTA to plan the next flight.
- References chosen by the user: integratedbio.com (motion), open-design.ai/es (product narrative structure), evernote.com/es-es (product imagery that assembles in motion).

## Evidence on Hand

- Logos, icon, fonts: `docs/branding/`.
- Copy, objections, glossary, pricing: `docs/product-marketing.md`.
- Hero plane: `avion.png` (600×398 placeholder; final 4K asset to be generated with Nano Banana).
- No real testimonials, customer logos, press or usage metrics exist (pre-launch). Do not fabricate them; product screenshots are illustrative and labeled as such.

## Product Principles

1. Recommend, don't list: the page shows one answer, not a wall of options.
2. Honest price: every number shown is either real (pricing) or labeled illustrative.
3. Respect the visitor's time: the action is always one click away.
4. Clarity over jargon: never expose internal engineering vocabulary.

## Accessibility & Inclusion

WCAG 2.1 AA, skip link, visible focus, full `prefers-reduced-motion` support for GSAP and Lenis, ES/EN routes.
