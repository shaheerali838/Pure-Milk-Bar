import React, { useState } from 'react';
import {
  ArrowLeft,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePOSContext } from '@/context/POSContext';
import { useDailyClose } from '@/context/DailyCloseContext';
import { getPktTodayString, formatPktDisplay } from '@/utils/dateUtils';
import POSWalkinSection from './POSWalkinSection';
import POSDeliverySection from './POSDeliverySection';

export default function POSCheckoutDrawer({ isOpen, onClose, activeOrderNumber }) {
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const { isDayClosed } = useDailyClose();

  const {
    cart = [],
    cartCount = 0,
    cartSubtotal = 0,
    deliveryCharge = 0,
    discount = 0,
    setDiscount,
    netPayable = 0,
    saleCategory = 'walkin',
    setSaleCategory,
    walkinCustomerType = 'first_time',
    setWalkinCustomerType,
    linkedCustomerId,
    ontimeCustomerName,
    ontimeDeliveryArea,
    deductStockAfterSale,
    handleCompleteSale,
    isSaleRefreshing = false,
    getProductAvailableStock,
  } = usePOSContext() || {};

  if (!isOpen) return null;

  const currentChannelKey = saleCategory === 'delivery' ? 'delivery' : 'walkin';

  const handleChannelSelect = (val) => {
    if (val === 'delivery') {
      setSaleCategory?.('delivery');
    } else {
      setSaleCategory?.('walkin');
      setWalkinCustomerType?.('first_time');
    }
  };

  const hasInvalidCartItem = cart.some((item) => {
    const qty = Number(item.quantity) || 0;
    if (qty <= 0) return true;
    const avail =
      typeof getProductAvailableStock === 'function'
        ? getProductAvailableStock(item)
        : (item.availableStock ?? 9999);
    return avail !== null && avail !== undefined && qty > avail;
  });

  const onConfirmCheckout = async () => {
    if (isDayClosed || isProcessingSale || isSaleRefreshing || cart.length === 0)
      return;

    if (hasInvalidCartItem) {
      toast.error('Adjust quantities: Items in cart exceed available stock.');
      return;
    }

    if (currentChannelKey === 'delivery' && !ontimeDeliveryArea && !ontimeCustomerName) {
      toast.info('Please configure customer name and delivery drop point.');
      return;
    }

    setIsProcessingSale(true);
    const completedCartItems = [...cart];
    try {
      const result = await handleCompleteSale?.();
      if (result) {
        if (typeof deductStockAfterSale === 'function') {
          deductStockAfterSale(completedCartItems);
        }
        toast.success('Sale completed successfully!');
        onClose?.();
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Failed to complete sale. Please try again.');
    } finally {
      setIsProcessingSale(false);
    }
  };

  const channels = [
    { id: 'walkin', label: 'Walk-in' },
    { id: 'delivery', label: 'Delivery' },
  ];

  const todayStr = getPktTodayString();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Semi-transparent backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Right-aligned Slide-out Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200/90 flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">
          {/* 1. Drawer Header */}
          <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition shadow-2xs cursor-pointer"
                title="Return to Cart"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Order #{activeOrderNumber} Checkout
                </h3>
                <p className="text-[11px] text-slate-500">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} in cart &bull; Configure order
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
              title="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 2. Scrollable Body: Pure Text Channel Selection & Form Fields */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {/* Live Business Date Audit Info */}
            <div className="flex items-center justify-between text-xs text-slate-500 pb-0.5">
              <span>Date: {formatPktDisplay(todayStr)}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PKT Audited
              </span>
            </div>

            {/* Purely Text-Based Order Channel Selector */}
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
              {channels.map((chan) => {
                const isActive = currentChannelKey === chan.id;
                return (
                  <button
                    key={chan.id}
                    type="button"
                    onClick={() => handleChannelSelect(chan.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition text-center cursor-pointer ${
                      isActive
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {chan.label}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Customer Details Fields Rendered Directly on Drawer Background */}
            <div className="pt-1">
              {currentChannelKey === 'delivery' ? (
                <POSDeliverySection />
              ) : (
                <POSWalkinSection />
              )}
            </div>

            {/* Order Discount Adjustment (Rendered Flat on Drawer Background) */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="font-semibold text-slate-700 block">Order Discount (Rs.)</span>
                <span className="text-[10px] text-slate-400">Optional deduction</span>
              </div>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount?.(e.target.value)}
                placeholder="0"
                className="w-24 text-right bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-xs text-slate-800 focus:outline-none focus:border-emerald-500 tabular"
              />
            </div>
          </div>

          {/* 3. Sticky Drawer Footer: Financial Recap & Final Confirmation CTA */}
          <div className="p-4 border-t border-slate-150 bg-slate-50/80 shrink-0 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'}):</span>
              <span className="font-bold text-slate-800 font-mono">
                Rs. {cartSubtotal.toLocaleString()}
              </span>
            </div>

            {saleCategory === 'delivery' && (
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span>Delivery Fee:</span>
                <span className="font-bold text-slate-800 font-mono">
                  Rs. {Number(deliveryCharge || 0).toLocaleString()}
                </span>
              </div>
            )}

            {Number(discount || 0) > 0 && (
              <div className="flex items-center justify-between text-xs font-medium text-emerald-700">
                <span>Applied Discount:</span>
                <span className="font-bold font-mono">
                  - Rs. {Number(discount).toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
              <span className="font-display uppercase tracking-wider text-xs text-slate-700">
                Final Net Payable
              </span>
              <span className="text-lg text-emerald-700 font-mono font-black">
                Rs. {netPayable.toLocaleString()}
              </span>
            </div>

            {/* Final Transaction Confirmation Button */}
            <button
              type="button"
              disabled={isDayClosed || isProcessingSale || isSaleRefreshing || cart.length === 0}
              onClick={onConfirmCheckout}
              className="w-full py-3.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isProcessingSale || isSaleRefreshing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Transaction...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Confirm &amp; Complete Order &bull; Rs. {netPayable.toLocaleString()}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
