import React, { useState, useMemo } from "react";
import { Plus, ArrowRight } from "lucide-react";
import { useAnimalContext } from "../../../../context/AnimalContext";
import { usePOSContext } from "../../../../context/POSContext";
import { useExpense } from "../../../../context/ExpenseContext";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import FarmCardOverflow from "./FarmCardOverflow";
import AnimalDetail from "../animals/AnimalDetail";
import AnimalTable from "../animals/AnimalTable";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  // Metrics
  const totalAnimals = animals.length;
  const cowsCount = animals.filter((a) => (a.species || "").toLowerCase().includes("cow")).length;
  const buffCount = animals.filter((a) => (a.species || "").toLowerCase().includes("buffalo")).length;

  const totalFarmYield = useMemo(() => {
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

  const milkPricePerLiter = useMemo(() => {
    const milkItem = products.find((p) => /cow\s*milk|pure\s*milk|milk/i.test(p.name)) || products[0];
    return Number(milkItem?.price) || 240;
  }, [products]);

  const dailyExpenses = useMemo(() => {
    const recordedExpense = totals?.feedSeedFarming || totals?.totalFarmExpense || 0;
    if (recordedExpense > 0) {
      return Math.round(recordedExpense / 30);
    }
    return totalAnimals * 620;
  }, [totals, totalAnimals]);

  const dailyRevenue = totalFarmYield * milkPricePerLiter;
  const dailyNetProfit = Math.max(0, dailyRevenue - dailyExpenses);
  const monthlyNetProfit = dailyNetProfit * 30;

  // Trend Data for 7 days
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

      let mYield = logsForDay.filter(l => (l.shift||'').toLowerCase() === 'morning').reduce((sum, l) => sum + (parseFloat(l.yieldLiters || l.yield) || 0), 0);
      let eYield = logsForDay.filter(l => (l.shift||'').toLowerCase() === 'evening').reduce((sum, l) => sum + (parseFloat(l.yieldLiters || l.yield) || 0), 0);

      if (mYield === 0 && eYield === 0) {
        animals.forEach((a) => {
          const entry = (a.history || []).find((h) => h.date === d.key || h.date === d.label);
          if (entry) {
            mYield += (parseFloat(entry.morning) || 0);
            eYield += (parseFloat(entry.evening) || 0);
          }
        });
      }

      if (mYield === 0 && eYield === 0) {
        mYield = totalFarmYield > 0 ? totalFarmYield / 2 : 60;
        eYield = totalFarmYield > 0 ? totalFarmYield / 2 : 60;
      }

      const dayRevenue = (mYield + eYield) * milkPricePerLiter;
      
      // Calculate realistic day cost. We could just use dailyExpenses. 
      // In the image, farm cost drops a bit towards the end, but let's keep it around dailyExpenses
      const dayCost = dailyExpenses;
      const dayProfit = Math.max(0, dayRevenue - dayCost);

      return {
        date: d.label,
        morning: parseFloat(mYield.toFixed(1)),
        evening: parseFloat(eYield.toFixed(1)),
        revenue: Math.round(dayRevenue),
        cost: Math.round(dayCost),
        profit: Math.round(dayProfit),
      };
    });
  }, [milkingLogs, animals, totalFarmYield, milkPricePerLiter, dailyExpenses]);

  // Data for Current Lactation Yield by Animal
  const animalBarData = useMemo(() => {
    return animals.slice(0, 6).map(a => {
      const morning = parseYield(a.morningYield);
      const evening = parseYield(a.eveningYield);
      const mVal = morning > 0 ? morning : (parseYield(a.totalDailyYield) / 2) || 8;
      const eVal = evening > 0 ? evening : (parseYield(a.totalDailyYield) / 2) || 7;
      return {
        name: a.tag,
        morning: parseFloat(mVal.toFixed(1)),
        evening: parseFloat(eVal.toFixed(1)),
      };
    });
  }, [animals]);

  // Aggregate expenses by category
  const expensesByCategory = useMemo(() => {
    const cats = {};
    expenses.forEach(e => {
      const cat = e.category || 'Other';
      if (!cats[cat]) cats[cat] = 0;
      cats[cat] += parseFloat(e.amount) || 0;
    });
    const sorted = Object.entries(cats).sort((a,b) => b[1] - a[1]).slice(0, 5);
    const displayList = sorted.length > 0 ? sorted : [
      ["Feed", 3200],
      ["Fuel cost", 2000],
      ["Kitchen Expense", 950],
      ["Medical Expense", 1500],
      ["Transportation", 1800]
    ];
    
    let sum = expenses.reduce((s, e) => s + (parseFloat(e.amount)||0), 0);
    if (sum === 0) sum = 26400; // Mock total if no data

    return { list: displayList, total: sum };
  }, [expenses]);

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
    <div className="flex flex-col gap-4">
      {/* Metrics Row */}
      <FarmCardOverflow 
        totalAnimals={totalAnimals}
        cowsCount={cowsCount}
        buffCount={buffCount}
        totalFarmYield={totalFarmYield}
        avgAnimalYield={avgAnimalYield}
        dailyNetProfit={dailyNetProfit}
        monthlyNetProfit={monthlyNetProfit}
      />

      {/* Grid Row 1: Area Chart & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Farm Production Trend (7 Days) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col h-[340px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Farm Production Trend (7 Days)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Own livestock morning vs. evening milking yield</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/farm/milking')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" /> Log Shift
              </button>
              <button 
                onClick={() => navigate('/farm/animals')}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                Register <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full mt-2 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMorning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEvening" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} dy={5} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val} L`} width={45} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff", fontSize: "11px" }}
                  formatter={(val, name) => [`${val} L`, name === 'morning' ? 'Morning Yield' : 'Evening Yield']}
                />
                <Area type="monotone" dataKey="morning" stackId="1" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorMorning)" />
                <Area type="monotone" dataKey="evening" stackId="1" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEvening)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Lactation Yield by Animal */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col h-[340px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Current Lactation Yield by Animal</h3>
              <p className="text-xs text-slate-500 mt-0.5">Individual cow and buffalo daily output</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/farm/animals')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" /> Add Animal
              </button>
              <button 
                onClick={() => navigate('/farm/animals')}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                View Herd <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full mt-2 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={animalBarData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} dy={5} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val} L`} width={45} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff", fontSize: "11px" }}
                  formatter={(val, name) => [`${val} L`, name === 'morning' ? 'Morning Yield' : 'Evening Yield']}
                />
                <Bar dataKey="morning" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="evening" stackId="a" fill="#047857" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid Row 2: Expenses & Financial P&L */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Farm Expenses */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-[340px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Farm Expenses</h3>
                <p className="text-xs text-slate-500 mt-0.5">Cattle maintenance, feed & healthcare allocation</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/farm/expenses')}
                  className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
                <button 
                  onClick={() => navigate('/farm/expenses')}
                  className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {expensesByCategory.list.map(([name, amount], i) => (
                <div key={i} className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="truncate max-w-[140px]">{name}</span>
                  </div>
                  <span className="font-mono text-slate-900">Rs. {amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold">
            <span className="text-slate-700">Total Farm Expenses:</span>
            <span className="text-emerald-700 font-mono font-black">Rs. {expensesByCategory.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Farm Financial Performance (P&L Trend) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col h-[340px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Farm Financial Performance (P&L Trend)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Farm revenue contribution vs. direct farm operating costs</p>
            </div>
            <button 
              onClick={() => navigate('/finance')}
              className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
            >
              Full P&L <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="flex-1 w-full mt-2 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} dy={5} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val} Rs`} width={55} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", borderColor: "#e2e8f0", borderRadius: "12px", color: "#334155", fontSize: "11px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
                  itemStyle={{ fontWeight: 700 }}
                  labelStyle={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}
                  formatter={(val, name) => [
                    `Rs. ${val.toLocaleString()}`, 
                    name === 'revenue' ? 'Revenue Contrib:' : name === 'cost' ? 'Farm Cost:' : 'Net Profit:'
                  ]}
                />
                <Line type="monotone" dataKey="revenue" name="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="cost" name="cost" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#ef4444', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="profit" name="profit" stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid Row 3: Herd Table */}
      <div className="mt-4">
        <AnimalTable onSelectAnimal={setSelectedAnimalId} />
      </div>

    </div>
  );
}
