import { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function PageShell({ children, user, onLogout, activeView, onNavigate, pageTitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onNavigate={onNavigate}
        user={user}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          onLogout={onLogout}
          title={pageTitle}
        />

        <main className="flex-1 overflow-auto">
          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={fadeIn.transition}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}