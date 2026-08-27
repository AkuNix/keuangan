# AGENTS.md — KeuanganKu

## Architecture

Monorepo with three components:

- `api/` — Vercel Serverless Function (Express wrapped with serverless-http)
- `server/` — Express API (Node, Prisma ORM, PostgreSQL) — for local dev
- `client/` — React SPA (Vite, Tailwind CSS v4, Recharts)

Production: deployed on **Vercel** (frontend + API serverless). Database on **Neon PostgreSQL**.
Local dev: Backend on port `5000`. Frontend dev server on `5173`. CORS is enabled; no proxy needed.

## Commands

### Local dev
```bash
cd server
npm install          # install deps
npm run dev          # start dev (nodemon, port 5000)
npx prisma db push   # push schema changes to Neon
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

**PostgreSQL** via Prisma on Neon (cloud).
Schema file: `server/prisma/schema.prisma` (source of truth) + `api/prisma/schema.prisma` (copy for Vercel build).

To push schema: `npx prisma db push` (from `server/` directory).

## API Endpoints

All routes prefixed `/api`:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account (rate limited) |
| POST | `/api/auth/login` | No | Login, returns JWT (rate limited) |
| GET | `/api/auth/me` | Bearer | Current user profile |
| GET | `/api/transactions` | Bearer | List user transactions (paginated) |
| POST | `/api/transactions` | Bearer | Create transaction |
| PUT | `/api/transactions/:id` | Bearer | Update transaction |
| DELETE | `/api/transactions/:id` | Bearer | Delete transaction |
| GET | `/api/dashboard/stats` | Bearer | Aggregated stats + charts (SQL) |

Token format: `Authorization: Bearer <jwt>`.

### Transactions Pagination
`GET /api/transactions?page=1&limit=50` returns:
```json
{ "data": [...], "pagination": { "page": 1, "limit": 50, "total": 120, "totalPages": 3 } }
```

## Frontend Architecture

- `client/src/api.js` — centralized fetch helper, auto-attaches JWT, handles 403 redirect
- `client/src/pages/Login.jsx` — auth page (split layout: dark brand panel + form)
- `client/src/pages/Dashboard.jsx` — main app (sidebar nav, balance bar, charts, ledger table, modal form)
- `client/src/index.css` — Tailwind v4 import + CSS custom properties for design tokens + mobile responsive

### Design System

Uses **custom CSS variables** (not Tailwind config). Tokens defined in `index.css`:
- `--paper` (#F7F5F0), `--ink` (#1A1A2E), `--green` (#00875A), `--red` (#C0392B)
- Fonts: Instrument Sans (body) + DM Mono (numbers/data)
- Utility class `.font-ledger` for tabular-nums monospace
- Inline styles used for component-level styling (not Tailwind utility classes)
- Charts use hardcoded color values matching CSS variables (Recharts doesn't read CSS vars)

### Data model

- `type` field on Transaction is a **String** ("INCOME" | "EXPENSE"), not an enum
- Categories are hardcoded arrays in frontend (`CATEGORIES` object in Dashboard.jsx)
- DB indexes on `userId`, `type`, `date`, and composite `userId+type`

## Security

- Rate limiting on `/api/auth/register` and `/api/auth/login` (20 req / 15 min)
- Password min 6 chars, max 128 chars (server-side validation)
- Email format validation (regex)
- Input sanitization (trim, max length) on all string fields
- Amount validation (positive, max 999999999999)
- JWT auto-redirect on 403 (expired token)

## Deployment

- **Vercel**: `vercel.json` configures build — installs `api/` + `client/`, generates Prisma client, builds Vite
- **Neon**: PostgreSQL database, connection string in Vercel env vars
- GitHub repo: `AkuNix/keuangan`

## Gotchas

- `server/` directory is for **local dev only**. Production uses `api/index.js` (serverless)
- `api/prisma/schema.prisma` is a **copy** of `server/prisma/schema.prisma` — keep both in sync
- Tailwind v4 uses `@tailwindcss/vite` plugin (NOT PostCSS). Config in `vite.config.js`
- Vercel free tier cold starts ~30s after idle

## Known Issues (Fixed)

- ~~`.env` JWT_SECRET risk~~ → `.env` in `.gitignore`
- ~~Rate limiting~~ → express-rate-limit added
- ~~Password validation~~ → server-side min 6 chars
- ~~Input sanitization~~ → trim + length checks
- ~~Dashboard stats fetch all~~ → SQL GROUP BY + aggregate
- ~~Loading screen old classes~~ → CSS variables
- ~~api.js hardcoded URL~~ → env var `VITE_API_URL`
- ~~JWT expiry handling~~ → 403 auto-redirect
- ~~No pagination~~ → offset pagination on transactions
- ~~No DB indexes~~ → indexes on userId, type, date
- ~~No mobile responsive~~ → sidebar collapse on small screens
- ~~No modal keyboard support~~ → Escape to close
- ~~No submit loading~~ → spinner on modal submit
