import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Droplets,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Scale,
} from 'lucide-react';
import { useAnimalContext } from '@/context/AnimalContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { usePOSContext } from '@/context/POSContext';

export default function MilkProductionAndFlow() {
  const { animals = [] } = useAnimalContext();
  const { intakeLogs = [], totals: intakeTotals = {} } = useIntakeContext();
  const { inventoryMetrics = {} } = usePOSContext();

  // 1. DYNAMIC 7-DAY MILK PRODUCTION (FARM VS PURCHASED)
  const productionChartData = useMemo(() => {
    // Collect dates from real animal history and intake logs
    const dateSet = new Set();
    animals.forEach((a) => {
      (a.history || []).forEach((h) => {
        if (h.date) dateSet.add(h.date);
      });
    });
    intakeLogs.forEach((l) => {
      if (l.date) {
        const d = new Date(l.date);
        const label = !isNaN(d.getTime())
          ? d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
          : l.date;
        dateSet.add(label);
      }
    });

    let days = Array.from(dateSet);
    if (days.length === 0) {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
      }
    } else {
      days = days.slice(-7);
    }

    return days.map((day) => {
      // Farm yield for this day from animal histories
      let farmDayYield = 0;
      animals.forEach((animal) => {
        const historyEntry = (animal.history || []).find((h) => h.date === day);
        if (historyEntry) {
          farmDayYield += (Number(historyEntry.morning) || 0) + (Number(historyEntry.evening) || 0);
        }
      });

      // Intake quantity for this day from intakeLogs
      let purchasedYield = 0;
      intakeLogs.forEach((log) => {
        const logDateObj = new Date(log.date);
        const logLabel = !isNaN(logDateObj.getTime())
          ? logDateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
          : log.date;
        if (log.date === day || logLabel === day) {
          purchasedYield += Number(log.quantity) || 0;
        }
      });

      return {
        date: day,
        farm: parseFloat(farmDayYield.toFixed(1)),
        purchased: parseFloat(purchasedYield.toFixed(1)),
        total: parseFloat((farmDayYield + purchasedYield).toFixed(1)),
      };
    });
  }, [animals, intakeLogs]);

  // 2. TODAY'S MILK FLOW STEP-BY-STEP CALCULATION
  const totalFarmMilk = animals.reduce(
    (sum, a) => sum + (parseFloat(a.totalDailyYield) || 0),
    0
  );
  const totalProcured =
    intakeTotals.totalProcuredVolume !== undefined
      ? Number(intakeTotals.totalProcuredVolume)
      : intakeLogs.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

  const openingStock = 0; // Cold room reserve base
  const posMilkSold = parseFloat(inventoryMetrics.milkSold) || 0;
  const convertedToDahi = Math.round((parseFloat(inventoryMetrics.dahiSold) || 0) * 1.1);
  const estimatedWastage = 0; // Chiller loss / sampling

  // Math: Opening + Farm + Procurement - POS - Dahi - Wastage
  const expectedClosing = Math.max(
    0,
    parseFloat((openingStock + totalFarmMilk + totalProcured - posMilkSold - convertedToDahi - estimatedWastage).toFixed(1))
  );

  // Actual physical / recorded closing
  const actualClosing = parseFloat(inventoryMetrics.totalMilk) || expectedClosing;
  const variance = parseFloat((actualClosing - expectedClosing).toFixed(1));
  const isBalanced = Math.abs(variance) <= 2;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* LEFT: 7-Day Milk Production Line Chart (7 cols) */}
      <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <Droplets className="w-4 h-4 text-[#155dfc]" />
                <span>7-Day Milk Production (Farm vs. Purchased)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Daily output volume comparing internal cattle yield with dock supplier procurement
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                Live Inflow
              </span>
            </div>
          </div>

          <div className="h-[260px] w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productionChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} unit=" L" />
                <Tooltip
                  formatter={(val, name) => [
                    `${val} Liters`,
                    name === 'farm' ? 'Internal Farm' : name === 'purchased' ? 'Supplier Purchased' : 'Total Milk Sourced',
                  ]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-[11px] font-semibold text-slate-600">
                      {value === 'farm' ? 'Farm Production' : value === 'purchased' ? 'Purchased Milk' : 'Total'}
                    </span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="farm"
                  stroke="#009966"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#009966' }}
                  activeDot={{ r: 5 }}
                  name="farm"
                />
                <Line
                  type="monotone"
                  dataKey="purchased"
                  stroke="#155dfc"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#155dfc' }}
                  activeDot={{ r: 5 }}
                  name="purchased"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">7-Day Farm Avg</span>
            <span className="text-xs font-black text-slate-800 tabular font-mono">
              {productionChartData.length > 0
                ? (productionChartData.reduce((s, d) => s + d.farm, 0) / productionChartData.length).toFixed(1)
                : totalFarmMilk.toFixed(1)} L/day
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">7-Day Procurement Avg</span>
            <span className="text-xs font-black text-slate-800 tabular font-mono">
              {productionChartData.length > 0
                ? (productionChartData.reduce((s, d) => s + d.purchased, 0) / productionChartData.length).toFixed(1)
                : totalProcured.toFixed(1)} L/day
            </span>
          </div>
          <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100">
            <span className="text-[10px] uppercase font-bold text-blue-800 block">Total Combined Inflow</span>
            <span className="text-xs font-black text-blue-900 tabular font-mono">
              {(totalFarmMilk + totalProcured).toFixed(1)} L
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: Today's Milk Flow Calculation Breakdown (5 cols) */}
      <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Today's Milk Flow Reconciliation
              </h3>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isBalanced
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {isBalanced ? 'Balanced' : 'Audit Notice'}
            </span>
          </div>

          {/* Calculation Steps List */}
          <div className="divide-y divide-slate-100 my-2 text-xs">
            {/* 1. Opening */}
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-600 font-medium">Opening Chilling Tank Stock</span>
              <span className="font-bold text-slate-800 font-mono tabular">{openingStock.toFixed(1)} L</span>
            </div>

            {/* 2. + Farm Production */}
            <div className="flex items-center justify-between py-1.5 text-emerald-700">
              <span className="flex items-center gap-1.5 font-medium">
                <Plus className="w-3 h-3 text-emerald-600" />
                <span>Farm Production (Herd Yield)</span>
              </span>
              <span className="font-bold font-mono tabular">+{totalFarmMilk.toFixed(1)} L</span>
            </div>

            {/* 3. + Procurement */}
            <div className="flex items-center justify-between py-1.5 text-blue-700">
              <span className="flex items-center gap-1.5 font-medium">
                <Plus className="w-3 h-3 text-blue-600" />
                <span>Purchased Procurement (Suppliers)</span>
              </span>
              <span className="font-bold font-mono tabular">+{totalProcured.toFixed(1)} L</span>
            </div>

            {/* 4. - POS Sales */}
            <div className="flex items-center justify-between py-1.5 text-rose-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Minus className="w-3 h-3 text-rose-500" />
                <span>POS &amp; Delivery Sales</span>
              </span>
              <span className="font-bold font-mono tabular">-{posMilkSold.toFixed(1)} L</span>
            </div>

            {/* 5. - Converted to Dahi */}
            <div className="flex items-center justify-between py-1.5 text-cyan-700">
              <span className="flex items-center gap-1.5 font-medium">
                <Minus className="w-3 h-3 text-cyan-600" />
                <span>Converted to Dahi &amp; Value-Add</span>
              </span>
              <span className="font-bold font-mono tabular">-{convertedToDahi.toFixed(1)} L</span>
            </div>

            {/* 6. - Wastage */}
            <div className="flex items-center justify-between py-1.5 text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <Minus className="w-3 h-3 text-slate-400" />
                <span>Chiller Loss &amp; Pipe Holdup</span>
              </span>
              <span className="font-bold font-mono tabular">-{estimatedWastage.toFixed(1)} L</span>
            </div>
          </div>
        </div>

        {/* Expected vs Actual & Variance Footer */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Expected Closing Stock</span>
            <span className="text-sm font-black text-slate-900 font-mono tabular">
              {expectedClosing.toFixed(1)} L
            </span>
          </div>

          <div
            className={`p-2.5 rounded-xl border flex items-center justify-between ${
              isBalanced
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold">
              {isBalanced ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600" />
              )}
              <span>Audit Variance</span>
            </div>
            <span className="text-sm font-black font-mono tabular">
              {variance >= 0 ? `+${variance}` : variance} L
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
