import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Droplets,
  Save,
  Calculator,
  AlertCircle,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSupplierContext } from '@/context/SupplierContext';
import { Button } from '@/components/ui/button';

/**
 * LogIntakeForm Component
 * Full-Space Form component jo main content area (right side of app sidebar) ko
 * 100% space mein utilize karta hai. No narrow popup drawers.
 */
export default function LogIntakeForm({ onCancel, editItem = null }) {
  const { addIntake, updateIntake } = useIntakeContext();
  const { suppliers = [] } = useSupplierContext();

  const [formData, setFormData] = useState({
    supplierId: '',
    supplierName: '',
    area: '',
    date: new Date().toISOString().split('T')[0],
    shift: 'Morning',
    quantity: '',
    ratePerLiter: '228',
    fat: '4.5',
    lr: '28.5',
    settlement: 'Pending',
    receivedBy: 'Farhan (Lab Incharge)',
    notes: '',
  });

  // Prepopulate when editItem changes or on initial mount
  useEffect(() => {
    if (editItem) {
      setFormData({
        supplierId: editItem.supplierId || '',
        supplierName: editItem.supplierName || '',
        area: editItem.area || '',
        date: editItem.date || new Date().toISOString().split('T')[0],
        shift: editItem.shift || 'Morning',
        quantity: editItem.quantity !== undefined ? String(editItem.quantity) : '',
        ratePerLiter: editItem.ratePerLiter !== undefined ? String(editItem.ratePerLiter) : '228',
        fat: editItem.fat !== undefined ? String(editItem.fat) : '4.5',
        lr: editItem.lr !== undefined ? String(editItem.lr) : '28.5',
        settlement: editItem.settlement || 'Pending',
        receivedBy: editItem.receivedBy || 'Farhan (Lab Incharge)',
        notes: editItem.notes || '',
      });
    } else {
      const firstSupplier = suppliers.find((s) => s.status === 'Active') || suppliers[0];
      setFormData({
        supplierId: firstSupplier ? firstSupplier.id : '',
        supplierName: firstSupplier ? firstSupplier.name : '',
        area: firstSupplier ? firstSupplier.area : '',
        date: new Date().toISOString().split('T')[0],
        shift: 'Morning',
        quantity: '',
        ratePerLiter: firstSupplier && firstSupplier.ratePerLiter ? String(firstSupplier.ratePerLiter) : '228',
        fat: '4.5',
        lr: '28.5',
        settlement: 'Pending',
        receivedBy: 'Farhan (Lab Incharge)',
        notes: '',
      });
    }
  }, [editItem, suppliers]);

  // Handle supplier dropdown selection
  const handleSupplierChange = (e) => {
    const chosenId = e.target.value;
    const matched = suppliers.find((s) => s.id === chosenId);
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        supplierId: matched.id,
        supplierName: matched.name,
        area: matched.area || '',
        ratePerLiter: matched.ratePerLiter ? String(matched.ratePerLiter) : prev.ratePerLiter,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        supplierId: chosenId,
        supplierName: chosenId,
      }));
    }
  };

  const qty = parseFloat(formData.quantity) || 0;
  const rate = parseFloat(formData.ratePerLiter) || 0;
  const totalPurchaseCost = qty * rate;

  const fatVal = parseFloat(formData.fat) || 0;
  const lrVal = parseFloat(formData.lr) || 0;
  const snfPreview = ((lrVal / 4) + (0.25 * fatVal) + 0.35).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.supplierName) {
      alert('Please select or specify a supplier.');
      return;
    }
    if (qty <= 0) {
      alert('Please enter a valid milk quantity in liters.');
      return;
    }

    if (editItem) {
      updateIntake(editItem.id, formData);
    } else {
      addIntake(formData);
    }

    if (onCancel) onCancel();
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Header Bar with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-[38px] px-3.5 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back to Intake Register</span>
          </Button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-600" />
              <span>{editItem ? `Edit Milk Intake Slip (#${editItem.id})` : 'Log Single Milk Intake'}</span>
            </h2>
            <p className="text-xs text-slate-500">
              Record collection volume, Gerber lab test quality, and supplier procurement rate
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-[38px] px-4 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            className="h-[38px] px-6 rounded-full text-xs font-semibold text-white shadow-xs flex items-center gap-1.5 cursor-pointer hover:brightness-110"
            style={{ backgroundColor: '#009966' }}
          >
            <Save className="w-4 h-4" />
            <span>{editItem ? 'Update Intake Slip' : 'Save Intake Slip'}</span>
          </Button>
        </div>
      </div>

      {/* 2. Full Space Multi-Column Form Body */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Supplier & Session Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800 font-bold text-sm font-display">
              <User className="w-4 h-4 text-blue-600" />
              <span>Supplier &amp; Intake Details</span>
            </div>

            {/* Select Supplier */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Registered Supplier *
              </label>
              {suppliers.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>No suppliers in directory yet. Please add a supplier in Supplier Directory first.</span>
                </div>
              ) : (
                <select
                  required
                  value={formData.supplierId}
                  onChange={handleSupplierChange}
                  className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white outline-none focus:border-blue-600 transition-colors shadow-2xs cursor-pointer"
                >
                  <option value="" disabled>
                    -- Select Registered Supplier from Directory --
                  </option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id}) • Route: {s.area} • Agreed: Rs. {s.ratePerLiter}/L
                    </option>
                  ))}
                </select>
              )}
              {formData.area && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Collection Route: <strong className="text-slate-700">{formData.area}</strong>
                </p>
              )}
            </div>

            {/* Date & Shift Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Intake Date *
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 h-[42px]">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-transparent border-none outline-none text-xs font-medium text-slate-900 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Collection Shift *
                </label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  className="w-full h-[42px] px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white outline-none focus:border-blue-600 shadow-2xs"
                >
                  <option value="Morning">Morning Shift (Early)</option>
                  <option value="Evening">Evening Shift (Dusk)</option>
                </select>
              </div>
            </div>

            {/* Quantity & Agreed Rate Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Delivered Quantity (Liters) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  required
                  placeholder="e.g. 50"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 text-base font-black text-slate-900 outline-none focus:border-blue-600 shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Agreed Rate (Rs. / Liter) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  placeholder="e.g. 230"
                  value={formData.ratePerLiter}
                  onChange={(e) => setFormData({ ...formData, ratePerLiter: e.target.value })}
                  className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 text-base font-bold text-slate-900 outline-none focus:border-blue-600 shadow-2xs"
                />
              </div>
            </div>

            {/* Receiver & Observations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Received &amp; Tested By
                </label>
                <input
                  type="text"
                  placeholder="Staff receiver name"
                  value={formData.receivedBy}
                  onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                  className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Settlement Status
                </label>
                <select
                  value={formData.settlement}
                  onChange={(e) => setFormData({ ...formData, settlement: e.target.value })}
                  className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white outline-none focus:border-blue-600"
                >
                  <option value="Pending">Pending Clearance</option>
                  <option value="Paid">Paid in Full</option>
                  <option value="Partial">Partially Settled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Remarks / Visual Milk Observations
              </label>
              <textarea
                rows={2}
                placeholder="Optional notes regarding milk temperature, visual color, purity, or gate remarks..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Quality Inspection & Live Financial Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quality Inspection Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-slate-800 font-bold text-sm font-display">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Gerber Lab Quality Testing</span>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                Laboratory Tests
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Fat % Input */}
              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1.5">
                <label className="block font-bold text-blue-900 uppercase tracking-wider text-[10px]">
                  Fat % (Gerber Test) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 4.8"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                  className="w-full h-[40px] px-3 rounded-xl border border-blue-200 text-base font-black text-blue-700 bg-white outline-none focus:border-blue-600 tabular"
                />
                <span className="text-[10px] text-blue-600/80 block">Standard: 3.5% - 7.5%</span>
              </div>

              {/* LR Reading Input */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  LR Reading (Lactometer) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  placeholder="e.g. 29.0"
                  value={formData.lr}
                  onChange={(e) => setFormData({ ...formData, lr: e.target.value })}
                  className="w-full h-[40px] px-3 rounded-xl border border-slate-200 text-base font-black text-slate-800 bg-white outline-none focus:border-blue-600 tabular"
                />
                <span className="text-[10px] text-slate-500 block">Density reading at 20°C</span>
              </div>
            </div>

            {/* Live Auto-Calculated SNF Indicator */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                  Calculated Solids Not Fat (SNF)
                </span>
                <span className="text-[11px] text-indigo-600">Formula: (LR ÷ 4) + (0.25 × Fat) + 0.35</span>
              </div>
              <span className="text-xl font-black text-indigo-900 font-display tabular">
                {snfPreview}%
              </span>
            </div>
          </div>

          {/* Dynamic Live Cost Summary Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-white border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Purchase Cost Calculation</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Entered Volume:</span>
                <strong className="text-slate-900 font-mono">{qty.toFixed(1)} Liters</strong>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Agreed Unit Price:</span>
                <strong className="text-slate-900 font-mono">Rs. {rate.toFixed(2)} / L</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block">
                  Total Payable Amount
                </span>
                <span className="text-xs text-emerald-600 font-medium">
                  {qty > 0 && rate > 0 ? `${qty} L × Rs. ${rate}/L` : 'Fill quantity and rate'}
                </span>
              </div>
              <p className="text-2xl font-black text-emerald-800 font-display tabular tracking-tight">
                Rs. {totalPurchaseCost.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Bottom Direct Submission Button */}
          <Button
            type="submit"
            className="w-full h-[46px] rounded-2xl text-sm font-bold text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:brightness-110"
            style={{ backgroundColor: '#009966' }}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{editItem ? 'Update & Save Changes' : 'Confirm & Save Intake Slip'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
