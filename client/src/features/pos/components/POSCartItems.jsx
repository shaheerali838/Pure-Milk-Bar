import React from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Minus,
  X,
  Truck,
  ShoppingCart,
  AlertCircle,
} from 'lucide-react';
import { PKRIcon } from '@/components/common/PKRIcon';
import { usePOSContext } from '@/context/POSContext';
import { getProductIcon } from '@/features/inventory/components/AddProduct';

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
    handleUpdateItemSource,
    saleCategory = 'walkin',
    getProductAvailableStock,
    getProductUnitLabel,
  } = usePOSContext();

  if (cart.length === 0) {
    return (
      <div className="py-8 text-center flex flex-col items-center justify-center space-y-2">
        <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
          <ShoppingCart className="w-5 h-5" />
        </div>
        <p className="text-xs sm:text-sm font-bold text-slate-700">
          Sale Cart is Empty
        </p>
        <p className="text-[11px] text-slate-400 max-w-55">
          Tap any dairy product on the left to add it to this active sale.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {cart.map((item) => {
          const availStock = typeof getProductAvailableStock === 'function'
            ? getProductAvailableStock(item)
            : (item.availableStock ?? item.stock ?? 9999);
          const isOverStock = availStock !== null && availStock !== undefined && item.quantity > availStock;
          const isDahi = (item.category || '').toLowerCase().includes('dahi') || (item.name || '').toLowerCase().includes('dahi');
          const unitLabel = typeof getProductUnitLabel === 'function'
            ? getProductUnitLabel(item)
            : item.name.toLowerCase().includes('milk')
            ? 'Liters (L)'
            : isDahi
            ? 'Kilograms (kg)'
            : 'Units';

          return (
            <div
              key={item.id}
              className={`p-2.5 rounded-xl border transition-all ${
                isOverStock
                  ? 'bg-rose-50/80 border-rose-300 shadow-xs'
                  : 'border-slate-200/80 bg-slate-50/70 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2 min-w-0 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  {getProductIcon(item.name, { size: 16, withBadge: true })}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 leading-tight truncate">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                      <span>Rate: Rs.</span>
                      <input
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={(e) => handleUpdatePrice(item.id, e.target.value)}
                        className="w-14 text-center bg-white border border-slate-200 rounded px-1 py-0.5 text-[10px] font-bold text-slate-700 tabular"
                      />
                      <span>/ {item.unit ? item.unit.replace('per ', '') : 'unit'}</span>
                      {availStock !== null && availStock !== undefined && (
                        <span className="ml-1 text-[9px] px-1.5 py-0.2 bg-slate-200/70 rounded text-slate-600 font-semibold">
                          Stock: {availStock}
                        </span>
                      )}
                    </div>
                    {/* Interactive Source Tag */}
                    <div className="flex items-center gap-1 mt-1">
                      {isDahi ? (
                        <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.2 rounded border bg-amber-50 text-amber-800 border-amber-200">
                          ⚡ Cascading FIFO
                        </span>
                      ) : (
                        <select
                          value={item.source || 'Farm'}
                          onChange={(e) => handleUpdateItemSource?.(item.id, e.target.value)}
                          className={`text-[9px] font-bold px-1 py-0.2 rounded border cursor-pointer focus:outline-none ${
                            item.source === 'Supplier'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : item.source === 'Mixed'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <option value="Farm">🌿 Farm</option>
                          <option value="Supplier">🚚 Supplier</option>
                          <option value="Mixed">⚖️ Mixed</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveFromCart(item.id)}
                  className="text-slate-300 hover:text-rose-500 p-1 rounded-md transition cursor-pointer"
                  title="Remove item"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dynamic Inputs: Quantity (L/kg) & Rupees (Rs) */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                {/* Quantity Input */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[9px] font-bold uppercase text-slate-500 block">
                      Qty ({unitLabel})
                    </label>
                    {availStock !== null && availStock !== undefined && (
                      <span className="text-[9px] font-bold text-slate-400">
                        Max: {availStock}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center border border-slate-200 bg-white rounded-lg shadow-2xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, Math.max(0, (parseFloat(item.quantity) || 0) - 1))}
                      className="px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition text-xs font-bold cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max={availStock ?? undefined}
                      value={item.quantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          handleUpdateQuantity(item.id, '');
                          return;
                        }
                        const num = parseFloat(val);
                        if (isNaN(num)) return;
                        if (availStock !== null && availStock !== undefined && num > availStock) {
                          toast.error(`🚫 Stock Limit Exceeded! "${item.name}"`, {
                            description: `Sirf ${availStock} ${unitLabel} stock dastiyab hai. Is se zyada enter nahi kiya ja sakta.`,
                            duration: 2500,
                          });
                          handleUpdateQuantity(item.id, availStock);
                        } else {
                          handleUpdateQuantity(item.id, Math.max(0, num));
                        }
                      }}
                      placeholder="0.0"
                      className="w-full text-center text-xs font-black text-slate-800 tabular border-x border-slate-150 py-1 outline-none focus:bg-blue-50/50"
                    />
                    <button
                      type="button"
                      disabled={availStock !== null && availStock !== undefined && (parseFloat(item.quantity) || 0) >= availStock}
                      onClick={() => {
                        const current = parseFloat(item.quantity) || 0;
                        if (availStock !== null && availStock !== undefined && current + 1 > availStock) {
                          toast.error(`🚫 Stock Limit Exceeded! "${item.name}"`, {
                            description: `Sirf ${availStock} ${unitLabel} stock dastiyab hai.`,
                            duration: 2500,
                          });
                          handleUpdateQuantity(item.id, availStock);
                          return;
                        }
                        handleUpdateQuantity(item.id, current + 1);
                      }}
                      className="px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Rupees (Amount) Input */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[9px] font-bold uppercase text-slate-500 block">
                      Amount (Rupees)
                    </label>
                    {availStock !== null && availStock !== undefined && item.price > 0 && (
                      <span className="text-[9px] font-bold text-slate-400">
                        Max: Rs. {Math.round(availStock * item.price)}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-2 top-1 text-[10px] font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max={availStock !== null && availStock !== undefined && item.price > 0 ? Math.round(availStock * item.price) : undefined}
                      value={item.quantity !== '' && !isNaN(item.quantity) ? Math.round((Number(item.quantity) * item.price) * 100) / 100 || '' : ''}
                      onChange={(e) => {
                        const rupees = parseFloat(e.target.value);
                        if (e.target.value === '') {
                          handleUpdateQuantity(item.id, '');
                          return;
                        }
                        if (!isNaN(rupees) && item.price > 0) {
                          let computedQty = Math.round((rupees / item.price) * 1000) / 1000;
                          if (availStock !== null && availStock !== undefined && computedQty > availStock) {
                            toast.error(`🚫 Stock Limit Exceeded! "${item.name}"`, {
                              description: `Rs. ${rupees} (${computedQty} ${unitLabel}) exceeds max stock of ${availStock} ${unitLabel}.`,
                              duration: 2500,
                            });
                            computedQty = availStock;
                          }
                          handleUpdateQuantity(item.id, computedQty);
                        }
                      }}
                      placeholder="0"
                      className="w-full pl-7 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-emerald-800 tabular outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Insufficient Stock Warning */}
              {isOverStock && (
                <div className="mt-1.5 text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded border border-rose-200 flex items-center justify-between">
                  <span>⚠️ Exceeds Available Stock!</span>
                  <span>Max: {availStock} {unitLabel}</span>
                </div>
              )}
            </div>
          );
        })}
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
            <PKRIcon className="w-3 h-3 text-slate-400" /> Discount (Rs.)
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
