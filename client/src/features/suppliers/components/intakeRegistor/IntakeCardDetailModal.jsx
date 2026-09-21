import React, { useState } from 'react';
import {
  X,
  Droplets,
  DollarSign,
  TrendingUp,
  Clock,
  Search,
  CheckCircle2,
  Eye,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Drilldown modal for milk intake summary metrics
export default function IntakeCardDetailModal({
  cardType,
  onClose,
  intakeLogs = [],
  totals = {},
  updateBatchSettlement,
  onViewBatch,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!cardType) return null;

  // Filter logs for modal table
  const filteredLogs = intakeLogs.filter((log) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      log.supplierName.toLowerCase().includes(q) ||
      (log.id && log.id.toLowerCase().includes(q)) ||
      (log.area && log.area.toLowerCase().includes(q)) ||
      (log.receivedBy && log.receivedBy.toLowerCase().includes(q));

    if (cardType === 'pending') {
      return matchesSearch && log.settlement !== 'Paid';
    }
    return matchesSearch;
  });

  // Modal configuration based on cardType
  const config = {
    volume: {
      title: 'Procured Milk Volume Breakdown',
      subtitle: `Viewing ${(totals.totalProcuredVolume || 0).toLocaleString()} Liters procured across ${totals.totalRecords || 0} batches`,
      icon: Droplets,
      color: '#155dfc',
      badge: 'Procured Volume',
    },
    spend: {
      title: 'Milk Procurement Spend Breakdown',
      subtitle: `Total procurement expenditure of Rs. ${(totals.totalIntakeSpend || 0).toLocaleString()}`,
      icon: DollarSign,
      color: '#009966',
      badge: 'Procurement Spend',
    },
    rate: {
      title: 'Purchase Rate & Quality Analysis',
      subtitle: `Weighted average purchase rate of Rs. ${(totals.avgPurchaseRate || 0).toFixed(1)} / L with lab tests`,
      icon: TrendingUp,
      color: '#4f39f6',
      badge: 'Quality & Rates',
    },
    pending: {
      title: 'Pending Milk Intake Settlements',
      subtitle: `Unsettled supplier payables totaling Rs. ${(totals.pendingSettlements || 0).toLocaleString()}`,
      icon: Clock,
      color: '#d97706',
      badge: 'Pending Due',
    },
  }[cardType] || {
    title: 'Intake Statistics Detail',
    subtitle: 'Summary breakdown',
    icon: Droplets,
    color: '#155dfc',
    badge: 'Details',
  };

  const Icon = config.icon;

  // Rate range calculations
  const rates = intakeLogs.map((l) => parseFloat(l.ratePerLiter) || 0).filter((r) => r > 0);
  const minRate = rates.length > 0 ? Math.min(...rates) : 220;
  const maxRate = rates.length > 0 ? Math.max(...rates) : 230;

  // Quality averages
  const avgFat =
    intakeLogs.length > 0
      ? (intakeLogs.reduce((sum, l) => sum + (parseFloat(l.fat) || 0), 0) / intakeLogs.length).toFixed(1)
      : '5.2';

  const avgLR =
    intakeLogs.length > 0
      ? (intakeLogs.reduce((sum, l) => sum + (parseFloat(l.lr) || 0), 0) / intakeLogs.length).toFixed(1)
      : '28.8';

  const totalVol = totals.totalProcuredVolume || 1;
  const morningPct = Math.round(((totals.morningVolume || 0) / totalVol) * 100);
  const eveningPct = Math.round(((totals.eveningVolume || 0) / totalVol) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        style={{ borderTop: `5px solid ${config.color}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: `${config.color}15` }}
            >
              <Icon style={{ width: 20, height: 20, color: config.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                  {config.title}
                </h3>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: `${config.color}15`,
                    color: config.color,
                  }}
                >
                  {config.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{config.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Top Summary KPI Pill Row */}
        <div className="p-4 bg-white border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {cardType === 'volume' && (
            <>
              <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                <span className="text-[11px] text-blue-700 font-medium block">Total Volume</span>
                <span className="text-lg font-bold text-blue-800 tabular">
                  {(totals.totalProcuredVolume || 0).toLocaleString()} L
                </span>
              </div>
              <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                <span className="text-[11px] text-amber-700 font-medium block">
                  Morning Shift ({morningPct}%)
                </span>
                <span className="text-lg font-bold text-amber-800 tabular">
                  {(totals.morningVolume || 0).toFixed(1)} L
                </span>
              </div>
              <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                <span className="text-[11px] text-indigo-700 font-medium block">
                  Evening Shift ({eveningPct}%)
                </span>
                <span className="text-lg font-bold text-indigo-800 tabular">
                  {(totals.eveningVolume || 0).toFixed(1)} L
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">Total Slips</span>
                <span className="text-lg font-bold text-slate-900">{totals.totalRecords}</span>
              </div>
            </>
          )}

          {cardType === 'spend' && (
            <>
              <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[11px] text-emerald-700 font-medium block">Total Spend</span>
                <span className="text-lg font-bold text-emerald-700 tabular">
                  Rs. {(totals.totalIntakeSpend || 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">Avg Slip Value</span>
                <span className="text-lg font-bold text-slate-900 tabular">
                  Rs.{' '}
                  {Math.round(
                    (totals.totalIntakeSpend || 0) / Math.max(1, totals.totalRecords || 1)
                  ).toLocaleString()}
                </span>
              </div>
              <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                <span className="text-[11px] text-blue-700 font-medium block">Paid Slips</span>
                <span className="text-lg font-bold text-blue-700">
                  {intakeLogs.filter((l) => l.settlement === 'Paid').length}
                </span>
              </div>
              <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                <span className="text-[11px] text-amber-700 font-medium block">Pending Payable</span>
                <span className="text-lg font-bold text-amber-700 tabular">
                  Rs. {(totals.pendingSettlements || 0).toLocaleString()}
                </span>
              </div>
            </>
          )}

          {cardType === 'rate' && (
            <>
              <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                <span className="text-[11px] text-indigo-700 font-medium block">Avg Rate</span>
                <span className="text-lg font-bold text-indigo-700 tabular">
                  Rs. {(totals.avgPurchaseRate || 0).toFixed(1)} / L
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">Rate Spread</span>
                <span className="text-sm font-bold text-slate-900 block mt-1 tabular">
                  Rs. {minRate} - Rs. {maxRate}
                </span>
              </div>
              <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[11px] text-emerald-700 font-medium block">Average Fat</span>
                <span className="text-lg font-bold text-emerald-700 tabular">{avgFat}%</span>
              </div>
              <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                <span className="text-[11px] text-blue-700 font-medium block">Average LR</span>
                <span className="text-lg font-bold text-blue-700 tabular">{avgLR}</span>
              </div>
            </>
          )}

          {cardType === 'pending' && (
            <>
              <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                <span className="text-[11px] text-amber-700 font-medium block">Pending Amount</span>
                <span className="text-lg font-bold text-amber-700 tabular">
                  Rs. {(totals.pendingSettlements || 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">Pending Slips</span>
                <span className="text-lg font-bold text-slate-900">
                  {intakeLogs.filter((l) => l.settlement !== 'Paid').length}
                </span>
              </div>
              <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[11px] text-emerald-700 font-medium block">Settled Slips</span>
                <span className="text-lg font-bold text-emerald-700">
                  {intakeLogs.filter((l) => l.settlement === 'Paid').length}
                </span>
              </div>
              <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                <span className="text-[11px] text-purple-700 font-medium block">Pending Liters</span>
                <span className="text-lg font-bold text-purple-700 tabular">
                  {intakeLogs
                    .filter((l) => l.settlement !== 'Paid')
                    .reduce((sum, l) => sum + (l.quantity || 0), 0)
                    .toFixed(1)}{' '}
                  L
                </span>
              </div>
            </>
          )}
        </div>

        {/* 3. Search Bar */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search slips by supplier name, slip ID, area, or receiver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-medium text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* 4. Detail Table / List Area */}
        <div className="overflow-y-auto max-h-[48vh] p-4 sm:p-5">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No matching intake slips found for this view.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
              {filteredLogs.map((log) => {
                const qty = parseFloat(log.quantity) || 0;
                const cost = parseFloat(log.totalCost) || qty * (parseFloat(log.ratePerLiter) || 220);

                return (
                  <div
                    key={log.id}
                    className="p-3.5 bg-white hover:bg-slate-50/90 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Left: Slip & Supplier Info */}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5"
                        style={{
                          backgroundColor: `${config.color}15`,
                          color: config.color,
                        }}
                      >
                        {log.shift === 'Morning' ? 'M' : 'E'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm font-display">
                            {log.supplierName}
                          </span>
                          <span className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded">
                            {log.id}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold ${
                              log.shift === 'Morning'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-indigo-50 text-indigo-700'
                            }`}
                          >
                            {log.shift}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{log.date}</span>
                          </div>
                          {log.fat && (
                            <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-[10px] text-slate-600">
                              Fat: {log.fat}% · LR: {log.lr || '28.5'}
                            </span>
                          )}
                          <span className="text-slate-300">·</span>
                          <span>{log.area || 'Direct Supply'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quantity, Amount & Settlement Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900 tabular block">
                          {qty.toFixed(1)} L
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 tabular">
                          Rs. {cost.toLocaleString()}
                        </span>
                      </div>

                      {/* Interactive Settlement Badge / Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (updateBatchSettlement) {
                            updateBatchSettlement(
                              log.id,
                              log.settlement === 'Paid' ? 'Pending' : 'Paid'
                            );
                          }
                        }}
                        title="Click to toggle payment status"
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer shadow-2xs hover:scale-105 ${
                          log.settlement === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {log.settlement === 'Paid' ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        <span>{log.settlement || 'Pending'}</span>
                      </button>

                      {/* View Detail Button */}
                      {onViewBatch && (
                        <button
                          type="button"
                          onClick={() => {
                            onViewBatch(log);
                            onClose();
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="View Full Intake Slip"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredLogs.length}</strong> of{' '}
            {intakeLogs.length} collection slips
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
}
