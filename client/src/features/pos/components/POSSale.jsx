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
  Users,
  UserCheck,
  Calendar,
  Phone,
  User,
  Wallet,
} from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    handleUpdatePrice,
    handleRemoveFromCart,
    handleClearCart,

    // 3 Primary Categories: 'walkin' | 'delivery' | 'customer'
    saleCategory = 'walkin',
    setSaleCategory,

    // Walk-in Customer Info
    walkinName = '',
    setWalkinName,
    walkinPhone = '',
    setWalkinPhone,

    // Delivery Sub-types: 'ontime' | 'monthly'
    deliverySubType = 'ontime',
    setDeliverySubType,

    // Customer Mode Khata Options: 'khata' | 'cash' | 'partial'
    khataPaymentOption = 'khata',
    setKhataPaymentOption,
    partialPaidAmount = '',
    setPartialPaidAmount,
    orderNotes = '',
    setOrderNotes,

    // Delivery Riders & Details
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

  const currentKhataBal = Number(activeCustomer?.khataBalance || 0);
  const projectedCustomerBalance =
    khataPaymentOption === 'khata'
      ? currentKhataBal + netPayable
      : khataPaymentOption === 'cash'
      ? currentKhataBal
      : currentKhataBal + Math.max(0, netPayable - (parseFloat(partialPaidAmount) || 0));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3.5">
      {/* 1. Header of Sale Cart */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-display">Sale Cart</h2>
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

      {/* 2. Empty State or Cart Items */}
      {cart.length === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center space-y-2">
          <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-700">Sale Cart is Empty</p>
          <p className="text-[11px] text-slate-400 max-w-[220px]">
            Tap any dairy product on the left to add it to this active sale.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Item rows */}
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
                  {/* Stepper */}
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

                  {/* Total line item */}
                  <div className="text-right min-w-[55px]">
                    <span className="text-xs font-black text-slate-900 tabular">
                      Rs. {(item.quantity * item.price).toLocaleString()}
                    </span>
                  </div>

                  {/* Remove */}
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

          {/* Pricing summary */}
          <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
            <div className="flex justify-between items-center text-[11px]">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800 tabular">
                Rs. {cartSubtotal.toLocaleString()}
              </span>
            </div>

            {/* Delivery Charges (when Delivery Mode is active) */}
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

            {/* Discount */}
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

            {/* NET PAYABLE */}
            <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-slate-200 text-xs font-black text-slate-900">
              <span className="uppercase tracking-wide font-display text-[11px]">NET PAYABLE</span>
              <span className="text-sm font-black text-emerald-700 tabular">
                Rs. {netPayable.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Primary Sale Category Selector (3 Buttons) */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
            ORDER TYPE
          </span>
          <span className="text-[10px] font-semibold text-slate-500">
            {saleCategory === 'walkin'
              ? 'Walk-in Counter'
              : saleCategory === 'delivery'
              ? 'Home Delivery'
              : 'Monthly Subscribed'}
          </span>
        </div>

        {/* 3 Buttons: Walk-in, Delivery, Customer */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
          {/* Button 1: Walkin */}
          <button
            type="button"
            onClick={() => setSaleCategory('walkin')}
            className={`py-2 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
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
            className={`py-2 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              saleCategory === 'delivery'
                ? 'bg-[#2563eb] text-white shadow-xs'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Delivery</span>
          </button>

          {/* Button 3: Customer (Monthly Subscribed Khata Buy) */}
          <button
            type="button"
            onClick={() => setSaleCategory('customer')}
            className={`py-2 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
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

      {/* 4. MODE SPECIFIC VIEWS */}

      {/* ========================================================================= */}
      {/* MODE 1: WALKIN CUSTOMER */}
      {/* ========================================================================= */}
      {saleCategory === 'walkin' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Walk-in Customer Details (Optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <input
                  type="text"
                  placeholder="Customer Name (Optional)"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Phone Number (Optional)"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 tabular"
                />
              </div>
            </div>
          </div>

          {/* Payment Method (Cash vs Online for Walk-in) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              <span>PAYMENT METHOD</span>
              <span className="text-slate-600 capitalize">{paymentMethod}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-[#009966] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Cash Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  paymentMethod === 'online'
                    ? 'bg-[#2563eb] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Online (EasyPaisa/JazzCash)</span>
              </button>
            </div>

            {/* Cash Tendered */}
            {paymentMethod === 'cash' && (
              <div className="space-y-1.5 pt-1">
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 tabular"
                  />
                </div>

                <div className="grid grid-cols-5 gap-1">
                  {cashChips.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => setCashTendered(String(chip.value))}
                      className="py-1 px-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-700 transition cursor-pointer text-center tabular"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {changeDue > 0 && (
                  <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg flex justify-between items-center text-xs font-bold text-emerald-800">
                    <span>Change Due:</span>
                    <span className="tabular">Rs. {changeDue.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Online Details */}
            {paymentMethod === 'online' && (
              <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-900 uppercase">Gateway</span>
                  <select
                    value={onlineDetails.provider}
                    onChange={(e) =>
                      setOnlineDetails({ ...onlineDetails, provider: e.target.value })
                    }
                    className="bg-white border border-blue-200 rounded px-2 py-0.5 text-xs font-bold text-blue-800"
                  >
                    <option value="JazzCash">JazzCash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="Raast">Raast Instant</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Sender Mobile #"
                    value={onlineDetails.senderAccount}
                    onChange={(e) =>
                      setOnlineDetails({ ...onlineDetails, senderAccount: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="TRX ID #"
                    value={onlineDetails.trxId}
                    onChange={(e) =>
                      setOnlineDetails({ ...onlineDetails, trxId: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: DELIVERY (ON-TIME vs MONTHLY) */}
      {/* ========================================================================= */}
      {saleCategory === 'delivery' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          {/* Sub-toggle: On-Time vs Monthly */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-blue-50/80 rounded-xl border border-blue-100">
            <button
              type="button"
              onClick={() => setDeliverySubType('ontime')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                deliverySubType === 'ontime'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-900 hover:bg-white/60'
              }`}
            >
              <span>⚡ On-Time Delivery</span>
            </button>

            <button
              type="button"
              onClick={() => setDeliverySubType('monthly')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                deliverySubType === 'monthly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-900 hover:bg-white/60'
              }`}
            >
              <span>📅 Monthly Delivery</span>
            </button>
          </div>

          {/* 2A: On-Time Delivery Details */}
          {deliverySubType === 'ontime' && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Delivery Rider / Boy (Optional):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <select
                      value={selectedRiderId}
                      onChange={(e) => setSelectedRiderId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 pr-7 appearance-none"
                    >
                      {riders.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.vehicleType === 'Motorbike' ? '🛵' : '🚲'} {r.name} ({r.phone})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                  </div>
                  <input
                    type="text"
                    placeholder="Or custom rider / delivery boy..."
                    value={customRiderName}
                    onChange={(e) => setCustomRiderName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  Drop Address &amp; Customer Note:
                </label>
                <input
                  type="text"
                  placeholder="e.g. House 14-B, Street 3 (Near Main Park)"
                  value={dropAddress}
                  onChange={(e) => setDropAddress(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={collectEmptyBottles}
                    onChange={(e) => setCollectEmptyBottles(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Collect empty bottles upon delivery</span>
                </label>
              </div>
            </div>
          )}

          {/* 2B: Monthly Delivery Details (Select Registered Customer) */}
          {deliverySubType === 'monthly' && (
            <div className="p-2.5 bg-blue-50/40 rounded-xl border border-blue-200/80 space-y-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                  Select Registered Monthly Customer:
                </label>
                <div className="relative">
                  <select
                    value={linkedCustomerId}
                    onChange={(e) => setLinkedCustomerId(e.target.value)}
                    className="w-full bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 pr-7 appearance-none"
                  >
                    <option value="">— Choose Registered Customer —</option>
                    {registeredCustomers.map((cust) => (
                      <option key={cust.id} value={cust.id}>
                        {cust.name} ({cust.phone}) — {cust.area || 'Model Town'} [Khata: Rs. {(cust.khataBalance || 0).toLocaleString()}]
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                </div>
              </div>

              {activeCustomer && (
                <div className="p-2 bg-white rounded-lg border border-blue-100 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{activeCustomer.name}</span>
                    <span className="text-amber-600 tabular text-[11px]">
                      Khata Due: Rs. {(activeCustomer.khataBalance || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    <span>{activeCustomer.phone} · {activeCustomer.area || 'Model Town'}</span>
                    {activeCustomer.shift && <span> · Shift: {activeCustomer.shift}</span>}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Assigned Rider:
                </label>
                <select
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.vehicleType === 'Motorbike' ? '🛵' : '🚲'} {r.name} ({r.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Delivery Payment Methods */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              DELIVERY PAYMENT METHOD
            </span>
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`py-1.5 px-1 rounded-lg text-xs font-bold flex flex-col items-center justify-center transition cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-3.5 h-3.5 mb-0.5" />
                <span>COD</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-1.5 px-1 rounded-lg text-xs font-bold flex flex-col items-center justify-center transition cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-3.5 h-3.5 mb-0.5" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`py-1.5 px-1 rounded-lg text-xs font-bold flex flex-col items-center justify-center transition cursor-pointer ${
                  paymentMethod === 'online'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 mb-0.5" />
                <span>Online</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('khata')}
                className={`py-1.5 px-1 rounded-lg text-xs font-bold flex flex-col items-center justify-center transition cursor-pointer ${
                  paymentMethod === 'khata'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 mb-0.5" />
                <span>Khata</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: CUSTOMER (MONTHLY SUBSCRIPTION & KHATA BUY LOGIC) */}
      {/* ========================================================================= */}
      {saleCategory === 'customer' && (
        <div className="space-y-3 animate-in fade-in duration-150 text-xs">
          {/* Registered Customer Picker */}
          <div>
            <label className="block text-[10px] font-bold text-purple-900 uppercase mb-1">
              Select Monthly Subscribed Customer:
            </label>
            <div className="relative">
              <select
                value={linkedCustomerId}
                onChange={(e) => setLinkedCustomerId(e.target.value)}
                className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500 pr-8 appearance-none"
              >
                <option value="">— Choose Customer Account —</option>
                {registeredCustomers.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.name} ({cust.phone}) — {cust.area || 'Model Town'} (Khata: Rs. {(cust.khataBalance || 0).toLocaleString()})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {activeCustomer ? (
            <div className="space-y-2.5">
              {/* 3 Metric Highlight Cards (From CustomerKhataLedger BuyProductView) */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-center">
                  <span className="text-[9px] font-bold text-rose-700 uppercase block">Current Due</span>
                  <div className="text-xs font-black text-rose-800 tabular mt-0.5">
                    Rs. {currentKhataBal.toLocaleString()}
                  </div>
                </div>

                <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <span className="text-[9px] font-bold text-blue-700 uppercase block">This Sale</span>
                  <div className="text-xs font-black text-blue-800 tabular mt-0.5">
                    Rs. {netPayable.toLocaleString()}
                  </div>
                </div>

                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                  <span className="text-[9px] font-bold text-emerald-700 uppercase block">New Balance</span>
                  <div className="text-xs font-black text-emerald-800 tabular mt-0.5">
                    Rs. {projectedCustomerBalance.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Settlement Options: Khata vs Cash vs Partial */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Khata &amp; Payment Settlement
                </span>

                <div className="grid grid-cols-3 gap-1.5">
                  <label
                    className={`flex flex-col p-2 rounded-xl border cursor-pointer transition-all ${
                      khataPaymentOption === 'khata'
                        ? 'border-purple-500 bg-purple-50/60 text-purple-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="khataPaymentOption"
                        value="khata"
                        checked={khataPaymentOption === 'khata'}
                        onChange={() => setKhataPaymentOption('khata')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs">Charge Khata</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-normal mt-0.5">Full on ledger</span>
                  </label>

                  <label
                    className={`flex flex-col p-2 rounded-xl border cursor-pointer transition-all ${
                      khataPaymentOption === 'cash'
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="khataPaymentOption"
                        value="cash"
                        checked={khataPaymentOption === 'cash'}
                        onChange={() => setKhataPaymentOption('cash')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs">Paid in Cash</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-normal mt-0.5">Immediate full pay</span>
                  </label>

                  <label
                    className={`flex flex-col p-2 rounded-xl border cursor-pointer transition-all ${
                      khataPaymentOption === 'partial'
                        ? 'border-amber-500 bg-amber-50/60 text-amber-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="khataPaymentOption"
                        value="partial"
                        checked={khataPaymentOption === 'partial'}
                        onChange={() => setKhataPaymentOption('partial')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-xs">Partial Pay</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-normal mt-0.5">Part cash, part khata</span>
                  </label>
                </div>

                {/* Partial Amount Input */}
                {khataPaymentOption === 'partial' && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                    <label className="block text-[10px] font-bold text-amber-900 uppercase">
                      Cash Paid Now (Rs.):
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={netPayable}
                      value={partialPaidAmount}
                      onChange={(e) => setPartialPaidAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 tabular"
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <input
                    type="text"
                    placeholder="Order Memo / Subscription Note (Optional)..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Please select a registered customer above to apply monthly subscription &amp; Khata buy logic.</span>
            </div>
          )}
        </div>
      )}

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
