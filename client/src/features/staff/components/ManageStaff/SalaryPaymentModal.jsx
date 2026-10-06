import React, { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  Calendar,
  CreditCard,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStaffPayrollContext } from '@/context/StaffPayrollContext';
import { useExpense } from '@/context/ExpenseContext';

export default function SalaryPaymentModal({ staff, isOpen, onClose, onSuccess }) {
  const { addExpense, fetchExpenses } = useExpense();
  const { recordSalaryPayment, getStaffAbsentDays, getStaffMonthlyAttendance, isStaffSalaryPaid } =
    useStaffPayrollContext();

  const isAlreadyPaid = staff && isStaffSalaryPaid ? isStaffSalaryPaid(staff.id || staff._id) : false;

  const monthlyBase = Number(staff?.monthlySalary || staff?.salary) || 0;
  const perDaySalary = Math.round(monthlyBase / 30);

  // Determine absent days from existing attendance state
  const absentDays = staff
    ? (getStaffAbsentDays
        ? getStaffAbsentDays(staff)
        : staff.attendanceMap
        ? Object.values(staff.attendanceMap).filter(
            (s) => String(s).trim().toLowerCase() === 'absent'
          ).length
        : Number(staff.absentDays) || 0)
    : 0;

  const totalDeduction = perDaySalary * absentDays;
  const initialCalculatedAmount = Math.max(0, monthlyBase - totalDeduction);

  const [payableAmount, setPayableAmount] = useState(String(initialCalculatedAmount));
  const [paymentDate, setPaymentDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentMonth, setPaymentMonth] = useState(() =>
    new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when staff changes
  useEffect(() => {
    if (staff) {
      const base = Number(staff.monthlySalary || staff.salary) || 0;
      const daily = Math.round(base / 30);
      const abs = getStaffAbsentDays ? getStaffAbsentDays(staff) : (Number(staff.absentDays) || 0);
      const ded = daily * abs;
      const net = Math.max(0, base - ded);
      setPayableAmount(String(net));
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [staff]);

  if (!isOpen || !staff) return null;

  const fmt = (n) => 'Rs. ' + Math.round(Number(n) || 0).toLocaleString();

  const handleConfirmPayment = async (e) => {
    e?.preventDefault();
    const finalAmt = Number(payableAmount);
    if (isAlreadyPaid) {
      toast.error('Salary has already been paid for this staff member for this month. Duplicate payments are not allowed.');
      return;
    }
    if (isNaN(finalAmt) || finalAmt < 0) {
      toast.error('Please enter a valid salary payment amount');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Record payment in database (creates SalaryPayment and Expense in MongoDB, updates Staff status to Paid)
      if (recordSalaryPayment) {
        await recordSalaryPayment({
          staffId: staff.id || staff._id,
          staffName: staff.name,
          role: staff.role || 'Farm Staff',
          paymentDate,
          absentDays,
          deduction: totalDeduction,
          amount: finalAmt,
          amountPaid: finalAmt,
          status: 'Paid',
          monthYear: paymentMonth,
          paymentMethod,
          notes,
        });
      }

      // 2. Refresh expenses from backend so Farm Expenses immediately shows the new salary expense
      if (fetchExpenses) {
        await fetchExpenses();
      }

      toast.success(
        `Rs. ${finalAmt.toLocaleString()} disbursed to ${staff.name}! Recorded in Database.`
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Salary payment error:', err);
      toast.error(err.message || 'Failed to process salary payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Disburse Staff Salary
              </h3>
              <p className="text-[11px] text-slate-500">
                Attendance deduction &amp; Farm Expense integration
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleConfirmPayment} className="p-5 space-y-4 text-xs">
          {/* Staff Info Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              {staff.image ? (
                <img
                  src={staff.image}
                  alt={staff.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm font-display">
                  {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
              <div>
                <h4 className="font-bold text-slate-900 text-sm leading-tight">
                  {staff.name}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-semibold text-slate-500">
                    {staff.role || 'Farm Staff'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {staff.shift || 'Morning'} Shift
                  </span>
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
              {staff.staffCode || (staff.id?.length === 24 ? `STF-${staff.id.slice(-4).toUpperCase()}` : staff.id)}
            </span>
          </div>

          {/* Attendance Deduction Calculation Box */}
          <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-purple-700" />
                Attendance Deduction Breakdown
              </span>
              <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                30-Day Base Formula
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-white border border-purple-100">
                <span className="text-slate-400 block text-[9.5px] uppercase font-bold">
                  Monthly Base Salary
                </span>
                <span className="font-black text-slate-900 font-mono text-xs">
                  {fmt(monthlyBase)}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-purple-100">
                <span className="text-slate-400 block text-[9.5px] uppercase font-bold">
                  Per Day Rate (1/30)
                </span>
                <span className="font-bold text-slate-700 font-mono text-xs">
                  {fmt(perDaySalary)}/d
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-purple-100">
                <span className="text-slate-400 block text-[9.5px] uppercase font-bold">
                  Absent Days Count
                </span>
                <span className={`font-black font-mono text-xs ${
                  absentDays > 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}>
                  {absentDays} {absentDays === 1 ? 'Day' : 'Days'}
                </span>
                <span className="text-[9px] text-slate-400 block leading-tight mt-0.5">
                  Present &amp; Leave: No deduction
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-purple-100">
                <span className="text-slate-400 block text-[9.5px] uppercase font-bold">
                  Total Absent Deduction
                </span>
                <span className="font-black text-rose-600 font-mono text-xs">
                  - {fmt(totalDeduction)}
                </span>
                <span className="text-[9px] text-slate-400 block leading-tight mt-0.5">
                  {absentDays}d × {fmt(perDaySalary)}
                </span>
              </div>
            </div>

            <div className="pt-1.5 border-t border-purple-200/70 flex items-center justify-between text-xs">
              <span className="font-bold text-purple-900">
                Formula Net Payable:
              </span>
              <span className="font-black font-mono text-purple-900 text-sm">
                {fmt(initialCalculatedAmount)}
              </span>
            </div>
          </div>

          {/* Payment Fields */}
          <div className="space-y-3 pt-1">
            {/* Final Payable Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Final Payable Amount (PKR) <span className="text-rose-500">*</span>
                </label>
                {payableAmount !== String(initialCalculatedAmount) && (
                  <button
                    type="button"
                    onClick={() => setPayableAmount(String(initialCalculatedAmount))}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    Reset to Calculated ({fmt(initialCalculatedAmount)})
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                  Rs.
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={payableAmount}
                  onChange={(e) => setPayableAmount(e.target.value)}
                  placeholder="Enter final payable amount"
                  className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-black text-slate-900 text-sm"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Amount calculated automatically from absent days, but freely editable if needed.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Payment Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full h-9.5 px-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium cursor-pointer text-xs"
                />
              </div>

              {/* Payment Period */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Salary Month <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={paymentMonth}
                  onChange={(e) => setPaymentMonth(e.target.value)}
                  placeholder="e.g. October 2026"
                  required
                  className="w-full h-9.5 px-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Payment Method */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-9.5 px-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold text-slate-800 text-xs"
                >
                  <option value="CASH">CASH</option>
                  <option value="ONLINE">ONLINE (JazzCash/Bank)</option>
                  <option value="CHEQUE">CHEQUE</option>
                </select>
              </div>

              {/* Reference Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Voucher Notes <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Salary paid"
                  className="w-full h-9.5 px-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium text-xs"
                />
              </div>
            </div>
          </div>

          {/* Farm Expense Confirmation Note or Already Paid Alert */}
          {isAlreadyPaid ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Salary Already Paid for this Month</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  A salary disbursement has already been recorded for <strong>{staff.name}</strong> this month. Staff can only be paid once per month.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>
                Confirming this payment will push <strong>{fmt(payableAmount)}</strong> into <strong>Farm Expenses</strong> and mark this month's salary as <strong>Paid</strong>.
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !payableAmount || isAlreadyPaid}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold transition shadow-xs cursor-pointer ${
                isAlreadyPaid
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                  : 'bg-purple-700 hover:bg-purple-800 active:scale-[0.98] text-white disabled:opacity-50'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              {isSubmitting ? 'Recording...' : isAlreadyPaid ? 'Already Paid' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
