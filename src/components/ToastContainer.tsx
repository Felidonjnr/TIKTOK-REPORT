import React from 'react';
import { useToast } from '../lib/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />,
  error: <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0" />,
  info: <Info className="text-blue-500 w-5 h-5 flex-shrink-0" />
};

const bgColors = {
  success: 'bg-white border-green-200',
  error: 'bg-white border-red-200',
  info: 'bg-white border-blue-200'
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg border ${bgColors[toast.type]} min-w-[300px] max-w-md`}
          >
            {icons[toast.type]}
            <span className="flex-1 text-sm font-medium text-slate-700">{toast.message}</span>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
