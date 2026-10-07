import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Beef,
  Activity,
  Milk,
  DollarSign,
  Calendar,
  Tag,
  ShieldCheck,
  TrendingUp,
  FileText,
  Droplets,
  Sun,
  Moon,
  Check,
  ChevronRight,
  X,
  Eye,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAnimalContext } from '../../../../context/AnimalContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import AnimalAdd from './AnimalAdd';

const getTodayDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const normalizeDate = (dateVal) => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateVal)) return dateVal.slice(0, 10);
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal).slice(0, 10);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function AnimalDetail({
  animalId,
  onClose,
  onBack,
  onEdit,
  onDelete,
}) {
  const { animals = [], milkingLogs = [], deleteAnimal } = useAnimalContext();
  const handleBack = onBack || onClose;

  const [isEditingInline, setIsEditingInline] = useState(false);
  const [shiftFilter, setShiftFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [customDate, setCustomDate] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const animal = animals.find(
    (a) =>
      String(a.id) === String(animalId) ||
      String(a.tag).toLowerCase() === String(animalId).toLowerCase()
  );

  // Filter logs strictly belonging to THIS specific cow or buffalo
  const animalLogs = useMemo(() => {
    if (!animal) return [];
    const tag = (animal.tag || '').trim().toLowerCase();
    const id = String(animal.id || animal._id || '');
    const name = (animal.name || '').trim().toLowerCase();

    // Match only records belonging to THIS specific animal (same cow or buffalo)
    const matched = (milkingLogs || []).filter((log) => {
      const logTag = (log.animalTag || log.tag || log.animal?.tag || log.animalId?.tagNumber || log.animalId?.tag || '').trim().toLowerCase();
      const logId = String(log.animalId?._id || log.animalId || log.animal?._id || log.animal?.id || '');
      const logName = (log.animalName || '').trim().toLowerCase();

      return (
        (tag && logTag === tag) ||
        (id && logId === id) ||
        (name && logName === name && name !== 'cow' && name !== 'buffalo')
      );
    });

    const isBuff = (animal.species || '').toLowerCase().includes('buffalo');
    const mExp = parseFloat(animal.morningYield || 0) || (isBuff ? 9.0 : 8.0);
    const eExp = parseFloat(animal.eveningYield || 0) || (isBuff ? 7.5 : 7.0);

    if (matched.length > 0) {
      return matched
        .map((log) => {
          const isMorning = (log.shift || '').toLowerCase().includes('morning');
          const actual = parseFloat(log.yieldLiters || log.quantityLiters || log.yield) || 0;
          const expected = isMorning ? mExp : eExp;
          const variance = parseFloat((actual - expected).toFixed(1));
          const dateStr = normalizeDate(log.date) || getTodayDateStr();

          return {
            id: log.id || log._id || `${animal.tag}-${dateStr}-${log.shift}`,
            date: dateStr,
            shift: isMorning ? 'Morning' : 'Evening',
            actualYield: actual,
            expectedYield: expected,
            variance,
            fat: log.fat || (isBuff ? 6.8 : 4.5),
            snf: log.snf || 8.6,
            lr: log.lr || 28.5,
            milkedBy: log.operatorId?.name || log.milkedBy || (isMorning ? 'Morning Milker' : 'Evening Milker'),
            chiller: log.chiller || 'Dock Chiller-1',
            status: log.status || 'Verified',
            notes: log.notes || '',
          };
        })
        .sort((a, b) => b.date.localeCompare(a.date));
    }

    // If no logs recorded yet in database for this animal, check animal.history
    if (animal.history && Array.isArray(animal.history) && animal.history.length > 0) {
      const list = [];
      animal.history.forEach((h) => {
        const dateStr = normalizeDate(h.date);
        if (!dateStr) return;
        if (h.morning !== undefined && h.morning !== null) {
          const mYield = parseFloat(h.morning) || 0;
          list.push({
            id: `hist-${animal.tag}-${dateStr}-M`,
            date: dateStr,
            shift: 'Morning',
            actualYield: mYield,
            expectedYield: mExp,
            variance: parseFloat((mYield - mExp).toFixed(1)),
            fat: isBuff ? 6.8 : 4.5,
            snf: 8.6,
            lr: 28.5,
            milkedBy: 'Morning Milker',
            chiller: 'Dock Chiller-1',
            status: 'Verified',
            notes: 'Historical intake record',
          });
        }
        if (h.evening !== undefined && h.evening !== null) {
          const eYield = parseFloat(h.evening) || 0;
          list.push({
            id: `hist-${animal.tag}-${dateStr}-E`,
            date: dateStr,
            shift: 'Evening',
            actualYield: eYield,
            expectedYield: eExp,
            variance: parseFloat((eYield - eExp).toFixed(1)),
            fat: isBuff ? 7.1 : 4.8,
            snf: 8.8,
            lr: 28.5,
            milkedBy: 'Evening Milker',
            chiller: 'Dock Chiller-1',
            status: 'Verified',
            notes: 'Historical intake record',
          });
        }
      });
      return list.sort((a, b) => b.date.localeCompare(a.date));
    }

    return [];
  }, [animal, milkingLogs]);

  // Filtered logs based on shift and date filters
  const filteredAnimalLogs = useMemo(() => {
    return animalLogs.filter((log) => {
      if (shiftFilter !== 'All' && log.shift.toLowerCase() !== shiftFilter.toLowerCase()) {
        return false;
      }
      if (dateFilter === 'Today') {
        const today = getTodayDateStr();
        if (log.date !== today) return false;
      } else if (dateFilter === 'Custom' && customDate) {
        if (log.date !== customDate) return false;
      }
      return true;
    });
  }, [animalLogs, shiftFilter, dateFilter, customDate]);

  // Compute 7-day chart data for milk production trend
  const chartData = useMemo(() => {
    const dateMap = {};

    (animalLogs || []).forEach((log) => {
      const dStr = log.date || getTodayDateStr();
      if (!dateMap[dStr]) {
        dateMap[dStr] = { date: dStr, morning: 0, evening: 0 };
      }
      if ((log.shift || '').toLowerCase() === 'morning') {
        dateMap[dStr].morning += parseFloat(log.actualYield) || 0;
      } else if ((log.shift || '').toLowerCase() === 'evening') {
        dateMap[dStr].evening += parseFloat(log.actualYield) || 0;
      }
    });

    const dates = Object.keys(dateMap).sort();
    if (dates.length > 0) {
      return dates.slice(-7).map((d) => ({
        date: d.length > 5 ? d.slice(5) : d,
        morning: dateMap[d].morning,
        evening: dateMap[d].evening,
      }));
    }

    return [];
  }, [animalLogs]);

  const morningCount = animalLogs.filter((l) => l.shift?.toLowerCase() === 'morning').length;
  const eveningCount = animalLogs.filter((l) => l.shift?.toLowerCase() === 'evening').length;

  if (!animal) {
    return (
      <div className="p-8 bg-slate-50 min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
          <Beef className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-800 font-display">
          Animal Record Not Found
        </h2>
        <p className="text-xs text-slate-500">
          The requested livestock profile does not exist or has been removed.
        </p>
        <button
          onClick={handleBack}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer transition shadow-2xs"
        >
          Back to Livestock
        </button>
      </div>
    );
  }

  // If currently editing inline
  if (isEditingInline) {
    return (
      <AnimalAdd
        editingAnimal={animal}
        onBack={() => setIsEditingInline(false)}
        onSuccess={() => setIsEditingInline(false)}
      />
    );
  }

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to remove animal "${animal.tag}" from the livestock registry?`
      )
    ) {
      if (onDelete) {
        onDelete(animal.id);
      } else {
        deleteAnimal(animal.id);
      }
      if (handleBack) handleBack();
    }
  };

  const handleStartEdit = () => {
    if (onEdit) {
      onEdit(animal);
    } else {
      setIsEditingInline(true);
    }
  };

  const getSpeciesBadgeStyle = (species) => {
    const s = (species || '').toLowerCase();
    if (s.includes('buffalo')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150 pb-8">
      {/* Top action & header bar - EXACT SupplierDetail match */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Livestock
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
              Livestock Profile — {animal.tag}
            </h1>
            <p className="text-xs text-slate-500">
              Tag: {animal.tag} • Registered on {animal.acquisitionDate || 'Recently'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartEdit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200/70 transition shadow-2xs cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Animal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200/70 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Main details card container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        {/* Profile Hero Section */}
        <div className="bg-[#f8fafc] p-5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {animal.image ? (
              <img
                src={animal.image}
                alt={animal.tag}
                className="w-16 h-16 rounded-full object-cover border border-emerald-200 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-2xl shadow-xs shrink-0 font-display">
                <Beef className="w-8 h-8 text-emerald-700" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  {animal.tag}
                </h2>
                {animal.name && animal.name !== animal.tag && (
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-700">
                    {animal.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-md border ${getSpeciesBadgeStyle(
                    animal.species
                  )}`}
                >
                  {animal.species || 'Cow (Sahiwal)'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {animal.lactationStatus || 'Milking'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Daily Milk Yield
              </span>
              <span className="text-2xl font-black text-emerald-700 font-mono">
                {animal.totalDailyYield || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Highlight Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/70">
            <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Milk className="w-3.5 h-3.5" />
              Morning Yield
            </div>
            <p className="text-base font-black text-slate-900 font-mono">
              {animal.morningYield || '0.0 L'}
            </p>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/70">
            <div className="flex items-center gap-1.5 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Milk className="w-3.5 h-3.5" />
              Evening Yield
            </div>
            <p className="text-base font-black text-slate-900 font-mono">
              {animal.eveningYield || '0.0 L'}
            </p>
          </div>

          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70">
            <div className="flex items-center gap-1.5 text-amber-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Expected Yield
            </div>
            <p className="text-base font-bold text-slate-800 font-mono">
              {animal.expectedYield || animal.totalDailyYield || '15.0 L'}
            </p>
          </div>

          <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200/70">
            <div className="flex items-center gap-1.5 text-purple-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5" />
              Acquisition Date
            </div>
            <p className="text-sm font-bold text-slate-800 font-mono">
              {animal.acquisitionDate || 'Recently'}
            </p>
          </div>
        </div>

        {/* Breakdown & Production History Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Left Column: Information Cards */}
          <div className="space-y-4">
            {/* Identification & Health */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-600">
                <Tag className="w-4 h-4 text-slate-500" />
                Identification &amp; Health
              </h3>
              <div className="space-y-2.5 divide-y divide-slate-200/60 text-slate-700">
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-slate-500">Official Tag #:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {animal.tag}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500">Animal Identifier:</span>
                  <span className="font-medium text-slate-800">
                    {animal.name || animal.tag}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500">Species &amp; Breed:</span>
                  <span className="font-bold text-slate-800">
                    {animal.species || 'Cow (Sahiwal)'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500">Lactation Status:</span>
                  <span className="font-bold text-emerald-700">
                    {animal.lactationStatus || 'Milking'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Health Status:
                  </span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {animal.healthStatus || 'Healthy & Vaccinated'}
                  </span>
                </div>
              </div>
            </div>

            {/* Valuation & Notes */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-600">
                <DollarSign className="w-4 h-4 text-slate-500" />
                Valuation &amp; Notes
              </h3>
              <div className="space-y-2.5 divide-y divide-slate-200/60 text-slate-700">
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-slate-500">Acquisition Price:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {animal.purchasePrice || 'Rs 200,000'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500">Date Registered:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {animal.acquisitionDate || 'Recently'}
                  </span>
                </div>
                <div className="flex justify-between items-start pt-2">
                  <span className="text-slate-500 flex items-center gap-1 shrink-0">
                    <FileText className="w-3.5 h-3.5 text-slate-400" /> Notes:
                  </span>
                  <span className="text-slate-700 font-normal text-right pl-3">
                    {animal.notes || 'No additional remarks recorded for this animal.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Milk Yield Trend Chart */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-600 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                7-Day Milk Production History
              </h3>
              <p className="text-[11px] text-slate-500">
                Daily yield recorded across Morning and Evening milking shifts.
              </p>
            </div>

            <div className="h-60 w-full bg-white rounded-xl p-2 border border-slate-200/60 shadow-2xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="morningGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00a86b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00a86b" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="eveningGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '11px',
                      border: 'none',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="morning"
                    name="Morning (L)"
                    stroke="#00a86b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#morningGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="evening"
                    name="Evening (L)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#eveningGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-2 pt-1 border-t border-slate-200/60">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00a86b]" /> Morning Yield
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Evening Yield
              </span>
              <span className="font-mono font-bold text-slate-700">
                Avg: {((parseFloat(animal.morningYield || 0) + parseFloat(animal.eveningYield || 0)) || 15.0).toFixed(1)} L/day
              </span>
            </div>
          </div>
        </div>

        {/* Farm Milking & Intake Records Container - EXACT SupplierDetail table structure */}
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col space-y-4 shadow-2xs text-xs">
          {/* Header & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
            {/* Title / Badges */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center shadow-2xs">
                <Droplets className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Farm Milking &amp; Intake Records
                </h3>
                <p className="text-[11px] text-slate-500">
                  Intake records for <strong className="text-slate-700">{animal.tag}</strong> {animal.name && `(${animal.name})`} • {animal.species || 'Livestock'}
                </p>
              </div>
            </div>

            {/* Filter Controls: Date & Shift */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Date Filter: All / Today */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter('All');
                    setCustomDate('');
                  }}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    dateFilter === 'All'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Dates
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter('Today');
                    setCustomDate('');
                  }}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    dateFilter === 'Today'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Today
                </button>
              </div>

              {/* Date Picker */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setDateFilter(e.target.value ? 'Custom' : 'All');
                  }}
                  className="bg-transparent border-none outline-none text-xs font-medium cursor-pointer"
                />
                {customDate && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomDate('');
                      setDateFilter('All');
                    }}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold ml-1 cursor-pointer"
                    title="Clear date"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Shift Filter Controls: All / Morning / Evening */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setShiftFilter('All')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    shiftFilter === 'All'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All ({animalLogs.length})
                </button>

                <button
                  type="button"
                  onClick={() => setShiftFilter('Morning')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    shiftFilter === 'Morning'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Sun className="w-3 h-3 text-amber-300" />
                  <span>Morning ({morningCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShiftFilter('Evening')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    shiftFilter === 'Evening'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Moon className="w-3 h-3 text-indigo-200" />
                  <span>Evening ({eveningCount})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-2xs">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Date &amp; Shift</th>
                  <th className="px-4 py-3">Actual Intake Yield</th>
                  <th className="px-4 py-3">Expected Benchmark</th>
                  <th className="px-4 py-3">Yield Variance</th>
                  <th className="px-4 py-3">Quality Test</th>
                  <th className="px-4 py-3">Operator / Station</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAnimalLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-400 font-medium">
                      No {shiftFilter !== 'All' ? shiftFilter.toLowerCase() : ''} intake records found for this {animal.species || 'animal'}.
                    </td>
                  </tr>
                ) : (
                  filteredAnimalLogs.map((log) => {
                    const isMorn = log.shift === 'Morning';
                    const isPositive = log.variance >= 0;

                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedRecord(log)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-slate-800">{log.date}</span>
                          <span className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold mt-0.5">
                            {isMorn ? (
                              <Sun className="w-3 h-3 text-amber-500" />
                            ) : (
                              <Moon className="w-3 h-3 text-indigo-500" />
                            )}
                            {log.shift} Shift
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-700 text-sm">
                          {log.actualYield.toFixed(1)} L
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600">
                          {log.expectedYield.toFixed(1)} L
                        </td>
                        <td className="px-4 py-3">
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
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                          Fat: {log.fat}% • SNF: {log.snf}%
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-medium">
                          {log.milkedBy || 'Milker'}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {log.chiller || 'Chiller-1'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            {log.status || 'Verified'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 group-hover:underline">
                            View Slip <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Milking Slip Detail Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedRecord.shift === 'Morning' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {selectedRecord.shift === 'Morning' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Farm Milking Slip — {animal.tag}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedRecord.date} • {selectedRecord.shift} Shift
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/70">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block mb-1">
                    Actual Intake Yield
                  </span>
                  <span className="text-2xl font-black text-emerald-700 font-mono">
                    {selectedRecord.actualYield.toFixed(1)} L
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Expected Yield
                  </span>
                  <span className="text-2xl font-black text-slate-800 font-mono">
                    {selectedRecord.expectedYield.toFixed(1)} L
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="flex justify-between items-center p-3 bg-white">
                  <span className="text-slate-500">Animal Tag / Identifier:</span>
                  <span className="font-bold text-slate-900 font-mono">{animal.tag} {animal.name && `(${animal.name})`}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50/50">
                  <span className="text-slate-500">Species / Breed:</span>
                  <span className="font-medium text-slate-800">{animal.species || 'Cow'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white">
                  <span className="text-slate-500">Yield Variance:</span>
                  <span className={`font-mono font-bold ${selectedRecord.variance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {selectedRecord.variance >= 0 ? `+${selectedRecord.variance.toFixed(1)}` : selectedRecord.variance.toFixed(1)} Liters
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50/50">
                  <span className="text-slate-500">Fat Percentage:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedRecord.fat}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white">
                  <span className="text-slate-500">SNF / Lactometer (LR):</span>
                  <span className="font-mono font-bold text-slate-900">{selectedRecord.snf}% • LR {selectedRecord.lr}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50/50">
                  <span className="text-slate-500">Milked By:</span>
                  <span className="font-medium text-slate-800">{selectedRecord.milkedBy}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white">
                  <span className="text-slate-500">Chiller Destination:</span>
                  <span className="font-medium text-slate-800">{selectedRecord.chiller}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
