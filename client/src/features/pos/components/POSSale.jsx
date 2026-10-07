import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ShoppingCart,
  Trash2,
  CheckCircle2,
  Users,
  UserCheck,
  Calendar,
  Phone,
  User,
  Wallet,
  Truck,
  Plus,
  Minus,
  X,
  AlertCircle,
  Banknote,
  Smartphone,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { PKRIcon } from "@/components/common/PKRIcon";
import { usePOSContext } from "@/context/POSContext";
import { getProductIcon } from "@/features/inventory/components/AddProduct";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import POSDeliverySection from "./POSDeliverySection";

export default function POSSale() {
  const [searchParams] = useSearchParams();
  const [isProcessingSale, setIsProcessingSale] = React.useState(false);

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
    handleUpdateItemSource,
    executeKhataPayment,

    // 2 Primary Categories: 'walkin' | 'delivery'
    saleCategory = "walkin",
    setSaleCategory,

    // Walk-in Customer Type: 'first_time' | 'registered'
    walkinCustomerType = "first_time",
    setWalkinCustomerType,

    // Walk-in Customer Info
    walkinName = "",
    setWalkinName,
    walkinPhone = "",
    setWalkinPhone,

    // Delivery Sub-types: 'ontime' | 'monthly'
    deliverySubType = "ontime",
    setDeliverySubType,

    // Customer Mode Khata Options: 'khata' | 'cash' | 'partial'
    khataPaymentOption = "khata",
    setKhataPaymentOption,
    partialPaidAmount = "",
    setPartialPaidAmount,
    orderNotes = "",
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
    paymentMethod = "cash",
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
    isSaleRefreshing = false,
    inventoryMetrics = {},
    products = [],
  } = usePOSContext() || {};

  const getProductDisplayStock = (prodId) => {
    const prod = products.find(p => p.id === prodId) || {};
    const name = (prod.name || '').toLowerCase();
    const cat = (prod.category || '').toLowerCase();
    const isCow = name.includes('cow');
    const isBuff = name.includes('buffalo');

    if (cat.includes('dahi') || name.includes('dahi')) {
      const liveDahi = Number(inventoryMetrics?.totalDahiStock);
      if (!isNaN(liveDahi) && liveDahi >= 0) return liveDahi;
      return Number(prod.stock) || 0;
    }

    if (cat.includes('milk') || name.includes('milk')) {
      if (isCow) {
        // Strictly Farm Cow Milk only! Supplier doodh isme add nahi hoga.
        const farmCow = Number(inventoryMetrics?.farmCowMilkStock) || 0;
        return farmCow;
      }
      if (isBuff) {
        // Combined Buffalo Milk Card: Farm Buffalo + Supplier Buffalo
        const farmBuff = Number(inventoryMetrics?.farmBuffaloMilkStock) || 0;
        const supBuff = Number(inventoryMetrics?.supplierBuffaloMilkStock) || 0;
        return farmBuff + supBuff;
      }
      const liveTot = Number(inventoryMetrics?.totalMilkStock);
      if (!isNaN(liveTot) && liveTot >= 0) return liveTot;
      return Number(prod.stock) || 0;
    }

    return Number(prod.stock) || 0;
  };

  // Sync category & customer info from URL search params (e.g. /pos?category=walkin&customerId=... or /pos?category=delivery)
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam === "delivery") {
      setSaleCategory("delivery");
      const subType = searchParams.get("subType");
      if (subType === "monthly" || subType === "ontime") {
        setDeliverySubType(subType);
      }
    } else if (categoryParam === "walkin") {
      setSaleCategory("walkin");
      const customerId = searchParams.get("customerId");
      const name = searchParams.get("name") || searchParams.get("customerName");
      const phone = searchParams.get("phone");
      const type = searchParams.get("type");

      if (customerId) {
        if (setLinkedCustomerId) setLinkedCustomerId(customerId);
        if (setWalkinCustomerType) setWalkinCustomerType("registered");
      } else if (name || phone) {
        if (type === "registered") {
          if (setWalkinCustomerType) setWalkinCustomerType("registered");
        } else {
          if (setWalkinCustomerType) setWalkinCustomerType("first_time");
        }
        if (name && setWalkinName) setWalkinName(name);
        if (phone && setWalkinPhone) setWalkinPhone(phone);
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

  const handleDirectClearKhata = (cust) => {
    const target = cust || activeCustomer;
    if (!target) return;
    const balance = target.khataBalance || 0;
    if (balance <= 0) {
      toast.info(`Customer ${target.name} has no outstanding khata debt.`);
      return;
    }
    if (
      window.confirm(
        `Clear and finish full khata debt of Rs. ${balance.toLocaleString()} for ${target.name}?`,
      )
    ) {
      executeKhataPayment({
        customerId: target.id,
        amountPaid: balance,
        paymentMethod: "Cash",
        notes: "Full Khata finished and cleared at POS register",
      });
      toast.success(`Khata for ${target.name} has been settled and finished.`);
    }
  };

  const numCashTendered = Number(cashTendered) || 0;
  const changeDue = Math.max(0, numCashTendered - netPayable);

  const cashChips = [
    { label: "Exact", value: netPayable },
    { label: "Rs. 500", value: 500 },
    { label: "Rs. 1,000", value: 1000 },
    { label: "Rs. 2,000", value: 2000 },
    { label: "Rs. 5,000", value: 5000 },
  ];

  const currentKhataBal = Number(activeCustomer?.khataBalance || 0);
  const projectedCustomerBalance =
    khataPaymentOption === "khata"
      ? currentKhataBal + netPayable
      : khataPaymentOption === "cash"
        ? currentKhataBal
        : currentKhataBal +
          Math.max(0, netPayable - (parseFloat(partialPaidAmount) || 0));

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 min-h-0 overflow-hidden">
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
            disabled={isProcessingSale || isSaleRefreshing}
            onClick={handleClearCart}
            className="text-xs font-semibold text-rose-500 hover:text-rose-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Scrollable Checkout Content */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3.5 pr-1 py-2">
        {cart.length === 0 ? (
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
        ) : (
          <div className="space-y-2">
            <div className="space-y-2 pr-0.5">
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
                  className="p-2 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {getProductIcon(item.name, { size: 14, withBadge: true })}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 leading-tight truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Rs. {rate.toLocaleString()}/{unitLabel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900 tabular">
                          Rs. {lineTotal.toLocaleString()}
                        </div>
                        <div className="text-[9.5px] font-bold text-emerald-600 tabular">
                          {getFriendlyLabel(qty)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-md transition p-1 cursor-pointer"
                        title="Delete item from cart"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">QTY ({unitLabel}):</span>
                    <div className="flex items-center border border-slate-200 bg-white rounded-lg shadow-2xs">
                      <button
                        type="button"
                        onClick={() => {
                          const step = qty <= 1 ? 0.25 : 0.5;
                          handleUpdateQuantity(item.id, Math.max(0, Number((qty - step).toFixed(2))));
                        }}
                        className="px-2 py-0.5 text-slate-500 hover:text-slate-800 transition text-xs font-bold cursor-pointer"
                        title="Reduce quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        value={qty === 0 ? '0' : qty}
                        onChange={(e) => {
                          const maxStock = getProductDisplayStock(item.id);
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val > maxStock) {
                             toast.error(`Cannot sell more than available stock (${maxStock} ${unitLabel})`);
                             handleUpdateQuantity(item.id, maxStock);
                          } else {
                             handleUpdateQuantity(item.id, e.target.value);
                          }
                        }}
                        className="w-12 text-center text-xs font-bold text-slate-800 outline-none tabular py-0.5"
                        title="Type quantity in liters/kg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const step = qty < 1 ? 0.25 : 0.5;
                          const newQty = Number((qty + step).toFixed(2));
                          const maxStock = getProductDisplayStock(item.id);
                          if (newQty > maxStock) {
                             toast.error(`Cannot sell more than available stock (${maxStock} ${unitLabel})`);
                             handleUpdateQuantity(item.id, maxStock);
                          } else {
                             handleUpdateQuantity(item.id, newQty);
                          }
                        }}
                        className="px-2 py-0.5 text-slate-500 hover:text-slate-800 transition text-xs font-bold cursor-pointer"
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

          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600 bg-slate-50/50 p-2 rounded-xl border border-slate-200/60">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-medium text-slate-600">Subtotal</span>
              <span className="font-bold text-slate-900 tabular">
                Rs. {cartSubtotal.toLocaleString()}
              </span>
            </div>

            {saleCategory === "delivery" && (
              <div className="flex justify-between items-center text-blue-700 text-[11px]">
                <span className="flex items-center gap-1 font-medium">
                  <Truck className="w-3 h-3" /> Delivery Fee
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-blue-900">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                    className="w-14 text-right bg-white border border-blue-200 rounded px-1.5 py-0.5 font-bold text-xs text-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-400 tabular"
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-600 text-[11px]">
              <span className="flex items-center gap-1 font-medium">
                <PKRIcon className="w-3 h-3 text-slate-400" /> Discount
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-600">Rs.</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-14 text-right bg-white border border-slate-200 rounded px-1.5 py-0.5 font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 tabular"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-slate-200 text-xs font-black text-slate-900">
              <span className="uppercase tracking-wide font-display text-[11px] text-slate-700">
                NET PAYABLE
              </span>
              <span className="text-sm font-black text-emerald-700 tabular">
                Rs. {netPayable.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="pt-2 border-t border-slate-100 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
            ORDER TYPE
          </span>
        </div>

        <div className="grid grid-cols-2 p-0.5 bg-slate-100 rounded-lg border border-slate-200/60">
          <button
            type="button"
            onClick={() => setSaleCategory("walkin")}
            className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              saleCategory === "walkin"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Walk-in Counter</span>
          </button>

          <button
            type="button"
            onClick={() => setSaleCategory("delivery")}
            className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              saleCategory === "delivery"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Home Delivery</span>
          </button>
        </div>
      </div>


      {saleCategory === "walkin" && (
        <div className="space-y-2 animate-in fade-in duration-150">
          <div className="grid grid-cols-2 p-0.5 bg-slate-100 rounded-lg border border-slate-200/60">
            <button
              type="button"
              onClick={() => setWalkinCustomerType("first_time")}
              className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                walkinCustomerType === "first_time"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>First-Time / Regular</span>
            </button>

            <button
              type="button"
              onClick={() => setWalkinCustomerType("registered")}
              className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                walkinCustomerType === "registered"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Monthly Subscribed</span>
            </button>
          </div>

          {walkinCustomerType === "first_time" && (
            <div className="space-y-2">
              <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Walk-in Customer Details (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div>
                    <input
                      type="text"
                      placeholder="Customer Name (Optional)"
                      value={walkinName}
                      onChange={(e) => setWalkinName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Phone Number (Optional)"
                      value={walkinPhone}
                      onChange={(e) => setWalkinPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 tabular"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  <span>PAYMENT METHOD</span>
                </div>

                <div className="grid grid-cols-2 p-0.5 bg-slate-100 rounded-lg border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      paymentMethod === "cash"
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Cash Payment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("online")}
                    className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      paymentMethod === "online"
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Online (EasyPaisa/Jazz)</span>
                  </button>
                </div>

                {paymentMethod === "cash" && (
                  <div className="space-y-1.5 pt-1">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400">
                        Rs.
                      </span>
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
                        <span className="tabular">
                          Rs. {changeDue.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === "online" && (
                  <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-900 uppercase">
                        Gateway
                      </span>
                      <select
                        value={onlineDetails.provider}
                        onChange={(e) =>
                          setOnlineDetails({
                            ...onlineDetails,
                            provider: e.target.value,
                          })
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
                          setOnlineDetails({
                            ...onlineDetails,
                            senderAccount: e.target.value,
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="TRX ID #"
                        value={onlineDetails.trxId}
                        onChange={(e) =>
                          setOnlineDetails({
                            ...onlineDetails,
                            trxId: e.target.value,
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {walkinCustomerType === "registered" && (
            <div className="space-y-3 animate-in fade-in duration-150 text-xs">
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
                        {cust.name} ({cust.phone}) — {cust.area || "Model Town"}{" "}
                        (Khata: Rs. {(cust.khataBalance || 0).toLocaleString()})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {activeCustomer ? (
                <div className="space-y-2.5">
                  <div className="p-2 bg-purple-50/50 rounded-lg border border-purple-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">
                        {activeCustomer.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {activeCustomer.phone} ·{" "}
                        {activeCustomer.area || "Model Town"}
                      </span>
                    </div>
                    {activeCustomer.khataBalance > 0 && (
                      <button
                        type="button"
                        onClick={() => handleDirectClearKhata(activeCustomer)}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-800 bg-white border border-rose-200 rounded px-2 py-0.5 shadow-2xs transition cursor-pointer"
                      >
                        Clear Due
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-center">
                      <span className="text-[9px] font-bold text-rose-700 uppercase block">
                        Current Due
                      </span>
                      <div className="text-xs font-black text-rose-800 tabular mt-0.5">
                        Rs. {currentKhataBal.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-center">
                      <span className="text-[9px] font-bold text-blue-700 uppercase block">
                        This Sale
                      </span>
                      <div className="text-xs font-black text-blue-800 tabular mt-0.5">
                        Rs. {netPayable.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                      <span className="text-[9px] font-bold text-emerald-700 uppercase block">
                        New Balance
                      </span>
                      <div className="text-xs font-black text-emerald-800 tabular mt-0.5">
                        Rs. {projectedCustomerBalance.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Khata &amp; Payment Settlement
                    </span>

                    <div className="grid grid-cols-3 gap-1.5">
                      <label
                        className={`flex flex-col p-2 rounded-xl border cursor-pointer transition-all ${
                          khataPaymentOption === "khata"
                            ? "border-purple-500 bg-purple-50/60 text-purple-900 font-bold"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <input
                            type="radio"
                            name="khataPaymentOption"
                            value="khata"
                            checked={khataPaymentOption === "khata"}
                            onChange={() => setKhataPaymentOption("khata")}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-xs">Charge Khata</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-normal mt-0.5">
                          Full on ledger
                        </span>
                      </label>

                      <label
                        className={`flex flex-col p-2 rounded-xl border cursor-pointer transition-all ${
                          khataPaymentOption === "cash"
                            ? "border-emerald-500 bg-emerald-50/60 text-emerald-900 font-bold"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <input
                            type="radio"
                            name="khataPaymentOption"
                            value="cash"
                            checked={khataPaymentOption === "cash"}
                            onChange={() => setKhataPaymentOption("cash")}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-xs">Paid in Cash</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-normal mt-0.5">
                          Immediate full pay
                        </span>
                      </label>

                      <label
                        className={`flex flex-col p-2 rounded-xl border cursor-pointer transition-all ${
                          khataPaymentOption === "partial"
                            ? "border-amber-500 bg-amber-50/60 text-amber-900 font-bold"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <input
                            type="radio"
                            name="khataPaymentOption"
                            value="partial"
                            checked={khataPaymentOption === "partial"}
                            onChange={() => setKhataPaymentOption("partial")}
                            className="text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-xs">Partial Pay</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-normal mt-0.5">
                          Part cash, part khata
                        </span>
                      </label>
                    </div>

                    {khataPaymentOption === "partial" && (
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
                          placeholder="Enter value"
                          className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 tabular"
                        />
                      </div>
                    )}

                    {khataPaymentOption === "cash" && (
                      <div className="space-y-1.5 pt-1">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400">
                            Rs.
                          </span>
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
                              onClick={() =>
                                setCashTendered(String(chip.value))
                              }
                              className="py-1 px-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-700 transition cursor-pointer text-center tabular"
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>

                        {changeDue > 0 && (
                          <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg flex justify-between items-center text-xs font-bold text-emerald-800">
                            <span>Change Due:</span>
                            <span className="tabular">
                              Rs. {changeDue.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

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
                <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl flex items-center gap-2 text-purple-900 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-purple-600" />
                  <span>
                    Please select a registered customer above to link their
                    account and apply Khata/subscription rules.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {saleCategory === "delivery" && <POSDeliverySection />}
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
        ) : (
          <button
            type="button"
            disabled={isProcessingSale || isSaleRefreshing}
            onClick={async () => {
              if (isProcessingSale || isSaleRefreshing || cart.length === 0) return;
              setIsProcessingSale(true);
              try {
                const result = await handleCompleteSale();
                if (result) {
                  toast.success('Sale completed successfully!');
                }
              } catch (err) {
                console.error(err);
                toast.error('Failed to complete sale. Please try again.');
              } finally {
                setIsProcessingSale(false);
              }
            }}
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

