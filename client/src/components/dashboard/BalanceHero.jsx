import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { pulse } from '@/lib/animations';
import { formatIDR } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';

export function BalanceHero({ stats, animate = true }) {
  const savingsRate = stats.totalIncome > 0
    ? Math.round(((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100)
    : 0;

  const isPositive = savingsRate >= 0;

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-slate-900 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 p-6 sm:p-8 lg:p-10 text-white"
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-emerald-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-1 text-xs font-semibold bg-white/10 rounded-full text-slate-300 uppercase tracking-wider">
              Akun Utama
            </span>
            <motion.span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded-full" animate={pulse.animate} transition={pulse.transition}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Aktif
            </motion.span>
          </div>

          <motion.div
            className="font-mono font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {formatIDR(stats.balance)}
          </motion.div>

          <p className="mt-2 text-slate-400 text-sm">Saldo tersedia</p>
        </div>

        <div className="flex flex-col sm:items-end gap-4 sm:flex-row sm:gap-6 w-full sm:w-auto">
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 min-w-[160px]">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <ArrowUpRight size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Pemasukan</p>
              <motion.p className="font-mono font-bold text-lg text-emerald-300">+{formatIDR(stats.totalIncome)}</motion.p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 min-w-[160px]">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
              <ArrowDownRight size={20} className="text-rose-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Pengeluaran</p>
              <motion.p className="font-mono font-bold text-lg text-rose-300">-{formatIDR(stats.totalExpense)}</motion.p>
            </div>
          </div>

          <motion.div
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm',
              isPositive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            )}
            initial={false}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ delay: 0.4, duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="flex items-center gap-1">
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              Tabungan {savingsRate}%
            </span>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="mt-8 pt-6 border-t border-white/10"
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <p className="text-xs text-slate-500 text-center">Data diperbarui secara real-time</p>
      </motion.div>
    </motion.div>
  );
}