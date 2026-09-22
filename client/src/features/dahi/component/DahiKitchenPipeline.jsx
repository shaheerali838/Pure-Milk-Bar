import React from 'react';
import {
  Clock,
  Thermometer,
  Store,
  Zap,
  ShoppingCart,
  Printer,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DahiKitchenPipeline({
  batches = [],
  metrics = {},
  onMoveToChiller,
  onSendToPOS,
  onMarkSoldOut,
  onOpenAddModal,
}) {
  const navigate = useNavigate();

  const incubatingBatches = batches.filter(
    (b) => b.stage === 'incubating' || b.status === 'In Progress'
  );
  const chilledBatches = batches.filter(
    (b) => b.stage === 'chilled' || (b.status === 'Completed' && b.stage !== 'pos')
  );
  const posBatches = batches.filter((b) => b.stage === 'pos');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* ======================================================== */}
      {/* COLUMN 1: Incubating / Setting */}
      {/* ======================================================== */}
      <div className="bg-white border-2 border-amber-200/90 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between pb-3 mb-3 border-b border-amber-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100/90 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-snug">
                  1. Incubating / Setting
                </h3>
                <p className="text-[10.5px] text-slate-400">Warm setting cabinet</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-800 border border-amber-200">
              {incubatingBatches.length} Batches
            </span>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {incubatingBatches.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-amber-200 rounded-xl bg-amber-50/20">
                No batches currently incubating.
              </div>
            ) : (
              incubatingBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="bg-white border border-amber-200/90 rounded-xl p-3 shadow-xs space-y-2.5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{batch.product}</h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {batch.id} {batch.time ? `• ${batch.time}` : ''}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Setting
                    </span>
                  </div>

                  <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Milk Input:</span>
                      <span className="font-bold text-slate-800">{batch.milkUsed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Source:</span>
                      <span className="font-bold text-slate-800">{batch.source || 'Farm & Supplier Mix'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Expected Yield:</span>
                      <span className="font-black text-emerald-600">{batch.output}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onMoveToChiller(batch.id)}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Set Completed → Move to Chiller
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column Footer Action */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="mt-3 w-full py-2 px-3 rounded-xl border border-amber-300 bg-white hover:bg-amber-50/70 text-amber-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Start New Incubating Batch
        </button>
      </div>

      {/* ======================================================== */}
      {/* COLUMN 2: Chilled & Ready */}
      {/* ======================================================== */}
      <div className="bg-white border-2 border-blue-200/90 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between pb-3 mb-3 border-b border-blue-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100/90 text-blue-700 flex items-center justify-center shrink-0">
                <Thermometer className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-snug">
                  2. Chilled &amp; Ready
                </h3>
                <p className="text-[10.5px] text-slate-400">In cold storage at 4°C</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100/80 text-blue-800 border border-blue-200">
              {chilledBatches.length} Ready
            </span>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {chilledBatches.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-blue-200 rounded-xl bg-blue-50/20">
                No batches chilled in cold room yet.
              </div>
            ) : (
              chilledBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="bg-white border border-blue-200/90 rounded-xl p-3 shadow-xs space-y-2.5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{batch.product}</h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{batch.id}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                      ✓ Ready
                    </span>
                  </div>

                  <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Finished Quantity:</span>
                      <span className="font-bold text-slate-800">{batch.output || '0 kg'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Retail POS Rate:</span>
                      <span className="font-bold text-emerald-700">{batch.posRate || 'Rs. 320 / kg'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Expected Profit:</span>
                      <span className="font-black text-emerald-600">{batch.expectedProfit || '+Rs. 0'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSendToPOS(batch.id)}
                    className="w-full py-2 px-3 rounded-lg bg-[#00a86b] hover:bg-[#008f5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Send to Shop POS Counter →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column Footer Notice */}
        <div className="mt-3 w-full py-2 px-3 rounded-xl bg-blue-50 text-blue-700 text-center font-semibold text-[11.5px] border border-blue-100">
          Chilled Dahi is ready to be sold at the counter.
        </div>
      </div>

      {/* ======================================================== */}
      {/* COLUMN 3: At POS Counter */}
      {/* ======================================================== */}
      <div className="bg-white border-2 border-emerald-200/90 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between pb-3 mb-3 border-b border-emerald-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100/90 text-emerald-700 flex items-center justify-center shrink-0">
                <Store className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-snug">
                  3. At POS Counter
                </h3>
                <p className="text-[10.5px] text-slate-400">Live retail sales stock</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 border border-emerald-200">
              {posBatches.length} Active
            </span>
          </div>

          {/* Live POS Sales Summary Pill */}
          <div className="mb-3 p-2 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-emerald-800">Live POS Sales:</span>
            <span className="text-[11px] font-black text-emerald-700">
              {metrics?.dahiSoldInPOS || '0'} kg (Rs. {metrics?.dahiSalesRevenue || '0'})
            </span>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {posBatches.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-emerald-200 rounded-xl bg-emerald-50/20">
                No active stock placed at POS counter right now.
              </div>
            ) : (
              posBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="bg-white border border-emerald-200/90 rounded-xl p-3 shadow-xs space-y-2.5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{batch.product}</h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{batch.id}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      🏬 Live at POS
                    </span>
                  </div>

                  <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Stock Transferred:</span>
                      <span className="font-bold text-slate-800">{batch.output || `${batch.outputVal || 0} kg`}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Total Revenue Value:</span>
                      <span className="font-bold text-emerald-700">{batch.revenueValue || 'Rs. 0'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Transferred At:</span>
                      <span className="font-mono text-slate-600 text-[11px]">{batch.transferredAt || batch.time || '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onMarkSoldOut(batch.id)}
                      className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
                    >
                      Mark Sold Out
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      title="Print Stock Slip"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column Footer Action */}
        <button
          type="button"
          onClick={() => navigate('/pos')}
          className="mt-3 w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Go to Counter POS Sale
        </button>
      </div>
    </div>
  );
}
