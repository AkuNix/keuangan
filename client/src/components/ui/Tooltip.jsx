import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tooltip } from '@/lib/animations';

export function Tooltip({ children, content, position = 'top', delay = 200, className }) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-900',
  };

  return (
    <div className="relative inline-block" ref={triggerRef} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {typeof children === 'function' ? children({ ref: triggerRef }) : children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            className={cn(
              'fixed z-50 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg shadow-lg pointer-events-none',
              positions[position],
              className
            )}
            variants={tooltip}
            initial="hidden"
            animate="visible"
            exit="hidden"
            role="tooltip"
            id="tooltip"
          >
            {content}
            <div
              className="absolute w-0 h-0 border-4 border-transparent"
              style={{ borderColor: 'transparent' }}
            >
              <div className={cn('absolute w-0 h-0 border-4 border-transparent', arrows[position])} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}