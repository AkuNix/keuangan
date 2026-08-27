import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  LogOut, Plus, Edit2, Trash2, Search, X, BookOpen, LayoutDashboard, List
} from 'lucide-react';

/* ── Palette derived from CSS variables (inline fallbacks for Recharts) ── */
const C = {
  paper:     '#F7F5F0',
  paperDark: '#EDEADE',
  rule:      '#DDD9CF',
  ink:       '#1A1A2E',
  inkMid:    '#4A4A6A',
  inkFaint:  '#9898B8',
  green:     '#00875A',
  greenBg:   '#E6F5F0',
  greenMid:  '#00663F',
  red:       '#C0392B',
  redBg:     '#FCECEA',
  accent:    '#2C5F8A',
  accentBg:  '#EAF1F8',
};

const CAT_COLORS = [C.green, C.accent, '#B8860B', C.red, '#6B4F9E', '#1B7A8A', '#7A4A2E'];

const formatIDR = (num) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

const formatShort = (num) => {
  if (Math.abs(num) >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'M';
  if (Math.abs(num) >= 1_000_000)     return (num / 1_000_000).toFixed(1) + 'jt';
  if (Math.abs(num) >= 1_000)         return (num / 1_000).toFixed(0) + 'rb';
  return num;
};

const CATEGORIES = {
  INCOME:  ['Gaji', 'Investasi', 'Freelance', 'Hadiah', 'Lain-lain'],
  EXPENSE: ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lain-lain'],
};

/* ── Compact balance bar at top ── */
function BalanceBar({ stats }) {
  const savingsRate = stats.totalIncome > 0
    ? Math.round(((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100)
    : 0;
  const expensePct = stats.totalIncome > 0
    ? Math.min(100, Math.round((stats.totalExpense / stats.totalIncome) * 100))
    : 0;

  return (
    <div style={{ borderBottom: `1px solid ${C.rule}`, background: C.paper }}
         className="px-8 py-5 flex flex-col sm:flex-row sm:items-end gap-6">

      {/* Saldo */}
      <div className="flex-1">
        <p style={{ color: C.inkFaint, fontFamily: 'var(--font-sans)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
          Saldo Sekarang
        </p>
        <p className="font-ledger" style={{ fontSize: 36, fontWeight: 500, color: stats.balance >= 0 ? C.ink : C.red, lineHeight: 1 }}>
          {formatIDR(stats.balance)}
        </p>
      </div>

      {/* Pemasukan */}
      <div style={{ minWidth: 130 }}>
        <p style={{ color: C.inkFaint, fontFamily: 'var(--font-sans)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>
          Pemasukan
        </p>
        <p className="font-ledger" style={{ fontSize: 20, fontWeight: 500, color: C.greenMid }}>
          +{formatIDR(stats.totalIncome)}
        </p>
      </div>

      {/* Pengeluaran */}
      <div style={{ minWidth: 130 }}>
        <p style={{ color: C.inkFaint, fontFamily: 'var(--font-sans)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>
          Pengeluaran
        </p>
        <p className="font-ledger" style={{ fontSize: 20, fontWeight: 500, color: C.red }}>
          −{formatIDR(stats.totalExpense)}
        </p>
      </div>

      {/* Savings rate bar */}
      <div style={{ minWidth: 160 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <p style={{ color: C.inkFaint, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Rasio Hemat</p>
          <p className="font-ledger" style={{ fontSize: 10, color: savingsRate >= 0 ? C.greenMid : C.red }}>
            {savingsRate}%
          </p>
        </div>
        <div style={{ height: 4, background: C.rule, borderRadius: 2, overflow: 'hidden' }}>
          {/* transform: scaleX avoids layout thrash vs animating width */}
          <div style={{
            height: '100%',
            width: '100%',
            background: expensePct > 85 ? C.red : expensePct > 60 ? '#B8860B' : C.green,
            borderRadius: 2,
            transformOrigin: 'left center',
            transform: `scaleX(${expensePct / 100})`,
            transition: 'transform 0.6s ease',
          }} />
        </div>
      </div>
    </div>
  );
}

/* ── Custom Tooltip for charts ── */
function LedgerTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.ink, border: 'none', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: C.paper }}>
      <p style={{ marginBottom: 6, color: C.inkFaint, fontSize: 10, letterSpacing: '0.06em' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ margin: '2px 0', color: p.dataKey === 'income' ? '#6EE7B7' : '#FCA5A5' }}>
          {p.name}: {formatIDR(p.value)}
        </p>
      ))}
    </div>
  );
}

/* ── Main Dashboard ── */
export default function Dashboard({ user, onLogout }) {
  const [transactions, setTransactions]   = useState([]);
  const [stats, setStats]                 = useState({ totalIncome: 0, totalExpense: 0, balance: 0, categoryBreakdown: [], monthlyTrend: [] });
  const [view, setView]                   = useState('dashboard'); // 'dashboard' | 'ledger'
  const [showModal, setShowModal]         = useState(false);
  const [editingTx, setEditingTx]         = useState(null);
  const [search, setSearch]               = useState('');
  const [typeFilter, setTypeFilter]       = useState('ALL');

  // Form
  const [fType, setFType]           = useState('EXPENSE');
  const [fAmount, setFAmount]       = useState('');
  const [fCategory, setFCategory]   = useState('Makanan');
  const [fDesc, setFDesc]           = useState('');
  const [fDate, setFDate]           = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [txData, statsData] = await Promise.all([api.getTransactions(), api.getDashboardStats()]);
      setTransactions(txData);
      setStats(statsData);
    } catch (e) { console.error(e); }
  };

  const openAdd = () => {
    setEditingTx(null); setFType('EXPENSE'); setFAmount(''); setFCategory('Makanan');
    setFDesc(''); setFDate(new Date().toISOString().slice(0, 10)); setShowModal(true);
  };

  const openEdit = (tx) => {
    setEditingTx(tx); setFType(tx.type); setFAmount(tx.amount.toString());
    setFCategory(tx.category); setFDesc(tx.description || '');
    setFDate(new Date(tx.date).toISOString().slice(0, 10)); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { type: fType, amount: parseFloat(fAmount), category: fCategory, description: fDesc, date: new Date(fDate).toISOString() };
    try {
      if (editingTx) await api.updateTransaction(editingTx.id, payload);
      else await api.addTransaction(payload);
      setShowModal(false); fetchData();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus transaksi ini?')) return;
    try { await api.deleteTransaction(id); fetchData(); }
    catch (err) { alert(err.message); }
  };

  const filtered = transactions.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.description?.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    const matchType   = typeFilter === 'ALL' || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';

  /* ── Sidebar nav item ── */
  const NavBtn = ({ id, icon: Icon, label }) => {
    const active = view === id;
    return (
      <button onClick={() => setView(id)} title={label} style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        padding: '12px 0', width: '100%', border: 'none', background: 'none',
        color: active ? C.green : C.inkFaint,
        borderLeft: active ? `3px solid ${C.green}` : '3px solid transparent',
        cursor: 'pointer', transition: 'all 0.15s',
      }}>
        <Icon size={18} />
        <span style={{ fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)' }}>{label}</span>
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.paper, fontFamily: 'var(--font-sans)' }}>

      {/* ── Left Sidebar (binder spine) ── */}
      <aside style={{
        width: 64, flexShrink: 0,
        background: C.paperDark,
        borderRight: `1px solid ${C.rule}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: 20, paddingBottom: 20,
        position: 'sticky', top: 0, height: '100vh',
        zIndex: 30,
      }}>
        {/* Brand mark */}
        <div style={{ marginBottom: 24, color: C.ink }}>
          <BookOpen size={22} strokeWidth={1.5} />
        </div>
        <div style={{ width: '100%', flexGrow: 1 }}>
          <NavBtn id="dashboard" icon={LayoutDashboard} label="Grafik" />
          <NavBtn id="ledger"    icon={List}            label="Buku Kas" />
        </div>
        {/* User + logout at bottom */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: C.accentBg, color: C.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
            border: `1px solid ${C.accent}30`,
          }} title={user?.name}>
            {initials}
          </div>
          <button onClick={onLogout} title="Keluar" style={{
            border: 'none', background: 'none', color: C.inkFaint,
            cursor: 'pointer', padding: 4, borderRadius: 4,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = C.red}
          onMouseLeave={e => e.currentTarget.style.color = C.inkFaint}>
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{ flex: 1, overflow: 'auto' }}>

        {/* ── Top header ── */}
        <header style={{
          borderBottom: `1px solid ${C.rule}`,
          padding: '0 32px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: C.paper, position: 'sticky', top: 0, zIndex: 20,
        }}>
          <div>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 15, color: C.ink, letterSpacing: '-0.02em' }}>
              KeuanganKu
            </span>
            <span style={{ marginLeft: 12, fontFamily: 'var(--font-sans)', fontSize: 11, color: C.inkFaint, letterSpacing: '0.04em' }}>
              {view === 'dashboard' ? 'Ringkasan' : 'Buku Kas'}
            </span>
          </div>
          <button onClick={openAdd} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px',
            background: C.ink, color: C.paper,
            border: 'none', borderRadius: 6,
            fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', letterSpacing: '0.01em',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = C.inkMid}
          onMouseLeave={e => e.currentTarget.style.background = C.ink}>
            <Plus size={14} />
            Catat Transaksi
          </button>
        </header>

        {/* ── Balance Bar ── */}
        <BalanceBar stats={stats} />

        {/* ── View: Dashboard ── */}
        {view === 'dashboard' && (
          <div style={{ padding: '32px 32px 64px' }}>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, marginBottom: 32 }}>

              {/* Bar chart */}
              <div style={{ border: `1px solid ${C.rule}`, borderRadius: 8, padding: 24, background: C.paper }}>
                <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.inkFaint, marginBottom: 20, fontWeight: 600 }}>
                  Arus Kas Bulanan
                </p>
                {stats.monthlyTrend.length > 0 ? (
                  <div style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.monthlyTrend} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barGap={3}>
                        <CartesianGrid strokeDasharray="none" horizontal stroke={C.rule} vertical={false} />
                        <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: C.inkFaint }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: C.inkFaint }} tickLine={false} axisLine={false} tickFormatter={formatShort} />
                        <Tooltip content={<LedgerTooltip />} cursor={{ fill: `${C.ink}06` }} />
                        <Bar dataKey="income"  name="Pemasukan"   fill={C.green} radius={[3,3,0,0]} maxBarSize={28} />
                        <Bar dataKey="expense" name="Pengeluaran" fill={C.red}   radius={[3,3,0,0]} maxBarSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.inkFaint, fontSize: 12 }}>
                    Belum ada data — catat transaksi pertama Anda
                  </div>
                )}
                <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                  {[['Pemasukan', C.green], ['Pengeluaran', C.red]].map(([label, color]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: C.inkMid }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Donut + category list */}
              <div style={{ border: `1px solid ${C.rule}`, borderRadius: 8, padding: 24, background: C.paper }}>
                <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.inkFaint, marginBottom: 20, fontWeight: 600 }}>
                  Alokasi Pengeluaran
                </p>
                {stats.categoryBreakdown.length > 0 ? (
                  <>
                    <div style={{ height: 160 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stats.categoryBreakdown} innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value" strokeWidth={0}>
                            {stats.categoryBreakdown.map((_, i) => (
                              <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => [formatIDR(v)]} contentStyle={{ background: C.ink, border: 'none', borderRadius: 6, color: C.paper, fontFamily: 'var(--font-mono)', fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {stats.categoryBreakdown.slice(0, 5).map((item, i) => {
                        const pct = stats.totalExpense > 0 ? Math.round((item.value / stats.totalExpense) * 100) : 0;
                        return (
                          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[i % CAT_COLORS.length], flexShrink: 0 }} />
                            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: C.inkMid, flex: 1 }}>{item.name}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: C.ink }}>{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.inkFaint, fontSize: 12, textAlign: 'center' }}>
                    Belum ada data pengeluaran
                  </div>
                )}
              </div>
            </div>

            {/* Recent transactions preview */}
            <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.inkFaint, marginBottom: 12, fontWeight: 600 }}>
              5 Transaksi Terakhir
            </p>
            <div style={{ border: `1px solid ${C.rule}`, borderRadius: 8, overflow: 'hidden' }}>
              <TransactionTable
                rows={transactions.slice(0, 5)}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            </div>
            {transactions.length > 5 && (
              <button onClick={() => setView('ledger')} style={{ marginTop: 12, background: 'none', border: 'none', color: C.accent, fontFamily: 'var(--font-sans)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                Lihat semua {transactions.length} transaksi →
              </button>
            )}
          </div>
        )}

        {/* ── View: Ledger ── */}
        {view === 'ledger' && (
          <div style={{ padding: '24px 32px 64px' }}>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.inkFaint, pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                    background: C.paper, border: `1px solid ${C.rule}`, borderRadius: 6,
                    fontFamily: 'var(--font-sans)', fontSize: 12, color: C.ink,
                    outline: 'none',
                  }}
                />
              </div>
              {['ALL', 'INCOME', 'EXPENSE'].map(f => (
                <button key={f} onClick={() => setTypeFilter(f)} style={{
                  padding: '7px 14px', borderRadius: 6, border: `1px solid ${typeFilter === f ? C.ink : C.rule}`,
                  background: typeFilter === f ? C.ink : 'transparent',
                  color: typeFilter === f ? C.paper : C.inkMid,
                  fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                  { f === 'ALL' ? 'Semua' : f === 'INCOME' ? 'Pemasukan' : 'Pengeluaran' }
                </button>
              ))}
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: C.inkFaint }}>
                {filtered.length} baris
              </span>
            </div>

            <div style={{ border: `1px solid ${C.rule}`, borderRadius: 8, overflow: 'hidden' }}>
              <TransactionTable rows={filtered} onEdit={openEdit} onDelete={handleDelete} />
            </div>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: 16,
        }}>
          <div style={{ background: C.paper, borderRadius: 10, width: '100%', maxWidth: 420, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>

            {/* Modal header */}
            <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, color: C.ink }}>
                  {editingTx ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: C.inkFaint, marginTop: 2 }}>
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: C.inkFaint, cursor: 'pointer', padding: 4, borderRadius: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = C.ink}
                onMouseLeave={e => e.currentTarget.style.color = C.inkFaint}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Type toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 4, background: C.paperDark, borderRadius: 7, border: `1px solid ${C.rule}` }}>
                {['INCOME', 'EXPENSE'].map(t => (
                  <button key={t} type="button" onClick={() => { setFType(t); setFCategory(CATEGORIES[t][0]); }}
                    style={{
                      padding: '9px 0', borderRadius: 5, border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12,
                      background: fType === t ? C.paper : 'transparent',
                      color: fType === t ? (t === 'INCOME' ? C.greenMid : C.red) : C.inkFaint,
                      boxShadow: fType === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s',
                    }}>
                    {t === 'INCOME' ? '+ Pemasukan' : '− Pengeluaran'}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <ModalField label="Jumlah">
                <div style={{ position: 'relative' }}>
                  <span className="font-ledger" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.inkFaint, fontSize: 13, pointerEvents: 'none' }}>Rp</span>
                  <input type="number" required min="1" placeholder="0" value={fAmount} onChange={e => setFAmount(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 36, fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 500, color: fType === 'INCOME' ? C.greenMid : C.red }} />
                </div>
              </ModalField>

              {/* Category + Date side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <ModalField label="Kategori">
                  <select value={fCategory} onChange={e => setFCategory(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {CATEGORIES[fType].map(c => <option key={c}>{c}</option>)}
                  </select>
                </ModalField>
                <ModalField label="Tanggal">
                  <input type="date" required value={fDate} onChange={e => setFDate(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                </ModalField>
              </div>

              {/* Description */}
              <ModalField label="Keterangan">
                <input type="text" placeholder="Belanja beras, bayar listrik, gaji bulan ini…" value={fDesc} onChange={e => setFDesc(e.target.value)} style={inputStyle} />
              </ModalField>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4, paddingTop: 16, borderTop: `1px solid ${C.rule}` }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px 0', borderRadius: 6, border: `1px solid ${C.rule}`, background: 'transparent', color: C.inkMid, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  Batal
                </button>
                <button type="submit" style={{ flex: 2, padding: '10px 0', borderRadius: 6, border: 'none', background: C.ink, color: C.paper, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: '0.01em' }}>
                  {editingTx ? 'Simpan Perubahan' : 'Catat Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Shared input style ── */
const inputStyle = {
  width: '100%', padding: '9px 12px',
  background: '#fff', border: `1px solid #DDD9CF`,
  borderRadius: 6, fontFamily: 'var(--font-sans)', fontSize: 13, color: '#1A1A2E',
  outline: 'none', transition: 'border-color 0.15s',
  boxSizing: 'border-box',
};

/* ── ModalField wrapper ── */
function ModalField({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9898B8', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Transaction Table (shared between dashboard preview + full ledger) ── */
function TransactionTable({ rows, onEdit, onDelete }) {
  if (!rows.length) return (
    <div style={{ padding: '48px 24px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 13, color: '#9898B8' }}>
      Belum ada transaksi tercatat
    </div>
  );

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)' }}>
      <thead>
        <tr style={{ background: '#EDEADE' }}>
          {['Tanggal', 'Keterangan', 'Kategori', 'Jumlah', ''].map(h => (
            <th key={h} style={{ padding: '10px 16px', textAlign: h === 'Jumlah' || h === '' ? 'right' : 'left', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9898B8', whiteSpace: 'nowrap' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((tx, i) => (
          <tr key={tx.id} style={{ borderTop: '1px solid #DDD9CF', background: i % 2 === 0 ? '#F7F5F0' : '#F3F0EA' }}
            onMouseEnter={e => e.currentTarget.style.background = '#EAF1F8'}
            onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#F7F5F0' : '#F3F0EA'}>

            <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9898B8' }}>
                {new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </td>

            <td style={{ padding: '11px 16px', maxWidth: 220 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#1A1A2E', fontWeight: 500 }}>
                {tx.description || <em style={{ color: '#9898B8', fontWeight: 400 }}>Tanpa keterangan</em>}
              </span>
            </td>

            <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
              <span style={{
                display: 'inline-block', padding: '2px 9px',
                background: tx.type === 'INCOME' ? '#E6F5F0' : '#F7F5F0',
                color: tx.type === 'INCOME' ? '#00663F' : '#4A4A6A',
                border: `1px solid ${tx.type === 'INCOME' ? '#A7DBC8' : '#DDD9CF'}`,
                borderRadius: 4, fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
              }}>
                {tx.category}
              </span>
            </td>

            <td style={{ padding: '11px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
                color: tx.type === 'INCOME' ? '#00663F' : '#C0392B',
                letterSpacing: '-0.02em',
              }}>
                {tx.type === 'INCOME' ? '+' : '−'}{formatIDR(tx.amount)}
              </span>
            </td>

            <td style={{ padding: '11px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={() => onEdit(tx)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9898B8', padding: 2, borderRadius: 3, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#2C5F8A'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9898B8'}>
                  <Edit2 size={13} />
                </button>
                <button onClick={() => onDelete(tx.id)} title="Hapus" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9898B8', padding: 2, borderRadius: 3, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#C0392B'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9898B8'}>
                  <Trash2 size={13} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
