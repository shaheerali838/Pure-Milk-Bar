import React, { useState, useMemo } from 'react';
import { Banknote, UserCheck, Calendar, CreditCard, Building, CheckCircle2, Clock, AlertCircle, Users, FileText, Trash2, Sparkles, ArrowRight, Receipt, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useStaffPayrollContext } from '@/context/StaffPayrollContext';
import { useExpense } from '@/context/ExpenseContext';

export default function SalaryPayment() {
  const {
    staffList = [],
    salaryPayments = [],
    metrics = {},
    recordSalaryPayment,
    paySalary,
    deleteSalaryPayment,
    isStaffSalaryPaid,
  } = useStaffPayrollContext();

  const { fetchExpenses } = useExpense();

  // Salary Payment Form State
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentMonth, setPaymentMonth] = useState(() => {
    return new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  });
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected staff details & deduction-based salary calculation
  const selectedStaff = useMemo(() => {
    return staffList.find((s) => String(s.id || s._id) === String(selectedStaffId));
  }, [staffList, selectedStaffId]);

  const { monthlyBase, perDaySalary, absentDays, totalDeduction, calculatedNetSalary } = useMemo(() => {
    if (!selectedStaff) {
      return { monthlyBase: 0, perDaySalary: 0, absentDays: 0, totalDeduction: 0, calculatedNetSalary: 0 };
    }
    const base = Number(selectedStaff.monthlySalary || selectedStaff.salary) || 0;
    const daily = Math.round(base / 30);
    const absent = selectedStaff.attendanceMap
      ? Object.values(selectedStaff.attendanceMap).filter((st) => String(st).trim().toLowerCase() === 'absent').length
      : (Number(selectedStaff.absentDays) || 0);
    const deduction = daily * absent;
    const net = Math.max(0, base - deduction);
    return {
      monthlyBase: base,
      perDaySalary: daily,
      absentDays: absent,
      totalDeduction: deduction,
      calculatedNetSalary: net,
    };
  }, [selectedStaff]);

  // When staff changes, auto-populate suggested salary amount
  const handleSelectStaff = (id) => {
    setSelectedStaffId(id);
    const staff = staffList.find((s) => String(s.id || s._id) === String(id));
    if (staff) {
      const base = Number(staff.monthlySalary || staff.salary) || 0;
      const daily = Math.round(base / 30);
      const absent = staff.attendanceMap
        ? Object.values(staff.attendanceMap).filter((st) => String(st).trim().toLowerCase() === 'absent').length
        : (Number(staff.absentDays) || 0);
      const deduction = daily * absent;
      const net = Math.max(0, base - deduction);
      setSalaryAmount(String(net));
    } else {
      setSalaryAmount('');
    }
  };

  // Submit salary payment
  const handleDisburseSalary = async (e) => {
    e.preventDefault();
    if (!selectedStaff) {
      toast.error('Please select a staff member first');
      return;
    }

    const isAlreadyPaid = selectedStaff && isStaffSalaryPaid ? isStaffSalaryPaid(selectedStaff.id || selectedStaff._id) : false;
    if (isAlreadyPaid) {
      toast.error(`Salary for ${selectedStaff.name} has already been paid for this month. Duplicate payments are not allowed.`);
      return;
    }

    const amt = Number(salaryAmount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid salary amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const payFn = recordSalaryPayment || paySalary;
      // 1. Record salary payment in database (which automatically creates the Expense in MongoDB via backend service)
      await payFn({
        staffId: selectedStaff.id || selectedStaff._id,
        staffName: selectedStaff.name,
        role: selectedStaff.role || 'Farm Labor',
        amount: amt,
        amountPaid: amt,
        absentDays,
        deduction: totalDeduction,
        status: 'Paid',
        paymentDate,
        date: paymentDate,
        paymentMethod,
        notes: paymentNotes,
        monthYear: paymentMonth,
      });

      // 2. Refresh expenses so Farm Expenses immediately displays the new database expense
      if (fetchExpenses) {
        await fetchExpenses();
      }

      toast.success(`Rs. ${amt.toLocaleString()} paid to ${selectedStaff.name}! Synced to Database & Farm Expenses.`);

      // Reset form fields
      setSalaryAmount('');
      setPaymentNotes('');
      setSelectedStaffId('');
    } catch (err) {
      toast.error(err.message || 'Failed to disburse salary payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fmt = (n) => 'Rs. ' + Math.round(Number(n) || 0).toLocaleString();

  return (
    <div className="space-y-5 pb-16 animate-in fade-in duration-150">
      {/* 1. Header & Live KPI Summary */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2">
                <Banknote className="w-6 h-6 text-purple-600" />
                Staff Salary &amp; Payroll Disbursement
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Farm P&amp;L Linked
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Duty attendance based salary calculation, cash payment register, and automated Farm Operating Expense posting.
            </p>
          </div>
        </div>

        {/* KPI Mini-cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card 1: Total Staff */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Staff Members</span>
            <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">{staffList.length}</p>
            <span className="text-[10px] text-slate-400 font-medium">On Payroll</span>
          </div>

          {/* Card 2: Total Active Staff */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Active Staff</span>
            <p className="text-2xl font-black text-emerald-700 font-mono mt-0.5">
              {staffList.filter((s) => s.status !== 'Inactive' && s.status !== 'Off Duty').length}
            </p>
            <span className="text-[10px] text-emerald-700 font-medium">Active on Duty</span>
          </div>

          {/* Card 3: Total Paid Salaries */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">Paid Staff Salaries</span>
            <p className="text-xl sm:text-2xl font-black text-blue-800 font-mono mt-0.5">
              {fmt(metrics?.totalPaidSalaries || 0)}
            </p>
            <span className="text-[10px] text-blue-700 font-medium">
              {(metrics?.totalPaidSalaries || 0) > 0 ? 'Disbursed This Month' : 'No salaries paid yet'}
            </span>
          </div>

          {/* Card 4: Disbursed Vouchers Count */}
          <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">Disbursed Vouchers</span>
            <p className="text-xl sm:text-2xl font-black text-purple-800 font-mono mt-0.5">
              {salaryPayments.length}
            </p>
            <span className="text-[10px] text-purple-700 font-medium">Database Synced</span>
          </div>
        </div>
      </div>

      {/* 2. Salary Payment Form */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              Pay Staff Salary Form
            </h2>
          </div>
        </div>

        <form onSubmit={handleDisburseSalary} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Select Staff Member */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Staff Member <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => handleSelectStaff(e.target.value)}
                required
                className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold text-slate-800"
              >
                <option value="">-- Choose Staff Member --</option>
                {staffList.map((staff) => (
                  <option key={staff.id || staff._id} value={staff.id || staff._id}>
                    {staff.name} — {staff.role || 'Labor'} (Rs. {Number(staff.monthlySalary || staff.salary || 0).toLocaleString()}/mo)
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Payment Month & Year */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Salary Period / Month <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={paymentMonth}
                onChange={(e) => setPaymentMonth(e.target.value)}
                placeholder="e.g. October 2026"
                required
                className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
              >
              </input>
            </div>

            {/* 3. Payment Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Disbursement Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium cursor-pointer"
              />
            </div>
          </div>

          {/* Duty Breakdown Live Helper Box */}
          {selectedStaff && (
            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-950 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-purple-700" />
                  Duty Attendance Summary for {selectedStaff.name}:
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-200/80 text-purple-900 font-bold text-[10px]">
                  {selectedStaff.role || 'Farm Labor'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px] pt-1">
                <div className="bg-white/90 p-2.5 rounded-lg border border-purple-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Monthly Base</span>
                  <span className="font-black text-slate-900">{fmt(monthlyBase)}</span>
                </div>
                <div className="bg-white/90 p-2.5 rounded-lg border border-purple-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Daily Wage (1/30)</span>
                  <span className="font-black text-slate-900">{fmt(perDaySalary)}/d</span>
                </div>
                <div className="bg-white/90 p-2.5 rounded-lg border border-purple-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Absent Deduction</span>
                  <span className="font-black text-rose-600 font-mono">
                    {absentDays > 0 ? `- ${fmt(totalDeduction)} (${absentDays}d)` : 'Rs. 0 (0 Absent)'}
                  </span>
                </div>
                <div className="bg-white/90 p-2.5 rounded-lg border border-purple-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Calculated Net Due</span>
                  <span className="font-black text-purple-800">{fmt(calculatedNetSalary)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 4. Payment Amount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Amount to Pay (PKR) <span className="text-rose-500">*</span>
                </label>
                {selectedStaff && (
                  <button
                    type="button"
                    onClick={() => setSalaryAmount(String(calculatedNetSalary))}
                    className="text-[10px] font-bold text-purple-700 hover:text-purple-800 underline cursor-pointer"
                  >
                    Use Suggested ({fmt(calculatedNetSalary)})
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                  Rs.
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="e.g. 15000"
                  value={salaryAmount}
                  onChange={(e) => setSalaryAmount(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold text-slate-900 text-sm"
                />
              </div>
            </div>

            {/* 5. Payment Method */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Payment Method (Cash / Online) <span className="text-rose-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold text-slate-800"
              >
                <option value="CASH">CASH (Drawn from POS / Farm Cash Register)</option>
                <option value="ONLINE">ONLINE (JazzCash / EasyPaisa / Bank Transfer)</option>
                <option value="CHEQUE">CHEQUE</option>
              </select>
            </div>

            {/* 6. Payment Notes / Voucher */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Voucher Notes / Reference <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Cleared full month wages"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          {selectedStaff && isStaffSalaryPaid && isStaffSalaryPaid(selectedStaff.id || selectedStaff._id) && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Salary for <strong>{selectedStaff.name}</strong> has already been disbursed for this month. A staff member can only receive salary once per month.</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <p className="text-[11px] text-slate-500 leading-tight">
              ✓ Submitting this payment will post a <strong>Farm Expense</strong> and log a <strong>Daily Close Cash Outflow</strong>.
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !selectedStaffId || !salaryAmount || (selectedStaff && isStaffSalaryPaid && isStaffSalaryPaid(selectedStaff.id || selectedStaff._id))}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs transition ${
                selectedStaff && isStaffSalaryPaid && isStaffSalaryPaid(selectedStaff.id || selectedStaff._id)
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                  : 'bg-purple-700 hover:bg-purple-800 active:scale-[0.98] text-white cursor-pointer disabled:opacity-50'
              }`}
            >
              <Banknote className="w-4 h-4" />
              {isSubmitting
                ? 'Recording...'
                : selectedStaff && isStaffSalaryPaid && isStaffSalaryPaid(selectedStaff.id || selectedStaff._id)
                ? 'Already Paid (Single Payment Only)'
                : 'Disburse & Record Salary Payment'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Recent Salary Payments Audit Ledger */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              Salary Payment Disbursements Ledger
            </h2>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            Recorded Vouchers: <strong className="text-slate-900">{salaryPayments.length}</strong>
          </span>
        </div>

        {salaryPayments.length === 0 ? (
          <div className="p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <Banknote className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No Salary Payments Recorded Yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Use the form above to disburse salary to your farm staff members.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Staff Member</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Period</th>
                  <th className="py-3 px-3 text-center">Absent Days</th>
                  <th className="py-3 px-3 text-right">Deduction</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3 text-right">Amount Paid</th>
                  <th className="py-3 px-3">Notes</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {salaryPayments.map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-semibold text-slate-600">
                      {p.paymentDate || p.date ? (p.paymentDate || p.date).slice(0, 10) : '-'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{p.staffName || 'Staff Member'}</div>
                      <div className="text-[10px] text-slate-400">ID: {p.staffId || p.id}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {p.role || 'Staff'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {p.monthYear || '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        Number(p.absentDays) > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.absentDays ?? 0} {Number(p.absentDays) === 1 ? 'd' : 'd'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-rose-600 font-semibold">
                      {Number(p.deduction) > 0 ? `- ${fmt(p.deduction)}` : 'Rs. 0'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.paymentMethod === 'CASH'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {p.paymentMethod || 'CASH'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-rose-700 font-mono text-sm">
                      - {fmt(p.amountPaid ?? p.amount)}
                    </td>
                    <td className="py-3 px-3 text-slate-500 max-w-xs truncate" title={p.notes || ''}>
                      {p.notes || 'Routine salary payment'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete salary payment voucher of Rs. ${Number(p.amount).toLocaleString()} for ${p.staffName}?`)) {
                            deleteSalaryPayment(p.id);
                            toast.success('Salary payment voucher removed');
                          }
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
