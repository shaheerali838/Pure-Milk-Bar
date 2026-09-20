import React from 'react';
import {
  X,
  TrendingUp,
  DollarSign,
  Receipt,
  Truck,
  Scale,
  Milk,
  Building2,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowUpRight,
  Droplets,
  Calendar,
  User,
  MapPin,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SupplierPLCardDetailSidebar({
  cardType,
  summaryData,
  onClose,
}) {
  if (!cardType || !summaryData) return null;

  const cardTitles = {
    income: {
      title: 'Total Sourced Resale Income',
      subtitle: 'Realized Revenue Across Resale Channels',
      icon: DollarSign,
      color: 'bg-emerald-100 text-emerald-800',
    },
    cost: {
      title: 'Supplier Procurement Purchase Cost',
      subtitle: 'Direct Milk Intake Spend Paid & Due to Farmers',
      icon: Receipt,
      color: 'bg-rose-100 text-rose-800',
    },
    gross: {
      title: 'Trading Gross Profit & Margins',
      subtitle: 'Spread Between Procurement Cost & Resale Revenue',
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-800',
    },
    logistics: {
      title: 'Logistics, Transit & Lab Testing',
      subtitle: 'Route Fuel, Vehicle Care, Hygiene & Quality Testing',
      icon: Truck,
      color: 'bg-amber-100 text-amber-800',
    },
    net: {
      title: 'Total Net Procurement Profit',
      subtitle: 'Bottom-Line Net Sourcing Margin After All Overheads',
      icon: Scale,
      color: 'bg-indigo-100 text-indigo-800',
    },
    realization: {
      title: 'Unit Economic Realization / Liter',
      subtitle: 'Net Realized Profit Margin Per Liter Sourced',
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
                {cardType === 'realization'
                  ? `Rs. ${Number(summaryData.realizationPerLiter || 0).toFixed(2)} / L`
                  : `Rs. ${Number(summaryData[cardType] || 0).toLocaleString()}`}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                {summaryData.totalVolume ? `${Number(summaryData.totalVolume).toLocaleString()} L Total Sourced` : 'Live Metrics'}
              </span>
            </div>
          </div>

          {/* 1. INCOME DETAIL */}
          {cardType === 'income' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                Channel Realization Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-purple-50/60 border border-purple-200/70 rounded-xl">
                  <p className="text-[10px] font-bold text-purple-700 uppercase">Doorstep Delivery</p>
                  <p className="text-sm font-extrabold text-slate-900 font-mono mt-1">
                    Rs. {Number(summaryData.channelIncome?.delivery || 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {summaryData.channelShares?.delivery || 0}% of Total
                  </p>
                </div>
                <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-xl">
                  <p className="text-[10px] font-bold text-blue-700 uppercase">POS Counter Sales</p>
                  <p className="text-sm font-extrabold text-slate-900 font-mono mt-1">
                    Rs. {Number(summaryData.channelIncome?.pos || 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {summaryData.channelShares?.pos || 0}% of Total
                  </p>
                </div>
                <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">Bulk Wholesale</p>
                  <p className="text-sm font-extrabold text-slate-900 font-mono mt-1">
                    Rs. {Number(summaryData.channelIncome?.wholesale || 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {summaryData.channelShares?.wholesale || 0}% of Total
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                  Sourced Product Contribution
                </p>
                {summaryData.products && summaryData.products.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-none">
                    <span className="font-medium text-slate-700">{p.streamName}</span>
                    <span className="font-mono font-bold text-slate-900">
                      Rs. {Number(p.resaleRevenue).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. COST DETAIL */}
          {cardType === 'cost' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                Supplier Procurement Ledger
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
                          {r.date} &bull; {r.shift} &bull; {r.quantity} L @ Rs. {r.ratePerLiter} (Fat {r.fat}%)
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-rose-600 block">
                          Rs. {Number(r.totalCost).toLocaleString()}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          r.settlement === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.settlement}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. GROSS DETAIL */}
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
                    <div className="grid grid-cols-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Sourced Cost: Rs. {Number(p.baseCost).toLocaleString()}</span>
                      <span className="text-right">Resale Rev: Rs. {Number(p.resaleRevenue).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. LOGISTICS & TESTING DETAIL */}
          {cardType === 'logistics' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                Operational Overheads from Source Expenses
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase">Route Fuel &amp; Transport</span>
                  <strong className="text-xs font-mono font-bold text-slate-900">
                    Rs. {Number(summaryData.collectionRouteFuel || 0).toLocaleString()}
                  </strong>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase">Chilling &amp; Lab Testing</span>
                  <strong className="text-xs font-mono font-bold text-slate-900">
                    Rs. {Number(summaryData.chillingLabTesting || 0).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                  Itemized Sourcing Expense Vouchers
                </p>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {summaryData.expenses && summaryData.expenses.map((e) => (
                    <div key={e.id} className="p-2 bg-slate-50/70 rounded-lg border border-slate-200/70 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{e.category}</p>
                        <p className="text-[10px] text-slate-400">
                          {e.voucherNo || e.id} &bull; {e.date} &bull; {e.loggedBy || 'Admin'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900">
                          Rs. {Number(e.amount).toLocaleString()}
                        </span>
                        <span className="block text-[10px] text-slate-400">{e.paymentMode}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. NET PROFIT WATERFALL */}
          {cardType === 'net' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                Comprehensive P&amp;L Bridge (Waterfall)
              </h4>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="font-semibold text-slate-700">1. Total Sourced Resale Revenue</span>
                  <span className="font-mono font-bold text-emerald-700">
                    + Rs. {Number(summaryData.income || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 text-rose-600">
                  <span>2. Less: Direct Supplier Procurement Spend</span>
                  <span className="font-mono font-bold">
                    - Rs. {Number(summaryData.cost || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 bg-blue-50/50 px-2 rounded font-bold text-blue-900">
                  <span>3. Trading Gross Profit</span>
                  <span className="font-mono">
                    = Rs. {Number(summaryData.gross || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 text-amber-700">
                  <span>4. Less: Collection Fuel &amp; Logistics</span>
                  <span className="font-mono">
                    - Rs. {Number(summaryData.collectionRouteFuel || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 text-amber-700">
                  <span>5. Less: Chilling, Testing &amp; Sanitation</span>
                  <span className="font-mono">
                    - Rs. {Number(summaryData.chillingLabTesting || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t-2 border-slate-800 font-extrabold text-sm text-slate-900 bg-emerald-50/60 p-2 rounded-lg">
                  <span>Net Bottom-Line Sourcing Profit</span>
                  <span className="font-mono text-emerald-700">
                    Rs. {Number(summaryData.net || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 6. REALIZATION PER LITER DETAIL */}
          {cardType === 'realization' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                Unit Economics Per Liter Sourced
              </h4>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Avg Resale Price</p>
                  <p className="text-base font-extrabold text-emerald-700 font-mono mt-0.5">
                    Rs. {Number(summaryData.avgResalePerLiter || 0).toFixed(1)} / L
                  </p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Avg Purchase Rate</p>
                  <p className="text-base font-extrabold text-rose-600 font-mono mt-0.5">
                    Rs. {Number(summaryData.avgPurchaseRate || 0).toFixed(1)} / L
                  </p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Overhead Burden / L</p>
                  <p className="text-base font-extrabold text-amber-600 font-mono mt-0.5">
                    Rs. {Number(summaryData.overheadPerLiter || 0).toFixed(1)} / L
                  </p>
                </div>
                <div className="p-3 bg-slate-900 text-white border border-slate-800 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Net Realization / L</p>
                  <p className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">
                    Rs. {Number(summaryData.realizationPerLiter || 0).toFixed(2)} / L
                  </p>
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
