import React from 'react';
import {
  MapPin,
  ChevronDown,
  Truck,
  Fuel,
  User,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';
import FuelLogForm from '@/features/deliveries/components/FuelLogForm';

export default function POSDeliverySection() {
  const {
    deliverySubType = 'ontime',
    setDeliverySubType,
    ontimeCustomerName = '',
    setOntimeCustomerName,
    ontimeCustomerPhone = '',
    setOntimeCustomerPhone,
    ontimeDeliveryArea = '',
    setOntimeDeliveryArea,
    riders = [],
    selectedRiderId,
    setSelectedRiderId,
    customRiderName,
    setCustomRiderName,
    showFuelLog,
    setShowFuelLog,
    linkedCustomerId,
    setLinkedCustomerId,
    activeCustomer,
    registeredCustomers = [],
    paymentMethod = 'cod',
    setPaymentMethod,
    netPayable = 0,
    fuelLog,
    setFuelLog,
    updateFuelLog,
  } = usePOSContext();

  return (
    <div className="space-y-2.5 animate-in fade-in duration-150">
      {/* Delivery Mode Tabs: On-Time vs Monthly */}
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

      {/* 1. ON-TIME DELIVERY FORM (Random / Calling Customer) */}
      {deliverySubType === 'ontime' && (
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          {/* Customer Name & Phone (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-blue-600" />
                Customer Name (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Ali Khan"
                value={ontimeCustomerName}
                onChange={(e) => setOntimeCustomerName && setOntimeCustomerName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-600" />
                Phone Number (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. 0300-1234567"
                value={ontimeCustomerPhone}
                onChange={(e) => setOntimeCustomerPhone && setOntimeCustomerPhone(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Delivery Area / Address (Mandatory / Required *) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Delivery Area / Address <span className="text-rose-500 font-black">* (Required)</span>:</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. House # 12, Street 4, Sector B, Model Town..."
              value={ontimeDeliveryArea}
              onChange={(e) => setOntimeDeliveryArea && setOntimeDeliveryArea(e.target.value)}
              className="w-full bg-white border border-rose-200 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
            />
          </div>

          {/* Rider Selection & Custom Rider */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
              <Truck className="w-3 h-3 text-blue-600" />
              Delivery Rider / Boy (Optional):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <select
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 pr-7 appearance-none"
                >
                  <option value="">— Choose Assigned Rider —</option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.vehicleType === 'Motorbike' ? '🛵' : '🚲'} {r.name} ({r.phone || 'No phone'}){r.active === false ? ' • [OFF DUTY]' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>
              <input
                type="text"
                placeholder="Or custom rider name..."
                value={customRiderName}
                onChange={(e) => setCustomRiderName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Fuel Log Toggle */}
          <div className="pt-0.5">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none hover:text-blue-700 transition">
              <input
                type="checkbox"
                checked={showFuelLog}
                onChange={(e) => {
                  setShowFuelLog(e.target.checked);
                  if (!e.target.checked && setFuelLog) {
                    setFuelLog({ liters: '', amount: '', distanceKm: '', notes: '' });
                  }
                }}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-amber-600" />
                <span>Fuel Log (Optional)</span>
                <span className="text-[10px] font-normal text-slate-400">(Record vehicle fuel / distance)</span>
              </span>
            </label>
          </div>

          {showFuelLog && (
            <div className="p-2.5 bg-white rounded-lg border border-slate-200/90 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <Fuel className="w-3 h-3 text-amber-600" />
                  Fuel Log Details
                </span>
                <span className="text-[10px] text-slate-400">Record vehicle expense</span>
              </div>
              <FuelLogForm compact values={fuelLog} onChange={updateFuelLog} />
            </div>
          )}
        </div>
      )}

      {/* 2. MONTHLY DELIVERY FORM (Registered Customer) */}
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
                    {cust.name} ({cust.phone}) — {cust.area || 'Model Town'} [Khata: Rs. {(cust.khataBalance || 0).toLocaleString()}]{cust.deliveryFee ? ` [Delivery: Rs. ${cust.deliveryFee}]` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>

          {activeCustomer && (
            <div className="p-2 bg-white rounded-lg border border-blue-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>{activeCustomer.name}</span>
                <div className="flex items-center gap-2">
                  {Number(activeCustomer.deliveryFee) > 0 && (
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                      +Rs. {activeCustomer.deliveryFee} Delivery
                    </span>
                  )}
                  <span className="text-amber-600 tabular text-[11px]">
                    Khata Due: Rs. {(activeCustomer.khataBalance || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {Number(activeCustomer.creditLimit || 0) > 0 && Number(activeCustomer.khataBalance || 0) >= Number(activeCustomer.creditLimit) && (
                <div className="p-1.5 bg-rose-50 border border-rose-300 rounded-md text-[10px] text-rose-800 font-bold flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>⚠️ Credit Limit Exceeded! (Limit: PKR {Number(activeCustomer.creditLimit).toLocaleString()})</span>
                </div>
              )}

              <div className="text-[10px] text-slate-500">
                <span>{activeCustomer.phone} · {activeCustomer.area || 'Model Town'}</span>
                {activeCustomer.shift && <span> · Shift: {activeCustomer.shift}</span>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
              <Truck className="w-3 h-3 text-blue-600" />
              Assigned Rider (Optional):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <select
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 pr-7 appearance-none"
                >
                  <option value="">— Choose Assigned Rider —</option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.vehicleType === 'Motorbike' ? '🛵' : '🚲'} {r.name} ({r.phone || 'No phone'}){r.active === false ? ' • [OFF DUTY]' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>
              <input
                type="text"
                placeholder="Or custom rider name..."
                value={customRiderName}
                onChange={(e) => setCustomRiderName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-0.5">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-blue-900 select-none hover:text-blue-700 transition">
              <input
                type="checkbox"
                checked={showFuelLog}
                onChange={(e) => {
                  setShowFuelLog(e.target.checked);
                  if (!e.target.checked && setFuelLog) {
                    setFuelLog({ liters: '', amount: '', distanceKm: '', notes: '' });
                  }
                }}
                className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-amber-600" />
                <span>Fuel Log (Optional)</span>
                <span className="text-[10px] font-normal text-slate-500">(Record vehicle fuel / distance)</span>
              </span>
            </label>
          </div>

          {showFuelLog && (
            <div className="p-2.5 bg-white rounded-lg border border-blue-100 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-blue-900 tracking-wider flex items-center gap-1">
                  <Fuel className="w-3 h-3 text-amber-600" />
                  Fuel Log Details
                </span>
                {activeCustomer?.area && (
                  <span className="text-[10px] text-slate-500">
                    Estimated distance based on {activeCustomer.area} — adjust if needed
                  </span>
                )}
              </div>
              <FuelLogForm compact values={fuelLog} onChange={updateFuelLog} />
            </div>
          )}
        </div>
      )}

      {/* 3. PAYMENT METHOD: CLEAN SINGLE COD BUTTON */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
            DELIVERY PAYMENT METHOD
          </span>
          <span className="text-[10px] font-semibold text-blue-600">
            Doorstep Collection
          </span>
        </div>

        <button
          type="button"
          onClick={() => setPaymentMethod && setPaymentMethod('cod')}
          className="w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer bg-blue-600 text-white shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>Cash on Delivery (COD)</span>
          </div>
          <span className="font-mono font-black text-sm">
            Rs. {netPayable.toLocaleString()}
          </span>
        </button>
      </div>
    </div>
  );
}
