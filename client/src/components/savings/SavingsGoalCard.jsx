import { motion } from 'framer-motion';
import { cn, formatIDR } from '@/lib/utils';
import { Target, Calendar, Edit2, Trash2, Coins } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';

export function SavingsGoalCard({ goal, onDeposit, onEdit, onDelete, index = 0, animate = true }) {
  const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.totalSaved / goal.targetAmount) * 100)) : 0;
  const remaining = Math.max(0, goal.targetAmount - goal.totalSaved);
  const isComplete = pct >= 100;
  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && !isComplete;

  const deadlineLabel = goal.deadline
    ? new Date(goal.deadline).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 16 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card className={cn('p-5 transition-all duration-200 hover:shadow-md', isComplete && 'ring-2 ring-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20')}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', isComplete ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-indigo-100 dark:bg-indigo-900/40')}>
              <Target size={20} className={isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{goal.name}</h3>
              {deadlineLabel && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Calendar size={12} className="text-slate-400 dark:text-slate-500" />
                  <span className={cn('text-xs', isOverdue ? 'text-rose-500 font-semibold' : 'text-slate-400 dark:text-slate-500')}>
                    {isOverdue ? 'Terlambat! ' : ''}{deadlineLabel}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(goal)} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors" aria-label={`Edit ${goal.name}`}>
              <Edit2 size={14} />
            </button>
            <button onClick={() => onDelete(goal.id)} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors" aria-label={`Hapus ${goal.name}`}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Terkumpul</p>
              <p className="font-mono font-bold text-xl text-slate-900 dark:text-white tabular-nums">{formatIDR(goal.totalSaved)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target</p>
              <p className="font-mono font-semibold text-sm text-slate-600 dark:text-slate-300 tabular-nums">{formatIDR(goal.targetAmount)}</p>
            </div>
          </div>

          <div className="relative h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={cn('absolute inset-y-0 left-0 rounded-full', isComplete ? 'bg-emerald-500' : 'bg-indigo-500')}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>

          <div className="flex items-center justify-between">
            <Badge variant={isComplete ? 'income' : 'outline'} size="sm">{pct}%</Badge>
            {!isComplete && (
              <p className="text-xs text-slate-500 dark:text-slate-400">Sisa {formatIDR(remaining)}</p>
            )}
            {isComplete && (
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Target tercapai!</p>
            )}
          </div>
        </div>

        {!isComplete && (
          <Button onClick={() => onDeposit(goal)} size="sm" variant="outline" className="w-full mt-4 gap-1.5">
            <Coins size={14} />
            Setor
          </Button>
        )}
      </Card>
    </motion.div>
  );
}