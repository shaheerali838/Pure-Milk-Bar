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
} from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSupplierContext } from '@/context/SupplierContext';
import IntakeDetail from '../intakeRegistor/IntakeDetail';

export default function SupplierDetail({ supplier, onBack, onEdit }) {
  const { intakeLogs = [], updateBatchSettlement } = useIntakeContext();
  const { settleSupplierBalance } = useSupplierContext();
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleAmount, setSettleAmount] = useState('');

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
        b.supplierName.toLowerCase().includes(supplier.name.toLowerCase()))
  );

  const rate = parseFloat(supplier.ratePerLiter) || 228;

  // Calculate totals
  const batchesLiters = supplierBatches.reduce(
    (sum, b) => sum + (parseFloat(b.quantity) || 0),
    0
  );
  const totalLiters =
    batchesLiters > 0 ? batchesLiters : parseFloat(supplier.totalSourced) || 0;

  const batchesGrossValue = supplierBatches.reduce(
    (sum, b) =>
      sum +
      (parseFloat(b.totalCost) ||
        (parseFloat(b.quantity) || 0) * (parseFloat(b.ratePerLiter) || rate)),
    0
  );
  const totalValue =
    batchesGrossValue > 0
      ? batchesGrossValue
      : parseFloat(supplier.grossProcuredValue) || totalLiters * rate;

  const batchesPaidValue = supplierBatches.reduce((sum, b) => {
    const cost =
      parseFloat(b.totalCost) ||
      (parseFloat(b.quantity) || 0) * (parseFloat(b.ratePerLiter) || rate);
    if (b.settlement === 'Paid') return sum + cost;
    if (b.settlement === 'Partial') return sum + cost * 0.5;
    return sum;
  }, 0);

  const totalPayout =
    supplierBatches.length > 0
      ? batchesPaidValue
      : parseFloat(supplier.totalPayout) || 0;

  const balanceDue = Math.max(0, Math.round(totalValue - totalPayout));

  const handleSettleSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(settleAmount) || balanceDue;
    if (amt <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }
    if (settleSupplierBalance) {
      settleSupplierBalance(supplier.id, amt);
    }
    setShowSettleModal(false);
    setSettleAmount('');
  };

  const initialLetter =
    supplier.name.replace(/Supplier\s+/i, '').charAt(0).toUpperCase() || 'S';

  return (
    <div className="space-y-4 animate-in fade-in duration-150 pb-8">
      {/* Top action & header bar - EXACT StaffDetail / AnimalDetail match */}
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
          {balanceDue > 0 && (
            <button
              type="button"
              onClick={() => {
                setSettleAmount(String(balanceDue));
                setShowSettleModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              Settle Due (Rs. {balanceDue.toLocaleString()})
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(supplier)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200/70 transition shadow-2xs cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Supplier
            </button>
          )}
        </div>
      </div>

      {/* Main Details Card Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        {/* Profile Hero Section */}
        <div className="bg-[#f8fafc] p-5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-2xl shadow-xs shrink-0 font-display">
              {initialLetter}
            </div>
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

          <div className={`p-4 rounded-xl border ${balanceDue > 0 ? 'bg-amber-50/70 border-amber-200/80' : 'bg-slate-50/70 border-slate-200/70'}`}>
            <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1 ${balanceDue > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
              <Wallet className="w-3.5 h-3.5" />
              Balance Due
            </div>
            <p className={`text-base font-black font-mono ${balanceDue > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
              Rs. {balanceDue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Breakdown & Batch History Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Left Column: Vendor Details (1 col) */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-600">
                <Building2 className="w-4 h-4 text-slate-500" />
                Contact &amp; Location
              </h3>
              <div className="space-y-2.5 divide-y divide-slate-200/60 text-slate-700">
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone:
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {supplier.contact || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Area:
                  </span>
                  <span className="font-medium text-slate-800">
                    {supplier.area || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-start pt-2">
                  <span className="text-slate-500 shrink-0">Address:</span>
                  <span className="text-slate-700 text-right pl-3">
                    {supplier.address || '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-600">
                <Tag className="w-4 h-4 text-slate-500" />
                Terms &amp; Account
              </h3>
              <div className="space-y-2.5 divide-y divide-slate-200/60 text-slate-700">
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-slate-500">Agreed Rate:</span>
                  <span className="font-mono font-bold text-slate-900">
                    Rs. {rate} / L
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500">Daily Expected:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {supplier.avgLiters ? `${supplier.avgLiters} L/day` : '10 L/day'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500">Payment Terms:</span>
                  <span className="font-medium text-slate-800">
                    {supplier.paymentMethod || 'Direct Cash'}
                  </span>
                </div>
                {supplier.accountNumber && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-500 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Account:
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {supplier.accountNumber}
                    </span>
                  </div>
                )}
                {supplier.notes && (
                  <div className="flex justify-between items-start pt-2">
                    <span className="text-slate-500 shrink-0">Notes:</span>
                    <span className="text-slate-700 text-right pl-3">
                      {supplier.notes}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Procurement Batches Table (2 cols) */}
          <div className="md:col-span-2 p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-600">
                  <Droplets className="w-4 h-4 text-[#009966]" />
                  Recent Procurement Batches ({supplierBatches.length})
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-2xs">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-3.5 py-2.5">Date &amp; Shift</th>
                    <th className="px-3.5 py-2.5">Quantity</th>
                    <th className="px-3.5 py-2.5">Rate / L</th>
                    <th className="px-3.5 py-2.5">Total Value</th>
                    <th className="px-3.5 py-2.5">Quality Test</th>
                    <th className="px-3.5 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {supplierBatches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No intake logs recorded yet for this supplier.
                      </td>
                    </tr>
                  ) : (
                    supplierBatches.slice(0, 10).map((batch) => {
                      const cost =
                        parseFloat(batch.totalCost) ||
                        (parseFloat(batch.quantity) || 0) * (parseFloat(batch.ratePerLiter) || rate);
                      return (
                        <tr
                          key={batch.id}
                          onClick={() => setSelectedBatch(batch)}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="px-3.5 py-2.5">
                            <span className="font-mono font-bold text-slate-800">{batch.date}</span>
                            <span className="block text-[10px] text-slate-400">{batch.shift}</span>
                          </td>
                          <td className="px-3.5 py-2.5 font-mono font-bold text-emerald-700">
                            {batch.quantity} L
                          </td>
                          <td className="px-3.5 py-2.5 font-mono text-slate-600">
                            Rs. {batch.ratePerLiter || rate}
                          </td>
                          <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900">
                            Rs. {Math.round(cost).toLocaleString()}
                          </td>
                          <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-600">
                            Fat: {batch.fat || '4.5'}% • LR: {batch.lr || '28'}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Settle Due Balance Modal */}
      {showSettleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 font-display">
                Settle Balance with {supplier.name}
              </h2>
              <button
                type="button"
                onClick={() => setShowSettleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSettleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Current Outstanding Due
                </label>
                <p className="text-xl font-black text-amber-700 font-mono">
                  Rs. {balanceDue.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Amount to Pay (Rs.)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={balanceDue}
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-bold font-mono focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] transition"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Detail Popup */}
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
