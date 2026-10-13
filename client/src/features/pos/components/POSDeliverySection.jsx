import React from 'react';
import {
  MapPin,
  ChevronDown,
  Truck,
  Fuel,
  User,
  Phone,
  Zap,
} from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';
import FuelLogForm from '@/features/deliveries/components/FuelLogForm';

export default function POSDeliverySection() {
  const {
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
    paymentMethod = 'cod',
    setPaymentMethod,
    netPayable = 0,
    fuelLog,
    setFuelLog,
    updateFuelLog,
  } = usePOSContext();

  return (
    <div className="space-y-2.5 animate-in fade-in duration-150">
      {/* Header Badge */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-blue-50/90 rounded-xl border border-blue-200">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
          <span className="text-xs font-black text-blue-900 uppercase tracking-tight">
            ⚡ On-Time / Home Delivery
          </span>
        </div>
        <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200 shadow-2xs">
          Direct Run
        </span>
      </div>

      {/* ON-TIME DELIVERY FORM */}
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
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
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
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono shadow-2xs"
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
            className="w-full bg-white border border-rose-200 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none shadow-2xs"
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
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 pr-7 appearance-none shadow-2xs cursor-pointer"
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
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
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

      {/* PAYMENT METHOD: CLEAN SINGLE COD BUTTON */}
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
