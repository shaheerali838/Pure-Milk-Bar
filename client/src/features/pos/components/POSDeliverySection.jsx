import React from 'react';
import {
  MapPin,
  ChevronDown,
  Truck,
  Banknote,
  Smartphone,
  CreditCard,
  Fuel,
} from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';
import FuelLogForm from '@/features/deliveries/components/FuelLogForm';

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
    showFuelLog,
    setShowFuelLog,
    linkedCustomerId,
    setLinkedCustomerId,
    activeCustomer,
    registeredCustomers = [],
    paymentMethod = 'cod',
    setPaymentMethod,
    codPaymentOption = 'full',
    setCodPaymentOption,
    codPaidAmount = '',
    setCodPaidAmount,
    netPayable = 0,
    cashTendered,
    setCashTendered,
    onlineDetails,
    setOnlineDetails,
    fuelLog,
    setFuelLog,
    updateFuelLog,
  } = usePOSContext();

  const numCashTendered = Number(cashTendered) || 0;
  const changeDue = Math.max(0, numCashTendered - netPayable);

  const cashChips = [
    { label: 'Exact', value: netPayable },
    { label: 'Rs. 500', value: 500 },
    { label: 'Rs. 1,000', value: 1000 },
    { label: 'Rs. 2,000', value: 2000 },
    { label: 'Rs. 5,000', value: 5000 },
  ];

  // Calculate COD payment breakdown
  const codCalcPaid =
    codPaymentOption === 'full'
      ? netPayable
      : codPaymentOption === 'half'
      ? Math.round(netPayable / 2)
      : codPaymentOption === 'partial'
      ? Math.min(netPayable, Math.max(0, parseFloat(codPaidAmount) || 0))
      : 0;

  const codCalcRemaining = Math.max(0, netPayable - codCalcPaid);

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
              Select Customer (Optional - Link to Khata):
            </label>
            <div className="relative">
              <select
                value={linkedCustomerId}
                onChange={(e) => {
                  const cId = e.target.value;
                  setLinkedCustomerId(cId);
                  const found = registeredCustomers.find((c) => String(c.id) === String(cId));
                  if (found && found.address) {
                    setDropAddress(found.address + (found.area ? `, ${found.area}` : ''));
                  }
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 pr-7 appearance-none"
              >
                <option value="">— Walk-in / Guest Delivery (No Khata) —</option>
                {registeredCustomers.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.name} ({cust.phone}) — {cust.area || 'Model Town'} [Khata: Rs. {(cust.khataBalance || 0).toLocaleString()}]
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>

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
                  <option value="">— No Rider (Optional) —</option>
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
              Assigned Rider (Optional):
            </label>
            <div className="relative">
              <select
                value={selectedRiderId}
                onChange={(e) => setSelectedRiderId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 pr-7 appearance-none"
              >
                <option value="">— No Rider (Optional) —</option>
                {riders.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.vehicleType === 'Motorbike' ? '🛵' : '🚲'} {r.name} ({r.phone || 'No phone'}){r.active === false ? ' • [OFF DUTY]' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
            DELIVERY PAYMENT METHOD
          </span>
          <span className="text-[10px] font-bold text-slate-600 uppercase">
            {deliverySubType === 'ontime' ? '⚡ On-Time Options' : '📅 Monthly Options'}
          </span>
        </div>

        {/* Dynamic Payment Method Buttons:
            - On-Time Delivery: Shows COD, Cash, Online (Khata is HIDDEN)
            - Monthly Delivery: Shows Khata, COD, Online (Cash is HIDDEN)
        */}
        <div className="grid grid-cols-3 gap-1.5">
          {deliverySubType === 'monthly' && (
            <button
              type="button"
              onClick={() => setPaymentMethod('khata')}
              className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition cursor-pointer ${
                paymentMethod === 'khata'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-4 h-4 mb-0.5" />
              <span>Khata Credit</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setPaymentMethod('cod')}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition cursor-pointer ${
              paymentMethod === 'cod'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Truck className="w-4 h-4 mb-0.5" />
            <span>COD Delivery</span>
          </button>

          {deliverySubType === 'ontime' && (
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition cursor-pointer ${
                paymentMethod === 'cash'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Banknote className="w-4 h-4 mb-0.5" />
              <span>Cash Advance</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setPaymentMethod('online')}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition cursor-pointer ${
              paymentMethod === 'online'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-4 h-4 mb-0.5" />
            <span>Online Pay</span>
          </button>
        </div>

        {/* 1. COD Interactive Settlement Section (Full / Half / Partial / Khata) */}
        {paymentMethod === 'cod' && (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                COD Collection Mode (Doorstep Payment)
              </span>
              <span className="text-[10px] font-semibold text-blue-700">Choose collection plan</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setCodPaymentOption('full')}
                className={`py-2 px-1 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition cursor-pointer ${
                  codPaymentOption === 'full'
                    ? 'border-emerald-500 bg-emerald-600 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider">Full Payment</span>
                <span className="text-xs font-black font-mono">100%</span>
                <span className="text-[9px] opacity-80 mt-0.5">Rs. {netPayable.toLocaleString()}</span>
              </button>

              <button
                type="button"
                onClick={() => setCodPaymentOption('half')}
                className={`py-2 px-1 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition cursor-pointer ${
                  codPaymentOption === 'half'
                    ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider">Half (50%)</span>
                <span className="text-xs font-black font-mono">50%</span>
                <span className="text-[9px] opacity-80 mt-0.5">Rs. {Math.round(netPayable / 2).toLocaleString()}</span>
              </button>

              <button
                type="button"
                onClick={() => setCodPaymentOption('partial')}
                className={`py-2 px-1 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition cursor-pointer ${
                  codPaymentOption === 'partial'
                    ? 'border-indigo-500 bg-indigo-600 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider">Partial Pay</span>
                <span className="text-xs font-black font-mono">Custom</span>
                <span className="text-[9px] opacity-80 mt-0.5">Enter amount</span>
              </button>

              <button
                type="button"
                onClick={() => setCodPaymentOption('unpaid')}
                className={`py-2 px-1 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition cursor-pointer ${
                  codPaymentOption === 'unpaid'
                    ? 'border-purple-500 bg-purple-600 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider">On Khata</span>
                <span className="text-xs font-black font-mono">0%</span>
                <span className="text-[9px] opacity-80 mt-0.5">Rs. 0 (Collect Later)</span>
              </button>
            </div>

            {codPaymentOption === 'partial' && (
              <div className="p-2 bg-white rounded-lg border border-indigo-200 space-y-1">
                <label className="block text-[10px] font-bold text-indigo-900 uppercase">
                  Cash Amount to Collect on Delivery (Rs.):
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400">Rs.</span>
                  <input
                    type="number"
                    min="1"
                    max={netPayable}
                    value={codPaidAmount}
                    onChange={(e) => setCodPaidAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full pl-8 pr-2.5 py-1 bg-white border border-indigo-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 tabular"
                  />
                </div>
              </div>
            )}

            {/* COD Summary Badges */}
            <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Order</span>
                <span className="text-xs font-black text-slate-800 font-mono">Rs. {netPayable.toLocaleString()}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-emerald-200">
                <span className="text-[9px] uppercase font-bold text-emerald-600 block">Rider Collects</span>
                <span className="text-xs font-black text-emerald-700 font-mono">Rs. {codCalcPaid.toLocaleString()}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-rose-200">
                <span className="text-[9px] uppercase font-bold text-rose-600 block">Baqi / Khata Due</span>
                <span className="text-xs font-black text-rose-700 font-mono">Rs. {codCalcRemaining.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Cash Tendered Box */}
        {paymentMethod === 'cash' && (
          <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-emerald-900 block">Cash Received</span>
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
                  className="py-1 px-1 bg-white hover:bg-emerald-50 border border-emerald-200 rounded text-[10px] font-bold text-slate-700 transition cursor-pointer text-center tabular"
                >
                  {chip.label}
                </button>
              ))}
            </div>
            {changeDue > 0 && (
              <div className="p-1.5 bg-emerald-100/60 border border-emerald-200 rounded-lg flex justify-between items-center text-xs font-bold text-emerald-800">
                <span>Change Due:</span>
                <span className="tabular">Rs. {changeDue.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* 3. Online Payment Details */}
        {paymentMethod === 'online' && (
          <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-900 uppercase">Gateway</span>
              <select
                value={onlineDetails?.provider || 'JazzCash'}
                onChange={(e) =>
                  setOnlineDetails &&
                  setOnlineDetails({ ...(onlineDetails || {}), provider: e.target.value })
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
                value={onlineDetails?.senderAccount || ''}
                onChange={(e) =>
                  setOnlineDetails &&
                  setOnlineDetails({ ...(onlineDetails || {}), senderAccount: e.target.value })
                }
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
              />
              <input
                type="text"
                placeholder="TRX ID #"
                value={onlineDetails?.trxId || ''}
                onChange={(e) =>
                  setOnlineDetails &&
                  setOnlineDetails({ ...(onlineDetails || {}), trxId: e.target.value })
                }
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
