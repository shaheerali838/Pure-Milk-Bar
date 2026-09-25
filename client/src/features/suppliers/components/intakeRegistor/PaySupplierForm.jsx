import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Wallet,
  Coins,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  Receipt,
  User,
  Calendar,
  Clock,
  Droplets,
  Building2,
  Tag,
  BadgeCheck,
} from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSupplierContext } from '@/context/SupplierContext';
import { toast } from 'sonner';

// Supplier milk delivery payment disbursement form
export default function PaySupplierForm({ slip = null, onCancel, onPaymentSuccess }) {
  const { intakeLogs = [], updateIntake } = useIntakeContext();
  const { suppliers = [], recordSupplierPayout } = useSupplierContext();

  // Pending slips available for settlement
  const pendingSlips = intakeLogs.filter((l) => l.settlement !== 'Paid');

  // Selected slip state
  const [selectedSlipId, setSelectedSlipId] = useState(() => {
    if (slip?.id) return slip.id;
    return pendingSlips[0]?.id || '';
  });

  const activeSlip =
    pendingSlips.find((l) => l.id === selectedSlipId) ||
    (slip?.id ? slip : pendingSlips[0]) ||
    null;

  // Selected or matched supplier
  const [selectedSupplierId, setSelectedSupplierId] = useState(() => {
    if (activeSlip?.supplierId) return activeSlip.supplierId;
    return suppliers[0]?.id || '';
  });

  useEffect(() => {
    if (activeSlip?.supplierId) {
      setSelectedSupplierId(activeSlip.supplierId);
    }
  }, [activeSlip]);

  const matchedSupplier =
    suppliers.find(
      (s) =>
        s.id === selectedSupplierId ||
        s.id === activeSlip?.supplierId ||
        (activeSlip?.supplierName &&
          s.name &&
          s.name.toLowerCase().includes(activeSlip.supplierName.toLowerCase()))
    ) || suppliers[0] || null;

  const supplierName =
    activeSlip?.supplierName || matchedSupplier?.name || 'Selected Supplier';
  const supplierId = matchedSupplier?.id || activeSlip?.supplierId || '';
  const supplierTotalPending = matchedSupplier?.balanceDue || 0;

  // Shift & Delivery details
  const shift = activeSlip?.shift || 'Morning';
  const isMorning = shift.toLowerCase() === 'morning';
  const quantity = parseFloat(activeSlip?.quantity) || 0;
  const rate = parseFloat(activeSlip?.ratePerLiter) || 0;
  const totalCost = parseFloat(activeSlip?.totalCost) || quantity * rate;

  const alreadyPaidOnSlip =
    activeSlip?.paidAmount !== undefined
      ? parseFloat(activeSlip.paidAmount) || 0
      : activeSlip?.settlement === 'Paid'
      ? totalCost
      : activeSlip?.settlement === 'Partial'
      ? totalCost * 0.5
      : 0;

  const slipPendingAmount =
    activeSlip?.pendingAmount !== undefined
      ? parseFloat(activeSlip.pendingAmount) || 0
      : Math.max(0, totalCost - alreadyPaidOnSlip);

  const maxPayable =
    slipPendingAmount > 0 ? slipPendingAmount : supplierTotalPending;

  const [payAmount, setPayAmount] = useState(() =>
    maxPayable > 0 ? String(maxPayable) : '0'
  );
  const [notes, setNotes] = useState('');

  // Prepopulate payAmount only when active slip or supplier changes
  useEffect(() => {
    if (activeSlip) {
      const q = parseFloat(activeSlip.quantity) || 0;
      const r = parseFloat(activeSlip.ratePerLiter) || 0;
      const cost = parseFloat(activeSlip.totalCost) || q * r;
      const paid =
        activeSlip.paidAmount !== undefined
          ? parseFloat(activeSlip.paidAmount) || 0
          : activeSlip.settlement === 'Paid'
          ? cost
          : activeSlip.settlement === 'Partial'
          ? cost * 0.5
          : 0;
      const pending =
        activeSlip.pendingAmount !== undefined
          ? parseFloat(activeSlip.pendingAmount) || 0
          : Math.max(0, cost - paid);
      setPayAmount(String(pending > 0 ? pending : 0));
    } else if (matchedSupplier) {
      setPayAmount(String(matchedSupplier.balanceDue || 0));
    }
  }, [selectedSlipId, selectedSupplierId]);

  const numPay = Math.min(maxPayable, Math.max(0, parseFloat(payAmount) || 0));
  const remainingSlipPending = Math.max(0, slipPendingAmount - numPay);
  const isFullSettlement = numPay >= slipPendingAmount && slipPendingAmount > 0;

  const handleSelectFull = () => {
    setPayAmount(String(maxPayable > 0 ? maxPayable : 0));
  };

  const handleSelectHalf = () => {
    const half = Math.round(maxPayable / 2);
    setPayAmount(String(half > 0 ? half : 0));
  };

  const handleConfirmPayment = (e) => {
    e?.preventDefault();
    if (numPay <= 0) {
      toast.error('Please enter a valid payment amount greater than 0');
      return;
    }

    // 1. If paying against an active slip, update that slip
    if (activeSlip) {
      const newPaid = Math.min(
        totalCost,
        parseFloat((alreadyPaidOnSlip + numPay).toFixed(2))
      );
      const newPending = Math.max(
        0,
        parseFloat((totalCost - newPaid).toFixed(2))
      );
      const newSettlement =
        newPending <= 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Pending';

      updateIntake(activeSlip.id, {
        paidAmount: newPaid,
        pendingAmount: newPending,
        settlement: newSettlement,
      });

    } else if (matchedSupplier && recordSupplierPayout) {
      // Direct supplier advance payout
      recordSupplierPayout({
        supplierId: matchedSupplier.id,
        amount: numPay,
        method: 'Cash',
        notes: notes || `Advance payment to ${supplierName}`,
      });
    }

    toast.success(
      `Disbursed Rs. ${numPay.toLocaleString()} to ${supplierName}. Pending balance updated!`
    );

    if (onPaymentSuccess) onPaymentSuccess();
    if (onCancel) onCancel();
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150 pb-8">
      {/* Top action & header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Intake Register
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
              Pay Supplier Milk Delivery
            </h1>
            <p className="text-xs text-slate-500">
              Disburse payment against milk intake slips &amp; update supplier ledger
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Disbursement Mode
        </span>
      </div>

      {/* Main 2-Column Structured Layout */}
      <form onSubmit={handleConfirmPayment}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Delivery & Supplier Information (7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Card 1: Selection Controls */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm font-display">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Select Pending Intake Slip &amp; Supplier</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span>Total Ledger Due:</span>
                  <span className="px-2 py-0.5 rounded-md font-bold font-mono bg-amber-50 text-amber-800 border border-amber-200">
                    Rs. {supplierTotalPending.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Pending Slip */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                    Select Milk Intake Slip *
                  </label>
                  {pendingSlips.length === 0 ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>
                        All milk intake slips are currently settled! You can still record direct supplier advance payouts.
                      </span>
                    </div>
                  ) : (
                    <select
                      value={selectedSlipId}
                      onChange={(e) => setSelectedSlipId(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white outline-none focus:border-emerald-600 shadow-2xs cursor-pointer"
                    >
                      {pendingSlips.map((s) => (
                        <option key={s.id} value={s.id}>
                          #{s.id} • {s.supplierName} • {s.date} ({s.shift} Shift) • {s.quantity} L • Total: Rs. {s.totalCost.toLocaleString()} • Due: Rs. {(s.pendingAmount !== undefined ? s.pendingAmount : s.totalCost).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Target Supplier Selection */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                    Target Supplier
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white outline-none focus:border-emerald-600 shadow-2xs cursor-pointer"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id}) • Balance Due: Rs. {(s.balanceDue || 0).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Card 2: Active Delivery Slip Voucher Details */}
            {activeSlip && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                {/* Voucher Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-2xs ${
                        isMorning
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {isMorning ? (
                        <Sun className="w-4 h-4" />
                      ) : (
                        <Moon className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-display">
                        {shift} Shift Intake Slip (#{activeSlip.id})
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Date: <strong className="text-slate-700">{activeSlip.date}</strong> • Supplier: <strong className="text-slate-700">{supplierName}</strong>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      activeSlip.settlement === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : activeSlip.settlement === 'Partial'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {activeSlip.settlement || 'Pending'}
                  </span>
                </div>

                {/* 4 Metric Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Delivered
                    </span>
                    <p className="text-sm font-black text-slate-900 font-mono mt-0.5">
                      {quantity.toFixed(1)} L
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Agreed Rate
                    </span>
                    <p className="text-sm font-black text-emerald-700 font-mono mt-0.5">
                      Rs. {rate}/L
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total Cost
                    </span>
                    <p className="text-sm font-black text-slate-900 font-mono mt-0.5">
                      Rs. {totalCost.toLocaleString()}
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                      Current Slip Due
                    </span>
                    <p className="text-sm font-black text-amber-900 font-mono mt-0.5">
                      Rs. {slipPendingAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Quality & Supervisor Bar */}
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-3">
                    <span>
                      Fat: <strong className="text-slate-800">{activeSlip.fat || '4.5'}%</strong>
                    </span>
                    <span>•</span>
                    <span>
                      LR: <strong className="text-slate-800">{activeSlip.lr || '28'}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      SNF: <strong className="text-slate-800">{activeSlip.snf || '8.5'}%</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Received By: {activeSlip.receivedBy || 'Shift Supervisor'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Payment Controls & Settlement Breakdown (5 Columns) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm font-display">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span>Disburse Payment</span>
                </div>
                <span className="text-xs text-emerald-700 font-bold">
                  Cash / Direct
                </span>
              </div>

              {/* Quick 100% / 50% Selectors */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Quick Amount Selection
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleSelectFull}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      numPay === maxPayable && maxPayable > 0
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-400/30'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pay Full: Rs. {maxPayable.toLocaleString()}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSelectHalf}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      numPay === Math.round(maxPayable / 2) && maxPayable > 0
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-400/30'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Pay Half: Rs. {Math.round(maxPayable / 2).toLocaleString()}</span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Amount to Disburse (Rs.) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    PKR
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full h-11 pl-13 pr-3.5 rounded-xl border border-slate-200 text-base font-black text-slate-900 bg-white outline-none focus:border-emerald-600 shadow-2xs font-mono"
                  />
                </div>
              </div>

              {/* Payment Remarks */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Payment Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter payment details"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white outline-none focus:border-emerald-600 shadow-2xs"
                />
              </div>

              {/* Real-Time Settlement Ledger Card */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 text-slate-700 font-sans font-bold">
                  <span className="flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-slate-500" />
                    <span>Settlement Summary</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold ${
                      isFullSettlement
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isFullSettlement ? 'Full Clearance' : 'Partial Payment'}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Current Slip Due:</span>
                  <span>Rs. {slipPendingAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Amount Paying Now:</span>
                  <span>- Rs. {numPay.toLocaleString()}</span>
                </div>

                <div className="border-t border-slate-200/80 pt-2 flex justify-between font-bold">
                  <span className="text-slate-800">Remaining Slip Due:</span>
                  <span
                    className={
                      remainingSlipPending > 0
                        ? 'text-amber-700 font-black'
                        : 'text-emerald-700 font-black'
                    }
                  >
                    Rs. {remainingSlipPending.toLocaleString()}
                    {remainingSlipPending === 0 && ' (Cleared!)'}
                  </span>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-95"
                  style={{ backgroundColor: '#009966' }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm &amp; Disburse Payment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
