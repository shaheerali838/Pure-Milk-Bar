import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  Receipt,
  DollarSign,
  Calendar,
  Tag,
  CreditCard,
  User,
  MapPin,
  CheckCircle2,
  Search,
  X,
  Sparkles,
} from 'lucide-react';
import { useSourcExpenseContext } from '@/context/SourcExpenseContext';
import RecordExpenseForm from './RecordExpenseForm';

export default function ExpenseVoucherDetail({
  expenseId,
  expense: initialExpense,
  onBack,
  onClose,
  onEdit,
  onDelete,
}) {
  const { expenses = [], deleteExpense } = useSourcExpenseContext();
  const handleBack = onBack || onClose;
  const [isEditingInline, setIsEditingInline] = useState(false);

  // Active expense ID state to allow switching via search method in detail
  const [activeId, setActiveId] = useState(expenseId || initialExpense?.id);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (expenseId) {
      setActiveId(expenseId);
    }
  }, [expenseId]);

  // 1. FILTER METHOD: Using Array.prototype.filter to get the active expense when clicked
  const filteredMatches = expenses.filter(
    (item) =>
      String(item.id) === String(activeId) ||
      String(item.voucherNo) === String(activeId)
  );
  const expense =
    filteredMatches.length > 0
      ? filteredMatches[0]
      : initialExpense || expenses[0];

  // 2. SEARCH METHOD: Using Array.prototype.filter to search vouchers in detail
  const filteredExpensesList = expenses.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.voucherNo && item.voucherNo.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.loggedBy && item.loggedBy.toLowerCase().includes(q)) ||
      (item.costAttribution && item.costAttribution.toLowerCase().includes(q))
    );
  });

  if (!expense) {
    return (
      <div className="p-8 bg-slate-50 min-h-[400px] flex flex-col items-center justify-center space-y-3 rounded-2xl border border-slate-200">
        <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
          <Receipt className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-800 font-display">
          Expense Voucher Not Found
        </h2>
        <p className="text-xs text-slate-500">
          The requested expense record does not exist or has been removed.
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer transition shadow-2xs"
        >
          Back to Expenses
        </button>
      </div>
    );
  }

  // Inline edit mode
  if (isEditingInline) {
    return (
      <RecordExpenseForm
        editingExpense={expense}
        onBack={() => setIsEditingInline(false)}
        onSuccess={() => setIsEditingInline(false)}
      />
    );
  }

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete expense "${expense.description}" (${expense.voucherNo || expense.id}) of Rs. ${Number(expense.amount).toLocaleString()}?`
      )
    ) {
      if (onDelete) onDelete(expense.id);
      if (handleBack) handleBack();
    }
  };

  const handleStartEdit = () => {
    if (onEdit) {
      onEdit(expense);
    } else {
      setIsEditingInline(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-150 pb-4">
      {/* Top action & header bar with Search Method in detail */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Expenses
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
              Expense Details — {expense.voucherNo || expense.id}
            </h1>
            <p className="text-xs text-slate-500">
              Voucher #{expense.voucherNo || expense.id} &bull; Recorded on {expense.date}
            </p>
          </div>
        </div>

        {/* Right side: Search Method & Select Tag Dropdown + Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search method input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-28 sm:w-36 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#4f39f6] focus:border-[#4f39f6] transition"
            />
          </div>

          {/* Select tag for dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={activeId}
              onChange={(e) => setActiveId(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#4f39f6] focus:border-[#4f39f6] transition cursor-pointer max-w-[200px] sm:max-w-[260px]"
            >
              {filteredExpensesList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.voucherNo || item.id} — {item.category} (Rs. {Number(item.amount).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          <button
            type="button"
            onClick={handleStartEdit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200/70 transition shadow-2xs cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200/70 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Main details card container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-4">
        {/* Profile Hero Section */}
        <div className="bg-[#f8fafc] p-4 sm:p-5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200 text-[#4f39f6] font-bold flex items-center justify-center text-2xl shadow-xs shrink-0 font-display">
              <Receipt className="w-7 h-7 text-[#4f39f6]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  {expense.voucherNo || expense.id}
                </h2>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-700">
                  {expense.id}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-md border bg-purple-50 text-purple-700 border-purple-200">
                  {expense.category}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ERP Verified Disbursement
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Voucher Amount
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
                Rs. {Number(expense.amount).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Highlight Metric Cards - STAY HERE as requested */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Card 1: Amount */}
          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/70">
            <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              Disbursed Outlay
            </div>
            <p className="text-base font-black text-slate-900 font-mono">
              Rs. {Number(expense.amount).toLocaleString()}
            </p>
          </div>

          {/* Card 2: Payment Mode */}
          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200/70">
            <div className="flex items-center gap-1.5 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <CreditCard className="w-3.5 h-3.5" />
              Payment Channel
            </div>
            <p className="text-base font-black text-slate-900 truncate">
              {expense.paymentMode || 'Cash on Hand'}
            </p>
          </div>

          {/* Card 3: Category */}
          <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/70">
            <div className="flex items-center gap-1.5 text-amber-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Tag className="w-3.5 h-3.5" />
              Procurement Center
            </div>
            <p className="text-sm font-bold text-slate-800 truncate">
              {expense.category}
            </p>
          </div>

          {/* Card 4: Date */}
          <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-200/70">
            <div className="flex items-center gap-1.5 text-purple-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5" />
              Transaction Date
            </div>
            <p className="text-sm font-bold text-slate-800 font-mono">
              {expense.date || 'Recently'}
            </p>
          </div>
        </div>

        {/* Detail Specification Table - NOT IN CARD TYPE (Clean flat ERP layout) */}
        <div className="border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
          <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#4f39f6]" />
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-display">
                Voucher &amp; Sourcing Outlay Specifications
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono font-medium">
              System ID: {expense.id}
            </span>
          </div>

          <table className="w-full text-xs text-left border-collapse">
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-slate-500 w-1/3 sm:w-1/4">
                  Official Voucher #
                </td>
                <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                  {expense.voucherNo || expense.id}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-slate-500">
                  Expense Narrative / Description
                </td>
                <td className="py-2.5 px-4 font-medium text-slate-800">
                  {expense.description}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-slate-500">
                  Procurement Category
                </td>
                <td className="py-2.5 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                    {expense.category}
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-slate-500">
                  Total Disbursed Outlay
                </td>
                <td className="py-2.5 px-4 font-mono font-extrabold text-[#4f39f6] text-sm">
                  Rs. {Number(expense.amount).toLocaleString()}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-slate-500">
                  Payment Channel
                </td>
                <td className="py-2.5 px-4">
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    {expense.paymentMode || 'Cash on Hand'}
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-slate-500">
                  Transaction Date
                </td>
                <td className="py-2.5 px-4 font-mono font-medium text-slate-800">
                  {expense.date}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-slate-500">
                  Logged By Staff
                </td>
                <td className="py-2.5 px-4 font-medium text-slate-800">
                  <span className="inline-flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {expense.loggedBy || 'System Administrator'}
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-slate-500">
                  Cost Attribution Center
                </td>
                <td className="py-2.5 px-4 font-medium text-slate-800">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {expense.costAttribution || 'General Procurement Unit'}
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-slate-500">
                  Audit Clearance Status
                </td>
                <td className="py-2.5 px-4">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Disbursement &bull; Clearance Certified for P&amp;L Ledger
                  </span>
                </td>
              </tr>
              {expense.notes && (
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-slate-500">
                    Operational Remarks
                  </td>
                  <td className="py-2.5 px-4 text-slate-700">
                    {expense.notes}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
