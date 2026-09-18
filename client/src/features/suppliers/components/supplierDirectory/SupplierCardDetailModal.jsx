import React, { useState } from 'react';
import {
  X,
  Users,
  Droplets,
  Receipt,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Wallet,
  ArrowRight,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * SupplierCardDetailModal
 * Renders a rich, interactive drilldown modal when clicking any summary card in Supplier Directory:
 * 1. 'vendors'  -> Registered Suppliers Breakdown
 * 2. 'sourced'  -> Total Procured Milk Volume Breakdown
 * 3. 'payouts'  -> Disbursed Supplier Payouts Breakdown
 * 4. 'balances' -> Outstanding Supplier Balances Due (with 1-click settle)
 */
export default function SupplierCardDetailModal({
  cardType,
  onClose,
  suppliers = [],
  totals = {},
  onSelectSupplier,
  settleSupplierBalance,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!cardType) return null;

  // Filter suppliers for the active card modal
  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      (s.id && s.id.toLowerCase().includes(q)) ||
      (s.area && s.area.toLowerCase().includes(q));

    if (cardType === 'balances') {
      return matchesSearch && (s.balanceDue || 0) > 0;
    }
    if (cardType === 'payouts') {
      return matchesSearch && (s.totalPayout || 0) > 0;
    }
    if (cardType === 'sourced') {
      return matchesSearch && (s.totalSourced || 0) > 0;
    }
    return matchesSearch;
  });

  // Modal configuration based on cardType
  const config = {
    vendors: {
      title: 'Registered Supplier Directory Breakdown',
      subtitle: `Viewing all ${totals.totalSuppliers || totals.totalVendors || suppliers.length} registered dairy farmers & collection centers`,
      icon: Users,
      color: '#009966',
      badge: 'Total Suppliers',
    },
    sourced: {
      title: 'Procured Milk Volume Analysis',
      subtitle: `Detailed breakdown of ${(totals.totalSourcedLiters || 0).toLocaleString()} Liters procured across suppliers`,
      icon: Droplets,
      color: '#155dfc',
      badge: 'Volume Breakdown',
    },
    payouts: {
      title: 'Disbursed Supplier Payouts',
      subtitle: `Disbursed farmer payments totaling Rs. ${(totals.totalPayouts || 0).toLocaleString()}`,
      icon: Receipt,
      color: '#10b981',
      badge: 'Payout Records',
    },
    balances: {
      title: 'Outstanding Supplier Balances Due',
      subtitle: `Pending payables of Rs. ${(totals.outstandingBalances || 0).toLocaleString()} awaiting clearance`,
      icon: Clock,
      color: '#d97706',
      badge: 'Pending Due',
    },
  }[cardType] || {
    title: 'Supplier Statistics Detail',
    subtitle: 'Summary breakdown',
    icon: Users,
    color: '#009966',
    badge: 'Details',
  };

  const Icon = config.icon;
  const totalVolume = totals.totalSourcedLiters || 1;

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
          {cardType === 'vendors' && (
            <>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">Total Suppliers</span>
                <span className="text-lg font-bold text-slate-900">{totals.totalSuppliers ?? totals.totalVendors}</span>
              </div>
              <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[11px] text-emerald-700 font-medium block">Active</span>
                <span className="text-lg font-bold text-emerald-700">{totals.activeSuppliers ?? totals.activeVendors}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">Inactive</span>
                <span className="text-lg font-bold text-slate-600">{totals.inactiveSuppliers ?? totals.inactiveVendors}</span>
              </div>
              <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                <span className="text-[11px] text-blue-700 font-medium block">Avg Rate</span>
                <span className="text-lg font-bold text-blue-700">
                  Rs.{' '}
                  {suppliers.length > 0
                    ? Math.round(
                        suppliers.reduce((sum, s) => sum + (s.ratePerLiter || 0), 0) /
                          suppliers.length
                      )
                    : 220}
                </span>
              </div>
            </>
          )}

          {cardType === 'sourced' && (
            <>
              <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                <span className="text-[11px] text-blue-700 font-medium block">Total Procured</span>
                <span className="text-lg font-bold text-blue-800 tabular">
                  {(totals.totalSourcedLiters || 0).toLocaleString()} L
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">Active Suppliers</span>
                <span className="text-lg font-bold text-slate-900">
                  {suppliers.filter((s) => (s.totalSourced || 0) > 0).length}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">Avg per Supplier</span>
                <span className="text-lg font-bold text-slate-900 tabular">
                  {(
                    (totals.totalSourcedLiters || 0) /
                    Math.max(1, suppliers.filter((s) => (s.totalSourced || 0) > 0).length)
                  ).toFixed(1)}{' '}
                  L
                </span>
              </div>
              <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                <span className="text-[11px] text-purple-700 font-medium block">Gross Billed</span>
                <span className="text-lg font-bold text-purple-700 tabular">
                  Rs.{' '}
                  {suppliers
                    .reduce((sum, s) => sum + (s.grossProcuredValue || 0), 0)
                    .toLocaleString()}
                </span>
              </div>
            </>
          )}

          {cardType === 'payouts' && (
            <>
              <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[11px] text-emerald-700 font-medium block">Total Disbursed</span>
                <span className="text-lg font-bold text-emerald-700 tabular">
                  Rs. {(totals.totalPayouts || 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">Paid Suppliers</span>
                <span className="text-lg font-bold text-slate-900">
                  {suppliers.filter((s) => (s.totalPayout || 0) > 0).length}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">Paid Ratio</span>
                <span className="text-lg font-bold text-slate-900 tabular">
                  {totals.totalPayouts + totals.outstandingBalances > 0
                    ? Math.round(
                        (totals.totalPayouts /
                          (totals.totalPayouts + totals.outstandingBalances)) *
                          100
                      )
                    : 100}
                  %
                </span>
              </div>
              <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                <span className="text-[11px] text-amber-700 font-medium block">Pending Balance</span>
                <span className="text-lg font-bold text-amber-700 tabular">
                  Rs. {(totals.outstandingBalances || 0).toLocaleString()}
                </span>
              </div>
            </>
          )}

          {cardType === 'balances' && (
            <>
              <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                <span className="text-[11px] text-amber-700 font-medium block">Total Pending Due</span>
                <span className="text-lg font-bold text-amber-700 tabular">
                  Rs. {(totals.outstandingBalances || 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">Pending Suppliers</span>
                <span className="text-lg font-bold text-slate-900">
                  {suppliers.filter((s) => (s.balanceDue || 0) > 0).length}
                </span>
              </div>
              <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[11px] text-emerald-700 font-medium block">Cleared Suppliers</span>
                <span className="text-lg font-bold text-emerald-700">
                  {suppliers.filter((s) => (s.balanceDue || 0) === 0).length}
                </span>
              </div>
              <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                <span className="text-[11px] text-blue-700 font-medium block">Settlement Status</span>
                <span className="text-xs font-bold text-blue-700 block mt-1">
                  {totals.outstandingBalances === 0 ? 'All Cleared' : 'Pending Clearance'}
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
            placeholder="Search suppliers by name, code, or area..."
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
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No matching records found for this card view.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
              {filteredSuppliers.map((supplier) => {
                const volPct =
                  totalVolume > 0
                    ? Math.round(((supplier.totalSourced || 0) / totalVolume) * 100)
                    : 0;

                return (
                  <div
                    key={supplier.id}
                    className="p-3.5 bg-white hover:bg-slate-50/90 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Left: Supplier Info */}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5"
                        style={{
                          backgroundColor: `${config.color}15`,
                          color: config.color,
                        }}
                      >
                        {supplier.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm font-display">
                            {supplier.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                            {supplier.id}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-semibold border-0 ${
                              supplier.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {supplier.status || 'Active'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{supplier.area || 'Central'}</span>
                          </div>
                          {supplier.contact && (
                            <div className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{supplier.contact}</span>
                            </div>
                          )}
                          <span className="text-slate-300">·</span>
                          <span className="font-semibold text-slate-700">
                            Rate: Rs. {supplier.ratePerLiter} / L
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Metrics & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3.5 border-t sm:border-t-0 pt-2 sm:pt-0">
                      {/* Card Specific Numbers */}
                      {cardType === 'vendors' && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-medium block">
                            Procured Volume
                          </span>
                          <span className="text-xs font-bold text-slate-800 tabular">
                            {(supplier.totalSourced || 0).toLocaleString()} L
                          </span>
                        </div>
                      )}

                      {cardType === 'sourced' && (
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-xs font-black text-blue-700 tabular">
                              {(supplier.totalSourced || 0).toLocaleString()} L
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 font-mono">
                              ({volPct}%)
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1 ml-auto">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(5, volPct))}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {cardType === 'payouts' && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-medium block">
                            Paid Out
                          </span>
                          <span className="text-xs font-black text-emerald-700 tabular">
                            Rs. {(supplier.totalPayout || 0).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {cardType === 'balances' && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-medium block">
                            Balance Due
                          </span>
                          <span className="text-xs font-black text-amber-600 tabular">
                            Rs. {(supplier.balanceDue || 0).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        {cardType === 'balances' &&
                          (supplier.balanceDue || 0) > 0 &&
                          settleSupplierBalance && (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Settle full balance of Rs. ${(
                                      supplier.balanceDue || 0
                                    ).toLocaleString()} for ${supplier.name}?`
                                  )
                                ) {
                                  settleSupplierBalance(supplier.id);
                                }
                              }}
                              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                              title="Clear outstanding balance"
                            >
                              <Wallet className="w-3 h-3" />
                              <span>Settle</span>
                            </button>
                          )}

                        {onSelectSupplier && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSupplier(supplier);
                              onClose();
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Open Supplier Profile"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
            Showing <strong className="text-slate-800">{filteredSuppliers.length}</strong> of{' '}
            {suppliers.length} suppliers
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
