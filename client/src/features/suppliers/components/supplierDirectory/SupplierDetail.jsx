import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  Building2,
  Phone,
  MapPin,
  Tag,
  DollarSign,
  Wallet,
  Clock,
  Droplets,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sun,
  Moon,
  Coins,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSupplierContext } from '@/context/SupplierContext';
import IntakeDetail from '../intakeRegistor/IntakeDetail';
import { toast } from 'sonner';

export default function SupplierDetail({ supplier: propSupplier, onBack, onEdit }) {
  const { intakeLogs = [], updateBatchSettlement } = useIntakeContext();
  const { suppliers = [], settleSupplierBalance } = useSupplierContext();

  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleAmount, setSettleAmount] = useState('');
  const [shiftFilter, setShiftFilter] = useState('All');

  // Ensure we use the live enriched supplier from context so balance updates instantly
  const supplier =
    suppliers.find((s) => s.id === propSupplier?.id) || propSupplier;

  if (!supplier) {
    return (
      <div className="p-8 bg-slate-50 min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-800 font-display">
          Supplier Record Not Found
        </h2>
        <p className="text-xs text-slate-500">
          The requested supplier profile does not exist or has been removed.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer transition shadow-2xs"
        >
          Back to Suppliers
        </button>
      </div>
    );
  }

  // Query procurement batches logged for this supplier
  const supplierBatches = intakeLogs.filter(
    (b) =>
      b.supplierId === supplier.id ||
      (b.supplierName &&
        supplier.name &&
        b.supplierName.toLowerCase().includes(supplier.name.toLowerCase())) ||
      (supplier.name &&
        b.supplierName &&
        supplier.name.toLowerCase().includes(b.supplierName.toLowerCase()))
  );

  // Filter based on selected shift
  const filteredBatches = supplierBatches.filter((b) => {
    if (shiftFilter === 'All') return true;
    return b.shift?.toLowerCase() === shiftFilter.toLowerCase();
  });

  const morningCount = supplierBatches.filter(
    (b) => b.shift?.toLowerCase() === 'morning'
  ).length;
  const eveningCount = supplierBatches.filter(
    (b) => b.shift?.toLowerCase() === 'evening'
  ).length;

  const rate = parseFloat(supplier.ratePerLiter) || 220;

  // Use enriched supplier totals from SupplierContext for single-source-of-truth accuracy
  const totalLiters =
    supplier.totalSourced !== undefined
      ? parseFloat(supplier.totalSourced)
      : supplierBatches.reduce((sum, b) => sum + (parseFloat(b.quantity) || 0), 0);

  const totalValue =
    supplier.grossProcuredValue !== undefined
      ? parseFloat(supplier.grossProcuredValue)
      : supplierBatches.reduce(
          (sum, b) =>
            sum +
            (parseFloat(b.totalCost) ||
              (parseFloat(b.quantity) || 0) * (parseFloat(b.ratePerLiter) || rate)),
          0
        );

  const totalPayout =
    supplier.totalPayout !== undefined
      ? parseFloat(supplier.totalPayout)
      : 0;

  const balanceDue =
    supplier.balanceDue !== undefined
      ? Math.max(0, Math.round(supplier.balanceDue))
      : Math.max(0, Math.round(totalValue - totalPayout));

  // Numeric payment validation in modal
  const numSettle = Math.max(0, parseFloat(settleAmount) || 0);
  const remainingDueAfterPayment = Math.max(0, balanceDue - numSettle);

  const handleSettleSubmit = (e) => {
    e.preventDefault();
    if (numSettle <= 0) {
      toast.error('Please enter a valid payment amount greater than 0.');
      return;
    }

    if (settleSupplierBalance) {
      settleSupplierBalance(supplier.id, numSettle);
    }

    toast.success(
      `Disbursed Rs. ${numSettle.toLocaleString()} to ${supplier.name}. Balance updated!`
    );
    setShowSettleModal(false);
    setSettleAmount('');
  };

  const initialLetter =
    supplier.name.replace(/Supplier\s+/i, '').charAt(0).toUpperCase() || 'S';

  return (
    <div className="space-y-4 animate-in fade-in duration-150 pb-8">
      {/* Top Header & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Suppliers
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
              Supplier Profile — {supplier.name}
            </h1>
            <p className="text-xs text-slate-500">
              Supplier ID: {supplier.id} • Route: {supplier.area || 'Direct Supply'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Settle Due Button: ONLY shown if balanceDue > 0; removed when balance is fully paid */}
          {balanceDue > 0 && (
            <button
              type="button"
              onClick={() => {
                setSettleAmount(String(balanceDue));
                setShowSettleModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-95"
            >
              <Wallet className="w-4 h-4" />
              <span>Settle Due (Rs. {balanceDue.toLocaleString()})</span>
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(supplier)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200/70 transition shadow-2xs cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Supplier
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-6">
        {/* Profile Hero Section */}
        <div className="bg-[#f8fafc] p-5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {supplier.image ? (
              <img
                src={supplier.image}
                alt={supplier.name}
                className="w-16 h-16 rounded-2xl object-cover shadow-xs border border-slate-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-2xl shadow-xs shrink-0 font-display">
                {initialLetter}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  {supplier.name}
                </h2>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-700">
                  {supplier.id}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-md border bg-slate-50 text-slate-700 border-slate-200">
                  {supplier.supplierType || 'Commercial Dairy Farm'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {supplier.status || 'Active'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Agreed Milk Rate
              </span>
              <span className="text-2xl font-black text-emerald-700 font-mono">
                Rs. {rate} / L
              </span>
            </div>
          </div>
        </div>

        {/* 4 Highlight Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/70">
            <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Droplets className="w-3.5 h-3.5" />
              Total Liters Procured
            </div>
            <p className="text-base font-black text-slate-900 font-mono">
              {totalLiters.toFixed(1)} L
            </p>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/70">
            <div className="flex items-center gap-1.5 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              Gross Procurement
            </div>
            <p className="text-base font-black text-slate-900 font-mono">
              Rs. {Math.round(totalValue).toLocaleString()}
            </p>
          </div>

          <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200/70">
            <div className="flex items-center gap-1.5 text-purple-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Total Amount Paid
            </div>
            <p className="text-base font-black text-slate-900 font-mono">
              Rs. {Math.round(totalPayout).toLocaleString()}
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border ${
              balanceDue > 0
                ? 'bg-amber-50/70 border-amber-200/80'
                : 'bg-slate-50/70 border-slate-200/70'
            }`}
          >
            <div
              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1 ${
                balanceDue > 0 ? 'text-amber-700' : 'text-slate-500'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              Balance Due
            </div>
            <p
              className={`text-base font-black font-mono ${
                balanceDue > 0 ? 'text-amber-700' : 'text-slate-700'
              }`}
            >
              Rs. {balanceDue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Contact & Location and Terms & Account Side by Side (Left to Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Card 1: Contact & Location */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 shadow-2xs">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-600">
              <Building2 className="w-4 h-4 text-slate-500" />
              Contact &amp; Location
            </h3>
            <div className="space-y-3 text-slate-700">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" /> Phone:
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {supplier.contact || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" /> Area / Route:
                </span>
                <span className="font-medium text-slate-800 text-sm">
                  {supplier.area || '—'}
                </span>
              </div>
              <div className="flex justify-between items-start pt-1">
                <span className="text-slate-500 shrink-0">Address:</span>
                <span className="text-slate-700 text-right pl-3 font-medium">
                  {supplier.address || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Terms & Account */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 shadow-2xs">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-600">
              <Tag className="w-4 h-4 text-slate-500" />
              Terms &amp; Account
            </h3>
            <div className="space-y-3 text-slate-700">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" /> Registration Date:
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {supplier.joinDate || new Date().toISOString().split('T')[0]}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Agreed Rate:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  Rs. {rate} / L
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Daily Expected:</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {supplier.avgLiters ? `${supplier.avgLiters} L/day` : '10 L/day'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Payment Terms:</span>
                <span className="font-bold text-slate-800 text-sm">
                  {supplier.paymentMethod || 'Direct Cash'}
                </span>
              </div>
              {supplier.accountNumber && (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-slate-400" /> Account:
                  </span>
                  <span className="font-mono font-black text-slate-800">
                    {supplier.accountNumber}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Procurement Batches Table (Placed Below Cards, Full Width) */}
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col space-y-4 shadow-2xs text-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-700">
              <Droplets className="w-4 h-4 text-emerald-600" />
              Recent Procurement Batches ({filteredBatches.length})
            </h3>

            {/* Shift Filter Controls: All / Morning / Evening */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setShiftFilter('All')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  shiftFilter === 'All'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({supplierBatches.length})
              </button>

              <button
                type="button"
                onClick={() => setShiftFilter('Morning')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  shiftFilter === 'Morning'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sun className="w-3 h-3 text-amber-300" />
                <span>Morning ({morningCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setShiftFilter('Evening')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  shiftFilter === 'Evening'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Moon className="w-3 h-3 text-indigo-200" />
                <span>Evening ({eveningCount})</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-2xs">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Date &amp; Shift</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Rate / L</th>
                  <th className="px-4 py-3">Total Value</th>
                  <th className="px-4 py-3">Quality Test</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400 font-medium">
                      No {shiftFilter !== 'All' ? shiftFilter.toLowerCase() : ''} intake logs recorded yet for this supplier.
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((batch) => {
                    const cost =
                      parseFloat(batch.totalCost) ||
                      (parseFloat(batch.quantity) || 0) * (parseFloat(batch.ratePerLiter) || rate);
                    const isMorn = batch.shift?.toLowerCase() === 'morning';

                    return (
                      <tr
                        key={batch.id}
                        onClick={() => setSelectedBatch(batch)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-slate-800">{batch.date}</span>
                          <span className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold mt-0.5">
                            {isMorn ? (
                              <Sun className="w-3 h-3 text-amber-500" />
                            ) : (
                              <Moon className="w-3 h-3 text-indigo-500" />
                            )}
                            {batch.shift} Shift
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-700 text-sm">
                          {batch.quantity} L
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600">
                          Rs. {batch.ratePerLiter || rate}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          Rs. {Math.round(cost).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                          Fat: {batch.fat || '4.5'}% • LR: {batch.lr || '28'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              batch.settlement === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : batch.settlement === 'Partial'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {batch.settlement || 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 group-hover:underline">
                            View Slip <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Settle Due Balance Modal (Supports Exact Partial & Full Payments) */}
      {showSettleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setShowSettleModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-display">
                    Settle Supplier Due
                  </h2>
                  <p className="text-xs text-slate-500">
                    {supplier.name} ({supplier.id})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSettleModal(false)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="p-6 space-y-4">
              {/* Outstanding Due Highlight Banner */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                    Current Balance Due
                  </span>
                  <p className="text-lg font-black text-amber-950 font-mono">
                    Rs. {balanceDue.toLocaleString()}
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200">
                  Unpaid
                </span>
              </div>

              {/* Quick Select Buttons */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quick Amount Selection
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettleAmount(String(balanceDue))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      numSettle === balanceDue
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pay Full: Rs. {balanceDue.toLocaleString()}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettleAmount(String(Math.round(balanceDue / 2)))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      numSettle === Math.round(balanceDue / 2)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Pay Half: Rs. {Math.round(balanceDue / 2).toLocaleString()}</span>
                  </button>
                </div>
              </div>

              {/* Payment Amount Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Amount Paying Now (Rs.) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    PKR
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    max={balanceDue}
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full h-11 pl-13 pr-3.5 rounded-xl border border-slate-200 text-base font-black text-slate-900 bg-white outline-none focus:border-emerald-600 shadow-2xs font-mono"
                  />
                </div>
              </div>

              {/* Live Settlement Breakdown */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Balance Before:</span>
                  <span>Rs. {balanceDue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Paying Now:</span>
                  <span>- Rs. {numSettle.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold">
                  <span className="text-slate-800">Remaining Due:</span>
                  <span
                    className={
                      remainingDueAfterPayment > 0
                        ? 'text-amber-700 font-black'
                        : 'text-emerald-700 font-black'
                    }
                  >
                    Rs. {remainingDueAfterPayment.toLocaleString()}
                    {remainingDueAfterPayment === 0 && ' (Cleared!)'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Confirm &amp; Pay Rs. {numSettle.toLocaleString()}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Batch Slip Modal */}
      {selectedBatch && (
        <IntakeDetail
          item={selectedBatch}
          onClose={() => setSelectedBatch(null)}
          onEdit={() => setSelectedBatch(null)}
        />
      )}
    </div>
  );
}
