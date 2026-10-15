import React from 'react';
import { X, TrendingUp, TrendingDown, Building2, Droplets, Layers, ArrowRight, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CombinedBusinessPLModal({
  isOpen,
  onClose,
  dateMetrics = {},
  periodLabel = 'Today',
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const totalRevenue = dateMetrics.salesRevenue || 0;
  const totalNetProfit = dateMetrics.totalNetProfit || 0;
  const netMargin = dateMetrics.netMargin || 0;

  // Farm figures
  const farmRevenue = dateMetrics.totalFarmRevenue || (dateMetrics.farmMilkRevenue || 0) + (dateMetrics.farmDahiRevenue || 0);
  const farmProfit = dateMetrics.farmNetProfit || 0;
  const farmExpense = Math.max(0, farmRevenue - farmProfit);

  // Supplier figures
  const supplierRevenue = dateMetrics.totalSupplierRevenue || (dateMetrics.supplierMilkRevenue || 0) + (dateMetrics.supplierDahiRevenue || 0);
  const supplierProfit = dateMetrics.supplierNetProfit || 0;
  const supplierExpense = Math.max(0, supplierRevenue - supplierProfit);

  // Dahi figures
  const dahiRevenue = dateMetrics.dahiSalesRevenue || 0;
  const dahiQty = dateMetrics.dahiSoldQty || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Total Business Profit & Loss
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {periodLabel}
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Combined financial performance of Farm, Supplier Procurement, and Dahi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Combined Overview Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">
                Rs. {totalRevenue.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-500 font-medium">From all sales channels</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Expenses & Cost</span>
              <p className="text-2xl font-black text-rose-600 mt-0.5">
                Rs. {(farmExpense + supplierExpense).toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-500 font-medium">Farm + Procurement + Ops</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Net Profit</span>
              <p className={`text-2xl font-black mt-0.5 flex items-center gap-1.5 ${totalNetProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {totalNetProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                Rs. {totalNetProfit.toLocaleString()}
              </p>
              <span className="text-[11px] font-semibold text-slate-500">
                {netMargin}% Net Margin
              </span>
            </div>
          </div>

          {/* 3 Segregated Breakdown Cards: Farm, Supplier, Dahi */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Segmented Profit Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 1. Farm Dairy */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Farm Dairy
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      In-House
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 mt-3">
                    <div className="flex justify-between">
                      <span>Farm Sales:</span>
                      <span className="font-bold text-slate-800">Rs. {farmRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Farm Expenses:</span>
                      <span className="font-bold text-rose-600">Rs. {farmExpense.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-200 flex justify-between font-black text-slate-900">
                      <span>Farm Net:</span>
                      <span className={farmProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                        Rs. {farmProfit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/farm/pl');
                  }}
                  className="mt-4 w-full py-1.5 px-3 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100/60 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>View Farm P&L</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 2. Supplier Procurement */}
              <div className="bg-sky-50/50 border border-sky-200 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 text-xs font-black text-sky-800">
                      <Droplets className="w-3.5 h-3.5 text-sky-600" /> Supplier Hub
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                      Procured
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 mt-3">
                    <div className="flex justify-between">
                      <span>Supplier Sales:</span>
                      <span className="font-bold text-slate-800">Rs. {supplierRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Procure Cost + Exp:</span>
                      <span className="font-bold text-rose-600">Rs. {supplierExpense.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-sky-200 flex justify-between font-black text-slate-900">
                      <span>Supplier Net:</span>
                      <span className={supplierProfit >= 0 ? 'text-sky-700' : 'text-rose-600'}>
                        Rs. {supplierProfit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/supplier/pl');
                  }}
                  className="mt-4 w-full py-1.5 px-3 rounded-xl bg-white border border-sky-300 hover:bg-sky-100/60 text-sky-800 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>View Supplier P&L</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 3. Dahi Processing */}
              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 text-xs font-black text-amber-800">
                      <Layers className="w-3.5 h-3.5 text-amber-600" /> Dahi Products
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Value Add
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 mt-3">
                    <div className="flex justify-between">
                      <span>Dahi Sold:</span>
                      <span className="font-bold text-slate-800">{dahiQty} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dahi Revenue:</span>
                      <span className="font-bold text-amber-700">Rs. {dahiRevenue.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-amber-200 flex justify-between font-black text-slate-900">
                      <span>Value Status:</span>
                      <span className="text-emerald-700 font-bold">Profitable</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/dahi');
                  }}
                  className="mt-4 w-full py-1.5 px-3 rounded-xl bg-white border border-amber-300 hover:bg-amber-100/60 text-amber-800 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>View Dahi Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Summary Comparison Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Business Unit</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-right">Cost / Expenses</th>
                  <th className="py-2.5 px-3 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-900">Farm Dairy (In-House)</td>
                  <td className="py-2.5 px-3 text-right">Rs. {farmRevenue.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-rose-600">Rs. {farmExpense.toLocaleString()}</td>
                  <td className={`py-2.5 px-3 text-right font-black ${farmProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    Rs. {farmProfit.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-900">Supplier Procurement</td>
                  <td className="py-2.5 px-3 text-right">Rs. {supplierRevenue.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-rose-600">Rs. {supplierExpense.toLocaleString()}</td>
                  <td className={`py-2.5 px-3 text-right font-black ${supplierProfit >= 0 ? 'text-sky-600' : 'text-rose-600'}`}>
                    Rs. {supplierProfit.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-200">
                  <td className="py-3 px-4">Total Combined Business</td>
                  <td className="py-3 px-3 text-right">Rs. {totalRevenue.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right text-rose-600">Rs. {(farmExpense + supplierExpense).toLocaleString()}</td>
                  <td className={`py-3 px-3 text-right text-sm ${totalNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    Rs. {totalNetProfit.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
