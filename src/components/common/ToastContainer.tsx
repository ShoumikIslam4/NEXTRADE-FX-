import React from 'react';
import { useToast } from '../../contexts/ToastContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const icon = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
          info: <Info className="w-4 h-4 text-blue-400 shrink-0" />
        }[toast.type];

        const border = {
          success: 'border-emerald-500/40 bg-[#151F30]/95',
          warning: 'border-amber-500/40 bg-[#151F30]/95',
          error: 'border-rose-500/40 bg-[#151F30]/95',
          info: 'border-blue-500/40 bg-[#151F30]/95'
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-xl backdrop-blur-md transition-all duration-200 ${border}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white tracking-wide">{toast.title}</div>
              {toast.message && (
                <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
