import React, { useState, useMemo } from 'react';
import { Plus, ArrowRight, LayoutDashboard, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnimalContext } from '../../../../context/AnimalContext';
import { usePOSContext } from '../../../../context/POSContext';
import { useExpense } from '../../../../context/ExpenseContext';
import { getPktTodayString, getDateRangeBoundaries, isDateInFilterRange } from '@/utils/dateUtils';
import DashboardDateFilterBar from '@/components/common/DashboardDateFilterBar';
import FarmCardOverflow from './FarmCardOverflow';
import FarmDashboardCharts from './FarmDashboardCharts';
import AnimalDetail from '../animals/AnimalDetail';
import AnimalAdd from '../animals/AnimalAdd';
import AnimalTable from '../animals/AnimalTable';

const parseYield = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const match = String(val).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

export default function FarmDashboardContent() {
  const { animals = [], milkingLogs = [] } = useAnimalContext();
  const posCtx = usePOSContext();
  const { expenses = [] } = useExpense();
  const [selectedAnimalId, setSelectedAnimalId] = useState(null);
  const [editAnimal, setEditAnimal] = useState(null);
  const navigate = useNavigate();

  // Date Filter State
  const [dateFilter, setDateFilter] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { detailedLabel: periodLabel } = useMemo(() => {
    return getDateRangeBoundaries(dateFilter, startDate, endDate);
  }, [dateFilter, startDate, endDate]);

  const totalAnimals = animals.length;
  const cowsCount = animals.filter((a) => (a.species || '').toLowerCase().includes('cow')).length;
  const buffCount = animals.filter((a) => (a.species || '').toLowerCase().includes('buffalo')).length;
  const milkingAnimals = animals.filter(
    (a) => (a.lactationStatus || a.status || '').toLowerCase() === 'milking'
  );

  // Farm Yield filtered by timeframe
  const totalFarmYield = useMemo(() => {
    const filteredLogs = milkingLogs.filter((l) =>
      isDateInFilterRange(l.date || l.createdAt, dateFilter, startDate, endDate)
    );
    if (filteredLogs.length > 0) {
      return filteredLogs.reduce(
        (sum, l) => sum + (parseFloat(l.yieldLiters || l.yield || l.quantityLiters) || 0),
        0
      );
    }

    // Aggregation from animal intakeHistory if logs array is empty
    let sumFromAnimals = 0;
    animals.forEach((animal) => {
      const historyList = Array.isArray(animal.intakeHistory)
        ? animal.intakeHistory
        : Array.isArray(animal.history)
        ? animal.history
        : [];
      historyList.forEach((h) => {
        if (isDateInFilterRange(h.date || h.createdAt, dateFilter, startDate, endDate)) {
          sumFromAnimals +=
            Number(
              h.quantityLiters ||
                h.yieldLiters ||
                h.yield ||
                (Number(h.morning) || 0) + (Number(h.evening) || 0)
            ) || 0;
        }
      });
    });
    if (sumFromAnimals > 0) return sumFromAnimals;

    if (dateFilter === 'today' && Number(posCtx?.inventoryMetrics?.totalFarmYield) > 0) {
      return Number(posCtx.inventoryMetrics.totalFarmYield);
    }
    return 0;
  }, [milkingLogs, animals, dateFilter, startDate, endDate, posCtx?.inventoryMetrics?.totalFarmYield]);

  // Available live farm stock in cold room / chiller
  const availableFarmStock = useMemo(() => {
    if (posCtx?.inventoryMetrics) {
      const inv = posCtx.inventoryMetrics;
      const live = Number(inv.rawFarmMilkStock ?? inv.farmMilkStock ?? inv.availableFarmStock);
      if (!isNaN(live) && live >= 0 && (inv.rawFarmMilkStock !== undefined || inv.farmMilkStock !== undefined)) {
        return live;
      }
    }
    const farmSold = Number(posCtx?.farmSalesMetrics?.milkSold) || 0;
    return Math.max(0, totalFarmYield - farmSold);
  }, [posCtx?.inventoryMetrics, posCtx?.farmSalesMetrics?.milkSold, totalFarmYield]);

  const activeMilkingCount = milkingAnimals.length > 0 ? milkingAnimals.length : totalAnimals > 0 ? totalAnimals : 1;
  const avgAnimalYield = totalFarmYield > 0 ? totalFarmYield / activeMilkingCount : 0;

  const totalExpectedYield = useMemo(() => {
    return animals.reduce((sum, a) => {
      const exp = parseFloat(a.expectedDailyYield || a.expectedYield || a.purchaseExpectedYield || 0);
      return sum + (exp > 0 ? exp : 15.0);
    }, 0);
  }, [animals]);

  // Real Financial Metrics from POS & Expenses based on dateFilter
  const {
    periodNetProfit,
    monthlyNetProfit,
    periodFarmSales,
    periodFarmExpense,
    periodFarmRevenue,
    periodFarmExpenses,
    periodExpenseCount,
  } = useMemo(() => {
    const rawSales = Array.isArray(posCtx?.farmSalesHistory) ? posCtx.farmSalesHistory : [];
    const salesInPeriod = rawSales.filter((s) =>
      isDateInFilterRange(s.date || s.createdAt, dateFilter, startDate, endDate)
    );

    const periodSales = salesInPeriod.reduce((sum, s) => {
      const amt = Number(s.finalTotal || s.total || s.totalAmount || s.amount) || 0;
      return sum + amt;
    }, 0);

    const farmExpenses = expenses.filter((e) => {
      const scope = String(e.scope || e.expenseEntity || 'FARM').toUpperCase();
      return scope === 'FARM';
    });

    const expensesInPeriod = farmExpenses.filter((e) =>
      isDateInFilterRange(e.date || e.expenseDate || e.createdAt, dateFilter, startDate, endDate)
    );

    const periodExpense = expensesInPeriod.reduce((sum, e) => {
      const amt = Number(e.amountRupees ?? e.amount) || 0;
      return sum + amt;
    }, 0);

    const monthlyExpenses = farmExpenses.filter((e) =>
      isDateInFilterRange(e.date || e.expenseDate || e.createdAt, 'this_month')
    );
    const monthlyExpenseTotal = monthlyExpenses.reduce((sum, e) => sum + (Number(e.amountRupees ?? e.amount) || 0), 0);

    const monthlySales = rawSales.filter((s) =>
      isDateInFilterRange(s.date || s.createdAt, 'this_month')
    );
    const monthlySalesTotal = monthlySales.reduce(
      (sum, s) => sum + (Number(s.finalTotal || s.total || s.totalAmount || s.amount) || 0),
      0
    );

    return {
      periodNetProfit: periodSales - periodExpense,
      monthlyNetProfit: monthlySalesTotal - monthlyExpenseTotal,
      periodFarmSales: periodSales,
      periodFarmExpense: periodExpense,
      periodFarmRevenue: periodSales,
      periodFarmExpenses: periodExpense,
      periodExpenseCount: expensesInPeriod.length,
    };
  }, [posCtx?.farmSalesHistory, expenses, dateFilter, startDate, endDate]);

  // Production Trends (7 Days)
  const trendData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayLogs = milkingLogs.filter(
        (l) => (l.date || l.createdAt || '').slice(0, 10) === dateStr
      );
      const morning = dayLogs
        .filter((l) => (l.shift || '').toLowerCase() === 'morning')
        .reduce((sum, l) => sum + (parseFloat(l.yieldLiters || l.yield) || 0), 0);
      const evening = dayLogs
        .filter((l) => (l.shift || '').toLowerCase() === 'evening')
        .reduce((sum, l) => sum + (parseFloat(l.yieldLiters || l.yield) || 0), 0);

      const dayExpenses = expenses
        .filter((e) => (e.date || e.expenseDate || e.createdAt || '').slice(0, 10) === dateStr)
        .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

      const daySales = (posCtx?.farmSalesHistory || [])
        .filter((s) => (s.date || s.createdAt || '').slice(0, 10) === dateStr)
        .reduce((sum, s) => sum + (parseFloat(s.finalTotal || s.total) || 0), 0);

      days.push({
        date: dayLabel,
        morning: morning || Math.round((totalFarmYield * 0.55) / 7),
        evening: evening || Math.round((totalFarmYield * 0.45) / 7),
        revenue: daySales,
        cost: dayExpenses,
        profit: daySales - dayExpenses,
      });
    }
    return days;
  }, [milkingLogs, expenses, posCtx?.farmSalesHistory, totalFarmYield]);

  // Animal Bar Chart Data
  const animalBarData = useMemo(() => {
    return animals.slice(0, 6).map((a) => {
      const hist = a.intakeHistory || a.history || [];
      const latest = hist[hist.length - 1] || {};
      return {
        name: a.tag || a.name || 'Animal',
        morning: Number(latest.morning) || Math.round((parseYield(a.expectedDailyYield || 12)) * 0.55),
        evening: Number(latest.evening) || Math.round((parseYield(a.expectedDailyYield || 12)) * 0.45),
      };
    });
  }, [animals]);

  // Expenses Breakdown by Category
  const expensesByCategory = useMemo(() => {
    const cats = {};
    const farmExpenses = expenses.filter((e) => {
      const scope = String(e.scope || e.expenseEntity || 'FARM').toUpperCase();
      return scope === 'FARM';
    });
    const filteredExpenses = farmExpenses.filter((e) =>
      isDateInFilterRange(e.date || e.expenseDate || e.createdAt, dateFilter, startDate, endDate)
    );
    filteredExpenses.forEach((e) => {
      const cat = e.category || 'General';
      cats[cat] = (cats[cat] || 0) + (parseFloat(e.amountRupees ?? e.amount) || 0);
    });
    return {
      list: Object.entries(cats).slice(0, 4),
      total: Object.values(cats).reduce((a, b) => a + b, 0),
    };
  }, [expenses, dateFilter, startDate, endDate]);

  // Drilldown View Handlers
  if (selectedAnimalId) {
    const selectedAnimal = animals.find(
      (a) =>
        String(a.id || a._id) === String(selectedAnimalId) ||
        String(a._id || a.id) === String(selectedAnimalId) ||
        String(a.tag || a.tagNumber || '').toLowerCase() === String(selectedAnimalId).toLowerCase()
    );
    const resolvedAnimalId = selectedAnimal ? (selectedAnimal._id || selectedAnimal.id) : selectedAnimalId;

    return (
      <AnimalDetail
        animal={selectedAnimal}
        animalId={resolvedAnimalId}
        onBack={() => setSelectedAnimalId(null)}
        onClose={() => setSelectedAnimalId(null)}
        onEdit={(animal) => {
          setSelectedAnimalId(null);
          setEditAnimal(animal);
        }}
      />
    );
  }

  if (editAnimal) {
    return (
      <AnimalAdd
        editingAnimal={editAnimal}
        onBack={() => setEditAnimal(null)}
        onSuccess={() => setEditAnimal(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Date Filter Bar */}
      <DashboardDateFilterBar
        dateFilter={dateFilter}
        onFilterChange={setDateFilter}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        theme="emerald"
      />

      {/* Metrics Row */}
      <FarmCardOverflow
        totalAnimals={totalAnimals}
        cowsCount={cowsCount}
        buffCount={buffCount}
        totalFarmYield={totalFarmYield}
        totalExpectedYield={totalExpectedYield}
        availableFarmStock={availableFarmStock}
        avgAnimalYield={avgAnimalYield}
        dailyNetProfit={periodNetProfit}
        monthlyNetProfit={monthlyNetProfit}
        todayFarmRevenue={periodFarmSales}
        todayFarmExpenses={periodFarmExpense}
        periodFarmExpense={periodFarmExpense}
        periodFarmExpenses={periodFarmExpense}
        totalFarmExpense={periodFarmExpense}
        expenseCount={periodExpenseCount}
        periodExpenseCount={periodExpenseCount}
        dateFilter={dateFilter}
        startDate={startDate}
        endDate={endDate}
        periodLabel={periodLabel}
      />

      {/* Charts Grid */}
      <FarmDashboardCharts
        trendData={trendData}
        animalBarData={animalBarData}
        expensesByCategory={expensesByCategory}
      />

      {/* Dynamic Bottom Register: Herd Directory */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Herd Register &amp; Directory
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {animals.length} Animals Registered
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive registry of active dairy cows and buffaloes with yields, health status, and lifecycle records
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditAnimal(null);
                navigate('/farm/animals');
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#009966] hover:bg-[#008055] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-3" />
              <span>Add Animal</span>
            </button>
          </div>
        </div>

        <AnimalTable
          onSelectAnimal={(id) => setSelectedAnimalId(id)}
          onEditAnimal={(animal) => setEditAnimal(animal)}
        />
      </div>
    </div>
  );
}
