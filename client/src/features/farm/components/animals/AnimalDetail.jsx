import React, { useState } from 'react';
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

export default function AnimalDetail({
  animalId,
  onClose,
  onBack,
  onEdit,
  onDelete,
}) {
  const { animals = [], deleteAnimal } = useAnimalContext();
  const handleBack = onBack || onClose;

  const [isEditingInline, setIsEditingInline] = useState(false);

  const animal = animals.find(
    (a) =>
      String(a.id) === String(animalId) ||
      String(a.tag).toLowerCase() === String(animalId).toLowerCase()
  );

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

  const chartData =
    animal.history && animal.history.length > 0
      ? animal.history
      : [
          { date: '18 Aug', morning: 8.2, evening: 7.0 },
          { date: '19 Aug', morning: 8.8, evening: 7.3 },
          { date: '20 Aug', morning: 8.0, evening: 6.8 },
          { date: '21 Aug', morning: 9.1, evening: 7.5 },
          { date: '22 Aug', morning: 8.5, evening: 7.2 },
          { date: '23 Aug', morning: 8.9, evening: 7.4 },
          { date: '24 Aug', morning: 8.5, evening: 7.2 },
        ];

  return (
    <div className="space-y-4 animate-in fade-in duration-150 pb-8">
      {/* Top action & header bar - EXACT StaffDetail match */}
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
              Tag #{animal.tag} • Registered on {animal.acquisitionDate || 'Recently'}
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
      </div>
    </div>
  );
}
