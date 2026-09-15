import React from 'react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  X,
  Store,
  Bike,
  CreditCard,
  Banknote,
  Smartphone,
  Truck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  DollarSign,
  ChevronDown,
} from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';

export default function POSSale() {
  const {
    cart = [],
    cartCount = 0,
    cartSubtotal = 0,
    discount = 0,
    setDiscount,
    deliveryCharge = 0,
    setDeliveryCharge,
    netPayable = 0,
    handleUpdateQuantity,
    handleUpdateByRupees,
    handleUpdatePrice,
    handleRemoveFromCart,
    handleClearCart,

    // Fulfillment
    fulfillmentMode = 'counter',
    setFulfillmentMode,
    riders = [],
    selectedRiderId,
    setSelectedRiderId,
    activeRider,
    customRiderName,
    setCustomRiderName,
    deliverySlot,
    setDeliverySlot,
    deliveryLandmark,
    setDeliveryLandmark,
    dropAddress,
    setDropAddress,
    collectEmptyBottles,
    setCollectEmptyBottles,

    // Payment
    paymentMethod = 'cash',
    setPaymentMethod,
    cashTendered,
    setCashTendered,
    onlineDetails,
    setOnlineDetails,

    // Customer Linking
    linkedCustomerId,
    setLinkedCustomerId,
    activeCustomer,
    registeredCustomers = [],

    // Sale Actions
    handleCompleteSale,
    executeKhataPayment,
  } = usePOSContext();

  const handleDirectClearKhata = (cust) => {
    const target = cust || activeCustomer;
    if (!target) return;
    const balance = target.khataBalance || 0;
    if (balance <= 0) {
      alert(`Customer ${target.name} has no outstanding khata debt.`);
      return;
    }
    if (window.confirm(`Clear and finish full khata debt of Rs. ${balance.toLocaleString()} for ${target.name}?`)) {
      executeKhataPayment({
        customerId: target.id,
        amountPaid: balance,
        paymentMethod: 'Cash',
        notes: 'Full Khata finished and cleared at POS register',
      });
      alert(`Khata for ${target.name} has been finished.`);
    }
  };

  const numCashTendered = Number(cashTendered) || 0;
  const changeDue = Math.max(0, numCashTendered - netPayable);

  const cashChips = [
    { label: 'Exact', value: netPayable },
    { label: 'Rs. 500', value: 500 },
    { label: 'Rs. 1,000', value: 1000 },
    { label: 'Rs. 2,000', value: 2000 },
    { label: 'Rs. 5,000', value: 5000 },
  ];

  const paymentLabels = {
    cash: 'Cash',
    khata: 'Khata Pay',
    online: 'Online',
    cod: 'COD',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
      {/* 1. Header of Sale Cart */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-purple-600" />
          <h2 className="text-sm font-bold text-slate-800 font-display">Sale Cart</h2>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white">
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

      {/* 2. Empty State or Cart Items */}
      {cart.length === 0 ? (
        <div className="py-10 text-center flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">Sale Cart is Empty</p>
          <p className="text-xs text-slate-400 max-w-[240px]">
            Tap any milk, yogurt, or lassi item on the left to add it to the active sale.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Item rows */}
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {cart.map((item) => {
              const qty = Number(item.quantity) || 0;
              const rate = Number(item.price) || 0;
              const lineTotal = Math.round(qty * rate);
              const unitLabel = item.unit ? item.unit.replace('per ', '') : (item.category?.toLowerCase().includes('milk') ? 'L' : 'kg');

              // Friendly quantity description
              const getFriendlyLabel = (q) => {
                if (Math.abs(q - 0.25) < 0.01) return '¼ (Pao)';
                if (Math.abs(q - 0.5) < 0.01) return '½ (Half)';
                if (Math.abs(q - 0.75) < 0.01) return '¾ (Paun)';
                if (Math.abs(q - 1.0) < 0.01) return '1 Liter';
                if (Math.abs(q - 1.5) < 0.01) return '1½ (Dedh)';
                if (Math.abs(q - 2.0) < 0.01) return '2 Liters';
                if (Math.abs(q - 2.5) < 0.01) return '2½ (Dhai)';
                return `${q} ${unitLabel}`;
              };

              return (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 transition space-y-2"
                >
                  {/* Top Row: Icon + Name + Rate + Total & Remove */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm shadow-2xs shrink-0">
                        {item.category && item.category.toLowerCase().includes('dahi')
                          ? ''
                          : item.category && item.category.toLowerCase().includes('lassi')
                          ? ''
                          : ''}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 leading-tight truncate">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <span>Rate: Rs.</span>
                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) => handleUpdatePrice(item.id, e.target.value)}
                            className="w-12 text-center bg-white border border-slate-200 rounded px-1 py-0.2 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-indigo-400"
                          />
                          <span>/{unitLabel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900 tabular">
                          Rs. {lineTotal.toLocaleString()}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-600 tabular">
                          {getFriendlyLabel(qty)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-slate-300 hover:text-rose-500 transition p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inputs: Quantity Stepper & Direct Rupee Amount */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-xs">
                    {/* Quantity Stepper with manual typing */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{unitLabel}:</span>
                      <div className="flex items-center border border-slate-200 bg-white rounded-lg shadow-2xs">
                        <button
                          type="button"
                          onClick={() => {
                            const step = qty <= 1 ? 0.25 : 0.5;
                            handleUpdateQuantity(item.id, Math.max(0.1, Number((qty - step).toFixed(2))));
                          }}
                          className="px-1.5 py-0.5 text-slate-500 hover:text-slate-800 transition text-xs font-bold cursor-pointer"
                          title="Reduce quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          step="0.05"
                          min="0.05"
                          value={qty}
                          onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                          className="w-12 text-center text-xs font-bold text-slate-800 outline-none tabular"
                          title="Type quantity in liters/kg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const step = qty < 1 ? 0.25 : 0.5;
                            handleUpdateQuantity(item.id, Number((qty + step).toFixed(2)));
                          }}
                          className="px-1.5 py-0.5 text-slate-500 hover:text-slate-800 transition text-xs font-bold cursor-pointer"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Direct Rupee (Rs) Input */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase">Rs:</span>
                      <div className="flex items-center border border-indigo-200 bg-white rounded-lg shadow-2xs px-1.5 py-0.5">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={lineTotal || ''}
                          onChange={(e) => handleUpdateByRupees(item.id, e.target.value)}
                          placeholder="e.g. 100"
                          className="w-14 text-right text-xs font-bold text-indigo-700 outline-none tabular"
                          title="Type amount in rupees (e.g. 100) to auto-calculate liters"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Rupee & Liter Preset Chips */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[9px] font-semibold text-slate-400 mr-0.5">Quick:</span>
                    {[50, 100, 200, 500].map((rs) => {
                      const calcL = rate > 0 ? Number((rs / rate).toFixed(2)) : 0;
                      const isSelected = Math.abs(lineTotal - rs) < 2;
                      return (
                        <button
                          key={rs}
                          type="button"
                          onClick={() => handleUpdateByRupees(item.id, rs)}
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border transition cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                          title={`Rs. ${rs} = ${calcL} ${unitLabel}`}
                        >
                          Rs.{rs} <span className="opacity-75 font-normal text-[9px]">({calcL}L)</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, 0.5)}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border transition cursor-pointer ${
                        Math.abs(qty - 0.5) < 0.01
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                      }`}
                      title="Half Liter (0.5 L)"
                    >
                      ½ L
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border transition cursor-pointer ${
                        Math.abs(qty - 1) < 0.01
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                      }`}
                      title="1 Liter"
                    >
                      1 L
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing summary */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800 tabular">
                Rs. {cartSubtotal.toLocaleString()}
              </span>
            </div>

            {/* Delivery Charges (when Doorstep Delivery is chosen) */}
            {fulfillmentMode === 'doorstep' && (
              <div className="flex justify-between items-center text-indigo-700">
                <span className="flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5" /> Delivery Charges (Rs.)
                </span>
                <input
                  type="number"
                  min="0"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(e.target.value)}
                  className="w-16 text-right bg-white border border-indigo-200 rounded px-1.5 py-0.5 font-bold text-xs text-indigo-900 focus:outline-none focus:ring-1 focus:ring-indigo-400 tabular"
                  placeholder="0"
                />
              </div>
            )}

            {/* Discount input */}
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Discount (Rs.)
              </span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-16 text-right bg-white border border-slate-200 rounded px-1.5 py-0.5 font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-400 tabular"
                placeholder="0"
              />
            </div>

            {/* NET PAYABLE */}
            <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200 text-sm font-black text-slate-900">
              <span className="uppercase tracking-wide font-display">NET PAYABLE</span>
              <span className="text-base text-purple-700 tabular">
                Rs. {netPayable.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Fulfillment Mode */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            FULFILLMENT MODE
          </span>
          <span className="text-[10px] font-medium text-slate-400">
            {fulfillmentMode === 'doorstep' ? 'Assign Rider / Walking Man' : 'Store Walk-in Pickup'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFulfillmentMode('counter')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              fulfillmentMode === 'counter'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            Counter Pickup
          </button>

          <button
            type="button"
            onClick={() => setFulfillmentMode('doorstep')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              fulfillmentMode === 'doorstep'
                ? 'bg-[#4f46e5] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            Doorstep Delivery
          </button>
        </div>

        {/* Doorstep Delivery Details (image_cd0aa6.png) */}
        {fulfillmentMode === 'doorstep' && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5 animate-in fade-in duration-150 text-xs">
            <span className="font-bold text-slate-700 text-[11px] block">Delivery Personnel:</span>

            {/* Rider Dropdown (with vehicle type) */}
            <div className="relative">
              <select
                value={selectedRiderId}
                onChange={(e) => setSelectedRiderId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 pr-8 appearance-none"
              >
                {riders.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.vehicleType === 'Motorbike' ? '🛵' : '🚲'} [Rider] {r.name} — {r.vehicleName} ({r.plateNumber}) ({r.phone})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Custom Delivery Person Input */}
            <input
              type="text"
              placeholder="Or type custom delivery person / hawker name..."
              value={customRiderName}
              onChange={(e) => setCustomRiderName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />

            {/* Selected Rider Box */}
            {activeRider && (
              <div className="bg-white p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-sm font-bold">
                    {activeRider.vehicleType === 'Motorbike' ? '🛵' : '🚲'}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 leading-tight block">
                      {customRiderName || activeRider.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {activeRider.vehicleName} ({activeRider.plateNumber}) · {activeRider.phone}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {activeRider.badge}
                </span>
              </div>
            )}

            {/* Shift & Landmark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Delivery Slot / Shift
                </label>
                <select
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value=" Instant Dispatch (30 mins)"> Instant Dispatch (30 mins)</option>
                  <option value=" Morning Shift (6:00 AM - 8:00 AM)"> Morning Shift (6:00 AM - 8:00 AM)</option>
                  <option value=" Evening Shift (5:00 PM - 7:00 PM)"> Evening Shift (5:00 PM - 7:00 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Delivery Landmark / Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Model Town / Near Mosque"
                  value={deliveryLandmark}
                  onChange={(e) => setDeliveryLandmark(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Drop Address */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-indigo-500" />
                Drop Address &amp; House / Gate Note:
              </label>
              <input
                type="text"
                placeholder="e.g. Street 4, House 18, Block B (Milk box on main gate)"
                value={dropAddress}
                onChange={(e) => setDropAddress(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-600 font-medium">
              <input
                type="checkbox"
                checked={collectEmptyBottles}
                onChange={(e) => setCollectEmptyBottles(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Collect empty milk bottles / jars upon doorstep delivery</span>
            </label>
          </div>
        )}
      </div>

      {/* 4. Payment Method */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            PAYMENT METHOD
          </span>
          <span className="text-[10px] font-medium text-slate-400 capitalize">
            {fulfillmentMode === 'doorstep' && paymentMethod === 'cod'
              ? 'Doorstep Cash Collection'
              : `Counter ${paymentLabels[paymentMethod]}`}
          </span>
        </div>

        {/* 4 buttons */}
        <div className="grid grid-cols-4 gap-1.5">
          {/* Cash */}
          <button
            type="button"
            onClick={() => setPaymentMethod('cash')}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
              paymentMethod === 'cash'
                ? 'bg-[#009966] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Cash</span>
          </button>

          {/* Khata Pay */}
          <button
            type="button"
            onClick={() => setPaymentMethod('khata')}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
              paymentMethod === 'khata'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Khata Pay</span>
          </button>

          {/* Online Payment */}
          <button
            type="button"
            onClick={() => setPaymentMethod('online')}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
              paymentMethod === 'online'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Online</span>
          </button>

          {/* COD */}
          <button
            type="button"
            onClick={() => setPaymentMethod('cod')}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
              paymentMethod === 'cod'
                ? 'bg-[#4f46e5] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>COD</span>
          </button>
        </div>

        {/* 4.A Cash Tendered Fields */}
        {paymentMethod === 'cash' && (
          <div className="space-y-2 pt-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase">
              CASH TENDERED / AMOUNT RECEIVED
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
              <input
                type="number"
                min="0"
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
                placeholder="0"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 tabular"
              />
            </div>

            {/* Denomination Chips */}
            <div className="grid grid-cols-5 gap-1 pt-0.5">
              {cashChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => setCashTendered(String(chip.value))}
                  className="py-1 px-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition cursor-pointer text-center"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {changeDue > 0 && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center text-xs font-bold text-emerald-800">
                <span>Change to Return:</span>
                <span className="tabular text-sm">Rs. {changeDue.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* 4.B Online Payment Fields */}
        {paymentMethod === 'online' && (
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-blue-900 tracking-wider">
                Online Payment Verification
              </span>
              <select
                value={onlineDetails.provider}
                onChange={(e) =>
                  setOnlineDetails({ ...onlineDetails, provider: e.target.value })
                }
                className="bg-white border border-blue-200 rounded-lg px-2 py-0.5 text-[11px] font-bold text-blue-800"
              >
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="Raast">Raast Instant</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Sender Phone / Account *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0300-1234567"
                  value={onlineDetails.senderAccount}
                  onChange={(e) =>
                    setOnlineDetails({ ...onlineDetails, senderAccount: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  TRX ID / Reference # *
                </label>
                <input
                  type="text"
                  placeholder="e.g. TRX-992140"
                  value={onlineDetails.trxId}
                  onChange={(e) =>
                    setOnlineDetails({ ...onlineDetails, trxId: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4.C Khata Pay Details */}
        {paymentMethod === 'khata' && (
          <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-900 text-xs">Khata / Credit Account</span>
              {activeCustomer && (
                <button
                  type="button"
                  onClick={() => handleDirectClearKhata(activeCustomer)}
                  className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                >
                  Finish &amp; Clear Khata
                </button>
              )}
            </div>

            {activeCustomer ? (
              <div className="space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span>Current Outstanding Khata:</span>
                  <span className="font-bold text-slate-900 tabular">
                    Rs. {(activeCustomer.khataBalance || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-purple-800 font-bold border-t border-purple-200/60 pt-1">
                  <span>New Khata Balance after this sale:</span>
                  <span className="tabular">
                    Rs. {((activeCustomer.khataBalance || 0) + netPayable).toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 text-[11px]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Please select a registered customer below to record this sale on their Khata.</span>
              </div>
            )}
          </div>
        )}

        {/* 4.D COD Banner */}
        {paymentMethod === 'cod' && (
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span>Doorstep Cash on Delivery (COD)</span>
            </div>
            <p className="text-[11px] text-slate-600">
              The assigned Delivery Rider (<strong>{customRiderName || activeRider.name}</strong>) will collect{' '}
              <strong className="text-slate-900">Rs. {netPayable.toLocaleString()}</strong> in cash directly from the customer at their doorstep.
            </p>
          </div>
        )}
      </div>

      {/* 5. Customer Account Link */}
      <div className="pt-2 border-t border-slate-100 space-y-1.5">
        <label className="block text-[10px] font-bold text-slate-500 uppercase">
          {paymentMethod === 'cod'
            ? 'Select or Link Registered Customer (Optional for COD):'
            : 'Customer Account Link (Optional for History / Loyalty):'}
        </label>
        <div className="relative">
          <select
            value={linkedCustomerId}
            onChange={(e) => setLinkedCustomerId(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500 pr-8 appearance-none"
          >
            <option value="">
              {fulfillmentMode === 'doorstep'
                ? '— Walk-in / Quick Doorstep Buyer —'
                : '— Walk-in Customer (Unlinked) —'}
            </option>
            {registeredCustomers.map((cust) => (
              <option key={cust.id} value={cust.id}>
                {cust.name} ({cust.phone}) — {cust.area || 'Model Town'} (Khata: Rs. {(cust.khataBalance || 0).toLocaleString()})
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {activeCustomer && (
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
            <span className="text-slate-600">
              Linked: <strong className="text-slate-800">{activeCustomer.name}</strong>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-amber-600 font-semibold tabular">
                Khata: Rs. {(activeCustomer.khataBalance || 0).toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => handleDirectClearKhata(activeCustomer)}
                className="text-[10px] font-bold text-purple-600 hover:text-purple-800 underline cursor-pointer"
              >
                Finish Khata
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Complete Sale Action Button */}
      <div className="pt-2">
        {cart.length === 0 ? (
          <button
            type="button"
            disabled
            className="w-full py-3 rounded-xl bg-slate-100 text-slate-400 font-semibold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
          >
            <CheckCircle2 className="w-4 h-4" />
            Add products to cart
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCompleteSale}
            className="w-full py-3 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete Sale - Rs. {netPayable.toLocaleString()} ({paymentLabels[paymentMethod]})
          </button>
        )}
      </div>
    </div>
  );
}
