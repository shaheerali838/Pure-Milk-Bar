import React from 'react';
import { Plus, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomSelect from '@/components/common/CustomSelect';

export default function POSAdjustDeliveryItemsEditor({
  items = [],
  onRateChange,
  onQtyChange,
  onQtyDirectInput,
  onRemoveItem,
  selectedProductId,
  onSelectProduct,
  addableProducts = [],
  onAddProduct,
}) {
  const productOptions = addableProducts.map((p) => ({
    value: p.id,
    label: p.name,
    sublabel: `Rate: Rs. ${p.unitPrice}/${p.unit}`,
    badge: p.unit,
  }));

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
        1. Delivery Items &amp; Quantity (Liters / Kg)
      </label>
      <div className="space-y-2">
        {items.map((it, idx) => (
          <div
            key={idx}
            className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800 text-xs block truncate">{it.name}</span>
                <span className="text-[10px] font-bold text-slate-400">/{it.unit}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                <span>Rate: Rs.</span>
                <input
                  type="number"
                  value={it.unitPrice}
                  onChange={(e) => onRateChange(idx, e.target.value)}
                  className="w-16 px-1.5 py-0.5 text-xs font-semibold bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => onQtyChange(idx, -0.5)}
                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                step="0.5"
                value={it.quantity}
                onChange={(e) => onQtyDirectInput(idx, e.target.value)}
                className="w-12 text-center text-xs font-bold text-slate-900 outline-none"
              />
              <button
                type="button"
                onClick={() => onQtyChange(idx, 0.5)}
                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Subtotal */}
            <div className="text-right min-w-16">
              <span className="text-[10px] text-slate-400 block">Subtotal</span>
              <span className="font-mono font-bold text-slate-900 text-xs">
                Rs. {((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0)).toLocaleString()}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onRemoveItem(idx)}
              aria-label={`Remove ${it.name}`}
              className="w-6 h-6 shrink-0 rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-1 items-center">
        <div className="flex-1 min-w-0">
          <CustomSelect
            value={selectedProductId}
            onChange={(val) => onSelectProduct(val)}
            options={productOptions}
            placeholder="Add Milk or Dahi product..."
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddProduct}
          className="text-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add
        </Button>
      </div>
    </div>
  );
}
