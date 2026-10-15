import React from 'react';
import { Droplets, AlertCircle } from 'lucide-react';

export default function AddDahiBatchStockBanner({
  formData,
  availTotalForType,
  availFarmForType,
  availSupplierForType,
  availTotalAll,
  currentMax,
}) {
  return (
    <>
      {/* Live Available Liquid Milk Card */}
      <div className="mb-4 p-3 rounded-xl bg-linear-to-r from-slate-50 via-emerald-50/20 to-blue-50/30 border border-slate-200/90 text-xs space-y-2 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
            <Droplets className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Available {formData.milkType} Stock:</span>
          </div>
          <span className="text-base font-black text-slate-900 tabular">
            {availTotalForType} <span className="text-xs font-bold text-slate-600">kg</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-[11.5px] pt-1.5 border-t border-slate-200/60 font-semibold flex-wrap gap-y-1">
          <span className="text-emerald-700 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Farm {formData.milkType.replace(' Milk', '')}: <strong className="font-black text-emerald-800 ml-0.5">{availFarmForType} kg</strong>
          </span>
          <span className="text-slate-300 font-bold">·</span>
          <span className="text-blue-700 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Supplier {formData.milkType.replace(' Milk', '')}: <strong className="font-black text-blue-800 ml-0.5">{availSupplierForType} kg</strong>
          </span>
          <span className="text-slate-300 font-bold">·</span>
          <span className="text-slate-500 flex items-center gap-1">
            Total Chiller: <strong className="font-bold text-slate-700 ml-0.5">{availTotalAll} kg</strong>
          </span>
        </div>
      </div>

      {currentMax <= 0 && (
        <div className="mb-3.5 p-3 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Out of Stock:</strong> No {formData.source === 'Both (Mixed)' ? formData.milkType : `${formData.source} (${formData.milkType})`} available (0 kg in chiller). Sourcing or milking intake is required before recording a Dahi batch.
          </span>
        </div>
      )}
    </>
  );
}
