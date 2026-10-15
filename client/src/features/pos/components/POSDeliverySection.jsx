import React from 'react';
import { usePOSContext } from '@/context/POSContext';
import FuelLogForm from '@/features/deliveries/components/FuelLogForm';
import POSRiderSelect from './POSRiderSelect';

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
    <div className="space-y-3 animate-in fade-in duration-150 text-xs">
      {/* Customer Name & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Customer Name (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Ali Khan"
            value={ontimeCustomerName}
            onChange={(e) => setOntimeCustomerName && setOntimeCustomerName(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Phone Number (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. 0300-1234567"
            value={ontimeCustomerPhone}
            onChange={(e) => setOntimeCustomerPhone && setOntimeCustomerPhone(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Delivery Area / Address */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
          Delivery Area / Address <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="e.g. House # 12, Street 4, Sector B..."
          value={ontimeDeliveryArea}
          onChange={(e) => setOntimeDeliveryArea && setOntimeDeliveryArea(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Rider Selection & Custom Rider */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
          Delivery Rider (Optional)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <POSRiderSelect
            value={selectedRiderId}
            onChange={setSelectedRiderId}
            riders={riders}
          />
          <input
            type="text"
            placeholder="Or custom rider name..."
            value={customRiderName}
            onChange={(e) => setCustomRiderName(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Fuel Log Toggle */}
      <div className="pt-0.5">
        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none hover:text-emerald-700 transition">
          <input
            type="checkbox"
            checked={showFuelLog}
            onChange={(e) => {
              setShowFuelLog(e.target.checked);
              if (!e.target.checked && setFuelLog) {
                setFuelLog({ liters: '', amount: '', distanceKm: '', notes: '' });
              }
            }}
            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <span>Record Fuel Log (Optional)</span>
        </label>
      </div>

      {showFuelLog && (
        <div className="pt-1 animate-in fade-in duration-150">
          <FuelLogForm compact values={fuelLog} onChange={updateFuelLog} />
        </div>
      )}

      {/* Payment Method */}
      <div className="pt-1 space-y-1.5">
        <label className="block text-[11px] font-semibold text-slate-700">
          Payment Method
        </label>
        <button
          type="button"
          onClick={() => setPaymentMethod && setPaymentMethod('cod')}
          className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer bg-slate-900 text-white"
        >
          <span>Cash on Delivery (COD)</span>
          <span className="font-mono font-bold">
            Rs. {netPayable.toLocaleString()}
          </span>
        </button>
      </div>
    </div>
  );
}
