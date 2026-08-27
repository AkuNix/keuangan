import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { PageShell } from '@/components/layout';
import {
  BalanceHero,
  StatCardsGrid,
  ChartsArea,
  TransactionTable,
  TransactionMobileList,
  FilterBar,
  TransactionModal,
  DeleteConfirmModal,
} from '@/components/dashboard';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import Savings from './Savings';
import Settings from './Settings';

export default function Dashboard({ user, onLogout }) {
  const [view, setView] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, categoryBreakdown: [], monthlyTrend: [] });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');

  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTx, setDeletingTx] = useState(null);

  const [currentUser, setCurrentUser] = useState(user);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tx, st] = await Promise.all([api.getTransactions(1, 200), api.getDashboardStats()]);
      setTransactions(tx.data || tx);
      setStats(st);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setCurrentUser(user); }, [user]);

  const filtered = transactions.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.description?.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    const matchType = typeFilter === 'ALL' || t.type === typeFilter;
    return matchSearch && matchType;
  }).sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'date_asc') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'amount_desc') return b.amount - a.amount;
    if (sortBy === 'amount_asc') return a.amount - b.amount;
    return 0;
  });

  const openNew = () => { setEditingTx(null); setShowModal(true); };
  const openEdit = (tx) => { setEditingTx(tx); setShowModal(true); };

  const handleSubmit = async (payload) => {
    try {
      if (editingTx) await api.updateTransaction(editingTx.id, payload);
      else await api.addTransaction(payload);
      setShowModal(false);
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const confirmDelete = (tx) => { setDeletingTx(tx); setShowDeleteModal(true); };

  const handleDelete = async () => {
    if (!deletingTx) return;
    try { await api.deleteTransaction(deletingTx.id); fetchData(); }
    catch (err) { alert(err.message); }
    finally { setShowDeleteModal(false); setDeletingTx(null); }
  };

  const handleUserUpdate = (updated) => {
    setCurrentUser(updated);
  };

  const pageTitles = {
    dashboard: 'Dashboard',
    ledger: 'Buku Kas',
    savings: 'Tabungan',
    settings: 'Pengaturan',
    profile: 'Profil',
  };

  return (
    <>
      <PageShell user={currentUser} onLogout={onLogout} activeView={view} onNavigate={setView} pageTitle={pageTitles[view] || 'Dashboard'}>
        {view === 'dashboard' && (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Selamat datang, {currentUser?.name?.split(' ')[0]}</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ringkasan keuangan Anda hari ini</p>
                </div>
                <Button onClick={openNew} size="lg" className="gap-2 shadow-lg shadow-indigo-500/20 w-full sm:w-auto">
                  <Plus size={20} strokeWidth={2.5} />
                  Transaksi Baru
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
              <BalanceHero stats={stats} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <StatCardsGrid stats={stats} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
              <ChartsArea stats={stats} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Transaksi Terbaru</h2>
                <button onClick={() => setView('ledger')} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
                  Lihat semua<ChevronDown size={16} strokeWidth={2} />
                </button>
              </div>
              <div className="hidden lg:block"><TransactionTable rows={filtered.slice(0, 10)} onEdit={openEdit} onDelete={confirmDelete} loading={loading} /></div>
              <div className="lg:hidden"><TransactionMobileList rows={filtered.slice(0, 10)} onEdit={openEdit} onDelete={confirmDelete} loading={loading} /></div>
            </motion.div>
          </div>
        )}

        {view === 'ledger' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Buku Kas</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Semua transaksi Anda</p>
              </div>
              <Button onClick={openNew} size="lg" className="gap-2 shadow-lg shadow-indigo-500/20 w-full sm:w-auto">
                <Plus size={20} strokeWidth={2.5} />
                Transaksi Baru
              </Button>
            </div>
            <FilterBar search={search} onSearchChange={setSearch} typeFilter={typeFilter} onTypeFilterChange={setTypeFilter} sortBy={sortBy} onSortChange={setSortBy} resultCount={filtered.length} />
            <div className="mt-4">
              <div className="hidden lg:block"><TransactionTable rows={filtered} onEdit={openEdit} onDelete={confirmDelete} loading={loading} /></div>
              <div className="lg:hidden"><TransactionMobileList rows={filtered} onEdit={openEdit} onDelete={confirmDelete} loading={loading} /></div>
            </div>
          </motion.div>
        )}

        {view === 'savings' && (
          <Savings user={currentUser} onLogout={onLogout} onNavigate={setView} />
        )}

        {view === 'settings' && (
          <Settings user={currentUser} onLogout={onLogout} onUserUpdate={handleUserUpdate} onNavigate={setView} />
        )}

        {view === 'profile' && (
          <Settings user={currentUser} onLogout={onLogout} onUserUpdate={handleUserUpdate} onNavigate={setView} />
        )}

        <TransactionModal isOpen={showModal} onClose={() => { setShowModal(false); setEditingTx(null); }} editingTx={editingTx} onSubmit={handleSubmit} submitting={false} />
        <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeletingTx(null); }} onConfirm={handleDelete} transaction={deletingTx} loading={false} />
      </PageShell>

      {/* Mobile FAB — outside PageShell to avoid overflow clipping */}
      {(view === 'dashboard' || view === 'ledger') && (
        <motion.button
          onClick={openNew}
          className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          aria-label="Transaksi baru"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
        >
          <Plus size={24} strokeWidth={2.5} />
        </motion.button>
      )}
    </>
  );
}