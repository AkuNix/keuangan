import { cn } from '@/lib/utils';

export function Badge({ className, variant = 'default', size = 'md', children, dot, ...props }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    primary: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border border-amber-100',
    danger: 'bg-rose-50 text-rose-700 border border-rose-100',
    income: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    expense: 'bg-rose-50 text-rose-700 border border-rose-100',
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    inactive: 'bg-slate-100 text-slate-600 border border-slate-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const baseStyles = 'inline-flex items-center font-semibold rounded-full border transition-colors';

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dot === 'income' && 'bg-emerald-500', dot === 'expense' && 'bg-rose-500', dot === 'active' && 'bg-emerald-500 animate-pulse', dot === 'inactive' && 'bg-slate-400')} />}
      {children}
    </span>
  );
}

export function StatusDot({ status, className, size = 'md' }) {
  const sizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const colors = {
    active: 'bg-emerald-500',
    inactive: 'bg-slate-400',
    pending: 'bg-amber-500',
    error: 'bg-rose-500',
  };

  return (
    <span
      className={cn('rounded-full', sizes[size], colors[status], className)}
      aria-label={status}
    />
  );
}