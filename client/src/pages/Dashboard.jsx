import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  LogOut, Plus, Edit2, Trash2, Search, X, BookOpen, LayoutDashboard, List, Menu
} from 'lucide-react';

/* ── Palette derived from CSS variables (inline fallbacks for Recharts) ── */
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
  shadow:    'rgba(15, 23, 42, 0.12)',
};

const CAT_COLORS = [C.accent, C.green, '#f59e0b', C.red, '#8b5cf6', '#06b6d4', '#7c3aed'];

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
    <section style={{
      background: `linear-gradient(135deg, ${C.panel} 0%, ${C.panel2} 100%)`,
      borderRadius: 28,
      padding: 28,
      color: '#fff',
      boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: -28, right: -10, width: 180, height: 180, borderRadius: '50%', background: 'rgba(79,70,229,0.18)', filter: 'blur(14px)' }} />
        <div style={{ position: 'absolute', bottom: -36, left: -24, width: 220, height: 220, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', filter: 'blur(18px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)', gap: 20, alignItems: 'stretch' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 18 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: 'rgba(255,255,255,0.72)' }}>
              Ringkasan hari ini
            </div>
            <div style={{ marginTop: 18, fontSize: 13, color: 'rgba(255,255,255,0.64)', letterSpacing: '0.01em' }}>Saldo sekarang</div>
            <p className="font-ledger" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.4rem)', fontWeight: 700, color: stats.balance >= 0 ? '#fff' : '#fecdd3', lineHeight: 0.95, margin: '10px 0 0', letterSpacing: '-0.05em' }}>
              {formatIDR(stats.balance)}
            </p>
            <p style={{ margin: '14px 0 0', maxWidth: 540, fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.72)' }}>
              {stats.balance >= 0
                ? 'Posisi saldo Anda sehat. Fokus pada transaksi berikutnya dan pertahankan ritme pengeluaran.'
                : 'Saldo sedang negatif. Cek pos pengeluaran terbesar dan rapikan transaksi prioritas.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <MiniMetric label="Pemasukan" value={`+${formatIDR(stats.totalIncome)}`} tone="income" />
            <MiniMetric label="Pengeluaran" value={`-${formatIDR(stats.totalExpense)}`} tone="expense" />
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)' }}>Rasio hemat</span>
              <span className="font-ledger" style={{ fontSize: 12, color: savingsRate >= 0 ? '#86efac' : '#fca5a5' }}>{savingsRate}%</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.10)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: '100%',
                background: expensePct > 85 ? C.red : expensePct > 60 ? C.amber : C.green,
                borderRadius: 999,
                transformOrigin: 'left center',
                transform: `scaleX(${expensePct / 100})`,
                transition: 'transform 0.65s ease',
              }} />
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.62)' }}>
              {expensePct}% dari pemasukan telah dipakai.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <MicroCard title="Terakhir" value={stats.monthlyTrend.at(-1)?.month || '—'} />
            <MicroCard title="Kategori aktif" value={stats.categoryBreakdown[0]?.name || '—'} />
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniMetric({ label, value, tone }) {
  const toneMap = {
    income: { bg: C.greenBg, text: C.greenMid },
    expense: { bg: C.redBg, text: C.red },
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 16 }}>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', marginBottom: 10 }}>{label}</div>
      <div className="font-ledger" style={{ fontSize: 20, fontWeight: 700, color: toneMap[tone].text, display: 'inline-flex', padding: '6px 10px', borderRadius: 12, background: toneMap[tone].bg }}>
        {value}
      </div>
    </div>
  );
}

function MicroCard({ title, value }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 16 }}>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.58)', marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
}

/* ── Custom Tooltip for charts ── */
function LedgerTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 16, padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: C.ink, boxShadow: '0 16px 40px rgba(15,23,42,0.12)' }}>
      <p style={{ marginBottom: 8, color: C.inkFaint, fontSize: 10, letterSpacing: '0.04em' }}>{label}</p>
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
  const [view, setView]                   = useState('dashboard'); // 'dashboard' | 'ledger'
  const [showModal, setShowModal]         = useState(false);
  const [editingTx, setEditingTx]         = useState(null);
  const [search, setSearch]               = useState('');
  const [typeFilter, setTypeFilter]       = useState('ALL');
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  // Form
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
      <button onClick={() => setView(id)} title={label} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', width: '100%', border: 'none',
        background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
        color: active ? '#fff' : 'rgba(255,255,255,0.62)',
        borderRadius: 16,
        cursor: 'pointer', transition: 'background 0.15s ease, color 0.15s ease',
        boxShadow: active ? 'inset 0 0 0 1px rgba(255,255,255,0.06)' : 'none',
      }}>
        <span style={{ width: 28, height: 28, borderRadius: 10, display: 'grid', placeItems: 'center', background: active ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)' }}>
          <Icon size={15} />
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em', fontFamily: 'var(--font-sans)' }}>{label}</span>
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.canvas, fontFamily: 'var(--font-sans)', color: C.ink }}>

      {/* ── Left Sidebar (binder spine) ── */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.42)', backdropFilter: 'blur(3px)', zIndex: 29 }}
        className="mobile-overlay" />}
      <aside style={{
        width: 64, flexShrink: 0,
        background: C.panel,
        borderRight: `1px solid rgba(255,255,255,0.08)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: 18,
        position: 'sticky', top: 0, height: '100vh',
        zIndex: 30,
      }} className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand mark */}
        <div style={{ marginBottom: 24, color: '#fff', width: 40, height: 40, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <BookOpen size={20} strokeWidth={1.7} />
        </div>
        <div style={{ width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <NavBtn id="dashboard" icon={LayoutDashboard} label="Grafik" />
          <NavBtn id="ledger" icon={List} label="Buku Kas" />
        </div>
        {/* User + logout at bottom */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 12, width: '100%' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
            border: '1px solid rgba(255,255,255,0.08)',
          }} title={user?.name}>
            {initials}
          </div>
          <button onClick={onLogout} title="Keluar" style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.68)',
            cursor: 'pointer', padding: '10px 12px', borderRadius: 14,
            transition: 'background 0.15s ease, color 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.68)'; }}>
            <LogOut size={14} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>Keluar</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>

        {/* ── Top header ── */}
        <header style={{
          borderBottom: `1px solid ${C.rule}`,
          padding: '0 24px', height: 72,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(248,250,252,0.76)', backdropFilter: 'blur(18px)', position: 'sticky', top: 0, zIndex: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
              display: 'none', border: '1px solid rgba(15,23,42,0.08)', background: '#fff', color: C.ink,
              cursor: 'pointer', padding: 8, borderRadius: 12, boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
            }} className="mobile-menu-btn">
              <Menu size={20} />
            </button>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 15, color: C.ink, letterSpacing: '-0.02em' }}>
                KeuanganKu
              </div>
              <div style={{ marginTop: 2, fontFamily: 'var(--font-sans)', fontSize: 12, color: C.inkFaint }}>
                {view === 'dashboard' ? 'Ringkasan akun' : 'Daftar transaksi'}
              </div>
            </div>
          </div>
          <button onClick={openAdd} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 16px',
            background: C.brand, color: '#fff',
            border: 'none', borderRadius: 14,
            fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', letterSpacing: '-0.01em',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
            boxShadow: '0 14px 28px rgba(79,70,229,0.18)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#4338ca'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = C.brand; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <Plus size={14} />
            Tambah transaksi
          </button>
        </header>

        {/* ── Balance Bar ── */}
        <BalanceBar stats={stats} />

        {/* ── View: Dashboard ── */}
        {view === 'dashboard' && (
          <div style={{ padding: '24px 24px 64px', maxWidth: 1440, margin: '0 auto' }}>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(320px,0.8fr)', gap: 20, marginTop: 24, marginBottom: 20 }}>

              {/* Bar chart */}
              <div style={{ border: `1px solid ${C.rule}`, borderRadius: 28, padding: 24, background: C.surface, boxShadow: `0 18px 50px ${C.shadow}` }}>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', color: C.ink }}>Arus kas bulanan</div>
                  <div style={{ marginTop: 6, fontSize: 13, color: C.inkFaint }}>Pemasukan dan pengeluaran bergerak dari bulan ke bulan.</div>
                </div>
                {stats.monthlyTrend.length > 0 ? (
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.monthlyTrend} margin={{ top: 6, right: 0, left: -24, bottom: 0 }} barGap={5}>
                        <CartesianGrid strokeDasharray="none" horizontal stroke={C.ruleSoft} vertical={false} />
                        <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: C.inkFaint }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: C.inkFaint }} tickLine={false} axisLine={false} tickFormatter={formatShort} />
                        <Tooltip content={<LedgerTooltip />} cursor={{ fill: `${C.accent}08` }} />
                        <Bar dataKey="income"  name="Pemasukan"   fill={C.green} radius={[8,8,2,2]} maxBarSize={30} />
                        <Bar dataKey="expense" name="Pengeluaran" fill={C.red}   radius={[8,8,2,2]} maxBarSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.inkFaint, fontSize: 13, background: C.surface2, borderRadius: 20, border: `1px dashed ${C.rule}` }}>
                    Belum ada data bulan ini.
                  </div>
                )}
                <div style={{ display: 'flex', gap: 20, marginTop: 18, flexWrap: 'wrap' }}>
                  {[['Pemasukan', C.green], ['Pengeluaran', C.red]].map(([label, color]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 999, background: color }} />
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: C.inkMid }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Donut + category list */}
              <div style={{ border: `1px solid ${C.rule}`, borderRadius: 28, padding: 24, background: C.surface, boxShadow: `0 18px 50px ${C.shadow}` }}>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', color: C.ink }}>Alokasi pengeluaran</div>
                  <div style={{ marginTop: 6, fontSize: 13, color: C.inkFaint }}>Komposisi belanja terbesar yang perlu diawasi.</div>
                </div>
                {stats.categoryBreakdown.length > 0 ? (
                  <>
                    <div style={{ height: 160 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stats.categoryBreakdown} innerRadius={54} outerRadius={76} paddingAngle={4} dataKey="value" strokeWidth={0}>
                            {stats.categoryBreakdown.map((_, i) => (
                              <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => [formatIDR(v)]} contentStyle={{ background: '#fff', border: `1px solid ${C.rule}`, borderRadius: 12, color: C.ink, fontFamily: 'var(--font-mono)', fontSize: 11, boxShadow: '0 16px 40px rgba(15,23,42,0.10)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {stats.categoryBreakdown.slice(0, 5).map((item, i) => {
                        const pct = stats.totalExpense > 0 ? Math.round((item.value / stats.totalExpense) * 100) : 0;
                        return (
                          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 14, background: C.surface2 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[i % CAT_COLORS.length], flexShrink: 0 }} />
                            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: C.inkMid, flex: 1 }}>{item.name}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: C.ink, fontWeight: 700 }}>{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.inkFaint, fontSize: 13, textAlign: 'center', background: C.surface2, borderRadius: 20, border: `1px dashed ${C.rule}` }}>
                    Belum ada pengeluaran yang tercatat.
                  </div>
                )}
              </div>
            </div>

            {/* Recent transactions preview */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', margin: '24px 0 12px' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', color: C.ink }}>Transaksi terbaru</div>
                <div style={{ marginTop: 6, fontSize: 13, color: C.inkFaint }}>Lima transaksi terakhir yang paling relevan.</div>
              </div>
            </div>
            <div style={{ border: `1px solid ${C.rule}`, borderRadius: 28, overflow: 'hidden', background: C.surface, boxShadow: `0 18px 50px ${C.shadow}` }}>
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
          <div style={{ padding: '24px 24px 64px', maxWidth: 1440, margin: '0 auto' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: C.ink }}>Buku kas</div>
              <div style={{ marginTop: 6, fontSize: 13, color: C.inkFaint }}>Cari, filter, dan audit transaksi dalam satu tampilan.</div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 260, maxWidth: 360 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.inkFaint, pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 11, paddingBottom: 11,
                    background: C.surface, border: `1px solid ${C.rule}`, borderRadius: 14,
                    fontFamily: 'var(--font-sans)', fontSize: 13, color: C.ink,
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                  }}
                />
              </div>
              {['ALL', 'INCOME', 'EXPENSE'].map(f => (
                <button key={f} onClick={() => setTypeFilter(f)} style={{
                  padding: '10px 14px', borderRadius: 999, border: `1px solid ${typeFilter === f ? C.brand : C.rule}`,
                  background: typeFilter === f ? C.brand : C.surface,
                  color: typeFilter === f ? '#fff' : C.inkMid,
                  fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: typeFilter === f ? '0 12px 24px rgba(79,70,229,0.16)' : '0 1px 2px rgba(15,23,42,0.04)',
                }}>
                  { f === 'ALL' ? 'Semua' : f === 'INCOME' ? 'Pemasukan' : 'Pengeluaran' }
                </button>
              ))}
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, color: C.inkFaint }}>
                {filtered.length} baris
              </span>
            </div>

            <div style={{ border: `1px solid ${C.rule}`, borderRadius: 28, overflow: 'hidden', background: C.surface, boxShadow: `0 18px 50px ${C.shadow}` }}>
              <TransactionTable rows={filtered} onEdit={openEdit} onDelete={handleDelete} />
            </div>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.62)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: 16,
        }}>
          <div style={{ background: C.surface, borderRadius: 28, width: '100%', maxWidth: 500, overflow: 'hidden', boxShadow: '0 28px 80px rgba(15,23,42,0.28)', border: `1px solid ${C.rule}` }}>

            {/* Modal header */}
            <div style={{ padding: '22px 24px', borderBottom: `1px solid ${C.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 18, color: C.ink, letterSpacing: '-0.03em' }}>
                  {editingTx ? 'Edit transaksi' : 'Catat transaksi baru'}
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: C.inkFaint, marginTop: 5 }}>
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: C.surface, border: `1px solid ${C.rule}`, color: C.inkMid, cursor: 'pointer', width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Type toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 4, background: '#f8fafc', borderRadius: 18, border: `1px solid ${C.rule}` }}>
                {['INCOME', 'EXPENSE'].map(t => (
                  <button key={t} type="button" onClick={() => { setFType(t); setFCategory(CATEGORIES[t][0]); }}
                    style={{
                      padding: '11px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 13,
                      background: fType === t ? C.surface : 'transparent',
                      color: fType === t ? (t === 'INCOME' ? C.greenMid : C.red) : C.inkFaint,
                      boxShadow: fType === t ? '0 4px 12px rgba(15,23,42,0.08)' : 'none',
                      transition: 'all 0.15s ease',
                    }}>
                    {t === 'INCOME' ? '+ Pemasukan' : '− Pengeluaran'}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <ModalField label="Jumlah">
                <div style={{ position: 'relative' }}>
                  <span className="font-ledger" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.inkFaint, fontSize: 13, pointerEvents: 'none' }}>Rp</span>
                  <input type="number" required min="1" placeholder="0" value={fAmount} onChange={e => setFAmount(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 38, fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: fType === 'INCOME' ? C.greenMid : C.red, background: '#fff' }} />
                </div>
              </ModalField>

              {/* Category + Date side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <ModalField label="Kategori">
                  <select value={fCategory} onChange={e => setFCategory(e.target.value)} style={{ ...inputStyle, cursor: 'pointer', background: '#fff' }}>
                    {CATEGORIES[fType].map(c => <option key={c}>{c}</option>)}
                  </select>
                </ModalField>
                <ModalField label="Tanggal">
                  <input type="date" required value={fDate} onChange={e => setFDate(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontSize: 12, background: '#fff' }} />
                </ModalField>
              </div>

              {/* Description */}
              <ModalField label="Keterangan">
                <input type="text" placeholder="Belanja beras, bayar listrik, gaji bulan ini…" value={fDesc} onChange={e => setFDesc(e.target.value)} style={{ ...inputStyle, background: '#fff' }} />
              </ModalField>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 6, paddingTop: 18, borderTop: `1px solid ${C.rule}` }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px 0', borderRadius: 14, border: `1px solid ${C.rule}`, background: C.surface, color: C.inkMid, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  Batal
                </button>
                <button type="submit" disabled={submitting} style={{
                  flex: 2, padding: '12px 0', borderRadius: 14, border: 'none',
                  background: submitting ? C.inkMid : C.ink,
                  color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 800,
                  fontSize: 13, cursor: submitting ? 'not-allowed' : 'pointer',
                  letterSpacing: '-0.01em', opacity: submitting ? 0.75 : 1,
                  boxShadow: '0 14px 24px rgba(15,23,42,0.12)',
                }}>
                  {submitting ? 'Menyimpan…' : editingTx ? 'Simpan Perubahan' : 'Catat Sekarang'}
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
  width: '100%', padding: '12px 14px',
  background: '#fff', border: `1px solid ${C.rule}`,
  borderRadius: 14, fontFamily: 'var(--font-sans)', fontSize: 13, color: C.ink,
  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
  boxSizing: 'border-box',
};

/* ── ModalField wrapper ── */
function ModalField({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.01em', color: C.inkMid, marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Transaction Table (shared between dashboard preview + full ledger) ── */
function TransactionTable({ rows, onEdit, onDelete }) {
  if (!rows.length) return (
    <div style={{ padding: '64px 24px', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
      <div style={{ width: 52, height: 52, borderRadius: 18, background: C.brandBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: `1px solid ${C.rule}` }}>
        <BookOpen size={20} color={C.accent} />
      </div>
      <p style={{ fontSize: 15, color: C.ink, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>Belum ada transaksi</p>
      <p style={{ fontSize: 13, color: C.inkFaint, marginBottom: 16, lineHeight: 1.6 }}>Catat transaksi pertama Anda untuk mulai melacak keuangan.</p>
    </div>
  );

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)' }}>
      <thead>
        <tr style={{ background: '#f8fafc' }}>
          {['Tanggal', 'Keterangan', 'Kategori', 'Jumlah', ''].map(h => (
            <th key={h} style={{ padding: '14px 18px', textAlign: h === 'Jumlah' || h === '' ? 'right' : 'left', fontSize: 11, fontWeight: 800, letterSpacing: '0.01em', color: C.inkFaint, whiteSpace: 'nowrap', borderBottom: `1px solid ${C.rule}` }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((tx, i) => (
          <tr key={tx.id} style={{ borderTop: `1px solid ${C.ruleSoft}`, background: i % 2 === 0 ? '#fff' : '#fafcff' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafcff'}>

            <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: C.inkSoft }}>
                {new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </td>

            <td style={{ padding: '14px 18px', maxWidth: 220 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: C.ink, fontWeight: 600 }}>
                {tx.description || <em style={{ color: C.inkSoft, fontWeight: 500 }}>Tanpa keterangan</em>}
              </span>
            </td>

            <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px',
                background: tx.type === 'INCOME' ? C.greenBg : C.redBg,
                color: tx.type === 'INCOME' ? C.greenMid : C.red,
                border: `1px solid ${tx.type === 'INCOME' ? '#d1fae5' : '#ffe4e6'}`,
                borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: '0.01em',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: tx.type === 'INCOME' ? C.green : C.red }} />
                {tx.category}
              </span>
            </td>

            <td style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                color: tx.type === 'INCOME' ? C.greenMid : C.red,
                letterSpacing: '-0.02em',
              }}>
                {tx.type === 'INCOME' ? '+' : '−'}{formatIDR(tx.amount)}
              </span>
            </td>

            <td style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={() => onEdit(tx)} title="Edit" style={{ background: '#fff', border: `1px solid ${C.rule}`, cursor: 'pointer', color: C.inkFaint, padding: 8, borderRadius: 12, transition: 'all 0.15s ease', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = C.accent; e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = C.inkFaint; e.currentTarget.style.borderColor = C.rule; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <Edit2 size={13} />
                </button>
                <button onClick={() => onDelete(tx.id)} title="Hapus" style={{ background: '#fff', border: `1px solid ${C.rule}`, cursor: 'pointer', color: C.inkFaint, padding: 8, borderRadius: 12, transition: 'all 0.15s ease', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = '#fecdd3'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = C.inkFaint; e.currentTarget.style.borderColor = C.rule; e.currentTarget.style.transform = 'translateY(0)'; }}>
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
