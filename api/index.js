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

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin === 'http://localhost:5173' ||
      origin === process.env.CLIENT_URL ||
      /^https:\/\/.*\.vercel\.app$/i.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
};

app.use(cors(corsOptions));
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

// Profile Routes
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nama wajib diisi' });
  }
  const cleanName = sanitize(name);
  if (cleanName.length < 2) {
    return res.status(400).json({ error: 'Nama minimal 2 karakter' });
  }
  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: cleanName }
    });
    res.json({ id: updated.id, name: updated.name, email: updated.email });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

app.put('/api/auth/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Password lama dan baru wajib diisi' });
  }
  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
  }
  if (newPassword.length > 128) {
    return res.status(400).json({ error: 'Password baru maksimal 128 karakter' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ error: 'Password lama salah' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Savings Routes
app.get('/api/savings', authenticateToken, async (req, res) => {
  try {
    const goals = await prisma.savingGoal.findMany({
      where: { userId: req.user.id },
      include: { deposits: { orderBy: { date: 'desc' } } },
      orderBy: { createdAt: 'desc' }
    });
    const result = goals.map(g => ({
      ...g,
      totalSaved: g.deposits.reduce((sum, d) => sum + d.amount, 0)
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

app.post('/api/savings', authenticateToken, async (req, res) => {
  const { name, targetAmount, deadline } = req.body;
  if (!name || !targetAmount) {
    return res.status(400).json({ error: 'Nama dan target wajib diisi' });
  }
  const cleanName = sanitize(name);
  const parsedTarget = parseFloat(targetAmount);
  if (cleanName.length < 1 || cleanName.length > 200) {
    return res.status(400).json({ error: 'Nama goal tidak valid' });
  }
  if (isNaN(parsedTarget) || parsedTarget <= 0) {
    return res.status(400).json({ error: 'Target harus lebih dari 0' });
  }
  try {
    const goal = await prisma.savingGoal.create({
      data: {
        userId: req.user.id,
        name: cleanName,
        targetAmount: parsedTarget,
        deadline: deadline ? new Date(deadline) : null
      }
    });
    res.status(201).json({ ...goal, totalSaved: 0, deposits: [] });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

app.put('/api/savings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, targetAmount, deadline } = req.body;
  const goalId = parseInt(id);
  if (isNaN(goalId)) {
    return res.status(400).json({ error: 'ID tidak valid' });
  }
  try {
    const existing = await prisma.savingGoal.findUnique({ where: { id: goalId } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Goal tidak ditemukan' });
    }
    const updateData = {};
    if (name !== undefined) {
      const clean = sanitize(name);
      if (clean.length < 1 || clean.length > 200) {
        return res.status(400).json({ error: 'Nama goal tidak valid' });
      }
      updateData.name = clean;
    }
    if (targetAmount !== undefined) {
      const parsed = parseFloat(targetAmount);
      if (isNaN(parsed) || parsed <= 0) {
        return res.status(400).json({ error: 'Target harus lebih dari 0' });
      }
      updateData.targetAmount = parsed;
    }
    if (deadline !== undefined) {
      updateData.deadline = deadline ? new Date(deadline) : null;
    }
    const updated = await prisma.savingGoal.update({ where: { id: goalId }, data: updateData });
    const deposits = await prisma.savingDeposit.findMany({ where: { goalId } });
    res.json({ ...updated, totalSaved: deposits.reduce((sum, d) => sum + d.amount, 0), deposits });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

app.delete('/api/savings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const goalId = parseInt(id);
  if (isNaN(goalId)) {
    return res.status(400).json({ error: 'ID tidak valid' });
  }
  try {
    const existing = await prisma.savingGoal.findUnique({ where: { id: goalId } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Goal tidak ditemukan' });
    }
    await prisma.savingGoal.delete({ where: { id: goalId } });
    res.json({ message: 'Goal berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

app.post('/api/savings/:id/deposit', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { amount, note } = req.body;
  const goalId = parseInt(id);
  if (isNaN(goalId)) {
    return res.status(400).json({ error: 'ID tidak valid' });
  }
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Jumlah harus lebih dari 0' });
  }
  if (parsedAmount > 999999999999) {
    return res.status(400).json({ error: 'Jumlah terlalu besar' });
  }
  try {
    const existing = await prisma.savingGoal.findUnique({ where: { id: goalId } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Goal tidak ditemukan' });
    }
    const deposit = await prisma.savingDeposit.create({
      data: {
        goalId,
        amount: parsedAmount,
        note: sanitize(note) || null
      }
    });
    const deposits = await prisma.savingDeposit.findMany({ where: { goalId } });
    res.status(201).json({
      deposit,
      totalSaved: deposits.reduce((sum, d) => sum + d.amount, 0)
    });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

module.exports = app;
module.exports.handler = serverless(app);
