import React, { useState, useEffect } from 'react';
import { History, ChevronDown, ChevronUp, Lock, CheckCircle2, RotateCcw } from 'lucide-react';
import { getClosingHistory } from '../../services/dailyClosingService';

export default function PreviousClosingsHistory({ onSelectDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && history.length === 0) {
      setLoading(true);
      getClosingHistory(20)
        .then((data) => setHistory(data))
        .catch((err) => console.warn('History fetch notice:', err.message))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const formatRs = (val) => `Rs. ${Number(val || 0).toLocaleString('en-PK')}`;
  const formatL = (val) => `${Number(val || 0).toFixed(1)} L`;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all">
      <div
        className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-800/20 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Previous Closing Logs (Audit History)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              View past confirmed snapshots and variances across previous business dates
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800">
          {loading ? (
            <div className="text-center py-6 text-xs text-slate-400 animate-pulse">
              Loading closing records...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 italic">
              No historical daily closing records confirmed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm min-w-[650px]">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Expected Milk</th>
                    <th className="py-2.5 px-3 text-right">Physical Dip</th>
                    <th className="py-2.5 px-2 text-center">Variance</th>
                    <th className="py-2.5 px-3 text-right">Collected</th>
                    <th className="py-2.5 px-3 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {history.map((h) => (
                    <tr
                      key={h.id}
                      onClick={() => onSelectDate && onSelectDate(h.date)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                        {h.date}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <Lock className="w-2.5 h-2.5" />
                          {h.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-600 dark:text-slate-400">
                        {formatL(h.expectedMilk)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900 dark:text-slate-100">
                        {formatL(h.physicalMilk)}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold">
                        <span className={Math.abs(h.milkVariance) <= 0.5 ? 'text-emerald-600' : 'text-amber-600'}>
                          {h.milkVariance > 0 ? `+${h.milkVariance}` : h.milkVariance} L
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900 dark:text-slate-100">
                        {formatRs(h.totalCollected)}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${h.estimatedProfit >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                        {formatRs(h.estimatedProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
