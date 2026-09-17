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
  X,
} from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSupplierContext } from '@/context/SupplierContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * PaySupplierForm Component
 * Full-Space Form component matching LogIntakeForm layout:
 * - Utilizes 100% full content area (right side of app sidebar)
 * - Header bar with Back button, Cancel button, and Confirm Payment button
 * - Shows Supplier Name, prior unpaid balance
 * - Shows Shift (Morning/Evening), delivered liters, rate, and total amount
 * - Quick buttons (Pay Full 100%, Pay Half 50%) and custom amount input
 * - Live pending balance decrease calculation
 */
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
        (activeSlip?.supplierName && s.name && s.name.toLowerCase().includes(activeSlip.supplierName.toLowerCase()))
    ) || suppliers[0] || null;

  const supplierName = activeSlip?.supplierName || matchedSupplier?.name || 'Selected Supplier';
  const supplierId = matchedSupplier?.id || activeSlip?.supplierId || '';
  const supplierTotalPending = matchedSupplier?.balanceDue || 0;

  // Shift & Delivery details
  const shift = activeSlip?.shift || 'Morning';
  const isMorning = shift.toLowerCase() === 'morning';
  const quantity = parseFloat(activeSlip?.quantity) || 0;
  const rate = parseFloat(activeSlip?.ratePerLiter) || 0;
  const totalCost = parseFloat(activeSlip?.totalCost) || (quantity * rate);

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

  const maxPayable = slipPendingAmount > 0 ? slipPendingAmount : supplierTotalPending;

  const [payAmount, setPayAmount] = useState(() => (maxPayable > 0 ? String(maxPayable) : '0'));
  const [notes, setNotes] = useState('');

  // Prepopulate payAmount only when active slip or supplier changes
  useEffect(() => {
    if (activeSlip) {
      const q = parseFloat(activeSlip.quantity) || 0;
      const r = parseFloat(activeSlip.ratePerLiter) || 0;
      const cost = parseFloat(activeSlip.totalCost) || (q * r);
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

  const numPay = Math.max(0, parseFloat(payAmount) || 0);
  const remainingSlipPending = Math.max(0, slipPendingAmount - numPay);
  const remainingSupplierTotal = Math.max(0, supplierTotalPending - numPay);

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

    // 1. If paying against a specific intake slip, update that slip with exact partial or full settlement
    if (activeSlip) {
      const newPaid = Math.min(totalCost, parseFloat((alreadyPaidOnSlip + numPay).toFixed(2)));
      const newPending = Math.max(0, parseFloat((totalCost - newPaid).toFixed(2)));
      const newSettlement = newPending <= 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Pending';

      updateIntake(activeSlip.id, {
        paidAmount: newPaid,
        pendingAmount: newPending,
        settlement: newSettlement,
      });
    } else if (matchedSupplier && recordSupplierPayout) {
      // 2. Direct supplier advance payout without a specific intake slip
      recordSupplierPayout(
        matchedSupplier.id,
        numPay,
        notes || `Owner advance payment to ${supplierName}`
      );
    }

    toast.success(
      `Disbursed Rs. ${numPay.toLocaleString()} to ${supplierName}. Pending balance decreased!`
    );

    if (onPaymentSuccess) onPaymentSuccess();
    if (onCancel) onCancel();
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-150 no-scrollbar">
      {/* Top action & header bar */}
      <div className="flex items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Intake Register
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight font-display leading-tight">
              Pay Supplier Milk Delivery
            </h1>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Disbursement Mode
        </span>
      </div>

      {/* Main form container */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs no-scrollbar">
        <form id="pay-supplier-form" onSubmit={handleConfirmPayment} className="space-y-4 w-full">
          {/* Card A: Supplier & Pending Slip Selection */}
          <div className="space-y-4 w-full">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-slate-800 font-bold text-sm font-display">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Supplier &amp; Pending Shift Selection</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Supplier Ledger Pending:</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
                Rs. {supplierTotalPending.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Select Pending Slip (8 cols) */}
            <div className="md:col-span-8">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Pending Milk Intake Slip *
              </label>
              {pendingSlips.length === 0 ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>All milk intake slips are currently paid in full! You can still record direct supplier advance payouts.</span>
                </div>
              ) : (
                <select
                  value={selectedSlipId}
                  onChange={(e) => setSelectedSlipId(e.target.value)}
                  className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white outline-none focus:border-emerald-600 shadow-2xs cursor-pointer"
                >
                  {pendingSlips.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.id} • {s.supplierName} • {s.date} ({s.shift} Shift) • {s.quantity} L • Total: Rs. {s.totalCost.toLocaleString()} • Due: Rs. {(s.pendingAmount !== undefined ? s.pendingAmount : s.totalCost).toLocaleString()}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Select Supplier (4 cols) */}
            <div className="md:col-span-4">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Target Supplier *
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white outline-none focus:border-emerald-600 shadow-2xs cursor-pointer"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id}) • Balance: Rs. {(s.balanceDue || 0).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card B: Shift Details & Pending Breakdown */}
        {activeSlip && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4 w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-slate-800 font-bold text-sm font-display">
              <div className="flex items-center gap-2">
                {isMorning ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-500" />
                )}
                <span>
                  {shift} Shift Intake Details (#{activeSlip.id})
                </span>
              </div>
              <span className="text-xs text-slate-500 font-normal">
                Intake Date: <strong className="text-slate-800">{activeSlip.date}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivered Liters</span>
                <span className="text-base font-black text-slate-800 tabular">{quantity.toFixed(1)} L</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Procurement Rate</span>
                <span className="text-base font-bold text-slate-800 tabular">Rs. {rate}/L</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Delivery Value</span>
                <span className="text-base font-black text-slate-900 tabular">Rs. {totalCost.toLocaleString()}</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Current Slip Due</span>
                <span className="text-base font-black text-amber-900 tabular">Rs. {slipPendingAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Card C: Payment Controls & Live Pending Decrease Calculation */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4 w-full">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-slate-800 font-bold text-sm font-display">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>Owner Payment Settlement</span>
            </div>
            <span className="text-xs text-emerald-700 font-semibold">
              Live Pending Balance Adjustment
            </span>
          </div>

          {/* Quick Buttons Grid */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
              Quick Payment Options
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSelectFull}
                className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  numPay === maxPayable && maxPayable > 0
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-400/40'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Pay Full (100%): Rs. {maxPayable.toLocaleString()}</span>
              </button>

              <button
                type="button"
                onClick={handleSelectHalf}
                className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  numPay === Math.round(maxPayable / 2) && maxPayable > 0
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-400/40'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>Pay Half (50%): Rs. {Math.round(maxPayable / 2).toLocaleString()}</span>
              </button>
            </div>
          </div>

          {/* Custom Paid Amount Input & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Amount Paid to Supplier Now (Rs.) *
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
                  placeholder="e.g. 5000"
                  className="w-full h-[46px] pl-13 pr-3.5 rounded-xl border border-slate-200 text-lg font-black text-slate-900 outline-none focus:border-emerald-600 shadow-2xs tabular"
                />
              </div>
            </div>

            <div className="md:col-span-6">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Payment Remarks / Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Paid in cash at morning gate / Online transfer"
                className="w-full h-[46px] px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Live Pending Decrease Ledger Calculation Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 via-slate-100/50 to-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-slate-500" />
                <span>Live Pending Decrease Ledger</span>
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                Instant Context Sync
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Before</span>
                <span className="text-sm font-black text-slate-800 font-mono">Rs. {slipPendingAmount.toLocaleString()}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Paying Now</span>
                <span className="text-sm font-black text-emerald-700 font-mono">- Rs. {numPay.toLocaleString()}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Remaining Pending</span>
                <span className={`text-sm font-black font-mono ${remainingSlipPending > 0 ? 'text-amber-900' : 'text-emerald-700'}`}>
                  Rs. {remainingSlipPending.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirm &amp; Disburse Payment
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}

