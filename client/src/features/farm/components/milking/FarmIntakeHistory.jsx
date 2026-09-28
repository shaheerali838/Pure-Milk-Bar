import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Eye,
  Calendar,
  Droplets,
  TrendingUp,
  TrendingDown,
  Sun,
  Moon,
  Milk,
  CheckCircle2,
  Plus,
  ArrowRight,
  Filter,
  Check,
  ChevronRight,
  Info,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useAnimalContext } from '@/context/AnimalContext';
import { Badge } from '@/components/ui/badge';

export default function FarmIntakeHistory({ onNewIntake, onEditIntake }) {
  const { animals = [], milkingLogs = [], deleteMilkingLog, updateMilkingLog } = useAnimalContext();

  const [search, setSearch] = useState('');
  const [shiftFilter, setShiftFilter] = useState('All');
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedLogs, setSelectedLogs] = useState([]);

  // Map animals by tag for quick lookup
  const animalMap = useMemo(() => {
    const map = {};
    animals.forEach((a) => {
      if (a.tag) map[a.tag] = a;
    });
    return map;
  }, [animals]);

  // Enrich milkingLogs with animal data and expected yield variance
  const enrichedLogs = useMemo(() => {
    return milkingLogs.map((log) => {
      const animal = animalMap[log.animalTag] || {};
      const isBuff =
        (animal.species && animal.species.toLowerCase().includes('buffalo')) ||
        (log.animalTag && log.animalTag.startsWith('BUF'));

      const mVal = parseFloat(animal.morningYield || 0);
      const eVal = parseFloat(animal.eveningYield || 0);
      const expVal = parseFloat(animal.expectedYield || animal.totalDailyYield || 0);

      const dailyExpected = expVal > 0 ? expVal : (mVal + eVal > 0 ? mVal + eVal : 15.0);
      const isMorning = (log.shift || '').toLowerCase().includes('morning');
      const expectedShiftYield = isMorning
        ? (mVal > 0 ? mVal : parseFloat((dailyExpected / 2).toFixed(1)))
        : (eVal > 0 ? eVal : parseFloat((dailyExpected / 2).toFixed(1)));

      const actualYield = parseFloat(log.yieldLiters || log.yield) || 0;
      const variance = parseFloat((actualYield - expectedShiftYield).toFixed(1));

      return {
        ...log,
        animalName: animal.name || `Cattle ${log.animalTag}`,
        species: isBuff ? 'Buffalo' : 'Cow',
        breed: animal.species || (isBuff ? 'Nili Ravi Buffalo' : 'Sahiwal Cow'),
        actualYield,
        expectedShiftYield,
        dailyExpected,
        variance,
        dateStr: log.date ? log.date.split('T')[0] : new Date().toISOString().split('T')[0],
      };
    });
  }, [milkingLogs, animalMap]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return enrichedLogs.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.animalTag && item.animalTag.toLowerCase().includes(q)) ||
        (item.animalName && item.animalName.toLowerCase().includes(q)) ||
        (item.breed && item.breed.toLowerCase().includes(q));

      const matchesShift =
        shiftFilter === 'All'
          ? true
          : (item.shift || '').toLowerCase() === shiftFilter.toLowerCase();

      const matchesSpecies =
        speciesFilter === 'All'
          ? true
          : (item.species || '').toLowerCase() === speciesFilter.toLowerCase();

      const matchesDate = !selectedDate || item.dateStr === selectedDate;

      return matchesSearch && matchesShift && matchesSpecies && matchesDate;
    });
  }, [enrichedLogs, search, shiftFilter, speciesFilter, selectedDate]);

  // Aggregated Summary Metrics
  const totalActualMilk = useMemo(() => {
    return filteredLogs.reduce((sum, item) => sum + item.actualYield, 0);
  }, [filteredLogs]);

  const totalExpectedMilk = useMemo(() => {
    return filteredLogs.reduce((sum, item) => sum + item.expectedShiftYield, 0);
  }, [filteredLogs]);

  const totalNetVariance = totalActualMilk - totalExpectedMilk;
  const variancePercent = totalExpectedMilk > 0
    ? ((totalNetVariance / totalExpectedMilk) * 100).toFixed(1)
    : 0;

  const handleBulkDelete = async () => {
    if (selectedLogs.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedLogs.length} selected records?`)) {
      try {
        await Promise.all(selectedLogs.map(id => deleteMilkingLog(id)));
        setSelectedLogs([]);
      } catch (error) {
        const msg = error.response?.data?.message || error.message || 'Unknown error occurred';
        alert(`Failed to delete some records: ${msg}`);
      }
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Top Summary Cards (Styled like Supplier Intake Register) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Actual Intake
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 font-display">
                {totalActualMilk.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-slate-500">Liters</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
              <Droplets className="w-3 h-3" /> Farm Direct Yield
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Milk className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Expected Benchmark
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 font-display">
                {totalExpectedMilk.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-slate-500">Liters</span>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 inline-flex items-center gap-1">
              Herd Baseline Standard
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Net Farm Variance
            </span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-2xl font-black font-display ${
                  totalNetVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {totalNetVariance >= 0 ? `+${totalNetVariance.toFixed(1)}` : totalNetVariance.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-slate-500">L ({variancePercent}%)</span>
            </div>
            <span
              className={`text-[11px] font-bold mt-1 inline-flex items-center gap-1 ${
                totalNetVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {totalNetVariance >= 0 ? (
                <>
                  <TrendingUp className="w-3 h-3" /> Surplus Yield
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3" /> Production Deficit
                </>
              )}
            </span>
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              totalNetVariance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {totalNetVariance >= 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Logged Records
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 font-display">
                {filteredLogs.length}
              </span>
              <span className="text-xs font-bold text-slate-500">entries</span>
            </div>
            <span className="text-[11px] text-indigo-600 font-semibold mt-1 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Server Synced
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar (Exact Supplier Intake Register Match) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="flex items-center gap-2 w-full md:w-80 bg-slate-50 border border-slate-200 rounded-full px-3.5 h-[38px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search cattle tag, breed, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-700 placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          {/* Shift Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold text-slate-600">
            {['All', 'Morning', 'Evening'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setShiftFilter(s)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  shiftFilter === s
                    ? 'bg-white text-indigo-600 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                {s === 'Morning' && <Sun className="w-3 h-3 inline mr-1 text-amber-500" />}
                {s === 'Evening' && <Moon className="w-3 h-3 inline mr-1 text-indigo-500" />}
                {s}
              </button>
            ))}
          </div>

          {/* Species Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold text-slate-600">
            {['All', 'Cow', 'Buffalo'].map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setSpeciesFilter(sp)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  speciesFilter === sp
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                {sp}
              </button>
            ))}
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-medium cursor-pointer"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                title="Clear date filter"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {selectedLogs.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected ({selectedLogs.length})
              </button>
            )}
            
            {/* Quick Action: Log New Intake */}
            {onNewIntake && (
              <button
                type="button"
                onClick={onNewIntake}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Log Intake
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Intake History Data Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Farm Milking &amp; Intake Records
            </h3>
            <p className="text-xs text-slate-400">
              Click any row to open the complete Yield &amp; Variance Detail Sheet
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Showing <strong className="text-slate-800">{filteredLogs.length}</strong> entries
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center px-4 flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
              <Droplets className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 font-display">
              No Milking Records Found
            </h4>
            <p className="text-xs text-slate-400 max-w-sm">
              {search || shiftFilter !== 'All' || selectedDate
                ? 'Try clearing your search query or filters.'
                : 'Click "Log Intake" or switch to the Milking Register to enter today\'s morning and evening yield.'}
            </p>
            {onNewIntake && (
              <button
                type="button"
                onClick={onNewIntake}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Go to Milking Register
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">
                    <input 
                      type="checkbox" 
                      checked={filteredLogs.length > 0 && selectedLogs.length === filteredLogs.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedLogs(filteredLogs.map(log => log.id));
                        else setSelectedLogs([]);
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" 
                    />
                  </th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Cattle Tag</th>
                  <th className="py-3 px-4">Animal &amp; Species</th>
                  <th className="py-3 px-4 text-right">Actual Yield</th>
                  <th className="py-3 px-4 text-right">Expected Yield</th>
                  <th className="py-3 px-4 text-right">Yield Variance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredLogs.map((log, idx) => {
                  const isMorning = (log.shift || '').toLowerCase().includes('morning');
                  const isPositive = log.variance >= 0;

                  return (
                    <tr
                      key={log.id || `${log.animalTag}-${log.dateStr}-${log.shift}-${idx}`}
                      onClick={() => setSelectedRecord(log)}
                      className="hover:bg-indigo-50/40 transition duration-150 cursor-pointer group"
                    >
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedLogs.includes(log.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedLogs(prev => [...prev, log.id]);
                            else setSelectedLogs(prev => prev.filter(id => id !== log.id));
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" 
                        />
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                        {log.dateStr}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isMorning
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {isMorning ? (
                            <Sun className="w-3 h-3 text-amber-500" />
                          ) : (
                            <Moon className="w-3 h-3 text-indigo-500" />
                          )}
                          {log.shift}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                          {log.animalTag}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                            {log.animalName}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                              log.species === 'Buffalo'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {log.species}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                        {log.actualYield.toFixed(1)} L
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-500 whitespace-nowrap">
                        {log.expectedShiftYield.toFixed(1)} L
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isPositive ? `+${log.variance.toFixed(1)}` : log.variance.toFixed(1)} L
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          Logged
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this milking log?')) {
                                try {
                                  await deleteMilkingLog(log.id);
                                } catch (error) {
                                  const msg = error.response?.data?.message || error.message || 'Unknown error occurred';
                                  alert(`Failed to delete milking log: ${msg}`);
                                }
                              }
                            }}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 shadow-2xs transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </button>
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (onEditIntake) {
                                onEditIntake(log);
                              } else {
                                const newYield = window.prompt('Enter new yield (Liters) for this record:', log.actualYield);
                                if (newYield && !isNaN(parseFloat(newYield))) {
                                  try {
                                    await updateMilkingLog(log.id, { yieldLiters: parseFloat(newYield) });
                                  } catch (error) {
                                    alert('Failed to update yield');
                                  }
                                }
                              }
                            }}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecord(log);
                            }}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs transition cursor-pointer"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Detailed Intake Modal View */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Milk className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Milking Intake Detail Sheet
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tag #{selectedRecord.animalTag} • {selectedRecord.animalName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-xs">
              {/* Top Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Recorded Date &amp; Shift
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {selectedRecord.dateStr} • {selectedRecord.shift} Shift
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    selectedRecord.shift === 'Morning'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }
                >
                  {selectedRecord.shift}
                </Badge>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Actual Yield
                  </span>
                  <span className="text-lg font-black text-indigo-600 font-mono">
                    {selectedRecord.actualYield.toFixed(1)} L
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Benchmark
                  </span>
                  <span className="text-lg font-black text-slate-600 font-mono">
                    {selectedRecord.expectedShiftYield.toFixed(1)} L
                  </span>
                </div>

                <div
                  className={`border rounded-xl p-3 ${
                    selectedRecord.variance >= 0
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50/70 border-rose-200 text-rose-800'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 opacity-80">
                    Variance
                  </span>
                  <span className="text-lg font-black font-mono">
                    {selectedRecord.variance >= 0
                      ? `+${selectedRecord.variance.toFixed(1)}`
                      : selectedRecord.variance.toFixed(1)}{' '}
                    L
                  </span>
                </div>
              </div>

              {/* Cattle Information */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400" /> Cattle Profile
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Identification Tag:</span>
                    <strong className="text-slate-800 font-mono">{selectedRecord.animalTag}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Species &amp; Breed:</span>
                    <strong className="text-slate-800">{selectedRecord.breed}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Daily Expected:</span>
                    <strong className="text-slate-800 font-mono">{selectedRecord.dailyExpected.toFixed(1)} L/day</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Record Status:</span>
                    <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Saved on Database
                    </span>
                  </div>
                </div>
              </div>

              {/* Variance Analysis Note */}
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-amber-900 leading-relaxed text-[11px]">
                <strong>Farm Variance Logic:</strong>{' '}
                {selectedRecord.variance >= 0
                  ? `Yield exceeds benchmark target by +${selectedRecord.variance.toFixed(1)} liters. Cattle is performing at peak lactation health.`
                  : `Yield is below benchmark by ${selectedRecord.variance.toFixed(1)} liters. Check feed nutrition, water availability, or lactation curve.`}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer shadow-xs"
              >
                Close Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
