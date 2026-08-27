import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Search, Filter, X } from 'lucide-react';
import { Select, Button } from '@/components/ui';

const TYPE_FILTERS = [
  { value: 'ALL', label: 'Semua' },
  { value: 'INCOME', label: 'Masuk' },
  { value: 'EXPENSE', label: 'Keluar' },
];

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Terbaru' },
  { value: 'date_asc', label: 'Terlama' },
  { value: 'amount_desc', label: 'Jumlah Terbesar' },
  { value: 'amount_asc', label: 'Jumlah Terkecil' },
];

export function FilterBar({ search, onSearchChange, typeFilter, onTypeFilterChange, sortBy, onSortChange, resultCount, animate = true }) {
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center" initial={animate ? { opacity: 0, y: -10 } : false} animate={animate ? { opacity: 1, y: 0 } : false} transition={{ duration: 0.3 }}>
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 pointer-events-none" aria-hidden="true" />
        <input type="search" placeholder="Cari transaksi..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-150" aria-label="Cari transaksi" />
        {search && (
          <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" aria-label="Hapus pencarian">
            <X size={16} strokeWidth={2} />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Select value={typeFilter} onChange={(e) => onTypeFilterChange(e.target.value)} options={TYPE_FILTERS} className="w-auto min-w-[130px]" aria-label="Filter tipe" />
        <div className="relative" ref={sortRef}>
          <Button variant="outline" size="sm" onClick={() => setShowSort(!showSort)} className="gap-1.5 min-w-[130px] justify-between" aria-haspopup="listbox" aria-expanded={showSort}>
            <Filter size={16} strokeWidth={2} className="text-slate-400 dark:text-slate-500" />
            <span>{sortBy === 'date_desc' ? 'Terbaru' : sortBy === 'date_asc' ? 'Terlama' : sortBy === 'amount_desc' ? 'Jumlah Terbesar' : 'Jumlah Terkecil'}</span>
            <svg className={cn('w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform', showSort && 'rotate-180')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 9l6 6 6-6" /></svg>
          </Button>
          <AnimatePresence>
            {showSort && (
              <motion.div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-20" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} role="listbox">
                {SORT_OPTIONS.map((option) => (
                  <button key={option.value} onClick={() => { onSortChange(option.value); setShowSort(false); }} className={cn('w-full px-3 py-2 text-left text-sm transition-colors', sortBy === option.value ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700')} role="option" aria-selected={sortBy === option.value}>
                    <span className="flex items-center justify-between">{option.label}{sortBy === option.value && <span className="text-indigo-600 dark:text-indigo-400">✓</span>}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <motion.div className="hidden sm:flex items-center px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-mono text-slate-600 dark:text-slate-400 tabular-nums" initial={false} animate={{ opacity: 1 }}>
        {resultCount} baris
      </motion.div>
    </motion.div>
  );
}