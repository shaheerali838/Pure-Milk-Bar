import React, { useState, useEffect, useMemo } from 'react';
import { Layers, X, Droplets, AlertCircle, ArrowLeft, Check, Milk, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useDahiContext } from '@/context/DahiContext';
import { usePOSContext } from '@/context/POSContext';
import { useAnimalContext } from '@/context/AnimalContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { useGlobalDate, getTodayDateStr } from '@/context/GlobalDateContext';
import { subscribeToSync } from '@/utils/syncBroadcaster';

export default function AddDahiBatchModal({ onClose, onAddBatch }) {
  const { metrics = {}, refreshBatches } = useDahiContext();
  const posCtx = usePOSContext();
  const animalCtx = useAnimalContext();
  const intakeCtx = useIntakeContext();
  const invMetrics = posCtx?.inventoryMetrics || {};
  const { globalDate } = useGlobalDate();

  // Lively fetch latest stock and batches on modal open and real-time events
  useEffect(() => {
    if (typeof refreshBatches === 'function') refreshBatches();
    if (typeof animalCtx?.refreshAnimals === 'function') animalCtx.refreshAnimals();
    if (typeof intakeCtx?.refreshIntakes === 'function') intakeCtx.refreshIntakes();
    if (typeof posCtx?.fetchOrders === 'function') posCtx.fetchOrders();
    if (typeof posCtx?.loadProcessingBatches === 'function') posCtx.loadProcessingBatches();

    const handleSync = () => {
      if (typeof refreshBatches === 'function') refreshBatches();
      if (typeof animalCtx?.refreshAnimals === 'function') animalCtx.refreshAnimals();
      if (typeof intakeCtx?.refreshIntakes === 'function') intakeCtx.refreshIntakes();
      if (typeof posCtx?.fetchOrders === 'function') posCtx.fetchOrders();
      if (typeof posCtx?.loadProcessingBatches === 'function') posCtx.loadProcessingBatches();
    };

    const unsubscribe = subscribeToSync(handleSync);
    window.addEventListener('pure_milk_bar_milking_updated', handleSync);
    window.addEventListener('pure_milk_bar_intake_updated', handleSync);
    window.addEventListener('pure_milk_bar_dahi_updated', handleSync);
    window.addEventListener('pure_milk_bar_sales_updated', handleSync);
    window.addEventListener('pure_milk_bar_pos_sale_completed', handleSync);
    window.addEventListener('pure_milk_bar_inventory_updated', handleSync);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      window.removeEventListener('pure_milk_bar_milking_updated', handleSync);
      window.removeEventListener('pure_milk_bar_intake_updated', handleSync);
      window.removeEventListener('pure_milk_bar_dahi_updated', handleSync);
      window.removeEventListener('pure_milk_bar_sales_updated', handleSync);
      window.removeEventListener('pure_milk_bar_pos_sale_completed', handleSync);
      window.removeEventListener('pure_milk_bar_inventory_updated', handleSync);
    };
  }, []);

  const [formData, setFormData] = useState({
    product: 'Fresh Dahi (Plain)',
    milkType: 'Buffalo Milk',
    source: 'Both (Mixed)',
    milkUsed: '',
    farmMilkUsed: '',
    supplierMilkUsed: '',
    output: '',
    date: globalDate || getTodayDateStr(),
    stage: 'incubating',
    status: 'In Progress',
    boiledAndCooled: true,
    starterAdded: true,
  });

  const [unitCost, setUnitCost] = useState(230);

  // Available stocks per milk type (Cow vs Buffalo)
  const isCow = (formData.milkType || '').toLowerCase().includes('cow');

  // Farm stocks
  const availFarmCow = Math.max(0, Number(metrics.remainingFarmCowMilk ?? invMetrics.rawFarmCowMilkStock ?? invMetrics.farmCowMilkStock ?? 0));
  let availFarmBuffalo = Math.max(0, Number(metrics.remainingFarmBuffaloMilk ?? invMetrics.rawFarmBuffaloMilkStock ?? invMetrics.farmBuffaloMilkStock ?? 0));
  const availFarmAll = Number(metrics.remainingFarmMilk ?? invMetrics.rawFarmMilkStock ?? invMetrics.farmMilkStock ?? metrics.farmSourced ?? (availFarmCow + availFarmBuffalo).toFixed(1));
  if (availFarmBuffalo === 0 && availFarmCow === 0 && availFarmAll > 0) {
    availFarmBuffalo = availFarmAll;
  }
  const availFarmForType = isCow ? availFarmCow : availFarmBuffalo;

  // Supplier stocks
  const availSupplierCow = Math.max(0, Number(metrics.remainingSupplierCowMilk ?? invMetrics.rawSupplierCowMilkStock ?? invMetrics.supplierCowMilkStock ?? 0));
  let availSupplierBuffalo = Math.max(0, Number(metrics.remainingSupplierBuffaloMilk ?? invMetrics.rawSupplierBuffaloMilkStock ?? invMetrics.supplierBuffaloMilkStock ?? 0));
  const availSupplierAll = Number(metrics.remainingSupplierMilk ?? invMetrics.rawSupplierMilkStock ?? invMetrics.supplierMilkStock ?? metrics.supplierSourced ?? (availSupplierCow + availSupplierBuffalo).toFixed(1));
  if (availSupplierBuffalo === 0 && availSupplierCow === 0 && availSupplierAll > 0) {
    availSupplierBuffalo = availSupplierAll;
  }
  const availSupplierForType = isCow ? availSupplierCow : availSupplierBuffalo;

  // Total available for currently selected milk type
  const availTotalForType = Number((availFarmForType + availSupplierForType).toFixed(1));
  const availTotalCow = Number((availFarmCow + availSupplierCow).toFixed(1));
  const availTotalBuffalo = Number((availFarmBuffalo + availSupplierBuffalo).toFixed(1));

  // Overall aggregate liquid milk (chiller total across all species)
  const availTotalAll = Number(metrics.remainingTotalMilk ?? invMetrics.rawTotalMilkStock ?? invMetrics.totalMilk ?? (availFarmAll + availSupplierAll).toFixed(1));

  // Maximum allowed for current source and selected milk type
  const currentMax =
    formData.source === 'Farm Milk'
      ? availFarmForType
      : formData.source === 'Supplier Milk'
        ? availSupplierForType
        : availTotalForType;

  const currentEntered = parseFloat(formData.milkUsed) || 0;
  const farmEntered = parseFloat(formData.farmMilkUsed) || 0;
  const supEntered = parseFloat(formData.supplierMilkUsed) || 0;

  // Strict over-limit conditions
  const isOverLimit = currentEntered > currentMax;
  const isFarmOver = formData.source === 'Both (Mixed)' && farmEntered > availFarmForType;
  const isSupOver = formData.source === 'Both (Mixed)' && supEntered > availSupplierForType;
  const hasValidationError = isOverLimit || isFarmOver || isSupOver;

  const handleMilkTypeChange = (newType) => {
    const isNowCow = (newType || '').toLowerCase().includes('cow');
    const newFarmAvail = isNowCow ? availFarmCow : availFarmBuffalo;
    const newSupAvail = isNowCow ? availSupplierCow : availSupplierBuffalo;
    const newTotalAvail = Number((newFarmAvail + newSupAvail).toFixed(1));

    const total = parseFloat(formData.milkUsed) || 0;
    let fVal = formData.farmMilkUsed;
    let sVal = formData.supplierMilkUsed;

    if (formData.source === 'Farm Milk') {
      fVal = String(total);
      sVal = '0';
    } else if (formData.source === 'Supplier Milk') {
      fVal = '0';
      sVal = String(total);
    } else {
      // Both (Mixed)
      const sumAvail = newFarmAvail + newSupAvail;
      const fPortion = sumAvail > 0 ? Math.min(total, Math.round(total * (newFarmAvail / sumAvail))) : Math.min(total, newFarmAvail);
      fVal = String(fPortion);
      sVal = String(Math.max(0, total - fPortion));
    }

    setFormData({
      ...formData,
      milkType: newType,
      farmMilkUsed: fVal,
      supplierMilkUsed: sVal,
    });
  };

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
      const sumAvail = availFarmForType + availSupplierForType;
      const fPortion = sumAvail > 0 ? Math.min(total, Math.round(total * (availFarmForType / sumAvail))) : Math.min(total, availFarmForType);
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
      const sumAvail = availFarmForType + availSupplierForType;
      const fPortion = sumAvail > 0 ? Math.min(num, Math.round(num * (availFarmForType / sumAvail))) : Math.min(num, availFarmForType);
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
    if (currentMax <= 0) {
      toast.error(`Out of Stock! No ${formData.milkType} available from ${formData.source}.`);
      return;
    }
    if (rawVal <= 0) {
      toast.error('Please enter a valid milk quantity greater than 0.');
      return;
    }

    if (rawVal > currentMax) {
      toast.error(`Insufficient ${formData.milkType} Stock! Entered ${rawVal} kg exceeds available ${currentMax} kg.`);
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

    if (formData.source === 'Both (Mixed)') {
      if (farmPortion > availFarmForType) {
        toast.error(`Farm portion (${farmPortion} kg) exceeds available Farm ${formData.milkType} stock of ${availFarmForType} kg.`);
        return;
      }
      if (supPortion > availSupplierForType) {
        toast.error(`Supplier portion (${supPortion} kg) exceeds available Supplier ${formData.milkType} stock of ${availSupplierForType} kg.`);
        return;
      }
    }

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

    const activeUnitCost = Number(unitCost) || (formData.source === 'Supplier Milk' ? 220 : 230);
    const dahiCostRate = parseFloat(formData.dahiCostRate) || 250;
    
    const farmMilkCost = formData.source === 'Supplier Milk'
      ? 0
      : formData.source === 'Farm Milk'
        ? Math.round(rawVal * activeUnitCost)
        : Math.round(farmPortion * (formData.source === 'Farm Milk' ? activeUnitCost : 230));
    const supplierMilkCost = formData.source === 'Farm Milk'
      ? 0
      : formData.source === 'Supplier Milk'
        ? Math.round(rawVal * 220)
        : Math.round(supPortion * 220);
    
    const milkCostTransferred = farmMilkCost + supplierMilkCost || Math.round(rawVal * activeUnitCost);
    const numOutput = parseFloat(formData.output) || Number((rawVal * 0.985).toFixed(1));
    const totalDahiCost = Math.round(numOutput * dahiCostRate);

    // 100% Dynamic Proportional Yield formulas:
    // farmDahiAdded = totalDahiProduced * farmRatio
    // supplierDahiAdded = totalDahiProduced * supplierRatio
    const farmDahiAdded = Number((numOutput * farmRatio).toFixed(3));
    const supplierDahiAdded = Number((numOutput * supplierRatio).toFixed(3));

    onAddBatch({
      ...formData,
      unitCost: activeUnitCost,
      dahiCostRate,
      farmMilkCost,
      supplierMilkCost,
      milkCostTransferred,
      milkUsedCost: milkCostTransferred,
      dahiProductionCost: totalDahiCost,
      totalDahiCost,
      totalMilkCost: milkCostTransferred,
      milkUsed: `${rawVal} L (${formData.source === 'Farm Milk' ? 'Farm' : formData.source === 'Supplier Milk' ? 'Supplier' : 'Mixed'})`,
      milkUsedVal: rawVal,
      farmMilkUsed: farmPortion,
      supplierMilkUsed: supPortion,
      farmRatio,
      supplierRatio,
      farmDahiAdded,
      supplierDahiAdded,
      output: formData.output ? `${formData.output} kg` : `${numOutput} kg`,
      outputVal: numOutput,
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Production Date <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50 focus:bg-white font-semibold cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Milk className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Milk Type <span className="text-rose-500">*</span></span>
                </label>
                <select
                  required
                  value={formData.milkType}
                  onChange={(e) => handleMilkTypeChange(e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50 focus:bg-white font-medium cursor-pointer"
                >
                  <option value="Buffalo Milk">Buffalo Milk ({availTotalBuffalo} kg available)</option>
                  <option value="Cow Milk">Cow Milk ({availTotalCow} kg available)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dahi Product Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50 focus:bg-white font-medium cursor-pointer"
                >
                  <option value="Fresh Dahi (Plain)">Fresh Dahi (Plain)</option>
                  <option value="Sweet Dahi (Meethi Dahi)">Sweet Dahi (Meethi Dahi)</option>
                  <option value="Matka Dahi (Clay Pot)">Matka Dahi (Clay Pot)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Milk Sourcing <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[10.5px] font-semibold ${currentMax === 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                    Avail: <strong className={currentMax === 0 ? 'text-rose-700 font-black' : 'text-slate-900 font-bold'}>{currentMax} kg</strong>
                  </span>
                </div>
                <select
                  value={formData.source}
                  onChange={(e) => handleSourceChange(e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50 focus:bg-white font-medium cursor-pointer"
                >
                  <option value="Both (Mixed)">Both (Mixed) — Farm + Supplier ({availTotalForType} kg available)</option>
                  <option value="Farm Milk">Farm Milk ({availFarmForType} kg {formData.milkType} available)</option>
                  <option value="Supplier Milk">Supplier Milk ({availSupplierForType} kg {formData.milkType} available)</option>
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
              <div className='col-span-2 row-span-1 '>
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
                        Farm: {Math.round(((parseFloat(formData.farmMilkUsed) || 0) / (parseFloat(formData.milkUsed) || 1)) * 100)}% | 
                        Supplier: {Math.round(((parseFloat(formData.supplierMilkUsed) || 0) / (parseFloat(formData.milkUsed) || 1)) * 100)}%
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
              disabled={hasValidationError || currentEntered <= 0 || currentMax <= 0}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-white text-xs font-bold shadow-xs transition cursor-pointer bg-[#00a86b] hover:bg-[#007a52] disabled:opacity-50 disabled:cursor-not-allowed"
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
