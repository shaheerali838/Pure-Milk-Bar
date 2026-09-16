import React from 'react';
import {
  Plus,
  Minus,
  X,
  Truck,
  DollarSign,
} from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';

export default function POSCartItems() {
  const {
    cart = [],
    cartSubtotal = 0,
    discount = 0,
    setDiscount,
    deliveryCharge = 0,
    setDeliveryCharge,
    netPayable = 0,
    handleUpdateQuantity,
    handleUpdatePrice,
    handleRemoveFromCart,
    saleCategory = 'walkin',
  } = usePOSContext();

  return (
    <div className="space-y-2">
      <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs shadow-2xs shrink-0">
                {item.category && item.category.toLowerCase().includes('dahi')
                  ? '🥣'
                  : item.category && item.category.toLowerCase().includes('lassi')
                  ? '🧃'
                  : '🥛'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 leading-tight truncate">
                  {item.name}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                  <span>Rs.</span>
                  <input
                    type="number"
                    min="0"
                    value={item.price}
                    onChange={(e) => handleUpdatePrice(item.id, e.target.value)}
                    className="w-12 text-center bg-white border border-slate-200 rounded px-1 py-0.2 text-[10px] font-bold text-slate-700 tabular"
                  />
                  <span>/ {item.unit ? item.unit.replace('per ', '') : 'unit'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center border border-slate-200 bg-white rounded-lg shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  className="px-1.5 py-0.5 text-slate-500 hover:text-slate-800 transition text-xs font-bold cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-1.5 text-xs font-bold text-slate-800 tabular">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  className="px-1.5 py-0.5 text-slate-500 hover:text-slate-800 transition text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div className="text-right min-w-[55px]">
                <span className="text-xs font-black text-slate-900 tabular">
                  Rs. {(item.quantity * item.price).toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveFromCart(item.id)}
                className="text-slate-300 hover:text-rose-500 transition p-0.5 cursor-pointer"
                title="Remove item"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
        <div className="flex justify-between items-center text-[11px]">
          <span>Subtotal</span>
          <span className="font-bold text-slate-800 tabular">
            Rs. {cartSubtotal.toLocaleString()}
          </span>
        </div>

        {saleCategory === 'delivery' && (
          <div className="flex justify-between items-center text-blue-700 text-[11px]">
            <span className="flex items-center gap-1">
              <Truck className="w-3 h-3" /> Delivery Fee (Rs.)
            </span>
            <input
              type="number"
              min="0"
              value={deliveryCharge}
              onChange={(e) => setDeliveryCharge(e.target.value)}
              className="w-16 text-right bg-white border border-blue-200 rounded px-1.5 py-0.5 font-bold text-xs text-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-400 tabular"
              placeholder="0"
            />
          </div>
        )}

        <div className="flex justify-between items-center text-slate-600 text-[11px]">
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-slate-400" /> Discount (Rs.)
          </span>
          <input
            type="number"
            min="0"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="w-16 text-right bg-white border border-slate-200 rounded px-1.5 py-0.5 font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 tabular"
            placeholder="0"
          />
        </div>

        <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-slate-200 text-xs font-black text-slate-900">
          <span className="uppercase tracking-wide font-display text-[11px]">NET PAYABLE</span>
          <span className="text-sm font-black text-emerald-700 tabular">
            Rs. {netPayable.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
