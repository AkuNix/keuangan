# AGENTS.md — KeuanganKu

## Architecture

Three-component monorepo:

- `api/` — Vercel serverless (Express + serverless-http)
- `server/` — Express API for local dev only (port 5000)
- `client/` — React 19 + Vite 8 + Tailwind v4 (port 5173)

Deploy: Vercel auto-deploys on push to `main`. Database: Neon PostgreSQL.

## Critical Gotchas

1. **Prisma schema exists in TWO places** — `server/prisma/schema.prisma` (source of truth) and `api/prisma/schema.prisma` (copy). After editing either, you MUST keep both in sync or Vercel build will fail.

2. **After changing schema**, run `npx prisma db push` from `server/` to apply to Neon.

3. **Tailwind v4** uses `@tailwindcss/vite` plugin (NOT PostCSS). Dark mode: `@custom-variant dark (&:where(.dark, .dark *));` in `index.css`.

4. **Dark mode** toggled via `ThemeProvider` adding `.dark` class to `<html>`. Persisted in `localStorage`.

5. **`useTheme.js` must be `useTheme.jsx`** — contains JSX syntax.

6. **`server/` is local-only.** Production runs `api/index.js`. Do not change `server/src/index.js` without also updating `api/index.js`.

## Page Routing

`Dashboard.jsx` is the single-page app shell. All sub-pages (`savings`, `settings`, `profile`) render **inside** `PageShell` — never as standalone pages. Each sub-page receives `onNavigate={setView}` prop for sidebar navigation.

## Commands

```bash
# Local dev
cd server && npm run dev          # API on port 5000
cd client && npm run dev          # Vite on port 5173

# Schema
cd server && npx prisma db push   # apply schema to Neon
cd server && npx prisma studio    # visual DB browser

# Build
cd client && npm run build        # production build
```

## API Routes

Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/profile`, `PUT /api/auth/password`
Transactions: `GET/POST /api/transactions`, `PUT/DELETE /api/transactions/:id`
Savings: `GET/POST /api/savings`, `PUT/DELETE /api/savings/:id`, `POST /api/savings/:id/deposit`
Stats: `GET /api/dashboard/stats`

Token: `Authorization: Bearer <jwt>`

## Frontend Structure

- `client/src/api.js` — centralized fetch, auto-attaches JWT
- `client/src/hooks/useTheme.jsx` — dark/light mode
- `client/src/hooks/useClock.js` — live clock
- `client/src/lib/utils.js` — `cn()`, `formatIDR()`, `getInitials()`
- `client/src/lib/animations.js` — Framer Motion variants
- `client/src/components/ui/` — Button, Input, Select, Card, Badge, Modal
- `client/src/components/dashboard/` — BalanceHero, StatCardsGrid, ChartsArea, TransactionTable, FilterBar, etc.
- `client/src/components/savings/` — SavingsGoalCard, SavingsModal, DepositModal
- `client/src/components/layout/` — PageShell, Sidebar, Topbar

## Design System

CSS variables in `index.css` (`--color-canvas`, `--color-ink`, `--color-accent`, etc.). Fonts: DM Sans (body), JetBrains Mono (data). Charts use hardcoded hex values (Recharts can't read CSS vars).

## Auto-logging

`.git/hooks/post-commit` auto-appends commits to `CHANGELOG.md`.
