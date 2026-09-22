import React, { useState } from 'react';
import { Layers, X, Droplets, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDahiContext } from '@/context/DahiContext';

export default function AddDahiBatchModal({ isOpen, onClose, onAddBatch }) {
  const { metrics = {} } = useDahiContext();

  const availFarm = Number(metrics.remainingFarmMilk ?? metrics.farmSourced ?? 0);
  const availSupplier = Number(metrics.remainingSupplierMilk ?? metrics.supplierSourced ?? 0);
  const availTotal = Number(metrics.remainingTotalMilk ?? (availFarm + availSupplier).toFixed(1));

  const [formData, setFormData] = useState({
    product: 'Fresh Dahi (Yogurt)',
    source: 'Farm & Supplier Mix',
    milkUsed: '',
    farmMilkUsed: '',
    supplierMilkUsed: '',
    output: '',
    date: new Date().toISOString().split('T')[0],
    status: 'In Progress',
    posRate: 'Rs. 320 / kg',
  });

  if (!isOpen) return null;

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
      // Split proportionally based on available sourcing
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

    const farmPortion = parseFloat(formData.farmMilkUsed) || (formData.source === 'Farm Milk' ? rawVal : 0);
    const supPortion = parseFloat(formData.supplierMilkUsed) || (formData.source === 'Supplier Milk' ? rawVal : 0);

    onAddBatch({
      ...formData,
      milkUsed: `${rawVal} kg (${formData.source === 'Farm Milk' ? 'Farm' : formData.source === 'Supplier Milk' ? 'Supplier' : 'Mixed'})`,
      milkUsedVal: rawVal,
      farmMilkUsed: farmPortion,
      supplierMilkUsed: supPortion,
      output: formData.output ? `${formData.output} kg` : `${(rawVal * 0.985).toFixed(1)} kg`,
      outputVal: parseFloat(formData.output) || Number((rawVal * 0.985).toFixed(1)),
      fat: '4.5%',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 animate-in fade-in-50 zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm leading-tight">
                Record New Dahi Batch
              </h4>
              <p className="text-[11px] text-slate-400">
                Converts available farm &amp; supplier milk into fresh dahi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Available Liquid Milk Card */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-50 via-emerald-50/20 to-blue-50/30 border border-slate-200/90 text-xs space-y-2 shadow-2xs">
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

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11.5px] font-bold text-slate-700 mb-1">Product Type</label>
            <select
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white font-medium"
            >
              <option value="Fresh Dahi (Yogurt)">Fresh Dahi (Yogurt)</option>
              <option value="Sweet Dahi (Meetha)">Sweet Dahi (Meetha)</option>
              <option value="Matka Dahi (Clay Pot)">Matka Dahi (Clay Pot)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11.5px] font-bold text-slate-700">Milk Sourcing</label>
              <span className="text-[10.5px] font-semibold text-slate-500">
                Available: <strong className="text-slate-900 font-bold">{currentMax} kg</strong>
              </span>
            </div>
            <select
              value={formData.source}
              onChange={(e) => handleSourceChange(e.target.value)}
              className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white font-medium"
            >
              <option value="Farm & Supplier Mix">Farm &amp; Supplier Mix ({availTotal} kg total)</option>
              <option value="Farm Milk">Farm Fresh Milk ({availFarm} kg available)</option>
              <option value="Supplier Milk">Supplier Procured Milk ({availSupplier} kg available)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11.5px] font-bold text-slate-700">Total Milk Input (kg)</label>
              {currentMax > 0 && (
                <button
                  type="button"
                  onClick={handleSetMax}
                  className="text-[10.5px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 cursor-pointer"
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
              className={`w-full h-9 px-3 text-xs border rounded-xl focus:outline-none focus:ring-1 font-medium ${
                isOverLimit
                  ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-emerald-500'
              }`}
            />
            {isOverLimit && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Input exceeds available {formData.source} limit of {currentMax} kg
              </p>
            )}
          </div>

          {/* If mixed, breakout inputs */}
          {formData.source === 'Farm & Supplier Mix' && (
            <div className="grid grid-cols-2 gap-2.5 p-2 bg-slate-50/80 border border-slate-200/80 rounded-xl">
              <div>
                <label className="block text-[10.5px] font-bold text-emerald-800 mb-0.5">
                  Farm Portion (Avail: {availFarm} kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.farmMilkUsed}
                  onChange={(e) => setFormData({ ...formData, farmMilkUsed: e.target.value })}
                  className="w-full h-8 px-2 text-xs border border-slate-200 rounded-lg bg-white font-medium"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-bold text-blue-800 mb-0.5">
                  Supplier Portion (Avail: {availSupplier} kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.supplierMilkUsed}
                  onChange={(e) => setFormData({ ...formData, supplierMilkUsed: e.target.value })}
                  className="w-full h-8 px-2 text-xs border border-slate-200 rounded-lg bg-white font-medium"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isOverLimit}
              className="text-xs font-bold text-white cursor-pointer disabled:opacity-50"
              style={{ background: '#009966' }}
            >
              Convert to Dahi Batch
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
