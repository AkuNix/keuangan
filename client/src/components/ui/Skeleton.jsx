import { cn } from '@/lib/utils';
import { shimmer } from '@/lib/animations';
import { motion } from 'framer-motion';

export function Skeleton({ className, variant = 'text', width, height, count, ...props }) {
  const baseStyles = 'relative overflow-hidden bg-slate-200 rounded';

  const variants = {
    text: 'h-4',
    title: 'h-6 w-3/4',
    avatar: 'rounded-full',
    card: 'rounded-xl',
    button: 'h-10 rounded-xl',
    circle: 'rounded-full',
  };

  const SkeletonItem = () => (
    <motion.div
      className={cn(baseStyles, variants[variant], className)}
      style={{ width, height }}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100 to-transparent"
        animate={shimmer}
      />
    </motion.div>
  );

  if (count) {
    return (
      <div className={cn('space-y-3', className)} {...props}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonItem key={i} />
        ))}
      </div>
    );
  }

  return <SkeletonItem {...props} />;
}

export function SkeletonTable({ rows = 5, columns = 5, className }) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" height="12" width="60%" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, col) => (
            <Skeleton key={col} variant="text" height="16" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn('space-y-4', className)}>
      <Skeleton variant="title" />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
      <div className="flex gap-3 pt-2">
        <Skeleton variant="button" width="100px" />
        <Skeleton variant="button" width="100px" />
      </div>
    </div>
  );
}

export function SkeletonChart({ className, height = 200 }) {
  return (
    <div className={cn('space-y-4', className)}>
      <Skeleton variant="title" />
      <Skeleton variant="card" height={height} className="bg-slate-50" />
    </div>
  );
}