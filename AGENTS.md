# AGENTS.md — KeuanganKu

## Architecture

Two separate apps in a monorepo root:

- `server/` — Express API (Node, Prisma ORM, SQLite)
- `client/` — React SPA (Vite, Tailwind CSS v4, Recharts)

Backend runs on port `5000`. Frontend dev server on `5173`. CORS is enabled; no proxy needed.

## Commands

### server/
```bash
cd server
npm install          # install deps
npm run dev          # start dev (nodemon, port 5000)
npm run start        # production start
npx prisma db push   # push schema changes to SQLite dev.db
npx prisma studio    # visual DB browser
```

### client/
```bash
cd client
npm install          # install deps
npm run dev          # start Vite dev server (port 5173)
npm run build        # production build → dist/
npm run lint         # oxlint
npm run preview      # preview production build
```

## Database

**SQLite** via Prisma. DB file lives at `server/prisma/dev.db`.
Schema file: `server/prisma/schema.prisma`.

To reset DB: delete `server/prisma/dev.db` then run `npx prisma db push`.

⚠️ `.env` still says PostgreSQL URL but schema.prisma uses SQLite. Prisma reads `schema.prisma` `datasource` block directly. The `.env` DATABASE_URL is unused — ignore it.

## API Endpoints

All routes prefixed `/api`:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Bearer | Current user profile |
| GET | `/api/transactions` | Bearer | List user transactions |
| POST | `/api/transactions` | Bearer | Create transaction |
| PUT | `/api/transactions/:id` | Bearer | Update transaction |
| DELETE | `/api/transactions/:id` | Bearer | Delete transaction |
| GET | `/api/dashboard/stats` | Bearer | Aggregated stats + charts |

Token format: `Authorization: Bearer <jwt>`.

## Frontend Architecture

- `client/src/api.js` — centralized fetch helper, auto-attaches JWT from localStorage
- `client/src/pages/Login.jsx` — auth page (split layout: dark brand panel + form)
- `client/src/pages/Dashboard.jsx` — main app (sidebar nav, balance bar, charts, ledger table, modal form)
- `client/src/index.css` — Tailwind v4 import + CSS custom properties for design tokens

### Design System

Uses **custom CSS variables** (not Tailwind config). Tokens defined in `index.css`:
- `--paper` (#F7F5F0), `--ink` (#1A1A2E), `--green` (#00875A), `--red` (#C0392B)
- Fonts: Instrument Sans (body) + DM Mono (numbers/data)
- Utility class `.font-ledger` for tabular-nums monospace
- Inline styles used for component-level styling (not Tailwind utility classes)
- Charts use hardcoded color values matching CSS variables (Recharts doesn't read CSS vars)

### Data model

- `type` field on Transaction is a **String** ("INCOME" | "EXPENSE"), not an enum (SQLite doesn't support enums)
- Categories are hardcoded arrays in frontend (`CATEGORIES` object in Dashboard.jsx)
- Chart colors hardcoded in `CAT_COLORS` array in Dashboard.jsx

## Gotchas

- `npm run dev` in server uses nodemon; kill any running node processes before restarting if port 5000 is in use
- Tailwind v4 uses `@tailwindcss/vite` plugin (NOT PostCSS). Config in `vite.config.js`, not `postcss.config.js`
- No existing test suite, no CI, no linting config beyond oxlint
- `server/.env` JWT_SECRET is hardcoded and should not be committed to public repos

## Improvement Backlog

Prioritized issues found during code review. Pick any when ready to work on.

### Critical (Security)
- Add `.env` to `.gitignore` — JWT_SECRET currently at risk of being committed
- Add rate limiting to `/api/auth/login` (e.g. `express-rate-limit`)
- Add password min-length validation on server side (not just frontend)
- Sanitize/validate inputs on server (parseFloat, type checks)

### High
- `/api/dashboard/stats` fetches ALL transactions then sums in JS → use SQL GROUP BY + SUM instead
- Loading screen in `App.jsx` still uses `bg-gray-100 border-indigo-600` (old Tailwind classes) — should use `--paper`/`--ink` CSS variables to match design system
- `api.js` hardcodes `http://localhost:5000/api` — use env var or relative URL for production
- Add auto-redirect to login when JWT expires mid-session (intercept 403 responses)

### Medium
- Add pagination to `/api/transactions` endpoint
- Add database indexes on `userId`, `type`, `date` columns
- Mobile responsive: sidebar should collapse/hide on small viewports
- Add `.env.example` with documented variables

### Low (Polish)
- Add empty state illustration + CTA when no transactions exist
- Add loading spinner to modal submit button (prevent double-submit)
- Add keyboard support: Escape to close modal
- Bundle split Recharts (currently 597KB JS bundle)
