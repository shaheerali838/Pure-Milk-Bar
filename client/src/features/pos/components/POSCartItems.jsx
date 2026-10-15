import React from 'react';
import {
  Plus,
  Minus,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';
import { getProductIcon } from '@/features/inventory/components/AddProduct';

export default function POSCartItems({ onOpenDetails }) {
  const {
    cart = [],
    cartSubtotal = 0,
    discount = 0,
    deliveryCharge = 0,
    netPayable = 0,
    handleUpdateQuantity,
    handleRemoveFromCart,
    saleCategory = 'walkin',
  } = usePOSContext();

  if (cart.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center space-y-2 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-4">
        <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
          <ShoppingCart className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-xs font-bold text-slate-700 font-display">
          Cart is Empty
        </p>
        <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto leading-relaxed">
          Tap items from the catalog on the left to start this order.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-2.5 overflow-hidden">
      {/* Stacked Distinct Item Cards */}
      <div className="space-y-2 flex-1 min-h-0 overflow-y-auto no-scrollbar pr-0.5">
        {cart.map((item) => {
          const isDahi = (item.category || '').toLowerCase().includes('dahi') || (item.name || '').toLowerCase().includes('dahi');
          const shortUnit = item.unit ? item.unit.replace('per ', '') : (isDahi ? 'kg' : 'L');
          const lineTotal = Math.round((Number(item.quantity) || 0) * (Number(item.price) || 0));

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs hover:border-slate-300 transition-all space-y-2"
            >
              {/* Product Info Row: Thumbnail + Name + Read-only Unit Price + Line Total */}
              <div className="flex items-center gap-2.5">
                {/* Product Thumbnail */}
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getProductIcon(item.name, { size: 18 })
                  )}
                </div>

                {/* Name & Read-only Unit Price */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate font-display">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Rs. {Number(item.price).toLocaleString()} / {shortUnit}
                  </p>
                </div>

                {/* Read-only Line Subtotal */}
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-slate-900 font-mono">
                    Rs. {lineTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Card Footer: Remove & Stepper */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleRemoveFromCart(item.id)}
                  className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>

                {/* Stepper with Non-Editable Count */}
                <div className="flex items-center border border-slate-200 bg-slate-50 rounded-lg overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateQuantity(
                        item.id,
                        Math.max(0, (parseFloat(item.quantity) || 0) - 1),
                      )
                    }
                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition text-xs font-bold cursor-pointer"
                    title="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-black text-slate-800 tabular select-none">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateQuantity(
                        item.id,
                        (parseFloat(item.quantity) || 0) + 1,
                      )
                    }
                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition text-xs font-bold cursor-pointer"
                    title="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clean Read-Only Financial Summary List */}
      <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
        <div className="flex justify-between items-center text-slate-600">
          <span>Subtotal</span>
          <span className="font-bold text-slate-800 tabular">
            Rs. {cartSubtotal.toLocaleString()}
          </span>
        </div>

        {saleCategory === 'delivery' && (
          <div className="flex justify-between items-center text-slate-600">
            <span>Delivery Fee</span>
            <span className="font-bold text-slate-800 tabular">
              Rs. {Number(deliveryCharge || 0).toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-slate-600">
          <span>Tax</span>
          <span className="font-semibold text-slate-400">Rs. 0</span>
        </div>

        <div className="flex justify-between items-center text-slate-600">
          <span>Discount</span>
          {discount > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] tabular">
              - Rs. {Number(discount).toLocaleString()}
            </span>
          ) : (
            <span className="text-slate-400 font-medium">None</span>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs font-black text-slate-900">
          <span className="font-display uppercase tracking-wider text-[11px] text-slate-700">
            Total Payable
          </span>
          <span className="text-base text-emerald-700 font-mono font-black">
            Rs. {netPayable.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
