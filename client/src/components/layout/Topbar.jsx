import { motion } from 'framer-motion';
import { fadeDown } from '@/lib/animations';
import { Menu, Bell, ChevronDown, Sun, Moon } from 'lucide-react';
import { useClock } from '@/hooks/useClock';
import { useTheme } from '@/hooks/useTheme';
import { getInitials } from '@/lib/utils';
import { Button } from '@/components/ui';

export function Topbar({ onMenuClick, user, onLogout, title }) {
  const now = useClock();
  const { theme, toggleTheme } = useTheme();

  const timeString = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  });

  const dateString = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-14 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden p-2"
              aria-label="Buka menu"
            >
              <Menu size={20} strokeWidth={2.5} />
            </Button>
            <motion.div
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              transition={fadeDown.transition}
              className="hidden sm:block truncate"
            >
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
            </motion.div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={fadeDown.transition}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-mono text-xs text-slate-600 dark:text-slate-400"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="text-slate-400 dark:text-slate-500">{dateString}</span>
              <span className="w-px h-4 bg-slate-200 dark:bg-slate-600 mx-1" />
              <span className="font-tab font-semibold text-slate-900 dark:text-white tabular-nums">{timeString}</span>
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider">WIB</span>
            </motion.div>

            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
              aria-label={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 180 : 0, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {theme === 'dark' ? (
                  <Sun size={20} strokeWidth={2} className="text-amber-400" />
                ) : (
                  <Moon size={20} strokeWidth={2} className="text-slate-500" />
                )}
              </motion.div>
            </motion.button>

            <div className="relative">
              <button
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                aria-label="Notifikasi"
              >
                <Bell size={20} strokeWidth={2} className="text-slate-500 dark:text-slate-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">3</span>
              </button>
            </div>

            <div className="relative group">
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                aria-label="Menu pengguna"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 font-mono">{getInitials(user?.name)}</span>
                </div>
                <span className="hidden sm:block text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{user?.name}</span>
                <ChevronDown size={16} strokeWidth={2.5} className="text-slate-400 dark:text-slate-500 hidden sm:block" />
              </button>

              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}