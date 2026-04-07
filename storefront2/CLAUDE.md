# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

Under Armour Brasil Store — headless e-commerce platform reconstructing a Shopify Evolution v5.0 theme. Next.js 16 storefront + Express 4 backend + admin panel + Chrome extension for review/product importing.

## Architecture

- **Storefront**: Next.js 16.2.1, React 19, Tailwind 4, App Router with SSG + ISR
- **Backend**: Express 4 (`../backend/server.js`, single file ~1350 lines), Prisma 6, SQLite
- **Admin**: Embedded at `/admin/theme` (single page component ~2900 lines)
- **Auth**: JWT + bcrypt, `authenticate` middleware on `/store/customers/*` protected routes
- **Resilience**: Circuit breaker → LRU cache → stale cache → fallback JSON
- **Checkout**: Luna Checkout via webhook integration (15 event types)
- **i18n**: 3 locales (pt-BR, en, es), 3 currencies (BRL, USD, EUR)

## Build & Dev Commands

```bash
# Storefront (from storefront2/)
npm run dev          # Next.js dev server on :3000
npm run build        # Production build (runs prebuild → generate fallback data)
npm run lint         # ESLint
npm test             # Vitest unit tests (12 test files)
npm run test:watch   # Vitest watch mode
npx tsc --noEmit     # TypeScript check

# Backend (from backend/)
npm run dev          # Express server (PORT from .env, default 9000)
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to DB
node seed.js         # Seed demo data (6 products, 8 collections, demo customer)

# Full stack
docker compose up    # Both services via Docker
```

## Key Files

| File | Role |
|------|------|
| `src/app/admin/theme/page.tsx` | Entire admin panel (~2900 lines, needs refactor) |
| `src/lib/medusa-client.ts` | Resilient API client with circuit breaker, cache, retry |
| `src/lib/circuit-breaker.ts` | Circuit breaker state machine |
| `src/lib/cache/lru-cache.ts` | LRU cache with TTL and stale serving |
| `src/context/CartContext.tsx` | Cart state + offline queue |
| `src/context/LocaleContext.tsx` | i18n + multi-currency |
| `src/data/theme-config.json` | Theme configuration (colors, typography, sections) |
| `src/data/fallback-products.json` | Build-time fallback for offline resilience |
| `../backend/server.js` | All 55+ API endpoints in single file |
| `../backend/prisma/schema.prisma` | 20 Prisma models |

## API Pattern

The storefront communicates with the backend through `resilientFetch<T>()` in `medusa-client.ts`. Every API call goes through:

1. Circuit breaker check (if open, serve from cache)
2. Fetch with 5s timeout + 1 retry on 5xx
3. Success → cache result in LRU
4. Failure → serve from cache → stale cache → null

API functions return `FetchResult<T>` with `{ data, source, degraded, error }`.

## Backend Endpoints

- `/store/*` — Public storefront API (products, collections, cart, checkout, auth, newsletter, contact)
- `/admin/*` — Admin API (CRUD for products, collections, orders, customers, coupons, shipping, redirects, importers) **Note: currently no auth on admin endpoints**
- `/webhooks/luna` — Luna Checkout webhook handler (15 event types)
- `/health` — Health check

## Theme System

Theme config lives in `src/data/theme-config.json`. The admin visual editor reads/writes this file through `src/lib/theme-config.ts`. `ThemeStyles` component injects CSS variables at runtime.

## Testing

- Storefront: Vitest with jsdom, tests in `src/__tests__/`
- Backend: Integration tests in `__tests__/api.test.js` (92 tests)
- No E2E tests yet

## Known Issues

- Admin panel is a monolithic 2900-line component — needs splitting
- Backend server.js is a monolithic 1350-line file — needs splitting
- Admin endpoints lack authentication
- Product page grid not responsive (`1fr 1fr` hardcoded)
- No `not-found.tsx`, `error.tsx`, or `loading.tsx` global error pages

## Environment

```
NEXT_PUBLIC_MEDUSA_BACKEND_URL  # Backend URL (default http://localhost:9000)
NEXT_PUBLIC_SITE_URL            # Site URL (default http://localhost:3000)
THEME_ADMIN_PASSWORD            # Admin panel password
REVALIDATION_SECRET             # ISR revalidation secret
```

## Conventions

- All UI text in Portuguese (pt-BR) by default
- Monetary values stored in centavos (integer)
- Product handles are URL slugs
- Components use folder structure: `src/components/ComponentName/index.tsx`
- Admin components: `src/components/admin/ComponentName.tsx`
- Inline styles used heavily (no CSS modules) — Tailwind for utilities only
