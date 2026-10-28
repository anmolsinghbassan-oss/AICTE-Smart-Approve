import React from 'react';
import { AlertTriangle, Clock, X, ArrowRight } from 'lucide-react';
import { useAlerts } from '../context/AlertsContext';
import { Link } from 'react-router-dom';

export const DeadlineToast: React.FC = () => {
  const { activeToast, closeToast, acknowledgeAlert } = useAlerts();

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-24 left-4 sm:left-6 z-50 max-w-sm w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-red-500/80 p-4 animate-in slide-in-from-left duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 animate-bounce" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
              Critical Statutory Alert
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Urgent
            </span>
          </div>
          <h5 className="font-bold text-xs text-slate-900 dark:text-white mt-1">
            {activeToast.title}
          </h5>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
            {activeToast.message}
          </p>
          <div className="text-[10px] font-semibold text-slate-500 mt-1">
            Target: {activeToast.institutionName}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              onClick={() => acknowledgeAlert(activeToast.id)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition shadow-xs"
            >
              Acknowledge
            </button>
            <Link
              to="/alerts"
              onClick={closeToast}
              className="text-xs font-semibold text-aicte-600 dark:text-saffron-400 hover:underline flex items-center gap-1"
            >
              Alert Center <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
        <button
          onClick={closeToast}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
