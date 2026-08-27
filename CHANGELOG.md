# Changelog — KeuanganKu

Semua perubahan penting pada proyek ini akan dicatat secara otomatis di file ini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

---

## [1.4.0] - 2026-08-27

### Added
- Profil page terpisah (gradient header, avatar inisial, form edit nama, info akun)
- Settings page (ganti password + strength indicator, info aplikasi)
- Savings goals (CRUD + deposit + progress tracking)
- 4 chart baru: Savings trend, Top categories, Monthly trend, Category breakdown
- Transaksi Baru button di header + mobile FAB
- Live clock di topbar

### Fixed
- Sidebar navigasi tidak bisa klik di halaman Savings/Settings
- Sidebar layout tidak tampil di desktop (tersembunyi oleh Framer Motion x:-100%)
- DeleteConfirmModal crash saat transaction null
- Topbar notification tidak bisa diklik
- Topbar user menu hover tidak works di mobile
- Mobile FAB tersembunyi (dipindah ke luar PageShell overflow)
- Fake account text "Akun Utama •••• 1234" dihapus
- Hardcoded notification badge "3" dihapus

### Changed
- Dark/Light mode diaktifkan di semua komponen UI
- Topbar: glass morphism backdrop-blur
- Sidebar: sticky di desktop, slide-in only di mobile
- Profil dan Settings dipisah menjadi halaman berbeda

---

## [1.3.0] - 2026-08-27

### Added
- Dark mode system (ThemeContext + provider)
- Theme toggle di topbar dan login page
- Live clock hook (useClock)
- Framer Motion animations
- Tailwind CSS v4 upgrade
- Vite 8 upgrade

### Fixed
- useTheme.js renamed to useTheme.jsx (JSX syntax)

---

## [1.2.0] - 2026-08-27

### Added
- Mobile responsive sidebar
- Modal keyboard support (Escape to close)
- Submit loading spinner
- Pagination on transactions

---

## [1.1.0] - 2026-08-27

### Added
- Rate limiting on auth endpoints
- Password server-side validation
- Input sanitization
- DB indexes (userId, type, date)

---

## [1.0.0] - 2026-08-27

### Added
- Initial release
- User authentication (register/login)
- Transaction CRUD
- Dashboard stats & charts
- JWT authorization
- PostgreSQL database with Prisma ORM
- Vercel serverless deployment

---

## Auto-generated Log

<!-- Log ini di-update otomatis oleh git post-commit hook -->
<!-- Format: [Tanggal Jam] - Commit message (hash) -->

- [2026-08-27 17:45] - feat: separate Profile and Settings into dedicated pages (db33fd6)
- [2026-08-27 17:42] - fix: sidebar navigation broken on sub-pages + redesign Settings (78e1b31)
- [2026-08-27 17:38] - fix: remove fake account text, fix notification badge, fix mobile FAB (20b2094)
- [2026-08-27 17:35] - feat: savings goals, settings, new charts (a7b6d1c)
- [2026-08-27 17:30] - fix: sidebar layout broken on desktop (fcf70b3)
- [2026-08-27 17:25] - fix: null crash + dark mode (c3ea33e)
- [2026-08-27 17:20] - feat: transaksi baru button + fix menus (4992e17)
