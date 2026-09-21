import React, { useState, useEffect } from 'react';
import {
  X,
  Wallet,
  Coins,
  Sun,
  Moon,
  Droplets,
  CheckCircle2,
  AlertCircle,
  ArrowDownRight,
  Receipt,
  User,
  Clock,
} from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSupplierContext } from '@/context/SupplierContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Modal for disbursing supplier intake payments
export default function PaySupplierModal({
  slip = null,
  supplier = null,
  onClose,
  onPaymentSuccess,
}) {
  const { intakeLogs = [], updateIntake } = useIntakeContext();
  const { suppliers = [], recordSupplierPayout } = useSupplierContext();

  // Find target slip & supplier
  const targetSlip = slip || (intakeLogs.find((l) => l.settlement !== 'Paid') || null);
  const matchedSupplier =
    supplier ||
    (targetSlip
      ? suppliers.find(
          (s) =>
            s.id === targetSlip.supplierId ||
            s.name === targetSlip.supplierName ||
            (targetSlip.supplierName && s.name && s.name.toLowerCase().includes(targetSlip.supplierName.toLowerCase()))
        )
      : suppliers[0]) ||
    null;

  const supplierName = targetSlip?.supplierName || matchedSupplier?.name || 'Selected Supplier';
  const supplierId = targetSlip?.supplierId || matchedSupplier?.id || '';
  const supplierTotalPending = matchedSupplier?.balanceDue || 0;

  const shift = targetSlip?.shift || 'Morning';
  const isMorning = shift.toLowerCase() === 'morning';
  const quantity = parseFloat(targetSlip?.quantity) || 0;
  const rate = parseFloat(targetSlip?.ratePerLiter) || 0;
  const totalCost = parseFloat(targetSlip?.totalCost) || (quantity * rate);

  const alreadyPaidOnSlip =
    targetSlip?.paidAmount !== undefined
      ? parseFloat(targetSlip.paidAmount) || 0
      : targetSlip?.settlement === 'Paid'
      ? totalCost
      : targetSlip?.settlement === 'Partial'
      ? totalCost * 0.5
      : 0;

  const slipPendingAmount =
    targetSlip?.pendingAmount !== undefined
      ? parseFloat(targetSlip.pendingAmount) || 0
      : Math.max(0, totalCost - alreadyPaidOnSlip);

  // Default payment amount is the slip's pending amount (or total supplier pending)
  const maxPayable = slipPendingAmount > 0 ? slipPendingAmount : supplierTotalPending;
  const [payAmount, setPayAmount] = useState(() => (maxPayable > 0 ? String(maxPayable) : '0'));
  const [paymentNote, setPaymentNote] = useState('');

  useEffect(() => {
    if (maxPayable > 0) {
      setPayAmount(String(maxPayable));
    }
  }, [maxPayable]);

  const numPay = Math.max(0, parseFloat(payAmount) || 0);
  const remainingSlipPending = Math.max(0, slipPendingAmount - numPay);
  const remainingSupplierTotal = Math.max(0, supplierTotalPending - numPay);

  // Quick button helpers
  const handleSelectFull = () => {
    setPayAmount(String(maxPayable));
  };

  const handleSelectHalf = () => {
    setPayAmount(String(Math.round(maxPayable / 2)));
  };

  const handleConfirmPayment = (e) => {
    e.preventDefault();
    if (numPay <= 0) {
      toast.error('Please enter a valid payment amount greater than 0');
      return;
    }

    // 1. If paying against a specific intake slip, update that slip
    if (targetSlip) {
      const newPaid = alreadyPaidOnSlip + numPay;
      const newPending = Math.max(0, totalCost - newPaid);
      const newSettlement = newPending <= 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Pending';

      updateIntake(targetSlip.id, {
        paidAmount: newPaid,
        pendingAmount: newPending,
        settlement: newSettlement,
      });
    }

    // 2. Record payout in SupplierContext to reduce supplier's pending balance
    if (matchedSupplier && recordSupplierPayout) {
      recordSupplierPayout(
        matchedSupplier.id,
        numPay,
        paymentNote || `Owner payout for ${shift} Shift slip (#${targetSlip?.id || 'Direct'})`,
        true
      );
    }

    toast.success(
      `Paid Rs. ${numPay.toLocaleString()} to ${supplierName}. Pending balance reduced!`
    );

    if (onPaymentSuccess) onPaymentSuccess();
    if (onClose) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Pay Supplier Delivery
              </h3>
              <p className="text-xs text-slate-500">
                Disburse cash or bank payment and decrease pending dues
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleConfirmPayment} className="p-6 space-y-4">
          {/* Supplier Name & Prior Total Pending Balance */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/60 via-emerald-100/30 to-white border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm shadow-xs">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Supplier Name
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {supplierName}{' '}
                  {supplierId && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-200/60 text-emerald-900 ml-1">
                      {supplierId}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Total Pending Due
              </span>
              <span className="text-base font-black text-amber-950 font-display tabular">
                Rs. {supplierTotalPending.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Shift Details (Which shift is pending, Liters, Rate, Total Amount) */}
          {targetSlip && (
            <div className="bg-white border border-slate-200/90 rounded-xl p-0 shadow-xs overflow-hidden mt-2 w-full">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between text-slate-800 font-bold text-xs font-display bg-slate-50">
                <div className="flex items-center gap-2">
                  {isMorning ? (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                  <span>
                    {shift} Shift (#{targetSlip.id})
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal">
                  Date: <strong className="text-slate-800">{targetSlip.date}</strong>
                </span>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="py-2 px-3 text-slate-500 font-bold uppercase text-[9px]">Delivered</th>
                    <th className="py-2 px-3 text-slate-500 font-bold uppercase text-[9px]">Rate</th>
                    <th className="py-2 px-3 text-slate-500 font-bold uppercase text-[9px]">Total Value</th>
                    <th className="py-2 px-3 text-amber-600 font-bold uppercase text-[9px] text-right">Current Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{quantity.toFixed(1)} L</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">Rs. {rate}/L</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">Rs. {totalCost.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-700 text-right">Rs. {slipPendingAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Quick Payment Selection: Full (100%) vs Half (50%) */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
              Quick Payment Selection
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSelectFull}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  numPay === maxPayable && maxPayable > 0
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pay Full (100%): Rs. {maxPayable.toLocaleString()}</span>
              </button>

              <button
                type="button"
                onClick={handleSelectHalf}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  numPay === Math.round(maxPayable / 2) && maxPayable > 0
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Pay Half (50%): Rs. {Math.round(maxPayable / 2).toLocaleString()}</span>
              </button>
            </div>
          </div>

          {/* Custom Paid Amount Input Field */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
              Enter Amount to Pay Now (Rs.) *
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
                className="w-full h-[46px] pl-13 pr-3.5 rounded-2xl border border-slate-200 text-lg font-black text-slate-900 outline-none focus:border-emerald-600 shadow-2xs tabular"
              />
            </div>
          </div>

          {/* Live Pending Decrease Ledger Calculation */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-2">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-slate-500" />
                <span>Settlement Summary</span>
              </span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-slate-100">
                <tr>
                  <th className="py-1.5 px-3 text-slate-500 font-semibold text-[10px]">Pending Before</th>
                  <th className="py-1.5 px-3 text-emerald-600 font-semibold text-[10px]">Paying Now</th>
                  <th className="py-1.5 px-3 text-amber-600 font-semibold text-[10px] text-right">Remaining Due</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">Rs. {slipPendingAmount.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">- Rs. {numPay.toLocaleString()}</td>
                  <td className={`py-2.5 px-3 font-mono font-bold text-right ${remainingSlipPending > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                    Rs. {remainingSlipPending.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-[40px] px-5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="h-[40px] px-6 rounded-full text-xs font-semibold text-white shadow-sm flex items-center gap-2 cursor-pointer hover:brightness-110"
              style={{ backgroundColor: '#009966' }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm &amp; Disburse Payment</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
