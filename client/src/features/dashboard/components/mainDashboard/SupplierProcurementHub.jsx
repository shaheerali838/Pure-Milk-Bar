import React from 'react';
import { Truck, ArrowRight } from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSupplierContext } from '@/context/SupplierContext';
import { useExpense } from '@/context/ExpenseContext';
import { usePOSContext } from '@/context/POSContext';
import { Link, useNavigate } from 'react-router-dom';

export default function SupplierProcurementHub() {
  const navigate = useNavigate();
  const { intakeLogs = [], totals: intakeTotals = {} } = useIntakeContext();
  const { suppliers = [], totals: supplierTotals = {} } = useSupplierContext();
  const { totals: expenseTotals = {} } = useExpense();
  const { products = [], inventoryMetrics = {} } = usePOSContext();

  const procuredVolume =
    intakeTotals.totalProcuredVolume !== undefined
      ? intakeTotals.totalProcuredVolume
      : intakeLogs.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

  const directCost =
    intakeTotals.totalIntakeSpend !== undefined
      ? intakeTotals.totalIntakeSpend
      : intakeLogs.reduce((sum, item) => sum + (parseFloat(item.totalCost) || 0), 0);

  const avgProcurementRate =
    procuredVolume > 0 ? directCost / procuredVolume : 228;

  // Collection transport / van diesel overheads from expense records
  const collectionDiesel =
    Number(expenseTotals.fuelTransportRepairs) || (procuredVolume > 0 ? 1000 : 0);

  // Valuation at retail price
  const milkProduct = products.find(
    (p) => (p.category || '').toLowerCase().includes('milk') || (p.name || '').toLowerCase().includes('milk')
  );
  const retailPrice = Number(inventoryMetrics.milkPrice) || Number(milkProduct?.price) || 250;
  const grossValue = Math.round(procuredVolume * retailPrice);
  const netContribution = grossValue - directCost - collectionDiesel;

  const activeSuppliersCount =
    supplierTotals.activeSuppliers ??
    suppliers.filter((s) => s.status === 'Active').length;

  const sourcingMarginPct = grossValue > 0 ? ((netContribution / grossValue) * 100).toFixed(1) : '8.1';

  return (
    <div
      onClick={() => navigate('/supplier/intake')}
      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group select-none"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#155dfc] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Truck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display leading-tight">
                Supplier Milk Procurement
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                External dairy sourcing &amp; transit
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#dbeafe] text-[#1d4ed8] border border-[#bfdbfe] shrink-0">
            +{sourcingMarginPct}% Margin
          </span>
        </div>

        {/* Data Rows */}
        <div className="py-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Procured Milk Volume:</span>
            <span className="font-mono font-bold text-slate-900 tabular">
              {procuredVolume.toFixed(1)} L ({activeSuppliersCount} Active Suppliers)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Milk Purchase Direct Cost:</span>
            <span className="font-mono font-bold text-slate-900 tabular">
              Rs. {directCost.toLocaleString()} (@ Rs. {Math.round(avgProcurementRate)}/L)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Collection Diesel &amp; Testing:</span>
            <span className="font-mono font-bold text-rose-500 tabular">
              Rs. {collectionDiesel.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Highlight Net Contribution Row */}
        <div className="pt-3 pb-2 border-t border-slate-100 flex items-center justify-between font-bold text-xs">
          <span className="text-slate-900">Net Sourcing Contribution:</span>
          <span className="font-mono font-bold text-[#155dfc] tabular">
            {netContribution >= 0 ? `+Rs. ${netContribution.toLocaleString()}` : `-Rs. ${Math.abs(netContribution).toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Bottom Full-Width Pill Action Button */}
      <div className="mt-2 pt-1">
        <Link
          to="/supplier/intake"
          className="w-full py-2.5 px-5 rounded-full bg-[#155dfc] hover:bg-[#0f4ad8] text-white flex items-center justify-between text-xs font-bold transition-all shadow-xs group cursor-pointer"
        >
          <span>Open Supplier Sourcing Hub</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
