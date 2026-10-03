import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  UserCheck,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  FileText,
  Trash2,
  Sparkles,
  ArrowRight,
  Receipt,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStaffContext } from '@/context/StaffContext';
import { useExpense } from '@/context/ExpenseContext';

export default function SalaryPayment() {
  const {
    staffList = [],
    salaryPayments = [],
    totalStaffSalaryPaid = 0,
    paySalary,
    deleteSalaryPayment,
  } = useStaffContext();

  const { addExpense } = useExpense();

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

  // Selected staff details & suggested duty-based salary
  const selectedStaff = useMemo(() => {
    return staffList.find((s) => String(s.id || s._id) === String(selectedStaffId));
  }, [staffList, selectedStaffId]);

  const suggestedSalary = useMemo(() => {
    if (!selectedStaff) return 0;
    const daily = Number(selectedStaff.dailySalary) || Math.round((Number(selectedStaff.monthlySalary || selectedStaff.salary) || 0) / 30);
    const present = selectedStaff.presentDays !== undefined ? Number(selectedStaff.presentDays) : 30;
    return daily * present;
  }, [selectedStaff]);

  // When staff changes, auto-populate suggested salary amount
  const handleSelectStaff = (id) => {
    setSelectedStaffId(id);
    const staff = staffList.find((s) => String(s.id || s._id) === String(id));
    if (staff) {
      const daily = Number(staff.dailySalary) || Math.round((Number(staff.monthlySalary || staff.salary) || 0) / 30);
      const present = staff.presentDays !== undefined ? Number(staff.presentDays) : 30;
      setSalaryAmount(String(daily * present));
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

    const amt = Number(salaryAmount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid salary amount');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Record salary payment in StaffContext
      await paySalary({
        staffId: selectedStaff.id || selectedStaff._id,
        staffName: selectedStaff.name,
        role: selectedStaff.role || 'Farm Labor',
        amount: amt,
        date: paymentDate,
        paymentMethod,
        notes: paymentNotes,
        monthYear: paymentMonth,
        skipDirectBackendCreate: true, // We push via addExpense into global farmExpenses
      });

      // 2. Automatically push into global farmExpenses array as a new expense object
      if (addExpense) {
        await addExpense({
          expenseEntity: 'FARM',
          scope: 'FARM',
          category: 'Staff Salary',
          title: `Staff Salary: ${selectedStaff.name}`,
          amount: amt,
          amountRupees: amt,
          paymentMethod,
          date: paymentDate,
          description: `Staff Salary: ${selectedStaff.name} (${paymentMonth})`,
          notes: paymentNotes,
          authorizedBy: 'Admin',
        });
      }

      toast.success(`Rs. ${amt.toLocaleString()} paid to ${selectedStaff.name}. Recorded as Farm Expense & Daily Close Cash Out!`);

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
                <DollarSign className="w-6 h-6 text-purple-600" />
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

          {/* Card 3: Monthly Salary Base */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">Monthly Payroll Base</span>
            <p className="text-xl sm:text-2xl font-black text-blue-800 font-mono mt-0.5">
              {fmt(staffList.reduce((s, m) => s + (Number(m.monthlySalary || m.salary) || 0), 0))}
            </p>
            <span className="text-[10px] text-blue-700 font-medium">Full Month Potential</span>
          </div>

          {/* Card 4: Total Salary Paid */}
          <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">Total Salary Paid</span>
            <p className="text-xl sm:text-2xl font-black text-purple-800 font-mono mt-0.5">
              {fmt(totalStaffSalaryPaid)}
            </p>
            <span className="text-[10px] text-purple-700 font-medium">Deducted from Farm P&amp;L</span>
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
            <p className="text-xs text-slate-500">
              Select a staff member, verify attendance duties, and disburse salary directly into Farm Expenses.
            </p>
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
                  <span className="font-black text-slate-900">{fmt(selectedStaff.monthlySalary || selectedStaff.salary)}</span>
                </div>
                <div className="bg-white/90 p-2.5 rounded-lg border border-purple-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Daily Wage (1/30)</span>
                  <span className="font-black text-slate-900">{fmt(selectedStaff.dailySalary)}</span>
                </div>
                <div className="bg-white/90 p-2.5 rounded-lg border border-purple-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Present Days</span>
                  <span className="font-black text-emerald-700">{selectedStaff.presentDays ?? 30} Days</span>
                </div>
                <div className="bg-white/90 p-2.5 rounded-lg border border-purple-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Calculated Net Due</span>
                  <span className="font-black text-purple-800">{fmt(suggestedSalary)}</span>
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
                    onClick={() => setSalaryAmount(String(suggestedSalary))}
                    className="text-[10px] font-bold text-purple-700 hover:text-purple-800 underline cursor-pointer"
                  >
                    Use Suggested ({fmt(suggestedSalary)})
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

          <div className="pt-2 flex items-center justify-between">
            <p className="text-[11px] text-slate-500 leading-tight">
              ✓ Submitting this payment will post a <strong>Farm Expense</strong> and log a <strong>Daily Close Cash Outflow</strong>.
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !selectedStaffId || !salaryAmount}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 active:scale-[0.98] text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <DollarSign className="w-4 h-4" />
              {isSubmitting ? 'Recording...' : 'Disburse & Record Salary Payment'}
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
            <p className="text-xs text-slate-500">
              Audit log of all issued staff salaries, voucher references, and Farm P&amp;L expense postings.
            </p>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            Recorded Vouchers: <strong className="text-slate-900">{salaryPayments.length}</strong>
          </span>
        </div>

        {salaryPayments.length === 0 ? (
          <div className="p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <DollarSign className="w-10 h-10 text-slate-300 mx-auto mb-2" />
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
                      {p.date ? p.date.slice(0, 10) : '-'}
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
                      - {fmt(p.amount)}
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
