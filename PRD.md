# PRODUCT REQUIREMENT DOCUMENT (PRD)

## Proyek: Sistem Keuangan Multi-User
**Stack:** React Vite, Tailwind CSS, Recharts, Node.js (Express), PostgreSQL, Prisma ORM.

### 1. TUJUAN
Menyediakan platform pencatatan keuangan personal yang aman, modern, dan interaktif bagi banyak pengguna (multi-user). Pengguna dapat mencatat pemasukan dan pengeluaran secara real-time dan melihat analisis visual keuangan mereka melalui grafik yang interaktif.

### 2. FITUR UTAMA
*   **Autentikasi & Keamanan:** Registrasi & Login dengan password hashing (bcrypt) dan session berbasis JWT (dikirim via header Bearer Token).
*   **Manajemen Transaksi (CRUD):** Tambah, lihat, edit, dan hapus transaksi (Pemasukan/Pengeluaran) per pengguna dengan atribut: jumlah, kategori, tanggal, deskripsi.
*   **Dashboard Visual:** Ringkasan Saldo, Total Pemasukan, Total Pengeluaran, serta grafik persentase kategori (Pie Chart) dan tren bulanan (Bar Chart) menggunakan Recharts.

### 3. SKEMA DATABASE
*   `User`: id, name, email, password, createdAt
*   `Transaction`: id, userId, type (INCOME/EXPENSE), amount, category, description, date, createdAt
