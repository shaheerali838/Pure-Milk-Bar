import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { usePOSContext } from "@/context/POSContext";
import { useDailyClose } from "@/context/DailyCloseContext";
import { getPktTodayString } from "@/utils/dateUtils";
import DayClosedLockOverlay from "@/components/common/DayClosedLockOverlay";
import POSCartItems from "./POSCartItems";
import POSCheckoutDrawer from "./POSCheckoutDrawer";

export default function POSSale() {
  const [searchParams] = useSearchParams();
  const [isCheckoutDrawerOpen, setIsCheckoutDrawerOpen] = useState(false);
  const { isDayClosed } = useDailyClose();

  const {
    setSaleDate,
    cart = [],
    cartCount = 0,
    netPayable = 0,
    handleClearCart,
    setSaleCategory,
    setWalkinCustomerType,
    setWalkinName,
    setWalkinPhone,
    setDeliverySubType,
    setLinkedCustomerId,
    salesHistory = [],
    isSaleRefreshing = false,
    getProductAvailableStock,
  } = usePOSContext() || {};

  // Pin sale date to live business date for audit security
  const todayStr = getPktTodayString();
  useEffect(() => {
    setSaleDate?.(todayStr);
  }, [setSaleDate, todayStr]);

  // Sync incoming URL parameters into context
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam === "delivery") {
      setSaleCategory?.("delivery");
      const subType = searchParams.get("subType");
      if (subType === "monthly" || subType === "ontime") {
        setDeliverySubType?.(subType);
      }
    } else if (categoryParam === "walkin") {
      setSaleCategory?.("walkin");
      const customerId = searchParams.get("customerId");
      const name = searchParams.get("name") || searchParams.get("customerName");
      const phone = searchParams.get("phone");
      const type = searchParams.get("type");

      if (customerId) {
        setLinkedCustomerId?.(customerId);
        setWalkinCustomerType?.("registered");
      } else if (name || phone) {
        if (type === "registered") {
          setWalkinCustomerType?.("registered");
        } else {
          setWalkinCustomerType?.("first_time");
        }
        if (name) setWalkinName?.(name);
        if (phone) setWalkinPhone?.(phone);
      }
    }
  }, [
    searchParams,
    setSaleCategory,
    setDeliverySubType,
    setLinkedCustomerId,
    setWalkinCustomerType,
    setWalkinName,
    setWalkinPhone,
  ]);

  const hasInvalidCartItem = cart.some((item) => {
    const qty = Number(item.quantity) || 0;
    if (qty <= 0) return true;
    const avail =
      typeof getProductAvailableStock === "function"
        ? getProductAvailableStock(item)
        : (item.availableStock ?? 9999);
    return avail !== null && avail !== undefined && qty > avail;
  });

  const onOpenCheckoutDrawer = () => {
    if (isDayClosed || isSaleRefreshing || cart.length === 0 || hasInvalidCartItem)
      return;
    setIsCheckoutDrawerOpen(true);
  };

  // Dynamic Order Reference Number
  const activeOrderNumber = salesHistory.length + 1;

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 min-h-0 overflow-hidden relative">
      {/* App Lockdown Overlay if Day is Closed */}
      {isDayClosed && <DayClosedLockOverlay />}

      {/* 1. Simple Header Row: Dynamic Order Title + Close Icon */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900 font-display">
            Order #{activeOrderNumber}
          </h2>
          <span className="text-[11px] font-semibold text-slate-400">
            ({cartCount} {cartCount === 1 ? "item" : "items"})
          </span>
        </div>

        <button
          type="button"
          disabled={isDayClosed || isSaleRefreshing}
          onClick={handleClearCart}
          className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer"
          title="Clear active order"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Stacked Cart Cards & Read-Only Financial Summary */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden py-2">
        <POSCartItems />
      </div>

      {/* 3. Primary "Complete Order" Action Button (Toggles Checkout Drawer) */}
      <div className="pt-2.5 border-t border-slate-100 shrink-0">
        {cart.length === 0 ? (
          <button
            type="button"
            disabled
            className="w-full py-3 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Add products to checkout</span>
          </button>
        ) : hasInvalidCartItem ? (
          <button
            type="button"
            disabled
            className="w-full py-3 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-rose-200 shadow-2xs"
          >
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>Exceeds Stock Limit &bull; Adjust Quantity</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={isDayClosed || isSaleRefreshing}
            onClick={onOpenCheckoutDrawer}
            className="w-full py-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Complete Order &bull; Rs. {netPayable.toLocaleString()}
            </span>
          </button>
        )}
      </div>

      {/* 4. Slide-Out Right-Aligned Checkout Configuration Drawer */}
      <POSCheckoutDrawer
        isOpen={isCheckoutDrawerOpen}
        onClose={() => setIsCheckoutDrawerOpen(false)}
        activeOrderNumber={activeOrderNumber}
      />
    </div>
  );
}
