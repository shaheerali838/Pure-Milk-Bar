import React, { useState } from 'react';
import {
  Phone,
  MapPin,
  Edit2,
  CheckCircle2,
  Clock,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSupplierContext } from '@/context/SupplierContext';
import IntakeDetail from '../intakeRegistor/IntakeDetail';

/**
 * SupplierDetail Component
 * Matches the user-provided reference layout exactly:
 * 1. Top Breadcrumb: Supplier Directory > Supplier A (Ahmad Farms)
 * 2. Header Profile Card with Avatar initial circle, Name, Contact, Address, Active badge, and Edit Vendor button
 * 3. 3 Metric Cards: Total Liters Procured, Total Procurement Value, Agreed Rate / Liter
 * 4. Recent Procurement Batches table with columns: DATE, SHIFT, QUANTITY (L), RATE / LITER, TOTAL VALUE, QUALITY TEST, PAYMENT STATUS
 */
export default function SupplierDetail({ supplier, onBack, onEdit }) {
  const { intakeLogs = [], updateBatchSettlement } = useIntakeContext();
  const { settleSupplierBalance } = useSupplierContext();
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showSettleModal, setShowSettleModal] = useState(false);

  if (!supplier) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        <p className="text-sm font-bold text-slate-700">No supplier profile selected.</p>
        <Button variant="outline" onClick={onBack} className="mt-3 rounded-full">
          Go Back
        </Button>
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

  const rate = parseFloat(supplier.ratePerLiter) || 230;

  // Calculate totals from batches, or fall back to supplier profile recorded stats
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

  // Avatar initial letter (e.g. 'S' or first letter of name)
  const initialLetter =
    supplier.name.replace(/Supplier\s+/i, '').charAt(0).toUpperCase() || 'S';

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Top Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs">
        <button
          type="button"
          onClick={onBack}
          className="font-bold text-[#009966] hover:underline cursor-pointer flex items-center gap-1 transition-colors"
        >
          Supplier Directory
        </button>
        <span className="text-slate-400">&gt;</span>
        <span className="text-slate-600 font-medium">{supplier.name}</span>
      </div>

      {/* 2. Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Avatar + Title + Contact Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-[#155dfc] flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
            {initialLetter}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              {supplier.name}
            </h2>
            <div className="flex items-center gap-2.5 text-xs text-slate-500 mt-1 flex-wrap font-medium">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{supplier.contact || '0300-1234567'}</span>
              </div>
              <span className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{supplier.address || supplier.area || 'Okara Road, Sahiwal'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Rate Badge + Active Badge + Edit Vendor Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Rate: Rs. {rate} / L
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
            {supplier.status || 'Active'}
          </span>

          <button
            type="button"
            onClick={() => onEdit && onEdit(supplier)}
            className="px-4 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Vendor</span>
          </button>
        </div>
      </div>

      {/* 3. Metric Cards Row (Total Liters, Gross Value, Total Payout, Balance Due) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Liters Procured */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block mb-1.5">
            Total Liters Procured
          </span>
          <div className="text-2xl font-black text-slate-900 font-display tabular">
            {totalLiters.toLocaleString()}{' '}
            <span className="text-base font-bold text-slate-700">L</span>
          </div>
        </div>

        {/* Card 2: Total Procurement Value */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block mb-1.5">
            Total Procurement Value
          </span>
          <div className="text-2xl font-black text-[#9333ea] font-display tabular">
            Rs. {Math.round(totalValue).toLocaleString()}
          </div>
        </div>

        {/* Card 3: Total Payout Disbursed */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block mb-1.5">
            Total Payout (Paid)
          </span>
          <div className="text-2xl font-black text-emerald-600 font-display tabular">
            Rs. {Math.round(totalPayout).toLocaleString()}
          </div>
        </div>

        {/* Card 4: Balance Due (Pending) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-500 font-medium">
                Balance Due (Pending)
              </span>
              {balanceDue > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSettleModal(true)}
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 hover:bg-emerald-600 hover:text-white border border-amber-200 transition-all cursor-pointer shadow-2xs"
                >
                  Settle Balance
                </button>
              )}
            </div>
            <div
              className={`text-2xl font-black font-display tabular ${
                balanceDue > 0 ? 'text-amber-600' : 'text-slate-400'
              }`}
            >
              Rs. {balanceDue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Procurement Batches Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 font-display">
            Recent Procurement Batches ({supplier.name})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">DATE</th>
                <th className="px-4 py-3.5">SHIFT</th>
                <th className="px-4 py-3.5 text-center">QUANTITY (L)</th>
                <th className="px-4 py-3.5 text-center">RATE / LITER</th>
                <th className="px-4 py-3.5 text-right">TOTAL VALUE</th>
                <th className="px-4 py-3.5 text-center">QUALITY TEST</th>
                <th className="px-5 py-3.5 text-right">
                  PAYMENT <span className="text-emerald-600 font-bold">STATUS</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {supplierBatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-xs">
                    No procurement batches recorded yet for this supplier.
                  </td>
                </tr>
              ) : (
                supplierBatches.map((batch) => {
                  const qty = parseFloat(batch.quantity) || 0;
                  const bRate = parseFloat(batch.ratePerLiter) || rate;
                  const cost = parseFloat(batch.totalCost) || qty * bRate;

                  return (
                    <tr
                      key={batch.id}
                      onClick={() => setSelectedBatch(batch)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      {/* DATE */}
                      <td className="px-5 py-3.5 font-medium text-slate-800 tabular">
                        {batch.date}
                      </td>

                      {/* SHIFT */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            batch.shift === 'Morning'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {batch.shift}
                        </span>
                      </td>

                      {/* QUANTITY (L) */}
                      <td className="px-4 py-3.5 text-center font-bold text-slate-900 tabular">
                        {qty.toFixed(1)} L
                      </td>

                      {/* RATE / LITER */}
                      <td className="px-4 py-3.5 text-center font-medium text-slate-700 tabular">
                        Rs. {bRate} / L
                      </td>

                      {/* TOTAL VALUE */}
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900 tabular">
                        Rs. {cost.toLocaleString()}
                      </td>

                      {/* QUALITY TEST */}
                      <td className="px-4 py-3.5 text-center text-xs text-slate-600">
                        {batch.fat ? (
                          <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            Fat: {batch.fat}% · LR: {batch.lr || '28.5'}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">Passed</span>
                        )}
                      </td>

                      {/* PAYMENT STATUS */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (updateBatchSettlement) {
                              updateBatchSettlement(
                                batch.id,
                                batch.settlement === 'Paid' ? 'Pending' : 'Paid'
                              );
                            }
                          }}
                          title="Click to toggle settlement status"
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer shadow-2xs hover:scale-105 ${
                            batch.settlement === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {batch.settlement === 'Paid' ? (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {batch.settlement || 'Pending'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settle Balance Confirmation Modal */}
      {showSettleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 font-display">
              Settle Outstanding Balance?
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Disburse full payment of{' '}
              <span className="font-bold text-slate-900">
                Rs. {balanceDue.toLocaleString()}
              </span>{' '}
              to <span className="font-bold text-slate-900">{supplier.name}</span>.
              This will mark all their pending intake slips as settled and increase Total Payouts.
            </p>

            <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSettleModal(false)}
                className="px-3.5 h-[34px] rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  settleSupplierBalance(supplier.id);
                  setShowSettleModal(false);
                }}
                className="px-4 h-[34px] rounded-full text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
              >
                Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Intake Batch Detail Modal */}
      {selectedBatch && (
        <IntakeDetail
          item={selectedBatch}
          onClose={() => setSelectedBatch(null)}
        />
      )}
    </div>
  );
}
