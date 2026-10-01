import React, { useState } from 'react';
import { Layers, X, Droplets, AlertCircle, ArrowLeft, Check, Milk } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDahiContext } from '@/context/DahiContext';

export default function AddDahiBatchModal({ onClose, onAddBatch }) {
  const { metrics = {} } = useDahiContext();

  const availFarm = Number(metrics.remainingFarmMilk ?? metrics.farmSourced ?? 0);
  const availSupplier = Number(metrics.remainingSupplierMilk ?? metrics.supplierSourced ?? 0);
  const availTotal = Number(metrics.remainingTotalMilk ?? (availFarm + availSupplier).toFixed(1));

  const [formData, setFormData] = useState({
    product: 'Fresh Dahi (Plain)',
    source: 'Both (Mixed)',
    milkUsed: '',
    farmMilkUsed: '',
    supplierMilkUsed: '',
    output: '',
    date: new Date().toISOString().split('T')[0],
    status: 'In Progress',
    posRate: 'Rs. 320 / kg',
  });

  // Maximum allowed for current source
  const currentMax =
    formData.source === 'Farm Milk'
      ? availFarm
      : formData.source === 'Supplier Milk'
        ? availSupplier
        : availTotal;

  const currentEntered = parseFloat(formData.milkUsed) || 0;
  const isOverLimit = currentEntered > currentMax && currentMax > 0;

  const handleSourceChange = (newSource) => {
    const total = parseFloat(formData.milkUsed) || 0;
    let fVal = '0';
    let sVal = '0';

    if (newSource === 'Farm Milk') {
      fVal = String(total);
      sVal = '0';
    } else if (newSource === 'Supplier Milk') {
      fVal = '0';
      sVal = String(total);
    } else {
      // Both (Mixed)
      const sumAvail = availFarm + availSupplier;
      const fPortion = sumAvail > 0 ? Math.round(total * (availFarm / sumAvail)) : Math.round(total / 2);
      fVal = String(fPortion);
      sVal = String(Math.max(0, total - fPortion));
    }

    setFormData({
      ...formData,
      source: newSource,
      farmMilkUsed: fVal,
      supplierMilkUsed: sVal,
    });
  };

  const handleTotalMilkChange = (newTotal) => {
    const num = parseFloat(newTotal) || 0;
    const estOutput = (num * 0.985).toFixed(1);

    if (formData.source === 'Farm Milk') {
      setFormData({
        ...formData,
        milkUsed: newTotal,
        farmMilkUsed: String(num),
        supplierMilkUsed: '0',
        output: estOutput,
      });
    } else if (formData.source === 'Supplier Milk') {
      setFormData({
        ...formData,
        milkUsed: newTotal,
        farmMilkUsed: '0',
        supplierMilkUsed: String(num),
        output: estOutput,
      });
    } else {
      const sumAvail = availFarm + availSupplier;
      const fPortion = sumAvail > 0 ? Math.round(num * (availFarm / sumAvail)) : Math.round(num / 2);
      setFormData({
        ...formData,
        milkUsed: newTotal,
        farmMilkUsed: String(fPortion),
        supplierMilkUsed: String(Math.max(0, num - fPortion)),
        output: estOutput,
      });
    }
  };

  const handleFarmPortionChange = (newFarm) => {
    const fVal = parseFloat(newFarm) || 0;
    const sVal = parseFloat(formData.supplierMilkUsed) || 0;
    const total = fVal + sVal;
    const estOutput = (total * 0.985).toFixed(1);

    setFormData({
      ...formData,
      farmMilkUsed: newFarm,
      milkUsed: total > 0 ? String(total) : '',
      output: estOutput,
    });
  };

  const handleSupplierPortionChange = (newSupplier) => {
    const fVal = parseFloat(formData.farmMilkUsed) || 0;
    const sVal = parseFloat(newSupplier) || 0;
    const total = fVal + sVal;
    const estOutput = (total * 0.985).toFixed(1);

    setFormData({
      ...formData,
      supplierMilkUsed: newSupplier,
      milkUsed: total > 0 ? String(total) : '',
      output: estOutput,
    });
  };

  const handleSetMax = () => {
    handleTotalMilkChange(String(currentMax));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const rawVal = parseFloat(formData.milkUsed) || 0;
    if (rawVal <= 0) return;

    if (currentMax > 0 && rawVal > currentMax) {
      alert(`Entered milk (${rawVal} kg) exceeds current available ${formData.source} (${currentMax} kg).`);
      return;
    }

    const farmPortion = formData.source === 'Farm Milk' 
      ? rawVal 
      : formData.source === 'Supplier Milk' 
        ? 0 
        : (parseFloat(formData.farmMilkUsed) || 0);
    const supPortion = formData.source === 'Supplier Milk' 
      ? rawVal 
      : formData.source === 'Farm Milk' 
        ? 0 
        : (parseFloat(formData.supplierMilkUsed) || 0);

    const totalUsed = farmPortion + supPortion || rawVal;
    let farmRatio = 1;
    let supplierRatio = 0;
    if (formData.source === 'Farm Milk') {
      farmRatio = 1;
      supplierRatio = 0;
    } else if (formData.source === 'Supplier Milk') {
      farmRatio = 0;
      supplierRatio = 1;
    } else {
      farmRatio = totalUsed > 0 ? Number((farmPortion / totalUsed).toFixed(4)) : 0.5;
      supplierRatio = totalUsed > 0 ? Number((supPortion / totalUsed).toFixed(4)) : 0.5;
    }

    onAddBatch({
      ...formData,
      milkUsed: `${rawVal} kg (${formData.source === 'Farm Milk' ? 'Farm' : formData.source === 'Supplier Milk' ? 'Supplier' : 'Mixed'})`,
      milkUsedVal: rawVal,
      farmMilkUsed: farmPortion,
      supplierMilkUsed: supPortion,
      farmRatio,
      supplierRatio,
      output: formData.output ? `${formData.output} kg` : `${(rawVal * 0.985).toFixed(1)} kg`,
      outputVal: parseFloat(formData.output) || Number((rawVal * 0.985).toFixed(1)),
      fat: '4.5%',
    });

    onClose();
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-150 no-scrollbar">
      {/* Top action & header bar */}
      <div className="flex items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dahi Pipeline
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight font-display leading-tight">
              Record New Dahi Batch
            </h1>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          New Batch
        </span>
      </div>

      {/* Main form container */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs no-scrollbar">
        {/* Live Available Liquid Milk Card */}
        <div className="mb-4 p-3 rounded-xl bg-linear-to-r from-slate-50 via-emerald-50/20 to-blue-50/30 border border-slate-200/90 text-xs space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
              <Droplets className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Total Available Liquid Milk:</span>
            </div>
            <span className="text-base font-black text-slate-900 tabular">
              {availTotal} <span className="text-xs font-bold text-slate-600">kg</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-[11.5px] pt-1.5 border-t border-slate-200/60 font-semibold">
            <span className="text-emerald-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Farm: <strong className="font-black text-emerald-800 ml-0.5">{availFarm} kg</strong>
            </span>
            <span className="text-slate-300 font-bold">·</span>
            <span className="text-blue-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Supplier: <strong className="font-black text-blue-800 ml-0.5">{availSupplier} kg</strong>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Section 1: Batch Details */}
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2.5">
              <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                1. Batch Details & Sourcing
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dahi Product Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.product}
                  onChange={(e) => {
                    const prod = e.target.value;
                    let defaultRate = 'Rs. 320 / kg';
                    if (prod.includes('Sweet Dahi')) defaultRate = 'Rs. 360 / kg';
                    else if (prod.includes('Matka Dahi')) defaultRate = 'Rs. 380 / kg';
                    else if (prod.includes('Low-Fat')) defaultRate = 'Rs. 300 / kg';
                    else if (prod.includes('Special Thick')) defaultRate = 'Rs. 350 / kg';
                    setFormData({ ...formData, product: prod, posRate: defaultRate });
                  }}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50 focus:bg-white font-medium cursor-pointer"
                >
                  <option value="Fresh Dahi (Plain)">Fresh Dahi (Plain)</option>
                  <option value="Sweet Dahi (Meetha)">Sweet Dahi (Meetha)</option>
                  <option value="Matka Dahi (Clay Pot)">Matka Dahi (Clay Pot)</option>
                  <option value="Low-Fat / Skimmed Dahi">Low-Fat / Skimmed Dahi</option>
                  <option value="Special Thick Dahi (Malai)">Special Thick Dahi (Malai)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Milk Sourcing <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10.5px] font-semibold text-slate-500">
                    Avail: <strong className="text-slate-900 font-bold">{currentMax} kg</strong>
                  </span>
                </div>
                <select
                  value={formData.source}
                  onChange={(e) => handleSourceChange(e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50 focus:bg-white font-medium cursor-pointer"
                >
                  <option value="Both (Mixed)">Both (Mixed) — Farm + Supplier ({availTotal} kg total)</option>
                  <option value="Farm Milk">Farm Milk (Only Farm P&amp;L — {availFarm} kg available)</option>
                  <option value="Supplier Milk">Supplier Milk (Only Supplier P&amp;L — {availSupplier} kg available)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Input & Output */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2.5">
              <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                <Milk className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                2. Input Volume & Breakdown
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Total Milk Input (kg/L) <span className="text-rose-500">*</span>
                  </label>
                  {currentMax > 0 && (
                    <button
                      type="button"
                      onClick={handleSetMax}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 cursor-pointer transition-colors"
                    >
                      Use Max ({currentMax} kg)
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  step="0.5"
                  required
                  min="0.5"
                  placeholder={`e.g. ${currentMax > 0 ? Math.min(20, currentMax) : 20}`}
                  value={formData.milkUsed}
                  onChange={(e) => handleTotalMilkChange(e.target.value)}
                  className={`w-full h-9 px-3 text-xs border rounded-xl focus:outline-none focus:ring-1 font-medium bg-slate-50 focus:bg-white ${
                    isOverLimit
                      ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-emerald-500'
                  }`}
                />
                {isOverLimit && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Input exceeds available {formData.source} limit of {currentMax} kg
                  </p>
                )}
                {formData.source === 'Farm Milk' && (
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                    ✓ 100% Sales &amp; Calculations will go strictly to <strong>Farm P&amp;L</strong>
                  </p>
                )}
                {formData.source === 'Supplier Milk' && (
                  <p className="text-[11px] text-blue-700 font-semibold mt-1">
                    ✓ 100% Sales &amp; Calculations will go strictly to <strong>Supplier P&amp;L</strong>
                  </p>
                )}
              </div>

              {/* If mixed, breakout inputs */}
              {formData.source === 'Both (Mixed)' || formData.source === 'Farm & Supplier Mix' ? (
                <div className="p-2.5 bg-slate-50/90 border border-slate-200/90 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700">Enter Exact Liter Ratio:</span>
                    {parseFloat(formData.milkUsed) > 0 && (
                      <span className="font-bold text-emerald-700 text-[10.5px]">
                        Farm: {Math.round(((parseFloat(formData.farmMilkUsed) || 0) / (parseFloat(formData.milkUsed) || 1)) * 100)}% | 
                        Supplier: {Math.round(((parseFloat(formData.supplierMilkUsed) || 0) / (parseFloat(formData.milkUsed) || 1)) * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10.5px] font-bold text-emerald-800 uppercase tracking-wider mb-0.5">
                        Farm Milk (L)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-400 font-bold text-[10px]">
                          kg
                        </span>
                        <input
                          type="number"
                          step="0.5"
                          required
                          value={formData.farmMilkUsed}
                          onChange={(e) => handleFarmPortionChange(e.target.value)}
                          className="w-full h-8 pl-2 pr-6 text-xs border border-emerald-300 rounded-lg bg-white font-medium focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-blue-800 uppercase tracking-wider mb-0.5">
                        Supplier Milk (L)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-400 font-bold text-[10px]">
                          kg
                        </span>
                        <input
                          type="number"
                          step="0.5"
                          required
                          value={formData.supplierMilkUsed}
                          onChange={(e) => handleSupplierPortionChange(e.target.value)}
                          className="w-full h-8 pl-2 pr-6 text-xs border border-blue-300 rounded-lg bg-white font-medium focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    * Future POS sales of this batch will split revenue between Farm &amp; Supplier P&amp;L according to this exact liter ratio.
                  </p>
                </div>
              ) : (
                <div className="hidden md:block"></div>
              )}
            </div>
          </div>

          {/* Form action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isOverLimit}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-white text-xs font-bold shadow-xs transition cursor-pointer bg-[#00a86b] hover:bg-[#007a52] disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              Record Dahi Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
