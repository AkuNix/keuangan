# DESIGN.md — KeuanganKu

## Visual World: Premium Fintech (Revolut/Stripe-grade Operate surface)

### Ground

| Token | Value | Role |
|---|---|---|
| Page ground | `bg-slate-50/50` (#f8fafc at 50% on white = near-white) | Canvas |
| Card surface | `bg-white` | Elevated panels |
| Hero card ground | `bg-slate-900` (#0f172a) | Primary account card |
| Topbar | `bg-white/80 backdrop-blur-md` | Sticky glass header |
| Border default | `border-slate-200/70` | Panel edge |
| Border hairline | `border-slate-100` | Table row dividers |
| Selection bg | `selection:bg-indigo-500` | Text selection |
| Selection fg | `selection:text-white` | Text selection contrast |

### Brand / Accent Palette

| Role | Class | Hex |
|---|---|---|
| Brand primary | `indigo-600` | #4f46e5 |
| Brand dark | `indigo-700` | #4338ca |
| Brand soft | `indigo-50` | #eef2ff |
| Income | `emerald-600` | #059669 |
| Income bg | `emerald-50` | #ecfdf5 |
| Income border | `emerald-100` | #d1fae5 |
| Expense | `rose-600` | #e11d48 |
| Expense bg | `rose-50` | #fff1f2 |
| Expense border | `rose-100` | #ffe4e6 |
| Chart accent 1 | `#6366f1` | Indigo |
| Chart accent 2 | `#10b981` | Emerald |
| Chart accent 3 | `#f59e0b` | Amber |
| Chart accent 4 | `#ef4444` | Red |
| Chart accent 5 | `#8b5cf6` | Violet |
| Chart accent 6 | `#ec4899` | Pink |
| Chart accent 7 | `#14b8a6` | Teal |

### Typography

| Layer | Size | Weight | Extras |
|---|---|---|---|
| Page brand wordmark | `text-lg` | `font-bold` | `tracking-tight text-slate-900` |
| Section header | `text-sm uppercase` | `font-bold` | `tracking-wider text-slate-400` (eyebrow-free — heading is the section) |
| Body / table | `text-xs` | `font-medium` | `text-slate-800` |
| Subtext / meta | `text-[10px]` or `text-xs` | `font-semibold` | `text-slate-400` |
| Numeric / monospaced | `font-mono` | `font-bold` or `font-black` | Tabular figures on all currency values |
| Hero balance | `text-3xl font-mono font-black` | — | White on `bg-slate-900` |
| Stat values | `text-2xl font-mono font-bold` | — | `text-slate-900` |

**Face**: System sans stack — `font-sans` (Tailwind default = system-ui, -apple-system, Segoe UI, sans-serif). Monospace stack — `font-mono` for all currency values, dates, and account masks.

### Elevation & Depth

- **Card default**: `shadow-sm` + `border border-slate-200/70` — border *or* shadow, never both heavy.
- **Hero account card**: `shadow-lg` + dark `bg-slate-900`. No border needed.
- **Topbar**: `border-b border-slate-200/60` + `backdrop-blur-md` glass effect.
- **Modal overlay**: `bg-slate-900/60 backdrop-blur-sm`. Modal card: `shadow-xl border border-slate-100`.
- **Radius**: `rounded-2xl` (16px) for cards; `rounded-xl` (12px) for inputs, buttons, badges; `rounded-lg` (8px) for icon containers and small controls; `rounded-full` for status pills.

### Spacing Rhythm

- Section gap: `gap-6` (24px) on grids.
- Card internal padding: `p-6` (24px).
- Table cell: `px-6 py-4` horizontal / `px-6 py-3` header.
- Filter bar: `px-6 py-4` with `gap-4` between controls.
- More space above section headings than below: achieved via `mb-2`/`mb-4` on description vs heading stacked pattern.

### Component Language

#### Topbar
Sticky, `z-40`, `h-16`, `max-w-7xl` content container. Left: wallet icon badge + wordmark. Right: user avatar (initials in `bg-indigo-50` circle) + logout button.

#### Account Hero Card (slate-900)
Full-width on mobile, 1-of-3 on lg grid. Decorative blur orbs (`blur-3xl`, `pointer-events-none`). Top row: "Akun Utama" label + animated pulse "Aktif" pill. Middle: balance in `font-mono font-black`. Bottom: masked account number + "Transaksi Baru" button.

#### Stat Cards (white)
2-column on lg grid. Top: uppercase label + icon in colored `bg-*-50` rounded box. Bottom: monospaced value + directional trend label in income/expense color.

#### Charts
- `BarChart`: `maxBarSize={32}`, `radius={[4,4,0,0]}`, vertical `CartesianGrid` off, `stroke="#f1f5f9"`. Tooltip: white bg, `border-slate-200`, `border-radius:12px`.
- `PieChart`: `innerRadius={55} outerRadius={75} paddingAngle={4}` donut. Legend as inline pill badges below chart.

#### Ledger Table
Full-width, `divide-y divide-slate-100`. Header: `text-[10px] font-bold text-slate-400 uppercase tracking-wider`. Rows: `hover:bg-slate-50/70 transition-colors`. Type badges: `rounded-full` pills with dot indicator. Category badges: `rounded-md bg-slate-100`. Currency: right-aligned `font-mono font-bold` in income/expense color with `+`/`-` prefix.

#### Filter Bar
`bg-slate-50/50 border-b border-slate-100`. Search: relative with `Search` icon inset. Selects: `bg-white border-slate-200 rounded-xl` with `Filter` icon prefix. Focus state: `focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`.

#### Transaction Modal
Full-screen overlay `bg-slate-900/60 backdrop-blur-sm`. Card: `bg-white rounded-2xl max-w-md`. Header bar: `bg-slate-900` with indigo label + slate subtext. Type switcher: segmented control — `bg-slate-100 rounded-xl` container, white active card with `shadow-sm`. Inputs: `bg-slate-50 border-slate-200 rounded-xl` with `Rp` prefix for amount. Action row: Cancel `border-slate-200` + Submit `bg-indigo-600`.

#### Buttons
- Primary: `bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm`
- Ghost/outline: `border border-slate-200 hover:bg-slate-50 text-slate-500 font-semibold rounded-xl`
- Logout: `bg-slate-100/85 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-lg`
- Inline icon action: `text-slate-400 hover:text-indigo-600` / `text-slate-400 hover:text-rose-600`

#### Login Page
Centered on `bg-slate-50` with two decorative `blur-3xl` orbs (indigo + emerald). Card: `rounded-3xl shadow-xl`. Banner: `bg-slate-900` with wallet icon in `bg-indigo-600/10` + blur accents. Inputs: same token as modal. Submit: `bg-indigo-600 shadow-md shadow-indigo-200/50`.

### Motion

- Transitions: `transition duration-150` to `transition duration-250` on interactive elements.
- Modal entrance: `animate-in fade-in zoom-in-95 duration-150` (Tailwind `tailwindcss-animate` or native).
- Status dot: `animate-pulse` on account "Aktif" indicator.
- No scattered entrance animations on every section — motion is purposeful and bounded.

### What this system refuses

- Gradient text (no `bg-clip-text text-transparent` on headings)
- Hard 4px offset box shadows
- Kicker/eyebrow labels above headings
- Same-size icon+heading+text cards as page structure
- Colored `border-left` above 1px on cards
- `glass` / blur as decoration outside topbar and modal overlay
