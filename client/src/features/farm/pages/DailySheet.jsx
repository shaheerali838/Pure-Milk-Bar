import React, { useState, useMemo } from 'react';
import {
  FileText,
  Calendar,
  Download,
  Printer,
  CheckCircle2,
  Lock,
  Droplets,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

import { useAnimalContext } from '@/context/AnimalContext';
import { useExpense } from '@/context/ExpenseContext';
import { exportMultiSectionCSV } from '@/utils/csvExport';

export default function DailySheet() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isLocked, setIsLocked] = useState(false);

  const { animals, milkingLogs } = useAnimalContext();
  const { expenses } = useExpense();

  const handlePrevDay = () => {
    const parts = (date || '').split('-').map(Number);
    const cur = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date();
    cur.setDate(cur.getDate() - 1);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    setDate(`${y}-${m}-${d}`);
  };

  const handleNextDay = () => {
    const parts = (date || '').split('-').map(Number);
    const cur = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date();
    cur.setDate(cur.getDate() + 1);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    setDate(`${y}-${m}-${d}`);
  };

  // Aggregate Data
  const { milkingRows, expenseRows, totals } = useMemo(() => {
    const dayMilkingLogs = (milkingLogs || []).filter(log => (log.date || '').split('T')[0] === date);

    const aggregatedMilking = {};
    (animals || []).filter(a => a.lactationStatus === 'Milking').forEach(a => {
      aggregatedMilking[a.tag] = {
        tag: a.tag,
        name: a.name || a.tag,
        species: a.species,
        morningLiters: 0,
        eveningLiters: 0,
        healthStatus: a.healthStatus || 'Healthy',
      };
    });

    dayMilkingLogs.forEach(log => {
      const tag = log.animalTag || log.tag || log.animal?.tag;
      if (aggregatedMilking[tag]) {
        const yieldAmount = parseFloat(log.yieldLiters || log.yield) || 0;
        const shift = (log.shift || '').toLowerCase();
        if (shift === 'morning') {
          aggregatedMilking[tag].morningLiters += yieldAmount;
        } else if (shift === 'evening') {
          aggregatedMilking[tag].eveningLiters += yieldAmount;
        }
      }
    });

    const calculatedMilkingRows = Object.values(aggregatedMilking).map(row => ({
      ...row,
      totalLiters: row.morningLiters + row.eveningLiters
    }));

    // 2. Process Expenses for the selected date
    const dayExpenses = (expenses || []).filter((e) => {
      const eDate = (e.date || '').slice(0, 10);
      return eDate === date || e.date === date;
    });

    const totalMorning = calculatedMilkingRows.reduce((sum, r) => sum + r.morningLiters, 0);
    const totalEvening = calculatedMilkingRows.reduce((sum, r) => sum + r.eveningLiters, 0);
    const totalCollected = totalMorning + totalEvening;
    
    const totalExpenses = dayExpenses.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

    return {
      milkingRows: calculatedMilkingRows,
      expenseRows: dayExpenses,
      totals: { totalCollected, totalMorning, totalEvening, totalExpenses, animalCount: calculatedMilkingRows.length }
    };
  }, [animals, milkingLogs, expenses, date]);

  const handlePrint = () => window.print();

  const handleDownloadCSV = () => {
    // 1. Export Milking Data
    const milkingHeaders = ['Animal Tag', 'Name', 'Species', 'Morning Yield (L)', 'Evening Yield (L)', 'Total Yield (L)', 'Health Status'];
    const milkingCsvRows = milkingRows.map(r => [
      r.tag,
      r.name || r.tag,
      r.species || 'Buffalo',
      r.morningLiters.toFixed(1),
      r.eveningLiters.toFixed(1),
      r.totalLiters.toFixed(1),
      r.healthStatus || 'Healthy'
    ]);
    
    // 2. Export Expenses Data
    const expenseHeaders = ['Expense ID', 'Date', 'Category', 'Amount (Rs)', 'Payment Mode', 'Authorized By'];
    const expenseCsvRows = expenseRows.map(e => [
      e.id,
      e.date,
      e.category,
      `Rs. ${Number(e.amount || 0).toLocaleString()}`,
      e.paymentMethod || e.paymentMode || 'Cash',
      e.authorizedBy || e.loggedBy || 'N/A'
    ]);

    exportMultiSectionCSV({
      filename: `Farm_Daily_Sheet_${date}`,
      title: 'Pure Milk Bar ERP — Farm Daily Master Operations Sheet',
      metadata: [
        ['Sheet Date', date],
        ['Total Herd Milking Yield', `${totals.totalCollected.toFixed(1)} Liters`],
        ['Morning Milking Total', `${totals.totalMorning.toFixed(1)} Liters`],
        ['Evening Milking Total', `${totals.totalEvening.toFixed(1)} Liters`],
        ['Active Animals Milked', totals.animalCount],
        ['Total Farm Expenses Today', `Rs. ${Number(totals.totalExpenses || 0).toLocaleString()}`],
      ],
      sections: [
        {
          title: 'Herd Milking Yield Register',
          description: 'Animal-wise morning and evening milking production log',
          headers: milkingHeaders,
          rows: milkingCsvRows,
          summaryRows: [
            ['TOTAL HERD YIELD', '', '', `${totals.totalMorning.toFixed(1)} L`, `${totals.totalEvening.toFixed(1)} L`, `${totals.totalCollected.toFixed(1)} Liters`, `Animals: ${calculatedMilkingRows.length}`],
          ],
        },
        {
          title: 'Farm Operational Expenses Today',
          description: 'Fodder, veterinary medicine, labor and maintenance vouchers',
          headers: expenseHeaders,
          rows: expenseCsvRows,
          summaryRows: [
            ['TOTAL EXPENSES', '', '', `Rs. ${Number(totals.totalExpenses || 0).toLocaleString()}`, '', `Vouchers: ${expenseRows.length}`],
          ],
        },
      ],
    });
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#d97706]" />
            Farm Daily Master Sheet
          </h2>
          <p className="text-sm text-slate-500">
            Daily milking logs, herd yield, and consolidated farm operating expenses.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevDay}
              className="px-2.5 h-[38px] rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer shadow-xs"
              title="Previous Day"
            >
              &larr; Prev
            </button>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3.5 h-[38px] text-xs font-semibold text-slate-700 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-none outline-none bg-transparent cursor-pointer font-bold text-xs"
              />
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              className="px-2.5 h-[38px] rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer shadow-xs"
              title="Next Day"
            >
              Next &rarr;
            </button>
          </div>

          <Button
            onClick={handleDownloadCSV}
            variant="outline"
            className="flex items-center gap-2 px-3.5 h-[38px] rounded-full text-xs font-semibold border-emerald-200 text-emerald-700 hover:bg-emerald-50 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center gap-2 px-3.5 h-[38px] rounded-full text-xs font-semibold border-slate-200 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </Button>

          <Button
            onClick={() => setIsLocked(!isLocked)}
            className="flex items-center gap-2 px-4 h-[38px] rounded-full text-white text-xs font-semibold shadow-xs"
            style={{ backgroundColor: isLocked ? '#059669' : '#d97706' }}
          >
            {isLocked ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Day Locked
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" /> Lock Daily Sheet
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {[
          {
            id: 'total_yield',
            title: 'Total Farm Yield Today',
            amount: `${totals.totalCollected.toFixed(1)} L`,
            sub: `${totals.animalCount} Animals Milked`,
            icon: Droplets,
            color: '#d97706',
            badge: 'Yield',
          },
          {
            id: 'morning_milking',
            title: 'Morning Milking',
            amount: `${totals.totalMorning.toFixed(1)} L`,
            sub: `${totals.totalCollected > 0 ? ((totals.totalMorning / totals.totalCollected) * 100).toFixed(1) : 0}% of day`,
            icon: Droplets,
            color: '#009966',
            badge: 'Morning',
          },
          {
            id: 'evening_milking',
            title: 'Evening Milking',
            amount: `${totals.totalEvening.toFixed(1)} L`,
            sub: `${totals.totalCollected > 0 ? ((totals.totalEvening / totals.totalCollected) * 100).toFixed(1) : 0}% of day`,
            icon: Droplets,
            color: '#155dfc',
            badge: 'Evening',
          },
          {
            id: 'active_animals',
            title: 'Active Milking Animals',
            amount: totals.animalCount,
            sub: 'Currently lactating',
            icon: FileText,
            color: '#2563eb',
            badge: 'Herd',
          },
          {
            id: 'total_expenses',
            title: 'Total Farm Expenses',
            amount: `Rs. ${totals.totalExpenses.toLocaleString()}`,
            sub: 'Logged today',
            icon: CheckCircle2,
            color: '#e11d48',
            badge: 'Expense',
          },
        ].map(({ id, title, amount, sub, icon: Icon, color, badge }) => (
          <div
            key={id}
            className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 hover:shadow-xs"
            style={{ borderTop: `3.5px solid ${color}` }}
          >
            <div className="flex items-start justify-between mb-1.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                style={{ background: `${color}15` }}
              >
                <Icon style={{ width: 15, height: 15, color }} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md text-slate-600 bg-slate-100 border border-slate-200/80">
                  {badge}
                </span>
              </div>
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
                {amount}
              </p>
              <p className="text-xs font-bold text-slate-800">{title}</p>
              <p className="text-[10px] font-medium text-slate-400 line-clamp-1">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Master Milking Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden mt-4">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-slate-900 font-display text-sm sm:text-base">
              Daily Farm Milking Log
            </h4>
            <p className="text-xs text-slate-500">
              Shift-wise milking volume per animal.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs sm:text-sm">
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  Animal Details
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  Species
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                  Morning Yield
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                  Evening Yield
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                  Total Yield (L)
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">
                  Health Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {milkingRows.length > 0 ? (
                milkingRows.map((row, idx) => (
                  <TableRow
                    key={idx}
                    className="hover:bg-slate-50/60 transition-colors duration-150"
                  >
                    <TableCell className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 font-display">{row.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {row.tag}
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-4 font-medium text-slate-600 text-xs">
                      {row.species}
                    </TableCell>

                    <TableCell className="py-3.5 px-4 text-right tabular text-xs">
                      <span className="font-bold text-slate-800">{row.morningLiters.toFixed(1)} L</span>
                    </TableCell>

                    <TableCell className="py-3.5 px-4 text-right tabular text-xs">
                      <span className="font-bold text-slate-800">{row.eveningLiters.toFixed(1)} L</span>
                    </TableCell>

                    <TableCell className="py-3.5 px-4 text-right font-bold text-slate-900 tabular">
                      {row.totalLiters.toFixed(1)} L
                    </TableCell>

                    <TableCell className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        {row.healthStatus}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                    No milking records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-4 text-slate-600">
            <span>
              Total Filtered Volume: <strong>{totals.totalCollected.toFixed(1)} Liters</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Farm Expenses Today Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden mt-4">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-slate-900 font-display text-sm sm:text-base">
              Farm Expenses Today
            </h4>
            <p className="text-xs text-slate-500">
              Breakdown of daily farm operating costs and overheads.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs sm:text-sm">
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  Expense ID
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  Category
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  Description
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                  Amount
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">
                  Payment Mode
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {expenseRows.length > 0 ? (
                expenseRows.map((row, idx) => (
                  <TableRow
                    key={idx}
                    className="hover:bg-slate-50/60 transition-colors duration-150"
                  >
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {row.id}
                    </TableCell>

                    <TableCell className="py-3.5 px-4 font-bold text-slate-800 text-xs">
                      {row.category}
                    </TableCell>

                    <TableCell className="py-3.5 px-4 font-medium text-slate-600 text-xs truncate max-w-[200px]">
                      {row.description || '—'}
                    </TableCell>

                    <TableCell className="py-3.5 px-4 text-right font-bold text-slate-900 tabular">
                      Rs. {(parseFloat(row.amount) || 0).toLocaleString()}
                    </TableCell>

                    <TableCell className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {row.paymentMethod || row.paymentMode || 'Cash'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-slate-500">
                    No farm expenses logged for {date}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2 text-xs">
          <div className="text-right">
            <span className="text-slate-500 font-medium mr-2">Total Expenses:</span>
            <span className="text-base font-bold text-slate-900 tabular font-display">
              Rs. {totals.totalExpenses.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
