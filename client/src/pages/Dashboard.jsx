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
import { ChevronDown } from 'lucide-react';

export default function Dashboard({ user, onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, categoryBreakdown: [], monthlyTrend: [] });
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');

  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTx, setDeletingTx] = useState(null);

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

  return (
    <PageShell user={user} onLogout={onLogout} activeView={view} onNavigate={setView} pageTitle={view === 'dashboard' ? 'Dashboard' : 'Buku Kas'}>
      {view === 'dashboard' && (
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <BalanceHero stats={stats} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <StatCardsGrid stats={stats} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <ChartsArea stats={stats} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
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
          <FilterBar search={search} onSearchChange={setSearch} typeFilter={typeFilter} onTypeFilterChange={setTypeFilter} sortBy={sortBy} onSortChange={setSortBy} resultCount={filtered.length} />
          <div className="mt-4">
            <div className="hidden lg:block"><TransactionTable rows={filtered} onEdit={openEdit} onDelete={confirmDelete} loading={loading} /></div>
            <div className="lg:hidden"><TransactionMobileList rows={filtered} onEdit={openEdit} onDelete={confirmDelete} loading={loading} /></div>
          </div>
        </motion.div>
      )}

      <TransactionModal isOpen={showModal} onClose={() => { setShowModal(false); setEditingTx(null); }} editingTx={editingTx} onSubmit={handleSubmit} submitting={false} />
      <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeletingTx(null); }} onConfirm={handleDelete} transaction={deletingTx} loading={false} />
    </PageShell>
  );
}