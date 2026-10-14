import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ShoppingCart, Trash2, CheckCircle2, Users, UserCheck, Calendar, User, Truck, Loader2, AlertCircle } from "lucide-react";
import { usePOSContext } from "@/context/POSContext";
import { useDailyClose } from "@/context/DailyCloseContext";
import { getPktTodayString } from "@/utils/dateUtils";
import DayClosedLockOverlay from "@/components/common/DayClosedLockOverlay";
import POSCartItems from "./POSCartItems";
import POSWalkinSection from "./POSWalkinSection";
import POSCustomerKhataSection from "./POSCustomerKhataSection";
import POSDeliverySection from "./POSDeliverySection";

export default function POSSale() {
  const [searchParams] = useSearchParams();
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const { isDayClosed, reopenDay } = useDailyClose();

  const {
    saleDate,
    setSaleDate,
    cart = [],
    cartCount = 0,
    netPayable = 0,
    handleClearCart,
    saleCategory = "walkin",
    setSaleCategory,
    walkinCustomerType = "first_time",
    setWalkinCustomerType,
    setWalkinName,
    setWalkinPhone,
    setDeliverySubType,
    setLinkedCustomerId,
    deductStockAfterSale,
    handleCompleteSale,
    isSaleRefreshing = false,
    getProductAvailableStock,
  } = usePOSContext() || {};

  // Sync category & customer info from URL search params
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
    const avail = typeof getProductAvailableStock === "function"
      ? getProductAvailableStock(item)
      : (item.availableStock ?? 9999);
    return avail !== null && avail !== undefined && qty > avail;
  });

  const onCompleteSaleClick = async () => {
    if (isDayClosed || isProcessingSale || isSaleRefreshing || cart.length === 0) return;
    if (hasInvalidCartItem) {
      toast.error("🚫 Cannot Complete Sale: Cart contains items exceeding available stock or invalid quantities.");
      return;
    }
    setIsProcessingSale(true);
    const completedCartItems = [...cart];
    try {
      const result = await handleCompleteSale?.();
      if (result) {
        if (typeof deductStockAfterSale === "function") {
          deductStockAfterSale(completedCartItems);
        }
        toast.success("Sale completed successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to complete sale. Please try again.");
    } finally {
      setIsProcessingSale(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 min-h-0 overflow-hidden relative">
      {/* App Lockdown Overlay if Day is Closed */}
      {isDayClosed && <DayClosedLockOverlay />}

      {/* Fixed Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-display">
              Sale Cart &amp; Checkout
            </h2>
          </div>
          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
            {cartCount} items
          </span>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            disabled={isDayClosed || isProcessingSale || isSaleRefreshing}
            onClick={handleClearCart}
            className="text-xs font-semibold text-rose-500 hover:text-rose-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Scrollable Checkout Content */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 py-2">
        {/* Modular Cart Items List & Summary */}
        <POSCartItems />

        {/* Order Type Toggle: Walk-in vs Delivery */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
            ORDER TYPE
          </span>

          <div className="grid grid-cols-2 p-0.5 bg-slate-100 rounded-lg border border-slate-200/60">
            <button
              type="button"
              onClick={() => setSaleCategory?.("walkin")}
              className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${saleCategory === "walkin"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Walk-in Counter</span>
            </button>

            <button
              type="button"
              onClick={() => setSaleCategory?.("delivery")}
              className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${saleCategory === "delivery"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Home Delivery</span>
            </button>
          </div>
        </div>

        {/* Walk-in Customer Flow */}
        {saleCategory === "walkin" && (
          <div className="space-y-2 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 p-0.5 bg-slate-100 rounded-lg border border-slate-200/60">
              <button
                type="button"
                onClick={() => setWalkinCustomerType?.("first_time")}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${walkinCustomerType === "first_time"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>First-Time / Regular</span>
              </button>

              <button
                type="button"
                onClick={() => setWalkinCustomerType?.("registered")}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${walkinCustomerType === "registered"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Monthly Subscribed</span>
              </button>
            </div>

            {walkinCustomerType === "first_time" && <POSWalkinSection />}
            {walkinCustomerType === "registered" && <POSCustomerKhataSection />}
          </div>
        )}

        {/* Home Delivery Flow */}
        {saleCategory === "delivery" && <POSDeliverySection />}
      </div>

      {/* Sale Date Selector */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs mt-1 shrink-0">
        <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sale Date:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={saleDate || getPktTodayString()}
            onChange={(e) => setSaleDate?.(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-semibold shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          />
          {saleDate && saleDate !== getPktTodayString() && (
            <button
              type="button"
              onClick={() => setSaleDate?.(getPktTodayString())}
              className="text-[10px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-1.5 py-0.5 rounded cursor-pointer transition"
              title="Reset to today's date"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Fixed Bottom Checkout Action */}
      <div className="pt-2.5 border-t border-slate-100 shrink-0">
        {cart.length === 0 ? (
          <button
            type="button"
            disabled
            className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
          >
            <CheckCircle2 className="w-4 h-4" />
            Add products to cart
          </button>
        ) : hasInvalidCartItem ? (
          <button
            type="button"
            disabled
            className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-rose-200 shadow-2xs"
          >
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>Exceeds Stock Limit &bull; Fix Qty to Checkout</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={isDayClosed || isProcessingSale || isSaleRefreshing}
            onClick={onCompleteSaleClick}
            className="w-full py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isProcessingSale || isSaleRefreshing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Applying &amp; Syncing State...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Sale &bull; Rs. {netPayable.toLocaleString()}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
