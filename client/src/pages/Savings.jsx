import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { SavingsGoalCard, SavingsModal, DepositModal } from '@/components/savings';
import { Button } from '@/components/ui';
import { Plus, Target, TrendingUp, Coins } from 'lucide-react';
import { formatIDR } from '@/lib/utils';

export default function Savings({ user, onLogout, onNavigate }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositGoal, setDepositGoal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSavings();
      setGoals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const totalSaved = goals.reduce((sum, g) => sum + g.totalSaved, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const completedGoals = goals.filter(g => g.totalSaved >= g.targetAmount).length;

  const openNew = () => { setEditingGoal(null); setShowGoalModal(true); };
  const openEdit = (goal) => { setEditingGoal(goal); setShowGoalModal(true); };
  const openDeposit = (goal) => { setDepositGoal(goal); setShowDepositModal(true); };

  const handleGoalSubmit = async (payload) => {
    try {
      setSubmitting(true);
      if (editingGoal) await api.updateSavingGoal(editingGoal.id, payload);
      else await api.addSavingGoal(payload);
      setShowGoalModal(false);
      fetchGoals();
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDeposit = async (amount, note) => {
    try {
      setSubmitting(true);
      await api.depositToGoal(depositGoal.id, amount, note);
      setShowDepositModal(false);
      fetchGoals();
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (goalId) => {
    if (!confirm('Yakin ingin menghapus goal ini?')) return;
    try {
      await api.deleteSavingGoal(goalId);
      fetchGoals();
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tabungan</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Capai target finansialmu</p>
          </div>
          <Button onClick={openNew} size="lg" className="gap-2 shadow-lg shadow-indigo-500/20 w-full sm:w-auto">
            <Plus size={20} strokeWidth={2.5} />
            Goal Baru
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Coins size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Tersimpan</p>
              <p className="font-mono font-bold text-lg text-slate-900 dark:text-white tabular-nums">{formatIDR(totalSaved)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <Target size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Total</p>
              <p className="font-mono font-bold text-lg text-slate-900 dark:text-white tabular-nums">{formatIDR(totalTarget)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <TrendingUp size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Goal Tercapai</p>
              <p className="font-mono font-bold text-lg text-slate-900 dark:text-white tabular-nums">{completedGoals} / {goals.length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <motion.div className="text-center py-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Target size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-lg">Belum ada goal tabungan</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-4">Buat goal pertamamu untuk mulai menabung</p>
          <Button onClick={openNew} className="gap-2">
            <Plus size={16} />
            Buat Goal Pertama
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal, i) => (
            <SavingsGoalCard key={goal.id} goal={goal} index={i} onDeposit={openDeposit} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Deposit History */}
      {goals.some(g => g.deposits.length > 0) && (
        <motion.div className="mt-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Riwayat Setoran</h2>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
            {goals.flatMap(g => g.deposits.map(d => ({ ...d, goalName: g.name })))
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 10)
              .map((dep, i) => (
                <div key={dep.id} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-slate-100 dark:border-slate-700/50' : ''}`}>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{dep.goalName}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{dep.note || 'Setoran'} &middot; {new Date(dep.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">+{formatIDR(dep.amount)}</span>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      <SavingsModal isOpen={showGoalModal} onClose={() => { setShowGoalModal(false); setEditingGoal(null); }} editingGoal={editingGoal} onSubmit={handleGoalSubmit} submitting={submitting} />
      <DepositModal isOpen={showDepositModal} onClose={() => { setShowDepositModal(false); setDepositGoal(null); }} goal={depositGoal} onSubmit={handleDeposit} submitting={submitting} />
    </div>
  );
}