import React, { useState, useMemo } from "react";
import { TrendingUp, PieChart as PieChartIcon, Droplets } from "lucide-react";
import { useAnimalContext } from "../../../../context/AnimalContext";
import { usePOSContext } from "../../../../context/POSContext";
import { useExpense } from "../../../../context/ExpenseContext";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import FarmCardOverflow from "./FarmCardOverflow";
import AnimalYieldBreakdown from "./AnimalYieldBreakdown";
import AnimalDetail from "../animals/AnimalDetail";

const parseYield = (val) => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const match = String(val).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

export default function FarmDashboardContent() {
  const { animals = [], milkingLogs = [] } = useAnimalContext();
  const { products = [] } = usePOSContext();
  const { expenses = [], totals = {} } = useExpense();
  const [selectedAnimalId, setSelectedAnimalId] = useState(null);

  // Metrics
  const totalAnimals = animals.length;
  const cowsCount = animals.filter((a) => (a.species || "").toLowerCase().includes("cow")).length;
  const buffCount = animals.filter((a) => (a.species || "").toLowerCase().includes("buffalo")).length;

  const totalFarmYield = useMemo(() => {
    // Check if we have logs for today
    const todayStr = new Date().toISOString().split("T")[0];
    const todayLogs = milkingLogs.filter((l) => (l.date ? l.date.split("T")[0] === todayStr : false));
    if (todayLogs.length > 0) {
      return todayLogs.reduce((sum, l) => sum + (parseFloat(l.yieldLiters || l.yield) || 0), 0);
    }

    return animals.reduce((sum, animal) => {
      const morning = parseYield(animal.morningYield);
      const evening = parseYield(animal.eveningYield);
      const total = morning + evening > 0 ? morning + evening : parseYield(animal.totalDailyYield);
      return sum + total;
    }, 0);
  }, [animals, milkingLogs]);

  const avgAnimalYield = totalAnimals > 0 ? totalFarmYield / totalAnimals : 0;

  // Live Milk Price from POS counter or fallback
  const milkPricePerLiter = useMemo(() => {
    const milkItem = products.find((p) => /cow\s*milk|pure\s*milk|milk/i.test(p.name)) || products[0];
    return Number(milkItem?.price) || 240;
  }, [products]);

  // Live Farm Expenses from Expense Context
  const dailyExpenses = useMemo(() => {
    const recordedExpense = totals?.feedSeedFarming || totals?.totalFarmExpense || 0;
    if (recordedExpense > 0) {
      return Math.round(recordedExpense / 30);
    }
    // Benchmark feed cost per animal day
    const feedCostPerAnimalDay = 620;
    return totalAnimals * feedCostPerAnimalDay;
  }, [totals, totalAnimals]);

  const dailyRevenue = totalFarmYield * milkPricePerLiter;
  const dailyNetProfit = Math.max(0, dailyRevenue - dailyExpenses);
  const monthlyNetProfit = dailyNetProfit * 30;

  // Dynamic 7-Day Trend Dates & Yields from Server Milking Logs
  const trendData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const key = `${yyyy}-${mm}-${dd}`;
      const label = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      days.push({ key, label });
    }

    return days.map((d) => {
      const logsForDay = milkingLogs.filter((log) => {
        const dateStr = log.date ? log.date.split("T")[0] : "";
        return dateStr === d.key;
      });

      let dayYield = logsForDay.reduce((sum, l) => sum + (parseFloat(l.yieldLiters || l.yield) || 0), 0);

      // Check animal histories if logsForDay is empty
      if (dayYield === 0) {
        animals.forEach((a) => {
          const entry = (a.history || []).find((h) => h.date === d.key || h.date === d.label);
          if (entry) {
            dayYield += (parseFloat(entry.morning) || 0) + (parseFloat(entry.evening) || 0);
          }
        });
      }

      // Default to baseline yield if no entries yet
      if (dayYield === 0) {
        dayYield = totalFarmYield > 0 ? totalFarmYield : 120;
      }

      const dayRevenue = dayYield * milkPricePerLiter;
      const dayProfit = Math.max(0, dayRevenue - dailyExpenses);

      return {
        date: d.label,
        yield: parseFloat(dayYield.toFixed(1)),
        profit: Math.round(dayProfit),
      };
    });
  }, [milkingLogs, animals, totalFarmYield, milkPricePerLiter, dailyExpenses]);

  if (selectedAnimalId) {
    return (
      <AnimalDetail
        animalId={selectedAnimalId}
        onBack={() => setSelectedAnimalId(null)}
        onClose={() => setSelectedAnimalId(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <FarmCardOverflow 
        totalAnimals={totalAnimals}
        cowsCount={cowsCount}
        buffCount={buffCount}
        totalFarmYield={totalFarmYield}
        avgAnimalYield={avgAnimalYield}
        dailyNetProfit={dailyNetProfit}
        monthlyNetProfit={monthlyNetProfit}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Daily Farm Yield & Net Profit Trend
              </h3>
              <p className="text-xs text-slate-500">
                7-day production yield (L) vs estimated net profit (Rs)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Yield (L)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Net Profit (Rs)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#155dfc" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#155dfc" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  formatter={(val, name) => [
                    name === "yield" ? `${val} L` : `Rs. ${val.toLocaleString()}`,
                    name === "yield" ? "Total Yield" : "Net Profit"
                  ]}
                />
                <Area yAxisId="left" type="monotone" dataKey="yield" stroke="#155dfc" strokeWidth={2.5} fillOpacity={1} fill="url(#colorYield)" />
                <Area yAxisId="right" type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-600" /> Financial Summary
              </h3>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Daily Breakdown
              </span>
            </div>

            <div className="space-y-3.5 my-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Daily Milk Revenue</p>
                  <p className="text-[11px] text-slate-400">{totalFarmYield.toFixed(1)} L × Rs. {milkPricePerLiter}</p>
                </div>
                <p className="text-base font-extrabold text-slate-900">Rs. {Math.round(dailyRevenue).toLocaleString()}</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Daily Feed & Expenses</p>
                  <p className="text-[11px] text-slate-400">Live Farm &amp; Feed Costs (Avg / Day)</p>
                </div>
                <p className="text-base font-extrabold text-red-600">- Rs. {Math.round(dailyExpenses).toLocaleString()}</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div>
                  <p className="text-xs text-emerald-800 font-bold">Daily Net Profit</p>
                  <p className="text-[11px] text-emerald-600">Revenue - Expenses</p>
                </div>
                <p className="text-lg font-black text-emerald-700">Rs. {Math.round(dailyNetProfit).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400">Profit Margin</p>
              <p className="text-sm font-extrabold text-slate-800">
                {dailyRevenue > 0 ? ((dailyNetProfit / dailyRevenue) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400">Est. Monthly Profit</p>
              <p className="text-sm font-extrabold text-emerald-600">
                Rs. {(monthlyNetProfit / 100000).toFixed(2)} Lakh
              </p>
            </div>
          </div>
        </div>
      </div>

      <AnimalYieldBreakdown onSelectAnimal={setSelectedAnimalId} />
    </div>
  );
}
