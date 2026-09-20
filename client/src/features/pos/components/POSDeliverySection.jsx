import React from 'react';
import {
  MapPin,
  ChevronDown,
  Truck,
  Banknote,
  Smartphone,
  CreditCard,
} from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';

export default function POSDeliverySection() {
  const {
    deliverySubType = 'ontime',
    setDeliverySubType,
    riders = [],
    selectedRiderId,
    setSelectedRiderId,
    customRiderName,
    setCustomRiderName,
    dropAddress,
    setDropAddress,
    collectEmptyBottles,
    setCollectEmptyBottles,
    linkedCustomerId,
    setLinkedCustomerId,
    activeCustomer,
    registeredCustomers = [],
    paymentMethod = 'cod',
    setPaymentMethod,
  } = usePOSContext();

  return (
    <div className="space-y-2.5 animate-in fade-in duration-150">
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
              placeholder="Enter address"
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
  );
}
