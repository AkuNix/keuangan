import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { modalOverlay, modalContent } from '@/lib/animations';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function Modal({ isOpen, onClose, title, description, children, size = 'md', className, showClose = true }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          <motion.div
            ref={overlayRef}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            variants={modalOverlay}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={contentRef}
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full z-50',
              'bg-white rounded-2xl shadow-xl',
              sizes[size],
              className
            )}
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-description' : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || showClose) && (
              <div className="flex items-start justify-between p-6 border-b border-slate-100">
                <div>
                  {title && (
                    <h2 id="modal-title" className="text-lg font-bold text-slate-900">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id="modal-description" className="mt-1 text-sm text-slate-500">
                      {description}
                    </p>
                  )}
                </div>
                {showClose && (
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                    aria-label="Tutup"
                  >
                    <X size={18} strokeWidth={2} />
                  </button>
                )}
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}

export function ModalFooter({ children, className }) {
  return (
    <div className={cn('mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3', className)}>
      {children}
    </div>
  );
}