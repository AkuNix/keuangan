import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatIDR } from '@/lib/utils';

const ICONS = {
  income: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  expense: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M5 12l7 7 7-7M12 5v14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  balance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M10 5v4" />
    </svg>
  ),
};

const COLORS = {
  income: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  expense: 'bg-rose-50 text-rose-600 border-rose-100',
  balance: 'bg-indigo-50 text-indigo-600 border-indigo-100',
};

const LABELS = {
  income: 'Pemasukan',
  expense: 'Pengeluaran',
  balance: 'Saldo',
};

export function StatCard({ type, value, trend, trendLabel, index = 0, animate = true }) {
  const colorClass = COLORS[type];
  const label = LABELS[type];
  const icon = ICONS[type];

  return (
    <motion.div
      className={cn('rounded-2xl border p-6 transition-all duration-200 hover:shadow-md', colorClass)}
      initial={animate ? { opacity: 0, y: 16 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -2, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{label}</p>
          <motion.p
            className="font-mono font-bold text-2xl sm:text-3xl tabular-nums"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 + index * 0.08, duration: 0.5 }}
          >
            {value}
          </motion.p>
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colorClass.replace('50', '100').replace('600', '500'))}>
          {icon}
        </div>
      </div>

      {trend !== undefined && (
        <motion.div
          className="mt-4 flex items-center gap-1.5"
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 + index * 0.08, duration: 0.3 }}
        >
          <span className={cn('text-xs font-semibold', trend >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-xs text-slate-500">{trendLabel}</span>
        </motion.div>
      )}
    </motion.div>
  );
}

export function StatCardsGrid({ stats, animate = true }) {
  const savingsRate = stats.totalIncome > 0
    ? Math.round(((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100)
    : 0;

  const cards = [
    { type: 'income', value: `+${formatIDR(stats.totalIncome)}`, trend: 12, trendLabel: 'vs bln lalu' },
    { type: 'expense', value: `-${formatIDR(stats.totalExpense)}`, trend: -8, trendLabel: 'vs bln lalu' },
    { type: 'balance', value: formatIDR(stats.balance), trend: savingsRate, trendLabel: 'rasio tabungan' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Ringkasan keuangan">
      {cards.map((card, i) => (
        <StatCard key={card.type} index={i} animate={animate} {...card} />
      ))}
    </div>
  );
}