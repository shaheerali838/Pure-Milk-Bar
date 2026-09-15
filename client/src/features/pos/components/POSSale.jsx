import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  CheckCircle2,
  Users,
  UserCheck,
  Truck,
} from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';
import POSCartItems from './POSCartItems';
import POSWalkinSection from './POSWalkinSection';
import POSDeliverySection from './POSDeliverySection';
import POSCustomerKhataSection from './POSCustomerKhataSection';

export default function POSSale() {
  const [searchParams] = useSearchParams();

  const {
    cart = [],
    cartCount = 0,
    handleClearCart,
    saleCategory = 'walkin',
    setSaleCategory,
    setDeliverySubType,
    netPayable = 0,
    handleCompleteSale,
  } = usePOSContext();

  // Sync category from URL search params (e.g. /pos?category=delivery)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam === 'delivery') {
      setSaleCategory('delivery');
      const subType = searchParams.get('subType');
      if (subType === 'monthly' || subType === 'ontime') {
        setDeliverySubType(subType);
      }
    } else if (categoryParam === 'customer') {
      setSaleCategory('customer');
    } else if (categoryParam === 'walkin') {
      setSaleCategory('walkin');
    }
  }, [searchParams, setSaleCategory, setDeliverySubType]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3.5">
      {/* 1. Header of Sale Cart */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-display">
              Sale Cart
            </h2>
          </div>
          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
            {cartCount} items
          </span>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={handleClearCart}
            className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* 2. Empty State or Cart Items Component */}
      {cart.length === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center space-y-2">
          <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-700">
            Sale Cart is Empty
          </p>
          <p className="text-[11px] text-slate-400 max-w-[220px]">
            Tap any dairy product on the left to add it to this active sale.
          </p>
        </div>
      ) : (
        <POSCartItems />
      )}

      {/* 3. Primary Sale Category Switcher (3 Buttons: Walk-in, Delivery, Customer) */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
            ORDER TYPE
          </span>
          <span className="text-[10px] font-semibold text-slate-600">
            {saleCategory === 'walkin'
              ? 'Walk-in Counter'
              : saleCategory === 'delivery'
              ? 'Home Delivery'
              : 'Customer Khata'}
          </span>
        </div>

        {/* 3 Mode Buttons: Walk-in, Delivery, Customer */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
          {/* Button 1: Walkin */}
          <button
            type="button"
            onClick={() => setSaleCategory('walkin')}
            className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              saleCategory === 'walkin'
                ? 'bg-[#00a86b] text-white shadow-xs'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Walk-in</span>
          </button>

          {/* Button 2: Delivery */}
          <button
            type="button"
            onClick={() => setSaleCategory('delivery')}
            className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              saleCategory === 'delivery'
                ? 'bg-[#2563eb] text-white shadow-xs'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Delivery</span>
          </button>

          {/* Button 3: Customer Khata */}
          <button
            type="button"
            onClick={() => setSaleCategory('customer')}
            className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              saleCategory === 'customer'
                ? 'bg-[#7e22ce] text-white shadow-xs'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Customer</span>
          </button>
        </div>
      </div>

      {/* 4. Active Mode Component (Only active mode rendered) */}
      {saleCategory === 'walkin' && <POSWalkinSection />}
      {saleCategory === 'delivery' && <POSDeliverySection />}
      {saleCategory === 'customer' && <POSCustomerKhataSection />}

      {/* 5. Complete Sale Action Button */}
      <div className="pt-2">
        {cart.length === 0 ? (
          <button
            type="button"
            disabled
            className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
          >
            <CheckCircle2 className="w-4 h-4" />
            Add products to cart
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCompleteSale}
            className={`w-full py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
              saleCategory === 'walkin'
                ? 'bg-[#00a86b] hover:bg-[#008f5b]'
                : saleCategory === 'delivery'
                ? 'bg-[#2563eb] hover:bg-[#1d4ed8]'
                : 'bg-[#7e22ce] hover:bg-[#6b21a8]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete Sale &bull; Rs. {netPayable.toLocaleString()}
          </button>
        )}
      </div>
    </div>
  );
}
