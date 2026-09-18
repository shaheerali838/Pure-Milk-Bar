import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Sun,
  Moon,
  Droplets,
  Save,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Users,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSupplierContext } from '@/context/SupplierContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export default function IntakeShifting({ onSaveSuccess }) {
  const { suppliers = [] } = useSupplierContext();
  const { addBatchIntake } = useIntakeContext();

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('Evening'); // 'Morning' | 'Evening' (Evening active in screenshot)
  const [receiver, setReceiver] = useState('Shift Incharge');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  // Active suppliers from SupplierContext (No dummy data: empty by default until suppliers are added)
  const activeSuppliers = useMemo(() => {
    return (suppliers || [])
      .filter((s) => !s.status || s.status.toLowerCase() === 'active')
      .map((s) => ({
        id: s.id,
        name: s.name,
        contact: s.contact || '',
        area: s.area || 'Central',
        supplierType: s.supplierType || 'Dairy Farm',
        ratePerLiter: parseFloat(s.ratePerLiter) || 220,
        avgLiters: parseFloat(s.avgLiters) || 0,
        avgMorning: parseFloat(s.avgMorning) || parseFloat(s.avgLiters) || 0,
        avgEvening: parseFloat(s.avgEvening) || parseFloat(s.avgLiters) || 0,
      }));
  }, [suppliers]);

  // Local state for shift quantities & testing per supplier (separated by shift like MilkingRegisterTable)
  const [shiftEntries, setShiftEntries] = useState({
    Morning: {},
    Evening: {},
  });

  const currentShiftEntries = shiftEntries[shift] || {};

  const handleInputChange = (supplierId, field, value) => {
    setShiftEntries((prev) => ({
      ...prev,
      [shift]: {
        ...prev[shift],
        [supplierId]: {
          ...(prev[shift]?.[supplierId] || { fat: '4.5', lr: '28.5' }),
          [field]: value,
        },
      },
    }));
  };

  // Quick reset quantities for active shift
  const handleResetQuantities = () => {
    setShiftEntries((prev) => ({
      ...prev,
      [shift]: {},
    }));
    toast.info(`Cleared inputs for ${shift} shift`);
  };

  // -------------------------------------------------------------
  // EXACT ANIMAL MILKING REGISTER LOGIC (MilkingRegisterTable.jsx)
  // -------------------------------------------------------------
  const totalSuppliers = activeSuppliers.length;

  // 1. Entered Count (count of suppliers logged > 0)
  const enteredCount = activeSuppliers.filter((s) => {
    const val = currentShiftEntries[s.id]?.quantity;
    return val !== undefined && val !== '' && !isNaN(parseFloat(val)) && parseFloat(val) > 0;
  }).length;

  // 2. Total Entered Liters for current shift
  let totalEnteredLiters = 0;
  let totalShiftCost = 0;

  activeSuppliers.forEach((s) => {
    const val = currentShiftEntries[s.id]?.quantity;
    if (val !== undefined && val !== '' && !isNaN(parseFloat(val)) && parseFloat(val) > 0) {
      const q = parseFloat(val);
      totalEnteredLiters += q;
      totalShiftCost += q * (parseFloat(s.ratePerLiter) || 220);
    }
  });

  // 3. Expected Liters for current shift (sums avgMorning / avgEvening like Animal Register)
  const expectedLiters = activeSuppliers.reduce((sum, s) => {
    const expVal =
      shift === 'Morning'
        ? parseFloat(s.avgMorning) || parseFloat(s.avgLiters) || 0
        : parseFloat(s.avgEvening) || parseFloat(s.avgLiters) || 0;
    return sum + expVal;
  }, 0);

  // 4. Variance calculation (Animal Register pattern):
  // When 0 entered: strictly 0.0 L (neutral slate pill)
  // When entered: difference between entered and expected
  const enteredSuppliersExpected = activeSuppliers
    .filter((s) => {
      const q = parseFloat(currentShiftEntries[s.id]?.quantity);
      return !isNaN(q) && q > 0;
    })
    .reduce((sum, s) => {
      const expVal =
        shift === 'Morning'
          ? parseFloat(s.avgMorning) || parseFloat(s.avgLiters) || 0
          : parseFloat(s.avgEvening) || parseFloat(s.avgLiters) || 0;
      return sum + expVal;
    }, 0);

  const variance =
    totalEnteredLiters === 0
      ? 0.0
      : enteredCount === totalSuppliers
      ? totalEnteredLiters - expectedLiters
      : totalEnteredLiters - enteredSuppliersExpected;

  // Save all entered shift rows in one batch
  const handleSaveShift = (e) => {
    e.preventDefault();

    const batchToSave = [];
    activeSuppliers.forEach((s) => {
      const row = currentShiftEntries[s.id];
      const qty = parseFloat(row?.quantity) || 0;
      if (qty > 0) {
        batchToSave.push({
          date,
          shift,
          supplierId: s.id,
          supplierName: s.name,
          area: s.area,
          quantity: qty,
          ratePerLiter: parseFloat(s.ratePerLiter) || 220,
          fat: parseFloat(row?.fat) || 4.5,
          lr: parseFloat(row?.lr) || 28.5,
          settlement: 'Pending',
          receivedBy: receiver,
          notes: `${shift} bulk shift collection`,
        });
      }
    });

    if (batchToSave.length === 0) {
      toast.error(`Please enter milk quantity for at least one supplier before saving`);
      return;
    }

    addBatchIntake(batchToSave);
    toast.success(`Successfully saved ${batchToSave.length} intake slips for ${shift} Shift!`);
    setSavedSuccessMsg(`Successfully saved ${batchToSave.length} intake slips for ${shift} Shift!`);

    setTimeout(() => {
      setSavedSuccessMsg('');
      if (onSaveSuccess) onSaveSuccess();
    }, 1200);
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-150">
      {/* 1. Header Controls Card - EXACTLY MATCHING USER SCREENSHOT & ANIMAL REGISTER LOGIC */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: DATE and SHIFT Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* DATE Picker */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1">
              DATE
            </span>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 h-[38px] shadow-2xs hover:border-slate-300 transition-colors">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-transparent outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* SHIFT Picker */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1">
              SHIFT
            </span>
            <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-full border border-slate-200/80 shadow-2xs">
              {/* Morning Shift */}
              <button
                type="button"
                onClick={() => setShift('Morning')}
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  shift === 'Morning'
                    ? 'bg-[#155dfc] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sun className={`w-3.5 h-3.5 ${shift === 'Morning' ? 'text-white' : 'text-amber-500'}`} />
                <span>Morning</span>
              </button>

              {/* Evening Shift */}
              <button
                type="button"
                onClick={() => setShift('Evening')}
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  shift === 'Evening'
                    ? 'bg-[#155dfc] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Moon className={`w-3.5 h-3.5 ${shift === 'Evening' ? 'text-white' : 'text-indigo-500'}`} />
                <span>Evening</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: 3 Stat Pills (Entered, Expected, Variance) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Pill 1: Entered */}
          <div className="flex items-center px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 text-xs shadow-2xs">
            <span className="text-slate-500 mr-1.5 font-medium">Entered:</span>
            <span className="font-mono font-bold text-slate-800">
              {enteredCount} / {totalSuppliers} Suppliers
            </span>
          </div>

          {/* Pill 2: Expected */}
          <div className="flex items-center px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 text-xs shadow-2xs">
            <span className="text-slate-500 mr-1.5 font-medium">Expected:</span>
            <span className="font-mono font-bold text-slate-800">
              ~{expectedLiters.toFixed(1)} L
            </span>
          </div>

          {/* Pill 3: Variance - ANIMAL TYPE LOGIC (Neutral 0.0 L when 0 entered) */}
          <div
            className={`flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-2xs transition-all ${
              totalEnteredLiters === 0 || variance === 0
                ? 'bg-slate-100 text-slate-700 border-slate-200'
                : variance > 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-600 border-rose-200'
            }`}
          >
            <span className="mr-1.5 font-medium">Variance:</span>
            <span className="font-mono">
              {totalEnteredLiters === 0 || variance === 0
                ? '0.0 L'
                : `${variance > 0 ? '+' : ''}${variance.toFixed(1)} L`}
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {savedSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* 2. Table - EXACTLY MATCHING USER SCREENSHOT */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <form onSubmit={handleSaveShift}>
          <div className="overflow-x-auto">
            <Table className="w-full text-left text-xs sm:text-sm">
              <TableHeader className="bg-slate-50/70 border-b border-slate-200">
                <TableRow>
                  <TableHead className="py-3.5 px-5 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    SUPPLIER / VENDOR
                  </TableHead>
                  <TableHead className="py-3.5 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    LOCATION &amp; TYPE
                  </TableHead>
                  <TableHead className="py-3.5 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">
                    PURCHASE RATE
                  </TableHead>
                  <TableHead className="py-3.5 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">
                    AVG (L)
                  </TableHead>
                  <TableHead className="py-3.5 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">
                    SHIFT INTAKE (L)
                  </TableHead>
                  <TableHead className="py-3.5 px-5 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                    LINE TOTAL
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-slate-100">
                {activeSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-14 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                          <Users className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-700 font-display">No Suppliers Registered</p>
                        <p className="text-xs text-slate-400 max-w-sm">
                          There are currently no active suppliers. Add your first supplier in the Supplier Directory to log shift intake.
                        </p>
                        <a
                          href="/suppliers/directory"
                          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white shadow-xs hover:brightness-110 transition-all cursor-pointer"
                          style={{ backgroundColor: '#009966' }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Go to Supplier Directory</span>
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  activeSuppliers.map((supplier, idx) => {
                    const rowData = currentShiftEntries[supplier.id] || { quantity: '', fat: '4.5', lr: '28.5' };
                    const q = parseFloat(rowData.quantity);
                    const hasQty = !isNaN(q) && q > 0;
                    const rate = parseFloat(supplier.ratePerLiter) || 220;
                    const lineTotal = hasQty ? q * rate : 0;
                    const avgShiftLiters =
                      shift === 'Morning'
                        ? parseFloat(supplier.avgMorning) || parseFloat(supplier.avgLiters) || 0
                        : parseFloat(supplier.avgEvening) || parseFloat(supplier.avgLiters) || 0;

                    // Initial letter badge: 'A', 'B', 'C', etc.
                    const letterBadge =
                      supplier.name.replace(/Supplier\s+/i, '').charAt(0).toUpperCase() ||
                      String.fromCharCode(65 + (idx % 26));

                    return (
                      <TableRow key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Column 1: SUPPLIER / VENDOR with Blue Initial Circle */}
                      <TableCell className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#155dfc] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {letterBadge}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm font-display truncate">
                              {supplier.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium">
                              {supplier.id} · {supplier.contact}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Column 2: LOCATION & TYPE */}
                      <TableCell className="py-3.5 px-4">
                        <p className="text-xs font-semibold text-slate-700">{supplier.area}</p>
                        <p className="text-[11px] text-slate-400">{supplier.supplierType}</p>
                      </TableCell>

                      {/* Column 3: PURCHASE RATE */}
                      <TableCell className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm tabular">
                          Rs. {supplier.ratePerLiter} / L
                        </span>
                      </TableCell>

                      {/* Column 4: AVG (L) - Shift Expected */}
                      <TableCell className="py-3.5 px-4 text-center">
                        <span className="text-xs text-slate-500 font-medium tabular">
                          {avgShiftLiters} L
                        </span>
                      </TableCell>

                      {/* Column 5: SHIFT INTAKE (L) - Clean Rounded-Full Input Field with Average Placeholder */}
                      <TableCell className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            placeholder={String(avgShiftLiters || 0)}
                            value={rowData.quantity || ''}
                            onChange={(e) =>
                              handleInputChange(supplier.id, 'quantity', e.target.value)
                            }
                            className="w-32 h-[34px] px-3 rounded-full border border-slate-200 text-center text-xs sm:text-sm font-bold text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none tabular transition-all bg-white hover:border-slate-300 shadow-2xs"
                          />
                        </div>
                      </TableCell>

                      {/* Column 6: LINE TOTAL - Dash if empty, or Rs. Total */}
                      <TableCell className="py-3.5 px-5 text-right font-bold tabular text-slate-900">
                        {hasQty ? (
                          <span className="text-emerald-700 text-xs sm:text-sm font-display">
                            Rs. {lineTotal.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              </TableBody>
            </Table>
          </div>

          {/* 3. Bottom Action Bar */}
          <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-600">
                Suppliers: <strong>{totalSuppliers}</strong>
              </span>
              <span>•</span>
              <span className="text-slate-600">
                Entered: <strong className="text-blue-600">{enteredCount}</strong>
              </span>
              <span>•</span>
              <span className="text-slate-600">
                Shift Volume: <strong className="text-slate-900">{totalEnteredLiters.toFixed(1)} L</strong>
              </span>
              <span>•</span>
              <span className="text-slate-600">
                Total Cost:{' '}
                <strong className="text-emerald-700 font-display">
                  Rs. {totalShiftCost.toLocaleString()}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetQuantities}
                className="rounded-full h-[38px] px-4 text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Clear
              </Button>

              <Button
                type="submit"
                className="rounded-full h-[38px] px-6 text-xs font-semibold text-white shadow-xs flex items-center gap-1.5 cursor-pointer hover:brightness-110"
                style={{ backgroundColor: '#009966' }}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save {shift} Intake ({enteredCount})</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
