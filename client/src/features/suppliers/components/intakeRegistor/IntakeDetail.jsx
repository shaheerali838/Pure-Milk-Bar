import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  X,
  Edit,
  Trash2,
  Printer,
  Droplets,
  DollarSign,
  Calendar,
  Clock,
  User,
  Building2,
  Tag,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Search,
  Receipt,
} from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSupplierContext } from '@/context/SupplierContext';
import { toast } from 'sonner';

// Full-space and modal detail view for milk intake slips
export default function IntakeDetail({
  item: initialItem,
  onBack,
  onClose,
  onEdit,
  onDelete,
  onPaySupplier,
  backLabel = 'Back to Intake Register',
}) {
  const { intakeLogs = [], deleteIntake } = useIntakeContext();
  const { suppliers = [] } = useSupplierContext();

  const handleBack = onBack || onClose;

  // Active slip ID state for quick-switcher
  const [activeId, setActiveId] = useState(initialItem?.id);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialItem?.id) {
      setActiveId(initialItem.id);
    }
  }, [initialItem]);

  // Find active slip from live context logs
  const activeSlip =
    intakeLogs.find((l) => String(l.id) === String(activeId)) ||
    initialItem ||
    intakeLogs[0] ||
    null;

  if (!activeSlip) {
    return (
      <div className="p-8 bg-slate-50 min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
          <Droplets className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-800 font-display">
          Intake Slip Not Found
        </h2>
        <p className="text-xs text-slate-500">
          The requested milk delivery slip does not exist or has been removed.
        </p>
        <button
          onClick={handleBack}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer transition shadow-2xs"
        >
          {backLabel}
        </button>
      </div>
    );
  }

  // Calculations
  const qty = parseFloat(activeSlip.quantity) || 0;
  const rate = parseFloat(activeSlip.ratePerLiter) || 220;
  const cost = parseFloat(activeSlip.totalCost) || qty * rate;
  const fat = parseFloat(activeSlip.fat) || 0;
  const lr = parseFloat(activeSlip.lr) || 0;
  const snf =
    activeSlip.snf !== undefined
      ? parseFloat(activeSlip.snf)
      : parseFloat(((lr / 4) + (0.25 * fat) + 0.35).toFixed(2));

  const alreadyPaid =
    activeSlip.paidAmount !== undefined
      ? parseFloat(activeSlip.paidAmount) || 0
      : activeSlip.settlement === 'Paid'
      ? cost
      : activeSlip.settlement === 'Partial'
      ? cost * 0.5
      : 0;

  const pendingDue =
    activeSlip.pendingAmount !== undefined
      ? parseFloat(activeSlip.pendingAmount) || 0
      : Math.max(0, cost - alreadyPaid);

  const isMorning = activeSlip.shift?.toLowerCase() === 'morning';

  // Matched supplier info
  const matchedSupplier = suppliers.find(
    (s) =>
      s.id === activeSlip.supplierId ||
      (activeSlip.supplierName &&
        s.name &&
        s.name.toLowerCase().includes(activeSlip.supplierName.toLowerCase()))
  );

  const supplierDisplayName = activeSlip.supplierName || 'Ahmad Farms';
  const initialLetter =
    supplierDisplayName.replace(/Supplier\s+/i, '').charAt(0).toUpperCase() || 'S';

  // Filtered list for quick switcher dropdown
  const filteredSlips = intakeLogs.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(l.id).toLowerCase().includes(q) ||
      (l.supplierName && l.supplierName.toLowerCase().includes(q)) ||
      (l.date && l.date.includes(q))
    );
  });

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to remove intake slip #${activeSlip.id} for ${supplierDisplayName} (${qty} L)?`
      )
    ) {
      if (onDelete) {
        onDelete(activeSlip.id);
      } else if (deleteIntake) {
        deleteIntake(activeSlip.id);
        toast.success(`Intake slip #${activeSlip.id} deleted.`);
        if (handleBack) handleBack();
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Reusable detail content
  const detailContent = (
    <div className="space-y-6">
      {/* 1. Hero Voucher Card */}
      <div className="bg-[#f8fafc] p-5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-2xl shadow-xs shrink-0 font-display">
            {initialLetter}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 font-display">
                {supplierDisplayName}
              </h2>
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-700">
                #{activeSlip.id}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                  isMorning
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                }`}
              >
                {isMorning ? (
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                )}
                <span>{activeSlip.shift} Collection</span>
              </span>

              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {activeSlip.date}
                {activeSlip.time && ` • ${activeSlip.time}`}
              </span>

              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  activeSlip.settlement === 'Paid'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : activeSlip.settlement === 'Partial'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    activeSlip.settlement === 'Paid'
                      ? 'bg-emerald-500'
                      : activeSlip.settlement === 'Partial'
                      ? 'bg-blue-500'
                      : 'bg-amber-500 animate-pulse'
                  }`}
                />
                {activeSlip.settlement || 'Pending'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Purchase Rate
            </span>
            <span className="text-2xl font-black text-emerald-700 font-mono">
              Rs. {rate} / L
            </span>
          </div>
        </div>
      </div>

      {/* 2. 4 Key Highlight Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Quantity */}
        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/70">
          <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Droplets className="w-3.5 h-3.5" />
            Milk Quantity
          </div>
          <p className="text-base font-black text-slate-900 font-mono">
            {qty.toFixed(1)} Liters
          </p>
        </div>

        {/* Unit Rate */}
        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/70">
          <div className="flex items-center gap-1.5 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Tag className="w-3.5 h-3.5" />
            Rate per Liter
          </div>
          <p className="text-base font-black text-slate-900 font-mono">
            Rs. {rate}
          </p>
        </div>

        {/* Total Cost */}
        <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200/70">
          <div className="flex items-center gap-1.5 text-purple-700 text-[10px] font-bold uppercase tracking-wider mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            Total Batch Value
          </div>
          <p className="text-base font-black text-slate-900 font-mono">
            Rs. {Math.round(cost).toLocaleString()}
          </p>
        </div>

        {/* Due / Balance */}
        <div
          className={`p-4 rounded-xl border ${
            pendingDue > 0
              ? 'bg-amber-50/70 border-amber-200/80'
              : 'bg-emerald-50/70 border-emerald-200/70'
          }`}
        >
          <div
            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1 ${
              pendingDue > 0 ? 'text-amber-700' : 'text-emerald-700'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            Balance Due
          </div>
          <p
            className={`text-base font-black font-mono ${
              pendingDue > 0 ? 'text-amber-800' : 'text-emerald-700'
            }`}
          >
            Rs. {Math.round(pendingDue).toLocaleString()}
          </p>
        </div>
      </div>

      {/* 3. Supplier & Financial Settlement Table */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 shadow-2xs text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-700">
            <Receipt className="w-4 h-4 text-emerald-600" />
            Supplier &amp; Financial Settlement
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Delivery Voucher #{activeSlip.id}
          </span>
        </div>

        <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-2xs">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3">Supplier Name &amp; ID</th>
                <th className="px-4 py-3">Route / Area</th>
                <th className="px-4 py-3 text-right">Milk Quantity</th>
                <th className="px-4 py-3 text-right">Rate / Liter</th>
                <th className="px-4 py-3 text-right">Total Cost</th>
                <th className="px-4 py-3 text-right">Amount Paid</th>
                <th className="px-4 py-3 text-right">Remaining Due</th>
                <th className="px-4 py-3 text-center">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-3.5">
                  <span className="font-bold text-slate-900 text-sm block">
                    {supplierDisplayName}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    ID: {activeSlip.supplierId || matchedSupplier?.id || '—'}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-medium text-slate-700">
                  {activeSlip.area || matchedSupplier?.area || 'Direct Supply'}
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700 text-sm">
                  {qty.toFixed(1)} L
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                  Rs. {rate}
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                  Rs. {Math.round(cost).toLocaleString()}
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700 text-sm">
                  Rs. {Math.round(alreadyPaid).toLocaleString()}
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-sm">
                  <span
                    className={
                      pendingDue > 0
                        ? 'text-amber-700 font-black'
                        : 'text-emerald-700 font-black'
                    }
                  >
                    Rs. {Math.round(pendingDue).toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      activeSlip.settlement === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : activeSlip.settlement === 'Partial'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {activeSlip.settlement || 'Pending'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Quick Payment Settlement Banner (Only if pendingDue > 0) */}
      {pendingDue > 0 && onPaySupplier && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-amber-100/40 to-white border border-amber-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-900 block">
                Pending Delivery Settlement: Rs. {Math.round(pendingDue).toLocaleString()}
              </span>
              <p className="text-[11px] text-amber-700">
                Disburse cash or bank payment to clear this milk delivery slip.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onPaySupplier(activeSlip)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition active:scale-95"
            style={{ backgroundColor: '#009966' }}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Pay Supplier Slip</span>
          </button>
        </div>
      )}

      {/* 5. Additional Delivery Notes */}
      {activeSlip.notes && (
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 text-xs text-slate-700 space-y-1">
          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block">
            Delivery Notes &amp; Observations
          </span>
          <p className="font-medium text-slate-800">{activeSlip.notes}</p>
        </div>
      )}
    </div>
  );

  // MODE A: FULL-PAGE VIEW (Standard Architecture when onBack is present)
  if (onBack) {
    return (
      <div className="space-y-4 animate-in fade-in duration-150 pb-8">
        {/* Top Action & Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
                Intake Slip Details — #{activeSlip.id}
              </h1>
              <p className="text-xs text-slate-500">
                Supplier: {supplierDisplayName} • {activeSlip.date} ({activeSlip.shift} Shift)
              </p>
            </div>
          </div>

          {/* Action Controls & Quick Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search filter for dropdown */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search slips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-28 sm:w-36 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            {/* Quick Switcher Dropdown */}
            <select
              value={activeId}
              onChange={(e) => setActiveId(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition cursor-pointer max-w-[200px] sm:max-w-[240px]"
            >
              {filteredSlips.map((item) => (
                <option key={item.id} value={item.id}>
                  #{item.id} — {item.supplierName} ({item.quantity}L • {item.shift})
                </option>
              ))}
            </select>

            {/* Print Slip Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>

            {/* Edit Button */}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(activeSlip)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200/70 transition shadow-2xs cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>
            )}

            {/* Pay Button if not fully paid */}
            {pendingDue > 0 && onPaySupplier && (
              <button
                type="button"
                onClick={() => onPaySupplier(activeSlip)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5" />
                Pay Slip (Rs. {Math.round(pendingDue).toLocaleString()})
              </button>
            )}

            {/* Delete Button */}
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200/70 transition shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>

        {/* Main Details Container */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-2xs">
          {detailContent}
        </div>
      </div>
    );
  }

  // MODE B: MODAL DIALOG VIEW (Fallback for popups)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={handleBack}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Milk Intake Slip Details — #{activeSlip.id}
              </h3>
              <p className="text-xs text-slate-500">
                Supplier: {supplierDisplayName} • {activeSlip.date} ({activeSlip.shift} Shift)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
              title="Print"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {detailContent}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {pendingDue > 0 && onPaySupplier ? (
            <button
              type="button"
              onClick={() => {
                if (handleBack) handleBack();
                onPaySupplier(activeSlip);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Pay Due (Rs. {Math.round(pendingDue).toLocaleString()})</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer shadow-2xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
