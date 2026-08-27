import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  LogOut, Plus, Edit2, Trash2, Search, X, BookOpen, LayoutDashboard, List, Menu,
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   Palette — warm neutrals, single accent, semantic colors
   ═══════════════════════════════════════════════════════ */
const C = {
  canvas:    '#f5f3ef',
  surface:   '#ffffff',
  surfaceDim:'#faf9f7',
  surfaceHov:'#f0efec',
  ink:       '#1a1a1a',
  ink2:      '#555555',
  ink3:      '#888888',
  border:    '#e5e5e5',
  accent:    '#4338ca',
  accentHov: '#3730a3',
  accentSoft:'#eef2ff',
  green:     '#16a34a',
  greenSoft: '#f0fdf4',
  red:       '#dc2626',
  redSoft:   '#fef2f2',
};

const CAT_COLORS = ['#4338ca', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d'];

const formatIDR = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatShort = (n) => {
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1) + 'M';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'jt';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(0) + 'rb';
  return n;
};

const CATEGORIES = {
  INCOME:  ['Gaji', 'Investasi', 'Freelance', 'Hadiah', 'Lain-lain'],
  EXPENSE: ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lain-lain'],
};

/* ═══════════════════════════════════════════════════════
   Balance Summary — clean horizontal strip
   ═══════════════════════════════════════════════════════ */
function BalanceBar({ stats }) {
  const savingsRate = stats.totalIncome > 0
    ? Math.round(((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100)
    : 0;

  return (
    <section className="balance-bar" style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 'var(--radius-md)',
      padding: '20px 24px',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, alignItems: 'center' }}>
        {/* Balance */}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: C.ink3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Saldo</div>
          <div className="font-tab" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {formatIDR(stats.balance)}
          </div>
        </div>

        {/* Income */}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: C.ink3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Pemasukan</div>
          <div className="font-tab" style={{ fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: 600, color: C.green, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            +{formatIDR(stats.totalIncome)}
          </div>
        </div>

        {/* Expense + Rate */}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: C.ink3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Pengeluaran</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="font-tab" style={{ fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: 600, color: C.red, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              -{formatIDR(stats.totalExpense)}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
              background: savingsRate >= 30 ? C.greenSoft : savingsRate >= 0 ? '#fffbeb' : C.redSoft,
              color: savingsRate >= 30 ? C.green : savingsRate >= 0 ? '#92400e' : C.red,
              flexShrink: 0,
            }}>
              {savingsRate}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   Tooltip
   ═══════════════════════════════════════════════════════ */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C.ink, color: '#fff', borderRadius: 'var(--radius-sm)',
      padding: '8px 12px', fontSize: 12, lineHeight: 1.5,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 11, opacity: 0.7 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ opacity: 0.8 }}>{p.name}</span>
          <span className="font-tab" style={{ fontWeight: 600 }}>{formatIDR(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Dashboard
   ═══════════════════════════════════════════════════════ */
export default function Dashboard({ user, onLogout }) {
  const [transactions, setTransactions]   = useState([]);
  const [stats, setStats]                 = useState({ totalIncome: 0, totalExpense: 0, balance: 0, categoryBreakdown: [], monthlyTrend: [] });
  const [view, setView]                   = useState('dashboard');
  const [showModal, setShowModal]         = useState(false);
  const [editingTx, setEditingTx]         = useState(null);
  const [search, setSearch]               = useState('');
  const [typeFilter, setTypeFilter]       = useState('ALL');
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  const [fType, setFType]           = useState('EXPENSE');
  const [fAmount, setFAmount]       = useState('');
  const [fCategory, setFCategory]   = useState('Makanan');
  const [fDesc, setFDesc]           = useState('');
  const [fDate, setFDate]           = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setShowModal(false); };
    if (showModal) { document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }
  }, [showModal]);

  const fetchData = async () => {
    try {
      const [tx, st] = await Promise.all([api.getTransactions(1, 200), api.getDashboardStats()]);
      setTransactions(tx.data || tx);
      setStats(st);
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
    setSubmitting(true);
    const payload = { type: fType, amount: parseFloat(fAmount), category: fCategory, description: fDesc, date: new Date(fDate).toISOString() };
    try {
      if (editingTx) await api.updateTransaction(editingTx.id, payload);
      else await api.addTransaction(payload);
      setShowModal(false); fetchData();
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
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

  const NavItem = ({ id, icon: Icon, label }) => {
    const active = view === id;
    return (
      <button onClick={() => { setView(id); setSidebarOpen(false); }} style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        padding: '8px 12px', border: 'none', borderRadius: 'var(--radius-sm)',
        background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
        color: active ? '#fff' : 'rgba(255,255,255,0.5)',
        fontSize: 13, fontWeight: 600, cursor: 'pointer',
        transition: 'background 0.12s, color 0.12s', textAlign: 'left',
      }}>
        <Icon size={16} strokeWidth={active ? 2 : 1.5} />
        {label}
      </button>
    );
  };

  return (
    <div className="dashboard-shell" style={{ display: 'flex', minHeight: '100vh', background: C.canvas, fontFamily: 'var(--font-body)', color: C.ink }}>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 29 }} className="mobile-overlay" />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', marginBottom: 24 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }}>
            <BookOpen size={14} color="#fff" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>KeuanganKu</span>
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="ledger" icon={List} label="Buku Kas" />
        </div>

        {/* User */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', marginBottom: 6, minWidth: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.12)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{
            display: 'flex', alignItems: 'center', gap: 6, width: '100%',
            padding: '8px', border: 'none', borderRadius: 'var(--radius-sm)',
            background: 'transparent', color: 'rgba(255,255,255,0.4)',
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
            <LogOut size={14} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="dashboard-main" style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>

        {/* Topbar */}
        <header className="dashboard-topbar" style={{
          borderBottom: `1px solid ${C.border}`,
          padding: '0 24px', height: 52,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: C.surface, position: 'sticky', top: 0, zIndex: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
              display: 'none', border: `1px solid ${C.border}`, background: C.surface, color: C.ink,
              cursor: 'pointer', padding: 6, borderRadius: 'var(--radius-sm)',
            }} className="mobile-menu-btn">
              <Menu size={16} />
            </button>
            <span style={{ fontWeight: 600, fontSize: 14, color: C.ink }}>
              {view === 'dashboard' ? 'Dashboard' : 'Buku Kas'}
            </span>
          </div>
          <button onClick={openAdd} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '7px 14px', background: C.accent, color: '#fff',
            border: 'none', borderRadius: 'var(--radius-sm)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'background 0.12s', flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = C.accentHov}
          onMouseLeave={e => e.currentTarget.style.background = C.accent}>
            <Plus size={14} strokeWidth={2.5} />
            <span className="hide-mobile">Tambah</span>
          </button>
        </header>

        {/* Content */}
        <div style={{ padding: '20px 24px 64px', maxWidth: 1100, margin: '0 auto' }}>

          <BalanceBar stats={stats} />

          {view === 'dashboard' && (
            <>
              {/* Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 16, marginTop: 16 }}>

                {/* Bar chart */}
                <div style={{ border: `1px solid ${C.border}`, borderRadius: 'var(--radius-md)', padding: 20, background: C.surface }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>Arus kas bulanan</div>
                  </div>
                  {stats.monthlyTrend.length > 0 ? (
                    <div style={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.monthlyTrend} margin={{ top: 4, right: 0, left: -20, bottom: 0 }} barGap={3}>
                          <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                          <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: C.ink3 }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: C.ink3 }} tickLine={false} axisLine={false} tickFormatter={formatShort} />
                          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                          <Bar dataKey="income"  name="Pemasukan"   fill={C.green} radius={[3,3,0,0]} maxBarSize={24} />
                          <Bar dataKey="expense" name="Pengeluaran" fill={C.red}   radius={[3,3,0,0]} maxBarSize={24} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.ink3, fontSize: 13, background: C.surfaceDim, borderRadius: 'var(--radius-sm)', border: `1px dashed ${C.border}` }}>
                      Belum ada data bulan ini.
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                    {[['Pemasukan', C.green], ['Pengeluaran', C.red]].map(([l, c]) => (
                      <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                        <span style={{ fontSize: 11, color: C.ink2 }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Donut */}
                <div style={{ border: `1px solid ${C.border}`, borderRadius: 'var(--radius-md)', padding: 20, background: C.surface }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>Per kategori</div>
                  </div>
                  {stats.categoryBreakdown.length > 0 ? (
                    <>
                      <div style={{ height: 130 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={stats.categoryBreakdown} innerRadius={40} outerRadius={58} paddingAngle={2} dataKey="value" strokeWidth={0}>
                              {stats.categoryBreakdown.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(v) => [formatIDR(v)]} contentStyle={{ background: C.ink, color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 12 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {stats.categoryBreakdown.slice(0, 5).map((item, i) => {
                          const pct = stats.totalExpense > 0 ? Math.round((item.value / stats.totalExpense) * 100) : 0;
                          return (
                            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderRadius: 4, minWidth: 0 }}>
                              <div style={{ width: 6, height: 6, borderRadius: 1, background: CAT_COLORS[i % CAT_COLORS.length], flexShrink: 0 }} />
                              <span style={{ fontSize: 11, color: C.ink2, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                              <span className="font-tab" style={{ fontSize: 11, color: C.ink, fontWeight: 600, flexShrink: 0 }}>{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.ink3, fontSize: 13, background: C.surfaceDim, borderRadius: 'var(--radius-sm)', border: `1px dashed ${C.border}` }}>
                      Belum ada pengeluaran.
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Transactions */}
              <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>Transaksi terbaru</span>
                  {transactions.length > 5 && (
                    <button onClick={() => setView('ledger')} style={{ background: 'none', border: 'none', color: C.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                      Lihat semua
                    </button>
                  )}
                </div>
                <div style={{ border: `1px solid ${C.border}`, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: C.surface }}>
                  <TransactionTable rows={transactions.slice(0, 5)} onEdit={openEdit} onDelete={handleDelete} />
                </div>
              </div>
            </>
          )}

          {view === 'ledger' && (
            <>
              <div style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300, minWidth: 0 }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.ink3, pointerEvents: 'none' }} />
                  <input type="text" placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} style={{
                    width: '100%', paddingLeft: 32, paddingRight: 10, paddingTop: 8, paddingBottom: 8,
                    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 'var(--radius-sm)',
                    fontSize: 13, color: C.ink, outline: 'none', boxSizing: 'border-box',
                  }} />
                </div>
                {['ALL', 'INCOME', 'EXPENSE'].map(f => (
                  <button key={f} onClick={() => setTypeFilter(f)} style={{
                    padding: '7px 12px', borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${typeFilter === f ? C.accent : C.border}`,
                    background: typeFilter === f ? C.accent : C.surface,
                    color: typeFilter === f ? '#fff' : C.ink2,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.12s', flexShrink: 0,
                  }}>
                    {f === 'ALL' ? 'Semua' : f === 'INCOME' ? 'Masuk' : 'Keluar'}
                  </button>
                ))}
                <span className="font-tab" style={{ marginLeft: 'auto', fontSize: 11, color: C.ink3, flexShrink: 0 }}>
                  {filtered.length} baris
                </span>
              </div>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: C.surface }}>
                <TransactionTable rows={filtered} onEdit={openEdit} onDelete={handleDelete} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="dashboard-modal" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: 16,
        }}>
          <div className="dashboard-modal-card" style={{
            background: C.surface, borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 420,
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: C.ink, margin: 0 }}>{editingTx ? 'Edit transaksi' : 'Transaksi baru'}</p>
                <p style={{ fontSize: 11, color: C.ink3, marginTop: 2, margin: '2px 0 0' }}>
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: C.ink3, cursor: 'pointer', padding: 4 }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Type toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 3, background: C.surfaceDim, borderRadius: 'var(--radius-sm)' }}>
                {['INCOME', 'EXPENSE'].map(t => (
                  <button key={t} type="button" onClick={() => { setFType(t); setFCategory(CATEGORIES[t][0]); }}
                    style={{
                      padding: '8px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
                      fontWeight: 600, fontSize: 12,
                      background: fType === t ? C.surface : 'transparent',
                      color: fType === t ? (t === 'INCOME' ? C.green : C.red) : C.ink3,
                      boxShadow: fType === t ? 'var(--shadow-sm)' : 'none',
                      transition: 'all 0.12s',
                    }}>
                    {t === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.ink2, marginBottom: 4 }}>Jumlah</label>
                <div style={{ position: 'relative' }}>
                  <span className="font-tab" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.ink3, fontSize: 12, pointerEvents: 'none' }}>Rp</span>
                  <input type="number" required min="1" placeholder="0" value={fAmount} onChange={e => setFAmount(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 32, fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: fType === 'INCOME' ? C.green : C.red }} />
                </div>
              </div>

              {/* Category + Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }} className="modal-grid">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.ink2, marginBottom: 4 }}>Kategori</label>
                  <select value={fCategory} onChange={e => setFCategory(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {CATEGORIES[fType].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.ink2, marginBottom: 4 }}>Tanggal</label>
                  <input type="date" required value={fDate} onChange={e => setFDate(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontSize: 11 }} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.ink2, marginBottom: 4 }}>Keterangan</label>
                <input type="text" placeholder="Catatan..." value={fDesc} onChange={e => setFDesc(e.target.value)} style={inputStyle} />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 'var(--radius-sm)', border: `1px solid ${C.border}`, background: C.surface, color: C.ink2, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  Batal
                </button>
                <button type="submit" disabled={submitting} style={{
                  flex: 2, padding: '9px 0', borderRadius: 'var(--radius-sm)', border: 'none',
                  background: submitting ? C.ink3 : C.accent,
                  color: '#fff', fontWeight: 700, fontSize: 13,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.5 : 1,
                }}>
                  {submitting ? 'Menyimpan...' : editingTx ? 'Simpan' : 'Catat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Input ─── */
const inputStyle = {
  width: '100%', padding: '8px 12px',
  background: C.surface, border: `1px solid ${C.border}`,
  borderRadius: 'var(--radius-sm)', fontSize: 13, color: C.ink,
  outline: 'none', transition: 'border-color 0.12s',
  boxSizing: 'border-box',
};

/* ─── Transaction Table ─── */
function TransactionTable({ rows, onEdit, onDelete }) {
  if (!rows.length) return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <BookOpen size={20} color={C.ink3} style={{ marginBottom: 8 }} />
      <p style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 2 }}>Belum ada transaksi</p>
      <p style={{ fontSize: 12, color: C.ink3 }}>Mulai catat transaksi pertama Anda.</p>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <table className="desktop-tx-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: C.surfaceDim }}>
            {['Tanggal', 'Keterangan', 'Kategori', 'Jumlah', ''].map(h => (
              <th key={h} style={{
                padding: '10px 14px',
                textAlign: h === 'Jumlah' || h === '' ? 'right' : 'left',
                fontSize: 11, fontWeight: 600, color: C.ink3,
                textTransform: 'uppercase', letterSpacing: '0.04em',
                borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((tx) => (
            <tr key={tx.id} style={{ borderBottom: `1px solid ${C.border}` }}
              onMouseEnter={e => e.currentTarget.style.background = C.surfaceDim}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                <span className="font-tab" style={{ fontSize: 11, color: C.ink3 }}>
                  {new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </td>

              <td style={{ padding: '10px 14px', maxWidth: 180 }}>
                <span style={{ fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                  {tx.description || <span style={{ color: C.ink3, fontWeight: 400, fontStyle: 'italic' }}>Tanpa keterangan</span>}
                </span>
              </td>

              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px',
                  background: tx.type === 'INCOME' ? C.greenSoft : C.redSoft,
                  color: tx.type === 'INCOME' ? C.green : C.red,
                  borderRadius: 4, fontSize: 11, fontWeight: 600,
                }}>
                  {tx.category}
                </span>
              </td>

              <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                <span className="font-tab" style={{ fontSize: 13, fontWeight: 600, color: tx.type === 'INCOME' ? C.green : C.red }}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatIDR(tx.amount)}
                </span>
              </td>

              <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <button onClick={() => onEdit(tx)} title="Edit" style={{ background: 'none', border: `1px solid ${C.border}`, cursor: 'pointer', color: C.ink3, padding: 5, borderRadius: 6, transition: 'color 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = C.accent; e.currentTarget.style.borderColor = C.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.color = C.ink3; e.currentTarget.style.borderColor = C.border; }}>
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => onDelete(tx.id)} title="Hapus" style={{ background: 'none', border: `1px solid ${C.border}`, cursor: 'pointer', color: C.ink3, padding: 5, borderRadius: 6, transition: 'color 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = C.red; }}
                    onMouseLeave={e => { e.currentTarget.style.color = C.ink3; e.currentTarget.style.borderColor = C.border; }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Cards */}
      <div className="mobile-tx-list">
        {rows.map((tx) => (
          <div key={tx.id} style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                display: 'grid', placeItems: 'center',
                background: tx.type === 'INCOME' ? C.greenSoft : C.redSoft,
              }}>
                {tx.type === 'INCOME'
                  ? <ArrowUpRight size={14} color={C.green} strokeWidth={2.5} />
                  : <ArrowDownRight size={14} color={C.red} strokeWidth={2.5} />
                }
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tx.description || 'Tanpa keterangan'}
                </div>
                <div style={{ fontSize: 11, color: C.ink3, marginTop: 1, fontFamily: 'var(--font-mono)' }}>
                  {new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} · {tx.category}
                </div>
              </div>

              <div className="font-tab" style={{ fontSize: 13, fontWeight: 600, color: tx.type === 'INCOME' ? C.green : C.red, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {tx.type === 'INCOME' ? '+' : '-'}{formatIDR(tx.amount)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 8, paddingLeft: 42 }}>
              <button onClick={() => onEdit(tx)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                padding: '6px 0', borderRadius: 6, border: `1px solid ${C.border}`,
                background: C.surface, color: C.ink3, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>
                <Edit2 size={10} /> Edit
              </button>
              <button onClick={() => onDelete(tx.id)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                padding: '6px 0', borderRadius: 6, border: `1px solid ${C.border}`,
                background: C.surface, color: C.ink3, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>
                <Trash2 size={10} /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
