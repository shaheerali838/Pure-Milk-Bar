import React from 'react';
import { X, TrendingUp, Banknote, Receipt, Truck, Scale, Milk, Building2, CheckCircle2, AlertCircle, Layers, ArrowUpRight, Droplets, Calendar, User, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SupplierPLCardDetailSidebar({
  cardType,
  summaryData,
  onClose,
}) {
  if (!cardType || !summaryData) return null;

  const cardTitles = {
    cost: {
      title: 'Total Procurement Cost',
      subtitle: 'Direct Milk Intake Spend Paid & Due to Farmers',
      icon: Receipt,
      color: 'bg-rose-100 text-rose-800',
    },
    volume: {
      title: 'Total Procured Volume',
      subtitle: 'Real Intake Liters Procured from Milk Suppliers',
      icon: Droplets,
      color: 'bg-blue-100 text-blue-800',
    },
    paid: {
      title: 'Settled Disbursements to Suppliers',
      subtitle: 'Actual Payments Cleared to Supplier Khatas',
      icon: Banknote,
      color: 'bg-emerald-100 text-emerald-800',
    },
    due: {
      title: 'Pending Supplier Khata Balance',
      subtitle: 'Outstanding Payables for Milk Procurement',
      icon: Scale,
      color: 'bg-amber-100 text-amber-800',
    },
    rate: {
      title: 'Average Milk Purchase Rate',
      subtitle: 'Weighted Average Rate Paid per Liter Procured',
      icon: Milk,
      color: 'bg-purple-100 text-purple-800',
    },
    income: {
      title: 'Realized Sales Revenue',
      subtitle: 'Real Customer Sales Recorded for Supplier Milk via POS',
      icon: TrendingUp,
      color: 'bg-teal-100 text-teal-800',
    },
    gross: {
      title: 'Procurement Spread & Margins',
      subtitle: 'Realized POS Gross Profit Spread',
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-800',
    },
    logistics: {
      title: 'Procurement Settlement Summary',
      subtitle: 'Paid vs Outstanding Supplier Balances',
      icon: Scale,
      color: 'bg-amber-100 text-amber-800',
    },
    net: {
      title: 'Net Realized Trading Gain',
      subtitle: 'Realized Gross Spread from Sold Supplier Milk',
      icon: Scale,
      color: 'bg-indigo-100 text-indigo-800',
    },
    realization: {
      title: 'Unit Economic Purchase Rate / Liter',
      subtitle: 'Direct Procurement Cost Per Liter Procured',
      icon: Milk,
      color: 'bg-purple-100 text-purple-800',
    },
  };

  const current = cardTitles[cardType] || cardTitles.income;
  const CurrentIcon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed Dark Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Slide-over Right Panel */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-right duration-200 border-l border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-2xs ${current.color}`}>
              <CurrentIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 font-display">
                {current.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{current.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
          {/* Main KPI Banner */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {current.title}
              </span>
              <p className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                {cardType === 'rate' || cardType === 'realization'
                  ? `Rs. ${Number(summaryData.avgPurchaseRate || summaryData.realizationPerLiter || 0).toFixed(1)} / L`
                  : cardType === 'volume'
                  ? `${Number(summaryData.totalVolume || 0).toLocaleString()} L`
                  : cardType === 'paid'
                  ? `Rs. ${Number(summaryData.paidSpend || 0).toLocaleString()}`
                  : cardType === 'due'
                  ? `Rs. ${Number(summaryData.pendingSpend || 0).toLocaleString()}`
                  : `Rs. ${Number(summaryData[cardType] || 0).toLocaleString()}`}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                {summaryData.totalVolume ? `${Number(summaryData.totalVolume).toLocaleString()} L Total Sourced` : 'Live Metrics'}
              </span>
            </div>
          </div>

          {/* 1. VOLUME DETAIL */}
          {cardType === 'volume' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                Procured Volume by Milk Stream
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-[10px] font-bold text-purple-800 uppercase">Sourced Buffalo Milk</p>
                  <p className="text-base font-extrabold text-purple-700 font-mono mt-0.5">
                    {Number(summaryData.buffaloVolume || 0).toLocaleString()} L
                  </p>
                  <p className="text-[10px] text-purple-600">High-Fat Buffalo Procurement</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                  Intake Slips Breakdown ({summaryData.intakeRecords?.length || 0})
                </p>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {summaryData.intakeRecords && summaryData.intakeRecords.map((r) => (
                    <div key={r.id} className="p-2 bg-white rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{r.supplierName}</p>
                        <p className="text-[10px] text-slate-400">
                          {r.date} &bull; {r.shift} &bull; Fat {r.fat}%
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-blue-700 block">
                          {r.quantity} Liters
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. PAID DETAIL */}
          {cardType === 'paid' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                Settled Supplier Disbursements
              </h4>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-[10px] font-bold text-emerald-800 uppercase">Total Settled with Farmers</p>
                <p className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5">
                  Rs. {Number(summaryData.paidSpend || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-600">Disbursed cash &amp; bank payments</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                  Paid Intake Records
                </p>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {summaryData.intakeRecords && summaryData.intakeRecords.map((r) => (
                    <div key={r.id} className="p-2 bg-white rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{r.supplierName}</p>
                        <p className="text-[10px] text-slate-400">
                          {r.date} &bull; {r.shift} &bull; {r.quantity} L
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-700 block">
                          Paid: Rs. {Number(r.paidAmount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. DUE DETAIL */}
          {cardType === 'due' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                Outstanding Supplier Balances (Khata)
              </h4>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-[10px] font-bold text-amber-800 uppercase">Total Balance Due</p>
                <p className="text-xl font-extrabold text-amber-700 font-mono mt-0.5">
                  Rs. {Number(summaryData.pendingSpend || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-amber-600">Pending settlement in supplier khata</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                  Pending Intake Slips
                </p>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {summaryData.intakeRecords && summaryData.intakeRecords.filter((r) => (Number(r.pendingAmount) || 0) > 0).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">All supplier intakes are fully settled!</p>
                  ) : (
                    summaryData.intakeRecords.filter((r) => (Number(r.pendingAmount) || 0) > 0).map((r) => (
                      <div key={r.id} className="p-2 bg-white rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{r.supplierName}</p>
                          <p className="text-[10px] text-slate-400">{r.date} &bull; {r.shift}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-rose-600 block">
                            Due: Rs. {Number(r.pendingAmount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. EXPENSES DETAIL */}
          {cardType === 'expenses' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                Sourcing Expenses Analysis
              </h4>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-[10px] font-bold text-amber-800 uppercase">Total Sourcing Overhead</p>
                <p className="text-xl font-extrabold text-amber-700 font-mono mt-0.5">
                  Rs. {Number(summaryData.logistics || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-amber-600">Calculated from {summaryData.expenseVouchersCount || 0} Vouchers</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                  Expense Vouchers
                </p>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {summaryData.expenses && summaryData.expenses.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No supplier expenses recorded for this period.</p>
                  ) : (
                    summaryData.expenses && summaryData.expenses.map((e) => (
                      <div key={e.id} className="p-2 bg-white rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{e.category}</p>
                          <p className="text-[10px] text-slate-400">{e.date} &bull; {e.paymentMode}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-amber-700 block">
                            Rs. {Number(e.amount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 5. COST DETAIL */}
          {cardType === 'cost' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                Supplier Intake Settlement Ledger
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase">Paid Disbursements</p>
                  <p className="text-base font-extrabold text-emerald-700 font-mono mt-0.5">
                    Rs. {Number(summaryData.paidSpend || 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-emerald-600">Settled to Supplier Accounts</p>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-[10px] font-bold text-amber-800 uppercase">Pending Supplier Khata</p>
                  <p className="text-base font-extrabold text-amber-700 font-mono mt-0.5">
                    Rs. {Number(summaryData.pendingSpend || 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-amber-600">Due for Settlement</p>
                </div>
              </div>
            </div>
          )}

          {/* 6. INCOME DETAIL */}
          {cardType === 'income' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                Realized Sales from Supplier Milk
              </h4>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                <p className="text-[10px] font-bold text-teal-800 uppercase">Real POS Customer Sales</p>
                <p className="text-xl font-extrabold text-teal-700 font-mono mt-0.5">
                  Rs. {Number(summaryData.income || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-teal-600">{summaryData.realSoldVolume || 0} Liters sold through POS</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                  Sourced Product Contribution
                </p>
                {summaryData.products && summaryData.products.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-none">
                    <span className="font-medium text-slate-700">{p.streamName}</span>
                    <span className="font-mono font-bold text-slate-900">
                      Rs. {Number(p.resaleRevenue).toLocaleString()} ({p.soldVolume || 0} L sold)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. GROSS DETAIL */}
          {cardType === 'gross' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                Stream-Wise Gross Margin Spread
              </h4>
              <div className="space-y-2">
                {summaryData.products && summaryData.products.map((p, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{p.streamName}</span>
                      <span className="text-xs font-extrabold text-blue-700 font-mono">
                        + Rs. {Number(p.grossMargin).toLocaleString()} ({p.grossMarginPercent}%)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 text-right">
                      <span>Resale Rev: Rs. {Number(p.resaleRevenue).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. NET PROFIT DETAIL */}
          {cardType === 'net' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                Net Profit / Loss (Bachat) Analysis
              </h4>
              
              <div className={`p-4 border rounded-xl flex items-center justify-center flex-col text-center ${
                (summaryData.net || 0) >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
              }`}>
                <p className={`text-[10px] font-bold uppercase ${
                  (summaryData.net || 0) >= 0 ? 'text-emerald-800' : 'text-rose-800'
                }`}>
                  Total Realized Net Profit
                </p>
                <p className={`text-2xl font-extrabold font-mono mt-1 ${
                  (summaryData.net || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {(summaryData.net || 0) >= 0 ? '+' : '-'} Rs. {Number(Math.abs(summaryData.net || 0)).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {(summaryData.realSoldVolume || 0) > 0
                    ? `Calculated from ${summaryData.realSoldVolume} Liters sold to customers`
                    : 'No supplier milk customer sales recorded yet.'}
                </p>
              </div>

              {/* Clean Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/80">
                  <span className="font-semibold text-slate-700">Supplier POS Sales (Milk + Dahi)</span>
                  <span className="font-mono font-bold text-emerald-700">
                    + Rs. {Number(summaryData.income || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 font-extrabold text-sm text-slate-900">
                  <span>Supplier Net Profit</span>
                  <span className={`font-mono ${(summaryData.net || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    = Rs. {Number(summaryData.net || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
}
