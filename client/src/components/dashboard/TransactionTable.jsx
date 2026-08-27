import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { rowHover } from '@/lib/animations';
import { formatIDR, formatDate } from '@/lib/utils';
import { Edit2, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Badge } from '@/components/ui';

const TYPE_LABELS = {
  INCOME: 'Pemasukan',
  EXPENSE: 'Pengeluaran',
};

const TYPE_COLORS = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

export function TransactionTable({
  rows,
  onEdit,
  onDelete,
  animate = true,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-label="Memuat transaksi">
        {[...Array(5)].map((_, i) => (
          <motion.div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <motion.div
        className="text-center py-12 px-6"
        initial={animate ? { opacity: 0, y: 20 } : false}
        animate={animate ? { opacity: 1, y: 0 } : false}
        transition={{ duration: 0.4 }}
      >
        <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <h3 className="font-semibold text-slate-700">Belum ada transaksi</h3>
        <p className="text-slate-500 text-sm mt-1">Mulai catat transaksi pertama Anda</p>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <motion.div
        className="overflow-x-auto"
        initial={animate ? { opacity: 0 } : false}
        animate={animate ? { opacity: 1 } : false}
        transition={{ duration: 0.3 }}
      >
        <table className="w-full" role="table">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['Tanggal', 'Keterangan', 'Kategori', 'Tipe', 'Jumlah', ''].map((header, i) => (
                <motion.th
                  key={header}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400',
                    header === 'Jumlah' && 'text-right',
                    header === '' && 'text-right w-20'
                  )}
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                >
                  {header}
                </motion.th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {rows.map((tx, index) => (
                <motion.tr
                  key={tx.id}
                  className={cn('hover:bg-slate-50/50 transition-colors')}
                  initial={animate ? { opacity: 0, y: 10 } : false}
                  animate={animate ? { opacity: 1, y: 0 } : false}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={rowHover.whileHover}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono text-sm text-slate-600 tabular-nums">
                      {formatDate(tx.date, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </td>

                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="font-medium text-slate-900 truncate">
                      {tx.description || (
                        <span className="text-slate-400 italic font-normal">Tanpa keterangan</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono">
                      {new Date(tx.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })}
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant={TYPE_COLORS[tx.type]} size="sm">
                      {tx.category}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant={TYPE_COLORS[tx.type]} size="sm" dot={tx.type.toLowerCase()}>
                      {TYPE_LABELS[tx.type]}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span className={cn('font-mono font-bold tabular-nums', tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600')}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatIDR(tx.amount)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right w-20">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                        aria-label={`Edit transaksi ${tx.description || 'tanpa keterangan'}`}
                      >
                        <Edit2 size={16} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => onDelete(tx.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30"
                        aria-label={`Hapus transaksi ${tx.description || 'tanpa keterangan'}`}
                      >
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      {rows.length > 10 && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-sm text-slate-500 text-center">
            Menampilkan {rows.length} transaksi
          </p>
        </div>
      )}
    </div>
  );
}

export function TransactionMobileList({ rows, onEdit, onDelete, animate = true }) {
  if (!rows.length) return null;

  return (
    <AnimatePresence mode="popLayout">
      {rows.map((tx, index) => (
        <motion.div
          key={tx.id}
          className="px-4 py-4 border-b border-slate-100 last:border-0 bg-white"
          initial={animate ? { opacity: 0, y: 10 } : false}
          animate={animate ? { opacity: 1, y: 0 } : false}
          exit={{ opacity: 0, height: 0, margin: 0 }}
          transition={{ delay: index * 0.04, duration: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              tx.type === 'INCOME' ? 'bg-emerald-50' : 'bg-rose-50'
            )}>
              {tx.type === 'INCOME' ? (
                <ArrowUpRight size={18} className="text-emerald-500" />
              ) : (
                <ArrowDownRight size={18} className="text-rose-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-slate-900 truncate">
                  {tx.description || 'Tanpa keterangan'}
                </h4>
                <span className={cn('font-mono font-bold tabular-nums whitespace-nowrap', tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600')}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatIDR(tx.amount)}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1.5 flex-wrap text-sm">
                <Badge variant={TYPE_COLORS[tx.type]} size="sm">
                  {tx.category}
                </Badge>
                <span className="text-slate-400 font-mono">
                  {formatDate(tx.date, { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-slate-400 font-mono">
                  {new Date(tx.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => onEdit(tx)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-colors"
            >
              <Edit2 size={12} strokeWidth={2} />
              Edit
            </button>
            <button
              onClick={() => onDelete(tx.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
            >
              <Trash2 size={12} strokeWidth={2} />
              Hapus
            </button>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}