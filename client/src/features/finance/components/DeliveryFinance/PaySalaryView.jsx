import React, { useState } from 'react';
import { ArrowLeft, Banknote, Calendar, CreditCard, User, CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp, Info, CalendarDays, Percent } from 'lucide-react';
import { useRiderSalaryContext } from '@/context/RiderSalaryContext';
import { useStaffPayrollContext } from '@/context/StaffPayrollContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PaySalaryView({
  staff,
  baseSalary = 25000,
  remainingBalance = 25000,
  record,
  selectedMonth = '2026-10',
  onBack,
  onComplete,
}) {
  const { recordSalaryPayment } = useRiderSalaryContext();
  let staffPayrollCtx = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    staffPayrollCtx = useStaffPayrollContext();
  } catch (_) {}

  const [base, setBase] = useState(String(baseSalary || 25000));
  const [showAbsentBreakdown, setShowAbsentBreakdown] = useState(false);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [error, setError] = useState('');

  if (!staff) return null;

  // Compute monthly attendance dynamics
  const monthlyAttendance = staffPayrollCtx?.getStaffMonthlyAttendance
    ? staffPayrollCtx.getStaffMonthlyAttendance(staff.id, selectedMonth)
    : null;

  const daysInMonth = monthlyAttendance?.daysInMonth || 30;
  const presentCount = monthlyAttendance ? monthlyAttendance.presentCount : Math.max(0, 30 - (Number(staff.absentDays) || 0));
  const absentCount = monthlyAttendance ? monthlyAttendance.absentCount : (Number(staff.absentDays) || 0);
  const leaveCount = monthlyAttendance ? monthlyAttendance.leaveCount : 0;

  const baseNum = Number(base) || 25000;
  const dailyRate = Math.round(baseNum / daysInMonth);
  const attendanceDeduction = absentCount * dailyRate;
  const netEarnedSalary = Math.max(0, baseNum - attendanceDeduction);

  const pastPayments = record?.payments || [];
  const totalPaidSoFar = record ? Number(record.paidAmount) || 0 : 0;
  const netRemainingDue = Math.max(0, netEarnedSalary - totalPaidSoFar);

  const [amountPaid, setAmountPaid] = useState(
    netRemainingDue > 0 ? String(netRemainingDue) : String(Math.max(0, baseNum - totalPaidSoFar))
  );
  const [notes, setNotes] = useState(
    absentCount > 0
      ? `Salary payout for ${selectedMonth} (${presentCount} Present, ${absentCount} Absents - Rs. ${attendanceDeduction.toLocaleString()} deducted)`
      : `Full salary payout for ${selectedMonth} (Full attendance)`
  );

  const absentDaysList = monthlyAttendance?.days
    ? monthlyAttendance.days.filter((d) => d.status === 'absent' || d.status === 'leave')
    : [];

  const handlePreset = (fraction) => {
    const target = Math.round(netEarnedSalary * fraction);
    const amountToSet = Math.max(0, Math.min(netRemainingDue, target));
    setAmountPaid(String(amountToSet));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payNum = Number(amountPaid);
    if (!payNum || payNum <= 0) {
      setError('Please enter a valid salary amount to pay.');
      return;
    }

    recordSalaryPayment({
      staffId: staff.id,
      staffName: staff.name,
      month: selectedMonth,
      baseSalary: baseNum,
      amountPaid: payNum,
      paymentMode,
      notes: notes.trim() || `Salary payment for ${selectedMonth} (${absentCount} Absents deducted)`,
    });

    if (onComplete) {
      onComplete();
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-150 pb-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-7.5 w-7.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Back to Payroll"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight font-display leading-none">
              Pay Salary &bull; {staff.name}
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Payroll period: {selectedMonth} &bull; {staff.type === 'RIDER' ? 'Delivery Rider' : 'Walking Staff'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Staff Overview Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-300 border border-purple-800/60 flex items-center justify-center text-lg font-bold font-display">
            {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
              Staff Member
            </span>
            <h3 className="text-base font-bold font-display">{staff.name}</h3>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Phone: {staff.phone || 'N/A'} &bull; Route: {staff.route || 'General'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-right">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Base Monthly
            </span>
            <p className="text-base font-black font-display text-white tabular leading-tight">
              Rs. {baseNum.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
              Absent Cut
            </span>
            <p className="text-base font-black font-display text-rose-400 tabular leading-tight">
              - Rs. {attendanceDeduction.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
              Net Earned
            </span>
            <p className="text-base font-black font-display text-blue-400 tabular leading-tight">
              Rs. {netEarnedSalary.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Paid So Far
            </span>
            <p className="text-base font-black font-display text-emerald-400 tabular leading-tight">
              Rs. {totalPaidSoFar.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Net Due Now
            </span>
            <p className="text-base font-black font-display text-amber-400 tabular leading-tight">
              Rs. {netRemainingDue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Attendance & Salary Deduction Explainer Card */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 shadow-2xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/70 pb-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-blue-950 font-display">
              Monthly Attendance &amp; Per-Day Wage Calculation ({selectedMonth})
            </h4>
          </div>

          {absentCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAbsentBreakdown(!showAbsentBreakdown)}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{showAbsentBreakdown ? 'Hide Absent Dates' : 'Why is salary cut? (View Dates)'}</span>
              {showAbsentBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-white p-2 rounded-lg border border-blue-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Present Days</span>
            <span className="text-sm font-black text-emerald-700 font-mono tabular">
              {presentCount} / {daysInMonth} Days
            </span>
          </div>

          <div className="bg-white p-2 rounded-lg border border-blue-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Absent Days</span>
            <span className={`text-sm font-black font-mono tabular ${absentCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
              {absentCount} {absentCount === 1 ? 'Day' : 'Days'}
            </span>
          </div>

          <div className="bg-white p-2 rounded-lg border border-blue-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Daily Wage Rate</span>
            <span className="text-sm font-black text-slate-800 font-mono tabular">
              Rs. {dailyRate} / day
            </span>
            <span className="text-[9px] text-slate-400 block">(Rs. {baseNum} ÷ {daysInMonth})</span>
          </div>

          <div className="bg-white p-2 rounded-lg border border-blue-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Attendance Deduction</span>
            <span className="text-sm font-black text-rose-600 font-mono tabular">
              - Rs. {attendanceDeduction.toLocaleString()}
            </span>
            <span className="text-[9px] text-slate-400 block">({absentCount} × Rs. {dailyRate})</span>
          </div>
        </div>

        {/* Detailed Itemized Absent Dates Drawer */}
        {showAbsentBreakdown && absentDaysList.length > 0 && (
          <div className="bg-white p-2.5 rounded-lg border border-rose-200 mt-2 space-y-1.5 animate-in fade-in duration-150">
            <span className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              Itemized Absents &amp; Leaves for {staff.name} ({selectedMonth}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 pt-1">
              {absentDaysList.map((d, i) => (
                <div
                  key={i}
                  className="bg-rose-50/70 border border-rose-200/80 px-2 py-1 rounded text-xs flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-800 font-mono">
                    {d.dateString} ({d.weekday})
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                    {d.status} (-Rs. {dailyRate})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs space-y-3">
        <h3 className="font-display font-bold text-xs text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
          Record Salary Payout
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Quick Presets:</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAmountPaid(String(netRemainingDue))}
            className="h-6.5 px-2.5 text-[11px] font-bold text-emerald-700 bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100 cursor-pointer"
          >
            Pay Net Due (Rs. {netRemainingDue.toLocaleString()})
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePreset(0.5)}
            className="h-6.5 px-2.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            50% Advance (Rs. {Math.round(netEarnedSalary * 0.5).toLocaleString()})
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAmountPaid(String(netEarnedSalary))}
            className="h-6.5 px-2.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Full Net Earned (Rs. {netEarnedSalary.toLocaleString()})
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-700">Monthly Base Salary (Rs.)</Label>
            <Input
              type="number"
              min="0"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="text-xs tabular h-8"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-700">
              Amount to Pay Now (Rs.) <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="number"
              min="1"
              max={baseNum * 2}
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="text-xs tabular h-8 font-black text-emerald-700"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-700">Payment Mode</Label>
            <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v)}>
              <SelectTrigger className="h-8 text-xs bg-white">
                <SelectValue placeholder="Select Payment Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH" className="text-xs">Cash</SelectItem>
                <SelectItem value="ONLINE" className="text-xs">Online / Bank Transfer</SelectItem>
                <SelectItem value="CHEQUE" className="text-xs">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold text-slate-700">Payment Notes / Reason</Label>
          <Input
            type="text"
            placeholder="e.g. Monthly salary disbursed with 3 absents deducted"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-xs h-8"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 px-3 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            className="h-8 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirm &amp; Disburse Rs. {Number(amountPaid || 0).toLocaleString()}</span>
          </Button>
        </div>
      </form>

      {/* Past Salary Payments for this Month */}
      {pastPayments.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs space-y-2">
          <h3 className="font-display font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Past Payment Receipts for {selectedMonth}</span>
          </h3>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60">
                  <TableHead className="py-1 text-xs">Date</TableHead>
                  <TableHead className="py-1 text-xs text-right">Amount Paid</TableHead>
                  <TableHead className="py-1 text-xs text-center">Mode</TableHead>
                  <TableHead className="py-1 text-xs">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastPayments.map((p, idx) => (
                  <TableRow key={p.id || idx}>
                    <TableCell className="py-1.5 font-mono text-xs text-slate-700">{p.date}</TableCell>
                    <TableCell className="py-1.5 font-mono text-xs text-right font-black text-emerald-700">
                      Rs. {Number(p.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="py-1.5 text-xs text-center">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {p.paymentMode}
                      </span>
                    </TableCell>
                    <TableCell className="py-1.5 text-xs text-slate-500">{p.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
