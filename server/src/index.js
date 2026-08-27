const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
}));
app.use(express.json());

// Auth Middleware
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

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transaction Routes
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
  const { type, amount, category, description, date } = req.body;
  if (!type || amount === undefined || !category || !date) {
    return res.status(400).json({ error: 'Type, amount, category and date are required' });
  }
  if (type !== 'INCOME' && type !== 'EXPENSE') {
    return res.status(400).json({ error: 'Type must be INCOME or EXPENSE' });
  }
  try {
    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user.id,
        type,
        amount: parseFloat(amount),
        category,
        description,
        date: new Date(date)
      }
    });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/transactions/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { type, amount, category, description, date } = req.body;
  try {
    const existing = await prisma.transaction.findUnique({ where: { id: parseInt(id) } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const updated = await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: {
        type: type !== undefined ? type : existing.type,
        amount: amount !== undefined ? parseFloat(amount) : existing.amount,
        category: category !== undefined ? category : existing.category,
        description: description !== undefined ? description : existing.description,
        date: date !== undefined ? new Date(date) : existing.date
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.transaction.findUnique({ where: { id: parseInt(id) } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await prisma.transaction.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard Stats Route
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'asc' }
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap = {};
    const monthlyMap = {};

    transactions.forEach(t => {
      if (t.type === 'INCOME') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      }

      // Group by Year-Month (e.g. "2026-08")
      const monthStr = t.date.toISOString().substring(0, 7);
      if (!monthlyMap[monthStr]) {
        monthlyMap[monthStr] = { month: monthStr, income: 0, expense: 0 };
      }
      if (t.type === 'INCOME') {
        monthlyMap[monthStr].income += t.amount;
      } else {
        monthlyMap[monthStr].expense += t.amount;
      }
    });

    const categoryBreakdown = Object.keys(categoryMap).map(cat => ({
      name: cat,
      value: categoryMap[cat]
    }));

    const monthlyTrend = Object.values(monthlyMap);

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categoryBreakdown,
      monthlyTrend
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
