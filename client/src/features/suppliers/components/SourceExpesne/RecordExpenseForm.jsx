import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Receipt,
  Check,
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  FileText,
  User,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import {
  useSourcExpenseContext,
  CATEGORY_OPTIONS,
  PAYMENT_MODES,
} from '@/context/SourcExpenseContext';

const initialForm = {
  category: 'Collection Route Fuel',
  date: new Date().toISOString().split('T')[0],
  paymentMode: 'Cash on Hand',
  description: '',
  amount: '',
  voucherNo: '',
  loggedBy: 'Farhan Ali (Driver)',
  costAttribution: 'Route 1 - Green Meadows Center',
  notes: '',
};

export default function RecordExpenseForm({
  onBack,
  onClose,
  editingExpense = null,
  onSuccess,
}) {
  const { addExpense, updateExpense } = useSourcExpenseContext();
  const handleBack = onBack || onClose;
  const isEdit = Boolean(editingExpense);

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        category: editingExpense.category || 'Collection Route Fuel',
        date: editingExpense.date || new Date().toISOString().split('T')[0],
        paymentMode: editingExpense.paymentMode || 'Cash on Hand',
        description: editingExpense.description || '',
        amount: editingExpense.amount
          ? String(editingExpense.amount).replace(/[^0-9.]/g, '')
          : '',
        voucherNo: editingExpense.voucherNo || editingExpense.id || '',
        loggedBy: editingExpense.loggedBy || 'System Admin',
        costAttribution: editingExpense.costAttribution || '',
        notes: editingExpense.notes || '',
      });
    } else {
      setFormData({
        ...initialForm,
        date: new Date().toISOString().split('T')[0],
        voucherNo: `VCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      });
    }
  }, [editingExpense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter an expense description';
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount (greater than 0)';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEdit && editingExpense) {
      updateExpense(editingExpense.id, formData);
    } else {
      addExpense(formData);
    }

    if (onSuccess) onSuccess();
    if (handleBack) handleBack();
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-150 no-scrollbar">
      {/* Top action & header bar - Exactly matching AnimalAdd */}
      <div className="flex items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Expenses
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight font-display leading-tight">
              {isEdit
                ? `Edit Sourcing Expense — ${editingExpense?.voucherNo || editingExpense?.id}`
                : 'Record Sourcing Expense'}
            </h1>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            isEdit
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isEdit ? 'bg-indigo-500' : 'bg-emerald-500 animate-pulse'
            }`}
          />
          {isEdit ? `Editing #${editingExpense?.voucherNo || editingExpense?.id}` : 'New Voucher'}
        </span>
      </div>

      {/* Main form container */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs no-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Section 1: Classification & Timing */}
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2.5">
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                  isEdit ? 'bg-indigo-100 text-indigo-700' : 'bg-[#4f39f6]/10 text-[#4f39f6]'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                1. Sourcing Expense Classification &amp; Timing
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Expense Category <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#4f39f6] focus:border-[#4f39f6] transition cursor-pointer font-medium"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#4f39f6] focus:border-[#4f39f6] transition font-medium"
                  />
                </div>
                {errors.date && <p className="text-[10px] text-rose-500 mt-1">{errors.date}</p>}
              </div>

              {/* Voucher # */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Voucher / Receipt Ref <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Tag className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    name="voucherNo"
                    value={formData.voucherNo}
                    onChange={handleChange}
                    placeholder="Auto-generated if empty"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#4f39f6] focus:border-[#4f39f6] transition font-mono font-medium"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Method <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#4f39f6] focus:border-[#4f39f6] transition cursor-pointer font-medium"
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Financial Amount & Description */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2.5">
              <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                2. Financial Amount &amp; Operational Narrative
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Amount */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Amount (Rs.) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 font-bold text-[11px]">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="14500"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#4f39f6] focus:border-[#4f39f6] transition font-mono font-bold"
                  />
                </div>
                {errors.amount && <p className="text-[10px] text-rose-500 mt-1">{errors.amount}</p>}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Expense Description / Narrative <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <FileText className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="e.g. Milk collection van diesel (Route 1 - Green Meadows)"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#4f39f6] focus:border-[#4f39f6] transition font-medium"
                  />
                </div>
                {errors.description && <p className="text-[10px] text-rose-500 mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Cost Center & Personnel */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2.5">
              <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                3. Cost Attribution &amp; Personnel
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Logged By */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Logged By Staff / Driver
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    name="loggedBy"
                    value={formData.loggedBy}
                    onChange={handleChange}
                    placeholder="e.g. Farhan Ali (Driver)"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#4f39f6] focus:border-[#4f39f6] transition font-medium"
                  />
                </div>
              </div>

              {/* Cost Attribution */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Cost Attribution / Center
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    name="costAttribution"
                    value={formData.costAttribution}
                    onChange={handleChange}
                    placeholder="e.g. Green Meadows Route Center"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#4f39f6] focus:border-[#4f39f6] transition font-medium"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Operational Remarks / Notes
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="e.g. Verified by Chilling Incharge..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#4f39f6] focus:border-[#4f39f6] transition font-medium"
                />
              </div>
            </div>
          </div>

          {/* Form action buttons - Exactly matching AnimalAdd */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-white text-xs font-bold shadow-xs transition cursor-pointer ${
                isEdit
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-[#4f39f6] hover:bg-[#3d29df]'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              {isEdit ? 'Save Changes' : 'Record Sourcing Cost'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
