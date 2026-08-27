const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
}));
app.use(express.json({ limit: '1mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token missing' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const sanitize = (str) => typeof str === 'string' ? str.trim().slice(0, 500) : '';

app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  const cleanName = sanitize(name);
  const cleanEmail = sanitize(email).toLowerCase();
  if (cleanName.length < 2) {
    return res.status(400).json({ error: 'Nama minimal 2 karakter' });
  }
  if (!validateEmail(cleanEmail)) {
    return res.status(400).json({ error: 'Format email tidak valid' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }
  if (password.length > 128) {
    return res.status(400).json({ error: 'Password maksimal 128 karakter' });
  }
  try {
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) return res.status(400).json({ error: 'Email sudah terdaftar' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name: cleanName, email: cleanEmail, password: hashedPassword }
    });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }
  const cleanEmail = sanitize(email).toLowerCase();
  if (!validateEmail(cleanEmail)) {
    return res.status(400).json({ error: 'Format email tidak valid' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Email atau password salah' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: req.user.id },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({
        where: { userId: req.user.id },
      }),
    ]);
    res.json({
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
  const { type, amount, category, description, date } = req.body;
  if (!type || amount === undefined || !category || !date) {
    return res.status(400).json({ error: 'Type, amount, category dan date wajib diisi' });
  }
  if (type !== 'INCOME' && type !== 'EXPENSE') {
    return res.status(400).json({ error: 'Type harus INCOME atau EXPENSE' });
  }
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Jumlah harus lebih dari 0' });
  }
  if (parsedAmount > 999999999999) {
    return res.status(400).json({ error: 'Jumlah terlalu besar' });
  }
  const cleanCategory = sanitize(category);
  const cleanDesc = sanitize(description || '');
  if (cleanCategory.length < 1 || cleanCategory.length > 100) {
    return res.status(400).json({ error: 'Kategori tidak valid' });
  }
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ error: 'Format tanggal tidak valid' });
  }
  try {
    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user.id,
        type,
        amount: parsedAmount,
        category: cleanCategory,
        description: cleanDesc || null,
        date: parsedDate
      }
    });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

app.put('/api/transactions/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { type, amount, category, description, date } = req.body;
  const txId = parseInt(id);
  if (isNaN(txId)) {
    return res.status(400).json({ error: 'ID tidak valid' });
  }
  try {
    const existing = await prisma.transaction.findUnique({ where: { id: txId } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }
    const updateData = {};
    if (type !== undefined) {
      if (type !== 'INCOME' && type !== 'EXPENSE') {
        return res.status(400).json({ error: 'Type harus INCOME atau EXPENSE' });
      }
      updateData.type = type;
    }
    if (amount !== undefined) {
      const parsed = parseFloat(amount);
      if (isNaN(parsed) || parsed <= 0) {
        return res.status(400).json({ error: 'Jumlah harus lebih dari 0' });
      }
      updateData.amount = parsed;
    }
    if (category !== undefined) {
      const clean = sanitize(category);
      if (clean.length < 1 || clean.length > 100) {
        return res.status(400).json({ error: 'Kategori tidak valid' });
      }
      updateData.category = clean;
    }
    if (description !== undefined) {
      updateData.description = sanitize(description) || null;
    }
    if (date !== undefined) {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ error: 'Format tanggal tidak valid' });
      }
      updateData.date = parsed;
    }
    const updated = await prisma.transaction.update({
      where: { id: txId },
      data: updateData
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const txId = parseInt(id);
  if (isNaN(txId)) {
    return res.status(400).json({ error: 'ID tidak valid' });
  }
  try {
    const existing = await prisma.transaction.findUnique({ where: { id: txId } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }
    await prisma.transaction.delete({ where: { id: txId } });
    res.json({ message: 'Transaksi berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [incomeAgg, expenseAgg, categoryBreakdown, monthlyRaw] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: 'INCOME' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ['category'],
        where: { userId, type: 'EXPENSE' },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
      }),
      prisma.$queryRaw`
        SELECT
          TO_CHAR(date, 'YYYY-MM') AS month,
          SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END)::float AS income,
          SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END)::float AS expense
        FROM "Transaction"
        WHERE "userId" = ${userId}
        GROUP BY TO_CHAR(date, 'YYYY-MM')
        ORDER BY month ASC
      `,
    ]);

    const totalIncome = incomeAgg._sum.amount || 0;
    const totalExpense = expenseAgg._sum.amount || 0;

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categoryBreakdown: categoryBreakdown.map(c => ({
        name: c.category,
        value: c._sum.amount || 0,
      })),
      monthlyTrend: monthlyRaw.map(m => ({
        month: m.month,
        income: Number(m.income),
        expense: Number(m.expense),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

module.exports = app;
module.exports.handler = serverless(app);
