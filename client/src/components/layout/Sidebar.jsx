import { motion, AnimatePresence } from 'framer-motion';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';
import { sidebarVariants } from '@/lib/animations';
import { LayoutDashboard, List, LogOut, BookOpen, User, Settings } from 'lucide-react';
import { getInitials } from '@/lib/utils';

const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'ledger', icon: List, label: 'Buku Kas' },
];

export function Sidebar({ isOpen, onClose, activeView, onNavigate, user, onLogout }) {
  return (
    <Fragment>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={cn(
          'fixed lg:sticky top-0 z-40 h-screen lg:h-[calc(100vh-4rem)] bg-slate-900 text-white flex flex-col',
          'border-r border-slate-800',
          'transition-all duration-300'
        )}
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        role="navigation"
        aria-label="Navigasi utama"
      >
        <div className="flex items-center gap-3 p-4 px-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
            <BookOpen size={20} className="text-indigo-400" />
          </div>
          <span className="font-bold text-lg tracking-tight truncate">KeuanganKu</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Menu utama">
          {NAV_ITEMS.map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <item.icon size={18} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800 space-y-1">
            <button
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
                'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <User size={18} strokeWidth={2} aria-hidden="true" />
              <span>Profil</span>
            </button>
            <button
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
                'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <Settings size={18} strokeWidth={2} aria-hidden="true" />
              <span>Pengaturan</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-indigo-300 font-mono">{getInitials(user?.name)}</span>
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
              'text-slate-400 hover:bg-rose-500/10 hover:text-rose-400'
            )}
          >
            <LogOut size={18} strokeWidth={2} aria-hidden="true" />
            <span>Keluar</span>
          </button>
        </div>
      </motion.aside>
    </Fragment>
  );
}