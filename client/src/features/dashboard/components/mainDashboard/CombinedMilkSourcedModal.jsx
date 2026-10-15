import React from 'react';
import { X, Droplets, Building2, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CombinedMilkSourcedModal({
  isOpen,
  onClose,
  dateMetrics = {},
  inventoryMetrics = {},
  periodLabel = 'Today',
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const farmYield = Number(dateMetrics.farmYield || 0);
  const procuredVolume = Number(dateMetrics.procuredVolume || 0);
  const totalSourced = Number((farmYield + procuredVolume).toFixed(1));

  const farmPercent = totalSourced > 0 ? Math.round((farmYield / totalSourced) * 100) : 0;
  const supplierPercent = totalSourced > 0 ? Math.round((procuredVolume / totalSourced) * 100) : 0;

  const farmMilkStock = inventoryMetrics?.farmMilkStock ?? '0';
  const supplierMilkStock = inventoryMetrics?.supplierMilkStock ?? '0';
  const totalMilkStock = inventoryMetrics?.totalMilkStock ?? '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Total Milk Sourced
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {periodLabel}
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Combined milk production from In-House Farm and Dairy Suppliers
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
          {/* Top Combined Sourced Metric */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-emerald-50 to-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Milk Sourced ({periodLabel})</span>
              <p className="text-3xl font-black text-slate-900 mt-1">
                {totalSourced} <span className="text-lg font-bold text-slate-500">Liters</span>
              </p>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {farmPercent}% from Farm Herd · {supplierPercent}% from Suppliers
              </p>
            </div>

            {/* Visual Ratio Bar */}
            <div className="w-full sm:w-48 space-y-1.5">
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div style={{ width: `${farmPercent}%` }} className="bg-emerald-500 h-full" title={`Farm: ${farmPercent}%`} />
                <div style={{ width: `${supplierPercent}%` }} className="bg-sky-500 h-full" title={`Supplier: ${supplierPercent}%`} />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span className="text-emerald-700">Farm: {farmYield.toFixed(0)}L</span>
                <span className="text-sky-700">Sup: {procuredVolume.toFixed(0)}L</span>
              </div>
            </div>
          </div>

          {/* Sourcing Hubs Side-by-Side Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Farm In-House Milking */}
            <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Farm Herd Milking</h4>
                      <p className="text-[11px] text-slate-500">In-house cattle production</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {farmPercent}%
                  </span>
                </div>

                <div className="space-y-2 mt-4 text-xs">
                  <div className="flex justify-between p-2 rounded-xl bg-white border border-emerald-100">
                    <span className="text-slate-600">Milk Yield ({periodLabel}):</span>
                    <span className="font-black text-emerald-800">{farmYield.toFixed(1)} Liters</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl bg-white border border-emerald-100">
                    <span className="text-slate-600">Available in Chiller:</span>
                    <span className="font-bold text-slate-800">{farmMilkStock} Liters</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/farm/milking');
                }}
                className="mt-5 w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <span>Open Milking Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. Supplier Dock Intake */}
            <div className="p-5 rounded-2xl border border-sky-200 bg-sky-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700 font-bold">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Supplier Intake</h4>
                      <p className="text-[11px] text-slate-500">Procured from dairy suppliers</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                    {supplierPercent}%
                  </span>
                </div>

                <div className="space-y-2 mt-4 text-xs">
                  <div className="flex justify-between p-2 rounded-xl bg-white border border-sky-100">
                    <span className="text-slate-600">Procured ({periodLabel}):</span>
                    <span className="font-black text-sky-800">{procuredVolume.toFixed(1)} Liters</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl bg-white border border-sky-100">
                    <span className="text-slate-600">Available in Chiller:</span>
                    <span className="font-bold text-slate-800">{supplierMilkStock} Liters</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/supplier/intake');
                }}
                className="mt-5 w-full py-2 px-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <span>Open Supplier Intake</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Current Cold Room Stock Overview */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-700">Total Live Milk Stock in Cold Room / Chiller:</span>
            </div>
            <span className="font-black text-sm text-slate-900">{totalMilkStock} L</span>
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
