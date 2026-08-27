import { motion } from 'framer-motion';
import { fadeDown } from '@/lib/animations';
import { Menu, Bell, ChevronDown } from 'lucide-react';
import { useClock } from '@/hooks/useClock';
import { getInitials } from '@/lib/utils';
import { Button } from '@/components/ui';

export function Topbar({ onMenuClick, user, _onLogout, title }) {
  const now = useClock();

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
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
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
              <h1 className="text-base font-bold text-slate-900 tracking-tight">{title}</h1>
            </motion.div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={fadeDown.transition}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 font-mono text-xs text-slate-600"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="text-slate-400">{dateString}</span>
              <span className="w-px h-4 bg-slate-200 mx-1" />
              <span className="font-tab font-semibold text-slate-900 tabular-nums">{timeString}</span>
              <span className="text-slate-400 text-[10px] uppercase tracking-wider">WIB</span>
            </motion.div>

            <div className="relative">
              <button
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                aria-label="Notifikasi"
              >
                <Bell size={20} strokeWidth={2} className="text-slate-500" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">3</span>
              </button>
            </div>

            <div className="relative">
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-505/30"
                aria-label="Menu pengguna"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-indigo-700 font-mono">{getInitials(user?.name)}</span>
                </div>
                <span className="hidden sm:block text-sm font-semibold text-slate-700 truncate max-w-[120px]">{user?.name}</span>
                <ChevronDown size={16} strokeWidth={2.5} className="text-slate-400 hidden sm:block" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}