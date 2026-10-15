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
import CustomSelect from '@/components/common/CustomSelect';
import AddDahiBatchYieldBreakdown from './AddDahiBatchYieldBreakdown';
import AddDahiBatchStockBanner from './AddDahiBatchStockBanner';
import AddDahiBatchHeader from './AddDahiBatchHeader';

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
      <AddDahiBatchHeader onClose={onClose} />

      {/* Main form container */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs no-scrollbar">
        <AddDahiBatchStockBanner
          formData={formData}
          availTotalForType={availTotalForType}
          availFarmForType={availFarmForType}
          availSupplierForType={availSupplierForType}
          availTotalAll={availTotalAll}
          currentMax={currentMax}
        />

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
                <CustomSelect
                  value={formData.milkType}
                  onChange={(val) => handleMilkTypeChange(val)}
                  options={[
                    { value: 'Buffalo Milk', label: 'Buffalo Milk', sublabel: `${availTotalBuffalo} kg available in stock`, badge: 'Buffalo' },
                    { value: 'Cow Milk', label: 'Cow Milk', sublabel: `${availTotalCow} kg available in stock`, badge: 'Cow' },
                  ]}
                  placeholder="Select Milk Type"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dahi Product Type <span className="text-rose-500">*</span>
                </label>
                <CustomSelect
                  value={formData.product}
                  onChange={(val) => setFormData({ ...formData, product: val })}
                  options={[
                    { value: 'Fresh Dahi (Plain)', label: 'Fresh Dahi (Plain)' },
                    { value: 'Sweet Dahi (Meethi Dahi)', label: 'Sweet Dahi (Meethi Dahi)' },
                    { value: 'Matka Dahi (Clay Pot)', label: 'Matka Dahi (Clay Pot)' },
                  ]}
                  placeholder="Select Dahi Product"
                />
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
                <CustomSelect
                  value={formData.source}
                  onChange={(val) => handleSourceChange(val)}
                  options={[
                    { value: 'Both (Mixed)', label: 'Both (Mixed) — Farm + Supplier', sublabel: `${availTotalForType} kg available total` },
                    { value: 'Farm Milk', label: 'Farm Milk', sublabel: `${availFarmForType} kg ${formData.milkType} available`, badge: 'Farm' },
                    { value: 'Supplier Milk', label: 'Supplier Milk', sublabel: `${availSupplierForType} kg ${formData.milkType} available`, badge: 'Supplier' },
                  ]}
                  placeholder="Select Milk Sourcing"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Input & Output */}
          <AddDahiBatchYieldBreakdown
            formData={formData}
            setFormData={setFormData}
            currentMax={currentMax}
            currentEntered={currentEntered}
            handleSetMax={handleSetMax}
            handleTotalMilkChange={handleTotalMilkChange}
            hasValidationError={hasValidationError}
            isOverLimit={isOverLimit}
            isFarmOver={isFarmOver}
            isSupOver={isSupOver}
            farmEntered={farmEntered}
            supEntered={supEntered}
            availFarmForType={availFarmForType}
            availSupplierForType={availSupplierForType}
            handleFarmPortionChange={handleFarmPortionChange}
            handleSupplierPortionChange={handleSupplierPortionChange}
          />

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
