import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const icon = {
            success: <CheckCircle2 className="w-5 h-5 text-[#34C759] shrink-0" />,
            info: <Info className="w-5 h-5 text-[#0071E3] shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-[#FF9500] shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-[#FF3B30] shrink-0" />,
          }[toast.type || 'info'];

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.16, ease: [0.23, 1, 0.32, 1] } }}
              transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
              className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl bg-white/95 dark:bg-[#16212F]/95 backdrop-blur-xl border border-black/[0.08] dark:border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.4)] text-[#1D1D1F] dark:text-white"
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-sm font-semibold tracking-tight leading-tight">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-[#86868B] dark:text-slate-300 mt-0.5 leading-relaxed break-words">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss Notification"
                className="p-1 -mr-1 rounded-full text-[#86868B] dark:text-slate-400 hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
