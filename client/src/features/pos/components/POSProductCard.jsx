import React from 'react';
import { AlertCircle, Check, Eye, Plus } from 'lucide-react';
import { getProductIcon, getProductMeta } from '@/features/inventory/components/AddProduct';

export default function POSProductCard({
  product,
  cart = [],
  inventoryMetrics = {},
  displayStock = 0,
  stockWarningId = null,
  stockWarningMsg = '',
  onCardClick,
  onDismissWarning,
  onViewDetail,
}) {
  const prodId = product.id || product._id || product.sku;
  const cartItem = cart.find((i) => i.id === prodId || (product.id && i.id === product.id));
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isMilk = product.category?.toLowerCase().includes('milk') || (product.name || '').toLowerCase().includes('milk');
  const isDahi = product.category?.toLowerCase().includes('dahi') || (product.name || '').toLowerCase().includes('dahi');
  const isCow = (product.name || '').toLowerCase().includes('cow');
  const isBuff = (product.name || '').toLowerCase().includes('buffalo');
  const unitLabel = product.unit?.replace('per ', '') || (isMilk ? 'L' : 'kg');

  return (
    <div
      onClick={() => onCardClick?.(product)}
      className={`relative group bg-white border rounded-2xl p-3 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between overflow-hidden ${
        inCartQty > 0
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10'
          : displayStock <= 0
          ? 'border-rose-200/90 hover:border-rose-400 bg-rose-50/10'
          : 'border-slate-200/90 hover:border-indigo-200'
      }`}
    >
      {/* On-Card Stock Warning Message Overlay */}
      {stockWarningId === product.id && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onDismissWarning?.();
          }}
          className="absolute inset-0 z-30 bg-rose-950/95 text-white rounded-2xl p-3 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xs shadow-xl cursor-pointer"
        >
          <AlertCircle className="w-6 h-6 text-rose-300 mb-1 animate-pulse" />
          <span className="text-xs font-black text-white leading-tight">
            {stockWarningMsg}
          </span>
          <p className="text-[10px] text-rose-200 mt-1 font-medium leading-tight">
            {isMilk ? 'Cannot add: 0 L milk available.' : 'Cannot add: Product out of stock.'}
          </p>
          <span className="mt-2 text-[9px] font-bold bg-white/20 hover:bg-white/30 text-white px-2.5 py-0.5 rounded-full transition">
            Tap to dismiss
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
            isMilk
              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
              : isDahi
              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
              : 'bg-purple-50 text-purple-700 border border-purple-200/60'
          }`}
        >
          {product.category || 'Dairy'}
        </span>

        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-lg p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={(e) => onViewDetail?.(e, product)}
            title="View Product Specifications"
            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2.5 my-0.5">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs border ${
            getProductMeta(product.name).bgClass
          }`}
        >
          {getProductIcon(product.name, { size: 20 })}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1 flex items-center gap-1.5">
            {getProductIcon(product.name, { size: 14, className: 'text-indigo-600' })}
            <span>{product.name}</span>
          </h4>
          <p
            className={`text-[10px] font-bold mt-0.5 flex items-center gap-1 ${
              displayStock > 0 ? 'text-emerald-600' : 'text-rose-600 font-extrabold'
            }`}
          >
            {displayStock > 0 ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {isDahi ? `Total Dahi: ${displayStock.toFixed(2)} ${unitLabel}` : `Stock: ${displayStock} ${unitLabel}`}
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                {isDahi ? `Total Dahi: 0.00 ${unitLabel} (Out of Stock)` : `0 ${unitLabel} (Out of Stock)`}
              </>
            )}
          </p>
          {isDahi && (
            <p className="text-[9px] text-slate-500 font-medium tracking-tight mt-0.5 flex items-center gap-1">
              <span className="font-semibold text-emerald-700">Farm: {(Number(inventoryMetrics?.farmDahiStock) || 0).toFixed(2)} kg</span>
              <span className="text-slate-300">|</span>
              <span className="font-semibold text-amber-700">Supplier: {(Number(inventoryMetrics?.supplierDahiStock) || 0).toFixed(2)} kg</span>
            </p>
          )}
          {isMilk && isBuff && (
            <p className="text-[9px] text-slate-500 font-medium tracking-tight mt-0.5 flex items-center gap-1">
              <span className="font-semibold text-emerald-700">Farm: {Number(inventoryMetrics?.farmBuffaloMilkStock) || 0}L</span>
              <span className="text-slate-300">|</span>
              <span className="font-semibold text-amber-700">Supplier: {Number(inventoryMetrics?.supplierBuffaloMilkStock) || 0}L</span>
            </p>
          )}
          {isMilk && isCow && (
            <p className="text-[9px] text-slate-500 font-medium tracking-tight mt-0.5 flex items-center gap-1">
              <span className="font-semibold text-emerald-700">Farm: {Number(inventoryMetrics?.farmCowMilkStock) || 0}L</span>
              <span className="text-slate-300">|</span>
              <span className="font-semibold text-blue-700">Supplier: {Number(inventoryMetrics?.supplierCowMilkStock) || 0}L</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-sm font-black text-slate-900 tracking-tight">
            Rs. {Number(product.price || 0).toLocaleString()}
          </span>
          <span className="text-[10px] font-medium text-slate-400 ml-1">
            /{product.unit?.replace('per ', '') || 'kg'}
          </span>
        </div>

        {displayStock <= 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCardClick?.(product);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition shadow-2xs cursor-pointer"
          >
            <AlertCircle className="w-3 h-3 text-rose-500" />
            Out of Stock
          </button>
        ) : inCartQty > 0 ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-[11px] font-bold shadow-2xs">
            <Check className="w-3 h-3 stroke-3" />
            {inCartQty} in cart
          </span>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCardClick?.(product);
            }}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        )}
      </div>
    </div>
  );
}
