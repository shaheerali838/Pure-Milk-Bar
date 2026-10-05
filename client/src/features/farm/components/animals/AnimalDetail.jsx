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
  Plus,
  Loader2,
  Heart,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAnimalContext } from '../../../../context/AnimalContext';
import PKRIcon from '@/components/common/PKRIcon';
import AnimalSaleModal from './AnimalSaleModal';
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
  const { animals = [], milkingLogs = [], deleteAnimal, addAnimalIntake, saveMilkingShift } = useAnimalContext();
  const handleBack = onBack || onClose;

  const [isEditingInline, setIsEditingInline] = useState(false);
  const [shiftFilter, setShiftFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [customDate, setCustomDate] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);

  // Quick milk intake state directly for this animal
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [intakeForm, setIntakeForm] = useState({
    date: getTodayDateStr(),
    shift: 'Morning',
    quantity: '',
    milkedBy: 'Morning Milker',
    notes: '',
  });
  const [isSubmittingIntake, setIsSubmittingIntake] = useState(false);

  const animal = animals.find(
    (a) =>
      String(a.id || a._id) === String(animalId) ||
      String(a._id || a.id) === String(animalId) ||
      String(a.tag || a.tagNumber || '').toLowerCase() === String(animalId).toLowerCase() ||
      String(a.tagNumber || a.tag || '').toLowerCase() === String(animalId).toLowerCase()
  );

  // Filter & merge all intake and milking history strictly belonging to THIS specific cow or buffalo
  const animalLogs = useMemo(() => {
    if (!animal) return [];
    const tag = (animal.tag || animal.tagNumber || '').trim().toLowerCase();
    const animalMongoId = String(animal._id || '').toLowerCase();
    const animalIdStr = String(animal.id || '').toLowerCase();
    const name = (animal.name || '').trim().toLowerCase();

    const isBuff = (animal.species || '').toLowerCase().includes('buffalo');
    const mExp = parseFloat(animal.morningYield || 0) || (isBuff ? 9.0 : 8.0);
    const eExp = parseFloat(animal.eveningYield || 0) || (isBuff ? 7.5 : 7.0);

    const mergedList = [];
    const seenShiftDate = new Set();

    // 1. Process intakeHistory stored on the Animal document
    const rawIntakeHistory = Array.isArray(animal.intakeHistory) ? animal.intakeHistory : [];
    rawIntakeHistory.forEach((h) => {
      if (!h) return;
      const dateStr = normalizeDate(h.date) || getTodayDateStr();
      const rawShift = h.shift || (h.morning > 0 ? 'Morning' : (h.evening > 0 ? 'Evening' : 'Morning'));
      const shift = rawShift.charAt(0).toUpperCase() + rawShift.slice(1).toLowerCase();
      const isMorning = shift === 'Morning';
      const actual = parseFloat(h.quantityLiters ?? h.yieldLiters ?? h.yield ?? (isMorning ? h.morning : h.evening) ?? 0) || 0;
      const expected = isMorning ? mExp : eExp;
      const variance = parseFloat((actual - expected).toFixed(1));
      const shiftKey = `${dateStr}-${shift.toLowerCase()}`;

      if (!seenShiftDate.has(shiftKey)) {
        seenShiftDate.add(shiftKey);
        mergedList.push({
          id: h._id || h.id || `INTAKE-${animal.tag}-${dateStr}-${shift}`,
          animalId: animal._id || animal.id || '',
          animalTag: animal.tag || animal.tagNumber || '',
          date: dateStr,
          shift,
          actualYield: actual,
          quantityLiters: actual,
          expectedYield: expected,
          variance,
          milkedBy: h.operator || h.milkedBy || (isMorning ? 'Morning Milker' : 'Evening Milker'),
          chiller: h.chiller || 'Dock Chiller-1',
          status: h.status || 'Verified',
          notes: h.notes || 'Recorded intake',
          createdAt: h.createdAt || new Date(dateStr).toISOString(),
        });
      }
    });

    // 2. Match from milkingLogs collection (for logs not yet in animal.intakeHistory)
    (milkingLogs || []).forEach((log) => {
      const logTag = (log.animalTag || log.tag || log.animal?.tag || log.animalId?.tagNumber || log.animalId?.tag || '').trim().toLowerCase();
      const logId = String(log.animalId?._id || log.animalId?.id || log.animalId || log.animal?._id || log.animal?.id || '').toLowerCase();
      const logName = (log.animalName || '').trim().toLowerCase();

      const isMatch = (
        (tag && (logTag === tag || logTag === (animal.tagNumber || '').trim().toLowerCase())) ||
        (animalMongoId && logId === animalMongoId) ||
        (animalIdStr && logId === animalIdStr) ||
        (name && logName === name && name !== 'cow' && name !== 'buffalo')
      );

      if (isMatch) {
        const isMorning = (log.shift || '').toLowerCase().includes('morning');
        const shift = isMorning ? 'Morning' : 'Evening';
        const actual = parseFloat(log.yieldLiters || log.quantityLiters || log.yield) || 0;
        const expected = isMorning ? mExp : eExp;
        const variance = parseFloat((actual - expected).toFixed(1));
        const dateStr = normalizeDate(log.date) || getTodayDateStr();
        const shiftKey = `${dateStr}-${shift.toLowerCase()}`;

        if (!seenShiftDate.has(shiftKey)) {
          seenShiftDate.add(shiftKey);
          mergedList.push({
            id: log.id || log._id || `${animal.tag}-${dateStr}-${shift}`,
            animalId: animal._id || animal.id || '',
            animalTag: animal.tag || animal.tagNumber || '',
            date: dateStr,
            shift,
            actualYield: actual,
            quantityLiters: actual,
            expectedYield: expected,
            variance,
            milkedBy: log.operatorId?.name || log.milkedBy || (isMorning ? 'Morning Milker' : 'Evening Milker'),
            chiller: log.chiller || 'Dock Chiller-1',
            status: log.status || 'Verified',
            notes: log.notes || 'Milking log entry',
            createdAt: log.createdAt || (log.date ? new Date(log.date).toISOString() : new Date().toISOString()),
          });
        }
      }
    });

    // 3. Strict Descending Order: Latest entry at the top
    return mergedList.sort((a, b) => {
      const timeA = new Date(a.date || a.createdAt || 0).getTime();
      const timeB = new Date(b.date || b.createdAt || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return String(b.shift).localeCompare(String(a.shift));
    });
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

  const morningCount = animalLogs.filter((l) => l.shift?.toLowerCase() === 'morning').length;
  const eveningCount = animalLogs.filter((l) => l.shift?.toLowerCase() === 'evening').length;

  // 7-Day Milk Production History chart data for AreaChart
  const chartData = useMemo(() => {
    if (!animal) return [];
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      const label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      days.push({ key, label });
    }

    return days.map((d) => {
      const logsForDay = (animalLogs || []).filter((log) => {
        const logDate = log.date ? log.date.split('T')[0] : '';
        return logDate === d.key;
      });

      let morning = logsForDay
        .filter((l) => (l.shift || '').toLowerCase() === 'morning')
        .reduce((sum, l) => sum + (parseFloat(l.actualYield ?? l.quantityLiters ?? l.yield) || 0), 0);

      let evening = logsForDay
        .filter((l) => (l.shift || '').toLowerCase() === 'evening')
        .reduce((sum, l) => sum + (parseFloat(l.actualYield ?? l.quantityLiters ?? l.yield) || 0), 0);

      if (morning === 0 && evening === 0 && Array.isArray(animal.history)) {
        const histEntry = animal.history.find((h) => normalizeDate(h.date) === d.key);
        if (histEntry) {
          morning = parseFloat(histEntry.morning || 0);
          evening = parseFloat(histEntry.evening || 0);
        }
      }

      return {
        date: d.label,
        morning: parseFloat(morning.toFixed(1)),
        evening: parseFloat(evening.toFixed(1)),
      };
    });
  }, [animal, animalLogs]);

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

  const handleIntakeSubmit = async (e) => {
    e.preventDefault();
    const qty = parseFloat(intakeForm.quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid milk quantity in liters');
      return;
    }

    setIsSubmittingIntake(true);
    try {
      if (addAnimalIntake) {
        await addAnimalIntake(animal.id || animal._id, {
          date: intakeForm.date,
          shift: intakeForm.shift,
          quantityLiters: qty,
          yieldLiters: qty,
          operator: intakeForm.milkedBy,
          notes: intakeForm.notes,
        });
      } else if (saveMilkingShift) {
        await saveMilkingShift(intakeForm.shift, intakeForm.date, { [animal.tag]: qty }, intakeForm.milkedBy);
      }
      toast.success(`Successfully recorded ${qty} L ${intakeForm.shift} milk intake for ${animal.tag}!`);
      setIsIntakeModalOpen(false);
      setIntakeForm({
        date: getTodayDateStr(),
        shift: 'Morning',
        quantity: '',
        milkedBy: 'Morning Milker',
        notes: '',
      });
    } catch (err) {
      console.error('Failed to record intake:', err);
      toast.error('Failed to record milk intake');
    } finally {
      setIsSubmittingIntake(false);
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
          {!animal.isSold && (
            <button
              type="button"
              onClick={() => setIsSaleModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200/70 transition shadow-2xs cursor-pointer"
            >
              <PKRIcon className="w-3.5 h-3.5 text-amber-700" />
              Sell Animal
            </button>
          )}
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
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  Registered: {animal.acquisitionDate || (animal.createdAt ? String(animal.createdAt).split('T')[0] : 'Recently')}
                </span>
                {animal.hasCalf && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                    <Heart className="w-3 h-3 fill-pink-500" />
                    Calf: {animal.calfTag || 'Calf'} ({animal.calfGender || 'Male'})
                  </span>
                )}
                {animal.isSold && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    <PKRIcon className="w-3 h-3 text-rose-600" />
                    SOLD (Rs. {(animal.salePrice || 0).toLocaleString()})
                  </span>
                )}
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

        {/* Sold Status Banner */}
        {animal.isSold && (
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/70 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                <PKRIcon className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <span className="font-bold text-rose-900 text-sm block">
                  Livestock Animal Sold
                </span>
                <p className="text-rose-700 text-[11px]">
                  Sold on: {animal.saleDate ? String(animal.saleDate).split('T')[0] : 'Past'}
                  {animal.saleNotes && ` • Notes: ${animal.saleNotes}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-rose-600 block">Sale Revenue</span>
              <span className="font-mono font-black text-rose-900 text-base">
                Rs. {(animal.salePrice || 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Calf Information Banner if hasCalf is true */}
        {animal.hasCalf && (
          <div className="p-4 rounded-xl border border-pink-200 bg-pink-50/50 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 shadow-2xs shrink-0">
                <Heart className="w-5 h-5 fill-pink-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Calf at Side
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                    {animal.calfGender || 'Male'}
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5 text-xs">
                  Calf ID: <strong className="font-mono text-slate-900">{animal.calfTag || 'Auto'}</strong>
                  {animal.calfAge && ` • Age: ${animal.calfAge}`}
                  {animal.calfNotes && ` • Notes: ${animal.calfNotes}`}
                </p>
              </div>
            </div>
          </div>
        )}

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
                <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                  <span>Milking History</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {animalLogs.length} Records
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Complete intake history for <strong className="text-slate-700">{animal.tag}</strong> {animal.name && `(${animal.name})`} • Sorted latest entries first
                </p>
              </div>
            </div>

            {/* Filter Controls: Date & Shift & Record Action */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Direct Intake Button */}
              <button
                type="button"
                onClick={() => {
                  setIntakeForm((prev) => ({ ...prev, date: getTodayDateStr() }));
                  setIsIntakeModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                title={`Record Milk Intake for ${animal.tag}`}
              >
                <Plus className="w-3.5 h-3.5" />
                Intake Milk
              </button>

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
                  <th className="px-4 py-3">Animal ID / Tag</th>
                  <th className="px-4 py-3">Intake Date</th>
                  <th className="px-4 py-3">Milking Shift</th>
                  <th className="px-4 py-3">Quantity (Liters)</th>
                  <th className="px-4 py-3">Expected Benchmark</th>
                  <th className="px-4 py-3">Yield Variance</th>
                  <th className="px-4 py-3">Quality / Notes</th>
                  <th className="px-4 py-3">Operator / Station</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAnimalLogs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-slate-400 font-medium">
                      No {shiftFilter !== 'All' ? shiftFilter.toLowerCase() : ''} milking history records found for {animal.tag}.
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
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] inline-block">
                            {log.animalTag || animal.tag}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5" title={log.animalId || animal._id || animal.id}>
                            ID: {String(log.animalId || animal._id || animal.id || '').slice(-6)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-mono font-bold text-slate-800 text-[12px] whitespace-nowrap">
                              {log.date || 'Today'}
                            </span>
                          </div>
                          {log.createdAt && (
                            <span className="block text-[10px] text-slate-400 font-mono pl-5">
                              {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isMorn
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                          >
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
                <div className="flex justify-between items-center p-3 bg-white">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Intake Date:
                  </span>
                  <span className="font-mono font-bold text-slate-900">{selectedRecord.date} ({selectedRecord.shift} Shift)</span>
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

      {/* Record Milk Intake Modal */}
      {isIntakeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => !isSubmittingIntake && setIsIntakeModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Record Milk Intake
                  </h3>
                  <p className="text-xs text-slate-500">
                    Animal Tag: <strong className="text-slate-800 font-mono">{animal.tag}</strong> • ID: <span className="font-mono">{animal._id || animal.id}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIntakeModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleIntakeSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/70 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                    Target Livestock
                  </span>
                  <span className="text-sm font-bold text-emerald-950 font-display">
                    {animal.tag} {animal.name && `(${animal.name})`}
                  </span>
                </div>
                <span className="font-mono text-xs font-semibold text-emerald-700 bg-white px-2 py-1 rounded border border-emerald-200">
                  {animal.species || 'Cow'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Date */}
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Intake Date
                  </label>
                  <input
                    type="date"
                    required
                    value={intakeForm.date}
                    onChange={(e) => setIntakeForm({ ...intakeForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Shift */}
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Shift
                  </label>
                  <select
                    value={intakeForm.shift}
                    onChange={(e) => setIntakeForm({ ...intakeForm, shift: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Morning">Morning Shift</option>
                    <option value="Evening">Evening Shift</option>
                  </select>
                </div>
              </div>

              {/* Quantity Liters */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  Milk Intake Quantity (Liters) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    placeholder="e.g. 10.5"
                    value={intakeForm.quantity}
                    onChange={(e) => setIntakeForm({ ...intakeForm, quantity: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                    Liters
                  </span>
                </div>
              </div>

              {/* Milker / Operator */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  Milker / Operator Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning Milker"
                  value={intakeForm.milkedBy}
                  onChange={(e) => setIntakeForm({ ...intakeForm, milkedBy: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified farm dock intake"
                  value={intakeForm.notes}
                  onChange={(e) => setIntakeForm({ ...intakeForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmittingIntake}
                  onClick={() => setIsIntakeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIntake}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingIntake ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Save Intake
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animal Sale Modal */}
      <AnimalSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        initialAnimal={animal}
      />
    </div>
  );
}
