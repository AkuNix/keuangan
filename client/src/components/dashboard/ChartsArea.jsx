import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatIDR, formatShort, CAT_COLORS } from '@/lib/utils';
import { Card } from '@/components/ui';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const colors = { income: '#16a34a', expense: '#dc2626' };
  return (
    <motion.div className="bg-slate-900 text-white rounded-lg shadow-lg p-3 min-w-[180px] border border-slate-800" initial={false} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.15 }}>
      <p className="text-xs font-medium text-slate-400 mb-2 capitalize">{label}</p>
      {payload.map((p, i) => (
        <motion.div key={p.dataKey} className="flex items-center justify-between gap-3 py-1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.2 }}>
          <span className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded" style={{ backgroundColor: colors[p.dataKey] || CAT_COLORS[i % CAT_COLORS.length] }} />
            {p.name}
          </span>
          <span className="font-mono font-semibold tabular-nums text-right">{formatIDR(p.value)}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <motion.div className="bg-slate-900 text-white rounded-lg shadow-lg p-3 min-w-[160px] border border-slate-800" initial={false} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.15 }}>
      <p className="font-medium text-sm mb-1">{item.name}</p>
      <p className="font-mono font-bold text-lg tabular-nums">{formatIDR(item.value)}</p>
      <p className="text-xs text-slate-400 mt-1">{(item.percent * 100).toFixed(1)}% dari total</p>
    </motion.div>
  );
}

export function BarChartCard({ data, animate = true, title = 'Arus Kas Bulanan' }) {
  const containerRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!animate || hasAnimated) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setHasAnimated(true); observer.disconnect(); } }, { threshold: 0.3 });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [animate, hasAnimated]);

  if (!data.length) {
    return (
      <Card className="h-[320px] flex items-center justify-center">
        <div className="text-center text-slate-500 dark:text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <p className="font-medium">Belum ada data</p>
          <p className="text-sm mt-1">Transaksi akan muncul di sini</p>
        </div>
      </Card>
    );
  }

  return (
    <Card ref={containerRef} className="h-[360px]">
      <div className="mb-6"><h3 className="font-bold text-slate-900 dark:text-white">{title}</h3></div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={4} barCategoryGap={12}>
            <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} axisTick={false} />
            <YAxis tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={formatShort} tickCount={5} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(15, 23, 42, 0.03)' }} />
            <Bar dataKey="income" name="Pemasukan" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={hasAnimated} animationDuration={600} animationEasing="easeOut" />
            <Bar dataKey="expense" name="Pengeluaran" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={hasAnimated} animationDuration={600} animationEasing="easeOut" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-4">
        {[{ label: 'Pemasukan', color: '#16a34a' }, { label: 'Pengeluaran', color: '#dc2626' }].map((item) => (
          <motion.span key={item.label} className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400" initial={false} animate={{ opacity: 1, x: 0 }} transition={{ delay: hasAnimated ? 0.6 : 0, duration: 0.3 }}>
            <motion.div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} initial={false} animate={{ scale: [0, 1] }} transition={{ delay: hasAnimated ? 0.7 : 0, type: 'spring', stiffness: 200 }} />
            {item.label}
          </motion.span>
        ))}
      </div>
    </Card>
  );
}

export function PieChartCard({ data, total, animate = true, title = 'Per Kategori' }) {
  const containerRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!animate || hasAnimated) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setHasAnimated(true); observer.disconnect(); } }, { threshold: 0.3 });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [animate, hasAnimated]);

  if (!data.length) {
    return (
      <Card className="h-[320px] flex items-center justify-center">
        <div className="text-center text-slate-500 dark:text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={1.5} /><path d="M12 6v6l4 2" strokeWidth={1.5} strokeLinecap="round" /></svg>
          <p className="font-medium">Belum ada pengeluaran</p>
          <p className="text-sm mt-1">Kategori akan muncul di sini</p>
        </div>
      </Card>
    );
  }

  return (
    <Card ref={containerRef} className="h-[360px]">
      <div className="mb-4"><h3 className="font-bold text-slate-900 dark:text-white">{title}</h3></div>
      <div className="flex flex-col lg:flex-row items-center gap-6 h-[280px]">
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <ResponsiveContainer width="100%" height="200">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value" strokeWidth={0} isAnimationActive={hasAnimated} animationDuration={800} animationEasing="easeOut">
                {data.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full lg:w-64 space-y-2">
          {data.slice(0, 6).map((item, i) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <motion.div key={item.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors" initial={false} animate={{ opacity: 1, x: 0 }} transition={{ delay: hasAnimated ? 0.5 + i * 0.06 : 0, duration: 0.3 }}>
                <motion.div className="w-2.5 h-2.5 rounded flex-shrink-0" style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }} initial={false} animate={{ scale: [0, 1] }} transition={{ delay: hasAnimated ? 0.6 + i * 0.06 : 0, type: 'spring', stiffness: 200 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatIDR(item.value)}</p>
                </div>
                <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums text-right whitespace-nowrap">{pct}%</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export function ChartsArea({ stats, animate = true }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" role="region" aria-label="Grafik keuangan">
      <motion.div className="lg:col-span-2" initial={animate ? { opacity: 0, y: 20 } : false} animate={animate ? { opacity: 1, y: 0 } : false} transition={{ duration: 0.4, delay: 0.1 }}>
        <BarChartCard data={stats.monthlyTrend} animate={animate} />
      </motion.div>
      <motion.div initial={animate ? { opacity: 0, y: 20 } : false} animate={animate ? { opacity: 1, y: 0 } : false} transition={{ duration: 0.4, delay: 0.2 }}>
        <PieChartCard data={stats.categoryBreakdown} total={stats.totalExpense} animate={animate} />
      </motion.div>
    </div>
  );
}