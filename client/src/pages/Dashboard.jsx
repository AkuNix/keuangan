import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  LogOut, Plus, Edit2, Trash2, Search, X, BookOpen, LayoutDashboard, List, Menu,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const C = {
  canvas:    '#f8fafc',
  surface:   '#ffffff',
  surface2:  '#f8fafc',
  panel:     '#0f172a',
  panel2:    '#111827',
  rule:      '#e2e8f0',
  ruleSoft:  '#f1f5f9',
  ink:       '#0f172a',
  inkMid:    '#334155',
  inkFaint:  '#64748b',
  inkSoft:   '#94a3b8',
  green:     '#059669',
  greenBg:   '#ecfdf5',
  greenMid:  '#047857',
  red:       '#e11d48',
  redBg:     '#fff1f2',
  accent:    '#4f46e5',
  accentBg:  '#eef2ff',
  brandBg:   '#eef2ff',
  amber:     '#d97706',
  shadow:    'rgba(15, 23, 42, 0.08)',
};

const CAT_COLORS = ['#4f46e5', '#059669', '#f59e0b', '#e11d48', '#8b5cf6', '#06b6d4', '#7c3aed'];

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

/* ── Balance Summary ── */
function BalanceBar({ stats }) {
  const savingsRate = stats.totalIncome > 0
    ? Math.round(((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100)
    : 0;
  const expensePct = stats.totalIncome > 0
    ? Math.min(100, Math.round((stats.totalExpense / stats.totalIncome) * 100))
    : 0;

  return (
    <section className="balance-bar" style={{
      background: C.panel,
      borderRadius: 20,
      padding: '24px 28px',
      color: '#fff',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left: Balance */}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saldo</div>
          <p className="font-ledger balance-val" style={{ color: '#fff', margin: 0 }}>
            {formatIDR(stats.balance)}
          </p>
        </div>

        {/* Middle: Income / Expense */}
        <div style={{ display: 'flex', gap: 16, minWidth: 0 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pemasukan</div>
            <div className="font-ledger" style={{ fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: 700, color: '#34d399', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              +{formatIDR(stats.totalIncome)}
            </div>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pengeluaran</div>
            <div className="font-ledger" style={{ fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: 700, color: '#f87171', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              -{formatIDR(stats.totalExpense)}
            </div>
          </div>
        </div>

        {/* Right: Savings rate */}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rasio hemat</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="font-ledger" style={{ fontSize: 20, fontWeight: 700, color: savingsRate >= 0 ? '#34d399' : '#f87171' }}>{savingsRate}%</span>
            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: '100%',
                background: expensePct > 85 ? '#f87171' : expensePct > 60 ? '#fbbf24' : '#34d399',
                borderRadius: 99,
                transformOrigin: 'left',
                transform: `scaleX(${expensePct / 100})`,
                transition: 'transform 0.6s ease',
              }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Chart Tooltip ── */
function LedgerTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 12,
      padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: C.ink,
      boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
    }}>
      <p style={{ marginBottom: 6, color: C.inkFaint, fontSize: 10, fontWeight: 700, letterSpacing: '0.04em' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ margin: '2px 0', color: p.dataKey === 'income' ? C.greenMid : C.red }}>
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
    const handleEsc = (e) => { if (e.key === 'Escape') setShowModal(false); };
    if (showModal) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [showModal]);

  const fetchData = async () => {
    try {
      const [txData, statsData] = await Promise.all([api.getTransactions(1, 200), api.getDashboardStats()]);
      setTransactions(txData.data || txData);
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

  /* ── Sidebar nav item ── */
  const NavBtn = ({ id, icon: Icon, label }) => {
    const active = view === id;
    return (
      <button onClick={() => { setView(id); setSidebarOpen(false); }} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px', width: '100%', border: 'none',
        background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
        color: active ? '#fff' : 'rgba(255,255,255,0.5)',
        borderRadius: 12, fontSize: 13, fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.15s ease',
        textAlign: 'left',
      }}>
        <Icon size={18} strokeWidth={active ? 2 : 1.5} />
        {label}
      </button>
    );
  };

  return (
    <div className="dashboard-shell" style={{ display: 'flex', minHeight: '100vh', background: C.canvas, fontFamily: 'var(--font-sans)', color: C.ink }}>

      {/* ── Sidebar overlay ── */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 29 }}
        className="mobile-overlay" />}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, color: '#fff' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }}>
            <BookOpen size={18} strokeWidth={1.7} />
          </div>
          <div style={{ overflow: 'hidden', minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>KeuanganKu</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Finance tracker</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <NavBtn id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavBtn id="ledger" icon={List} label="Buku Kas" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', marginBottom: 8, minWidth: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'rgba(255,255,255,0.1)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
        </div>

        <button onClick={onLogout} style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.4)',
          cursor: 'pointer', padding: '10px 12px', borderRadius: 10,
          fontSize: 13, fontWeight: 600, transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
          <LogOut size={16} />
          Keluar
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="dashboard-main" style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>

        {/* ── Topbar ── */}
        <header className="dashboard-topbar" style={{
          borderBottom: `1px solid ${C.rule}`,
          padding: '0 24px', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: C.surface, position: 'sticky', top: 0, zIndex: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
              display: 'none', border: `1px solid ${C.rule}`, background: '#fff', color: C.ink,
              cursor: 'pointer', padding: 8, borderRadius: 10,
            }} className="mobile-menu-btn">
              <Menu size={18} />
            </button>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.ink, letterSpacing: '-0.01em' }}>
                {view === 'dashboard' ? 'Dashboard' : 'Buku Kas'}
              </div>
            </div>
          </div>
          <button onClick={openAdd} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', background: C.accent, color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'background 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#4338ca'}
          onMouseLeave={e => e.currentTarget.style.background = C.accent}>
            <Plus size={15} strokeWidth={2.5} />
            <span className="hide-mobile">Tambah</span>
          </button>
        </header>

        {/* ── Content ── */}
        <div style={{ padding: '20px 24px 64px', maxWidth: 1200, margin: '0 auto' }}>

          {/* ── Balance Bar ── */}
          <BalanceBar stats={stats} />

          {view === 'dashboard' && (
            <>
              {/* ── Charts ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: 16, marginTop: 20 }}>

                {/* Bar chart */}
                <div style={{ border: `1px solid ${C.rule}`, borderRadius: 16, padding: 20, background: C.surface, overflow: 'hidden' }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>Arus kas bulanan</div>
                    <div style={{ marginTop: 4, fontSize: 12, color: C.inkFaint }}>Pemasukan vs pengeluaran</div>
                  </div>
                  {stats.monthlyTrend.length > 0 ? (
                    <div style={{ height: 240 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.monthlyTrend} margin={{ top: 4, right: 0, left: -20, bottom: 0 }} barGap={4}>
                          <CartesianGrid strokeDasharray="none" horizontal stroke={C.ruleSoft} vertical={false} />
                          <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: C.inkFaint }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: C.inkFaint }} tickLine={false} axisLine={false} tickFormatter={formatShort} />
                          <Tooltip content={<LedgerTooltip />} cursor={{ fill: `${C.accent}06` }} />
                          <Bar dataKey="income"  name="Pemasukan"   fill={C.green} radius={[4,4,0,0]} maxBarSize={28} />
                          <Bar dataKey="expense" name="Pengeluaran" fill={C.red}   radius={[4,4,0,0]} maxBarSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.inkFaint, fontSize: 13, background: C.surface2, borderRadius: 12, border: `1px dashed ${C.rule}` }}>
                      Belum ada data bulan ini.
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
                    {[['Pemasukan', C.green], ['Pengeluaran', C.red]].map(([label, color]) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 99, background: color }} />
                        <span style={{ fontSize: 12, color: C.inkMid }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Donut */}
                <div style={{ border: `1px solid ${C.rule}`, borderRadius: 16, padding: 20, background: C.surface, overflow: 'hidden' }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>Pengeluaran per kategori</div>
                    <div style={{ marginTop: 4, fontSize: 12, color: C.inkFaint }}>Komposisi belanja</div>
                  </div>
                  {stats.categoryBreakdown.length > 0 ? (
                    <>
                      <div style={{ height: 140 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={stats.categoryBreakdown} innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value" strokeWidth={0}>
                              {stats.categoryBreakdown.map((_, i) => (
                                <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v) => [formatIDR(v)]} contentStyle={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 10, color: C.ink, fontFamily: 'var(--font-mono)', fontSize: 11 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {stats.categoryBreakdown.slice(0, 5).map((item, i) => {
                          const pct = stats.totalExpense > 0 ? Math.round((item.value / stats.totalExpense) * 100) : 0;
                          return (
                            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, background: C.surface2, minWidth: 0 }}>
                              <div style={{ width: 8, height: 8, borderRadius: 99, background: CAT_COLORS[i % CAT_COLORS.length], flexShrink: 0 }} />
                              <span style={{ fontSize: 12, color: C.inkMid, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: C.ink, fontWeight: 700, flexShrink: 0 }}>{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.inkFaint, fontSize: 13, background: C.surface2, borderRadius: 12, border: `1px dashed ${C.rule}` }}>
                      Belum ada pengeluaran.
                    </div>
                  )}
                </div>
              </div>

              {/* ── Recent Transactions ── */}
              <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>Transaksi terbaru</div>
                  {transactions.length > 5 && (
                    <button onClick={() => setView('ledger')} style={{ background: 'none', border: 'none', color: C.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Lihat semua
                    </button>
                  )}
                </div>
                <div style={{ border: `1px solid ${C.rule}`, borderRadius: 16, overflow: 'hidden', background: C.surface }}>
                  <TransactionTable rows={transactions.slice(0, 5)} onEdit={openEdit} onDelete={handleDelete} />
                </div>
              </div>
            </>
          )}

          {view === 'ledger' && (
            <>
              {/* ── Filters ── */}
              <div style={{ display: 'flex', gap: 10, marginTop: 20, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 320, minWidth: 0 }}>
                  <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.inkFaint, pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="Cari transaksi..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                      width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10,
                      background: C.surface, border: `1px solid ${C.rule}`, borderRadius: 10,
                      fontSize: 13, color: C.ink, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                {['ALL', 'INCOME', 'EXPENSE'].map(f => (
                  <button key={f} onClick={() => setTypeFilter(f)} style={{
                    padding: '9px 14px', borderRadius: 99, border: `1px solid ${typeFilter === f ? C.accent : C.rule}`,
                    background: typeFilter === f ? C.accent : C.surface,
                    color: typeFilter === f ? '#fff' : C.inkMid,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.15s', flexShrink: 0,
                  }}>
                    { f === 'ALL' ? 'Semua' : f === 'INCOME' ? 'Pemasukan' : 'Pengeluaran' }
                  </button>
                ))}
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, color: C.inkFaint, flexShrink: 0 }}>
                  {filtered.length} baris
                </span>
              </div>

              <div style={{ border: `1px solid ${C.rule}`, borderRadius: 16, overflow: 'hidden', background: C.surface }}>
                <TransactionTable rows={filtered} onEdit={openEdit} onDelete={handleDelete} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="dashboard-modal" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: 16,
        }}>
          <div className="dashboard-modal-card" style={{
            background: C.surface, borderRadius: 20, width: '100%', maxWidth: 440,
            overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, color: C.ink }}>
                  {editingTx ? 'Edit transaksi' : 'Transaksi baru'}
                </p>
                <p style={{ fontSize: 12, color: C.inkFaint, marginTop: 2 }}>
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: C.inkFaint, cursor: 'pointer', padding: 6, borderRadius: 8 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Type toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: 3, background: C.surface2, borderRadius: 12 }}>
                {['INCOME', 'EXPENSE'].map(t => (
                  <button key={t} type="button" onClick={() => { setFType(t); setFCategory(CATEGORIES[t][0]); }}
                    style={{
                      padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                      fontWeight: 700, fontSize: 13,
                      background: fType === t ? C.surface : 'transparent',
                      color: fType === t ? (t === 'INCOME' ? C.greenMid : C.red) : C.inkFaint,
                      boxShadow: fType === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease',
                    }}>
                    {t === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.inkMid, marginBottom: 6 }}>Jumlah</label>
                <div style={{ position: 'relative' }}>
                  <span className="font-ledger" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.inkFaint, fontSize: 13, pointerEvents: 'none' }}>Rp</span>
                  <input type="number" required min="1" placeholder="0" value={fAmount} onChange={e => setFAmount(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 38, fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: fType === 'INCOME' ? C.greenMid : C.red }} />
                </div>
              </div>

              {/* Category + Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="modal-grid">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.inkMid, marginBottom: 6 }}>Kategori</label>
                  <select value={fCategory} onChange={e => setFCategory(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {CATEGORIES[fType].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.inkMid, marginBottom: 6 }}>Tanggal</label>
                  <input type="date" required value={fDate} onChange={e => setFDate(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.inkMid, marginBottom: 6 }}>Keterangan</label>
                <input type="text" placeholder="Catatan singkat..." value={fDesc} onChange={e => setFDesc(e.target.value)} style={inputStyle} />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: `1px solid ${C.rule}`, background: C.surface, color: C.inkMid, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  Batal
                </button>
                <button type="submit" disabled={submitting} style={{
                  flex: 2, padding: '11px 0', borderRadius: 12, border: 'none',
                  background: submitting ? C.inkFaint : C.accent,
                  color: '#fff', fontWeight: 700, fontSize: 13,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
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

/* ── Input Style ── */
const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: '#fff', border: `1px solid ${C.rule}`,
  borderRadius: 10, fontSize: 13, color: C.ink,
  outline: 'none', transition: 'border-color 0.15s',
  boxSizing: 'border-box',
};

/* ── Transaction Table ── */
function TransactionTable({ rows, onEdit, onDelete }) {
  if (!rows.length) return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: C.brandBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
        <BookOpen size={18} color={C.accent} />
      </div>
      <p style={{ fontSize: 14, color: C.ink, fontWeight: 700, marginBottom: 4 }}>Belum ada transaksi</p>
      <p style={{ fontSize: 12, color: C.inkFaint }}>Mulai catat transaksi pertama Anda.</p>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <table className="desktop-tx-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: C.surface2 }}>
            {['Tanggal', 'Keterangan', 'Kategori', 'Jumlah', ''].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Jumlah' || h === '' ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: C.inkFaint, whiteSpace: 'nowrap', borderBottom: `1px solid ${C.rule}`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((tx) => (
            <tr key={tx.id} style={{ borderTop: `1px solid ${C.ruleSoft}` }}
              onMouseEnter={e => e.currentTarget.style.background = C.surface2}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: C.inkSoft }}>
                  {new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </td>

              <td style={{ padding: '12px 16px', maxWidth: 200 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                  {tx.description || <span style={{ color: C.inkSoft, fontWeight: 400, fontStyle: 'italic' }}>Tanpa keterangan</span>}
                </span>
              </td>

              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px',
                  background: tx.type === 'INCOME' ? C.greenBg : C.redBg,
                  color: tx.type === 'INCOME' ? C.greenMid : C.red,
                  borderRadius: 99, fontSize: 11, fontWeight: 700,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: 99, background: tx.type === 'INCOME' ? C.green : C.red }} />
                  {tx.category}
                </span>
              </td>

              <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                <span className="font-ledger" style={{ fontSize: 13, fontWeight: 700, color: tx.type === 'INCOME' ? C.greenMid : C.red }}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatIDR(tx.amount)}
                </span>
              </td>

              <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button onClick={() => onEdit(tx)} title="Edit" style={{ background: 'none', border: `1px solid ${C.rule}`, cursor: 'pointer', color: C.inkFaint, padding: 6, borderRadius: 8, transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = C.accent; e.currentTarget.style.borderColor = '#c7d2fe'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = C.inkFaint; e.currentTarget.style.borderColor = C.rule; }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => onDelete(tx.id)} title="Hapus" style={{ background: 'none', border: `1px solid ${C.rule}`, cursor: 'pointer', color: C.inkFaint, padding: 6, borderRadius: 8, transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = '#fecdd3'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = C.inkFaint; e.currentTarget.style.borderColor = C.rule; }}>
                    <Trash2 size={13} />
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
          <div key={tx.id} style={{
            padding: '14px 16px', borderBottom: `1px solid ${C.ruleSoft}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                display: 'grid', placeItems: 'center',
                background: tx.type === 'INCOME' ? C.greenBg : C.redBg,
              }}>
                {tx.type === 'INCOME'
                  ? <ArrowUpRight size={16} color={C.green} strokeWidth={2.5} />
                  : <ArrowDownRight size={16} color={C.red} strokeWidth={2.5} />
                }
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tx.description || 'Tanpa keterangan'}
                </div>
                <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                  {new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} &middot; {tx.category}
                </div>
              </div>

              <div className="font-ledger" style={{ fontSize: 13, fontWeight: 700, color: tx.type === 'INCOME' ? C.greenMid : C.red, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {tx.type === 'INCOME' ? '+' : '-'}{formatIDR(tx.amount)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingLeft: 48 }}>
              <button onClick={() => onEdit(tx)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                padding: '7px 0', borderRadius: 8, border: `1px solid ${C.rule}`,
                background: '#fff', color: C.inkFaint, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>
                <Edit2 size={11} /> Edit
              </button>
              <button onClick={() => onDelete(tx.id)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                padding: '7px 0', borderRadius: 8, border: `1px solid ${C.rule}`,
                background: '#fff', color: C.inkFaint, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>
                <Trash2 size={11} /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
