import React from 'react';
import { Milk, AlertCircle } from 'lucide-react';

export default function AddDahiBatchYieldBreakdown({
  formData,
  setFormData,
  currentMax,
  currentEntered,
  handleSetMax,
  handleTotalMilkChange,
  hasValidationError,
  isOverLimit,
  isFarmOver,
  isSupOver,
  farmEntered,
  supEntered,
  availFarmForType,
  availSupplierForType,
  handleFarmPortionChange,
  handleSupplierPortionChange,
}) {
  return (
    <div className="pt-2 border-t border-slate-100">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2.5">
        <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
          <Milk className="w-3.5 h-3.5" />
        </div>
        <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
          2. Input Volume &amp; Breakdown
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="col-span-2 row-span-1">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Total Milk Input (kg/L) <span className="text-rose-500">*</span>
            </label>
            {currentMax > 0 && (
              <button
                type="button"
                onClick={handleSetMax}
                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 cursor-pointer transition-colors"
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
            placeholder={`e.g. ${currentMax > 0 ? Math.min(20, currentMax) : 0}`}
            value={formData.milkUsed}
            onChange={(e) => handleTotalMilkChange(e.target.value)}
            className={`w-full h-9 px-3 text-xs border rounded-xl focus:outline-none focus:ring-1 font-medium bg-slate-50 focus:bg-white transition-colors ${
              hasValidationError
                ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20 text-rose-900 font-bold'
                : 'border-slate-200 focus:ring-emerald-500'
            }`}
          />
          {isOverLimit && (
            <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-rose-800 text-xs">
                  ⚠️ Insufficient {formData.milkType} Stock!
                </p>
                <p className="text-[11.5px] text-rose-600 font-medium leading-relaxed">
                  Entered quantity <strong className="font-bold text-rose-700">{currentEntered} kg</strong> exceeds the maximum available {formData.milkType} ({formData.source}) stock of <strong className="font-bold text-rose-700">{currentMax} kg</strong>. Please enter an amount ≤ {currentMax} kg.
                </p>
              </div>
            </div>
          )}
          {!isOverLimit && (isFarmOver || isSupOver) && (
            <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-rose-800 text-xs">
                  ⚠️ Portion Exceeds Available Stock!
                </p>
                <p className="text-[11.5px] text-rose-600 font-medium leading-relaxed">
                  {isFarmOver && (
                    <span>Farm portion (<strong className="font-bold text-rose-700">{farmEntered} kg</strong>) exceeds available Farm {formData.milkType} (<strong className="font-bold text-rose-700">{availFarmForType} kg</strong>). </span>
                  )}
                  {isSupOver && (
                    <span>Supplier portion (<strong className="font-bold text-rose-700">{supEntered} kg</strong>) exceeds available Supplier {formData.milkType} (<strong className="font-bold text-rose-700">{availSupplierForType} kg</strong>).</span>
                  )}
                </p>
              </div>
            </div>
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
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 mt-[21px]">
              Expected Dahi Output (kg) <span className="text-slate-400 lowercase font-medium">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">kg</span>
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder={`Est: ${(currentEntered * 0.985).toFixed(1)}`}
                value={formData.output}
                onChange={(e) => setFormData({ ...formData, output: e.target.value })}
                className="w-full h-9 pl-3 pr-8 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50 focus:bg-white font-medium text-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* If mixed, breakout inputs */}
        {formData.source === 'Both (Mixed)' || formData.source === 'Farm & Supplier Mix' ? (
          <div className="p-2.5 bg-slate-50/90 border border-slate-200/90 rounded-xl space-y-2 md:col-span-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700">Enter Exact Liter Ratio:</span>
              {parseFloat(formData.milkUsed) > 0 && (
                <span className="font-bold text-emerald-700 text-[10.5px]">
                  Farm: {Math.round(((parseFloat(formData.farmMilkUsed) || 0) / (parseFloat(formData.milkUsed) || 1)) * 100)}% | Sup: {Math.round(((parseFloat(formData.supplierMilkUsed) || 0) / (parseFloat(formData.milkUsed) || 1)) * 100)}%
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10.5px] font-bold text-emerald-800 uppercase tracking-wider mb-0.5 flex items-center justify-between">
                  <span>Farm Milk (L)</span>
                  <span className={`text-[10px] font-bold ${isFarmOver ? 'text-rose-600' : 'text-emerald-600'}`}>Max: {availFarmForType} kg</span>
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
                    className={`w-full h-8 pl-2 pr-6 text-xs border rounded-lg bg-white font-medium focus:ring-1 ${
                      isFarmOver ? 'border-rose-400 focus:ring-rose-500 text-rose-900 bg-rose-50/20' : 'border-emerald-300 focus:ring-emerald-500'
                    }`}
                  />
                </div>
                {isFarmOver && (
                  <p className="text-[10px] text-rose-600 font-bold mt-1">Exceeds {availFarmForType} kg max</p>
                )}
              </div>
              <div>
                <label className="block text-[10.5px] font-bold text-blue-800 uppercase tracking-wider mb-0.5 flex items-center justify-between">
                  <span>Supplier Milk (L)</span>
                  <span className={`text-[10px] font-bold ${isSupOver ? 'text-rose-600' : 'text-blue-600'}`}>Max: {availSupplierForType} kg</span>
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
                    className={`w-full h-8 pl-2 pr-6 text-xs border rounded-lg bg-white font-medium focus:ring-1 ${
                      isSupOver ? 'border-rose-400 focus:ring-rose-500 text-rose-900 bg-rose-50/20' : 'border-blue-300 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {isSupOver && (
                  <p className="text-[10px] text-rose-600 font-bold mt-1">Exceeds {availSupplierForType} kg max</p>
                )}
              </div>
            </div>
            
            {/* Dynamic Proportional Yield Preview */}
            {parseFloat(formData.output || (parseFloat(formData.milkUsed) * 0.985)) > 0 && parseFloat(formData.milkUsed) > 0 && (
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>Proportional Yield Output:</span>
                <span className="font-bold text-slate-800">
                  Farm Dahi:{' '}
                  <strong className="text-emerald-700">
                    {(
                      (parseFloat(formData.output) || (parseFloat(formData.milkUsed) || 0) * 0.985) *
                      ((parseFloat(formData.farmMilkUsed) || 0) / (parseFloat(formData.milkUsed) || 1))
                    ).toFixed(2)}{' '}
                    kg
                  </strong>{' '}
                  · Sup Dahi:{' '}
                  <strong className="text-blue-700">
                    {(
                      (parseFloat(formData.output) || (parseFloat(formData.milkUsed) || 0) * 0.985) *
                      ((parseFloat(formData.supplierMilkUsed) || 0) / (parseFloat(formData.milkUsed) || 1))
                    ).toFixed(2)}{' '}
                    kg
                  </strong>
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden"></div>
        )}
      </div>
    </div>
  );
}
