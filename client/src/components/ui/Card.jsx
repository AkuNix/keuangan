import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Card = forwardRef(({ className, children, variant = 'default', padding = 'md', hover, animate = true, ...props }, ref) => {
  const variants = {
    default: 'bg-white border border-slate-200/70 shadow-sm',
    elevated: 'bg-white border border-slate-200/50 shadow-md',
    hero: 'bg-slate-900 border-0 shadow-lg',
    subtle: 'bg-slate-50/50 border border-slate-100',
    glass: 'bg-white/80 backdrop-blur-md border border-slate-200/60',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseStyles = 'rounded-2xl transition-shadow duration-200';

  return (
    <motion.div
      ref={ref}
      className={cn(baseStyles, variants[variant], paddings[padding], className)}
      initial={animate ? { opacity: 0, y: 12 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { y: -2, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

export const CardHeader = forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('mb-4', className)} {...props}>
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

export const CardTitle = ({ className, children, ...props }) => (
  <h3 className={cn('text-lg font-bold text-slate-900 tracking-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }) => (
  <p className={cn('mt-1 text-sm text-slate-500', className)} {...props}>
    {children}
  </p>
);

export const CardContent = forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn(className)} {...props}>
    {children}
  </div>
));

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('mt-4 pt-4 border-t border-slate-100 flex items-center gap-3', className)} {...props}>
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

export { Card };