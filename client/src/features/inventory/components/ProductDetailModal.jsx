import React from 'react';
import { ArrowLeft, X, Layers, ShieldCheck, Edit2 } from 'lucide-react';

export default function ProductDetailModal({ product, isOpen, onClose, onBack, onOpenEdit, backLabel = 'Back to Products' }) {
  if (!product) return null;
  // If used as modal and not open, do not render
  if (!onBack && !isOpen) return null;

  const salePrice = Number(product.price) || 0;
  const costPrice = Number(product.cost) || 0;
  const marginRs = salePrice - costPrice;
  const marginPct = salePrice > 0 ? ((marginRs / salePrice) * 100).toFixed(1) : '0.0';

  const isDahi = product.category && product.category.toLowerCase().includes('dahi');
  const isLassi = product.category && product.category.toLowerCase().includes('lassi');
  const emoji = isDahi ? '🥣' : isLassi ? '🧃' : '🥛';

  // 1. PAGE VIEW MODE: Renders on the right side of the fixed sidebar
  if (onBack) {
    return (
      <div className="space-y-4 max-w-4xl animate-in fade-in duration-150">
        <div className="flex items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel || 'Back to Products'}
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
                Product Specifications — {product.name}
              </h1>
            </div>
          </div>

          {onOpenEdit && (
            <button
              type="button"
              onClick={() => onOpenEdit(product)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200/70 transition shadow-2xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Rates
            </button>
          )}
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="bg-[#f0f4ff] p-5 rounded-2xl border border-indigo-100/70 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-3xl shrink-0 shadow-xs">
                {emoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 leading-tight font-display">
                    {product.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {product.status || 'Active'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    product.source === 'Supplier'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {product.source === 'Supplier' ? '🚚 Supplier Sourced' : '🌾 Farm In-House'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-3xl font-black text-[#4f46e5] font-mono tabular">
                Rs. {salePrice.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium ml-1">
                /{product.unit?.replace('per ', '') || 'kg'}
              </span>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  POS &amp; Delivery Ready
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                EST. COST / UNIT
              </span>
              <span className="text-lg font-black text-slate-800 font-mono mt-1 block tabular">
                Rs. {costPrice.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Estimated unit production</span>
            </div>

            <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 text-emerald-800">
              <span className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                GROSS MARGIN
              </span>
              <span className="text-lg font-black text-emerald-800 font-mono mt-1 block tabular">
                ~{marginPct}%
              </span>
              <span className="text-[10px] text-emerald-600 mt-0.5 block">Profit per sold unit</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                TAX / GST RATE
              </span>
              <span className="text-lg font-black text-slate-800 font-mono mt-1 block">
                0.0% <span className="font-normal text-xs text-slate-400">(Exempt)</span>
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Basic fresh dairy products</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-500" />
              Product Specifications &amp; Handling Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Product SKU</span>
                <p className="font-bold text-slate-800 font-mono text-xs mt-0.5 tabular">{product.sku || product.id}</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Measurement Standard</span>
                <p className="font-bold text-slate-800 text-xs mt-0.5">{product.unit}</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Storage Standard</span>
                <p className="font-semibold text-slate-800 text-xs mt-0.5">
                  {product.storage || 'Refrigerated Chiller (0 - 4 °C)'}
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">POS Quick Barcode</span>
                <p className="font-bold text-slate-800 font-mono text-xs mt-0.5 tabular">
                  {product.barcode || '890100100'}
                </p>
              </div>

              <div className="sm:col-span-2 bg-white p-3 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Fresh Production Frequency</span>
                <p className="font-semibold text-slate-800 text-xs mt-0.5">
                  {product.frequency || 'Daily Morning & Evening Batches'}
                </p>
              </div>

              {product.description && (
                <div className="sm:col-span-2 bg-white p-3 rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Description &amp; Notes</span>
                  <p className="text-slate-600 text-xs italic mt-1 leading-relaxed">
                    "{product.description}"
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition cursor-pointer"
            >
              {backLabel || 'Back to Products'}
            </button>
            {onOpenEdit && (
              <button
                type="button"
                onClick={() => onOpenEdit(product)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Product Rates
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. MODAL VIEW MODE: Popup with Backdrop
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xl shrink-0 shadow-2xs">
              {emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 leading-tight font-display">
                  {product.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {product.status || 'Active'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                SKU #{product.sku || product.id} · {product.category} ({product.unit})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3.5 text-xs text-slate-700 max-h-[82vh] overflow-y-auto">
          <div className="bg-[#f0f4ff] p-4 rounded-2xl border border-indigo-100/70 flex items-center justify-between">
            <div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                RETAIL SELLING RATE
              </span>
              <span className="text-2xl font-black text-[#4f46e5] font-mono tabular">
                Rs. {salePrice.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 font-medium ml-1">
                /{product.unit?.replace('per ', '') || 'kg'}
              </span>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                POS &amp; Delivery Ready
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                EST. COST / UNIT
              </span>
              <span className="text-xs font-black text-slate-800 font-mono mt-1 block tabular">
                Rs. {costPrice.toLocaleString()}
              </span>
            </div>

            <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 text-emerald-800">
              <span className="block text-[9px] font-bold text-emerald-700 uppercase tracking-wider">
                GROSS MARGIN
              </span>
              <span className="text-xs font-black text-emerald-800 font-mono mt-1 block tabular">
                ~{marginPct}%
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                TAX / GST RATE
              </span>
              <span className="text-xs font-black text-slate-800 font-mono mt-1 block">
                0.0% <span className="font-normal text-[9px] text-slate-400">(Exempt)</span>
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
            <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider font-display flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-slate-500" />
              Product Specifications &amp; Handling
            </h4>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[9px] text-slate-400 font-semibold uppercase block">Product SKU</span>
                <p className="font-bold text-slate-800 font-mono text-[11px] tabular">{product.sku || product.id}</p>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 font-semibold uppercase block">Measurement Unit</span>
                <p className="font-bold text-slate-800 text-[11px]">{product.unit}</p>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 font-semibold uppercase block">Storage Standard</span>
                <p className="font-semibold text-slate-800 text-[11px]">
                  {product.storage || 'Chiller (0 - 4 °C)'}
                </p>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 font-semibold uppercase block">POS Quick Barcode</span>
                <p className="font-bold text-slate-800 font-mono text-[11px] tabular">
                  {product.barcode || '890100100'}
                </p>
              </div>

              <div className="col-span-2">
                <span className="text-[9px] text-slate-400 font-semibold uppercase block">Batch Frequency</span>
                <p className="font-semibold text-slate-800 text-[11px]">
                  {product.frequency || 'Daily Morning & Evening Batches'}
                </p>
              </div>

              {product.description && (
                <div className="col-span-2 pt-1 border-t border-slate-200/60">
                  <span className="text-[9px] text-slate-400 font-semibold uppercase block">Description</span>
                  <p className="text-slate-600 text-[11px] italic mt-0.5 leading-relaxed">
                    "{product.description}"
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (onClose) onClose();
                if (onOpenEdit) onOpenEdit(product);
              }}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Rates
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#009966] hover:bg-[#008055] text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
