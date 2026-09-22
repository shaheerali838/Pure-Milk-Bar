import React, { useState, useMemo } from 'react';
import {
  FileText,
  Calendar,
  Download,
  Printer,
  CheckCircle2,
  Lock,
  Droplets,
  Layers,
  DollarSign,
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

import { useIntakeContext } from '@/context/IntakeContext';
import { useSupplierContext } from '@/context/SupplierContext';
import { useSourcExpenseContext } from '@/context/SourcExpenseContext';

function exportToCSV(filename, headers, rows) {
  if (!headers || !headers.length) return;

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const headerRow = headers.map(escapeCell).join(',');
  const dataRows = (rows || []).map((row) =>
    (Array.isArray(row) ? row : headers.map((h) => row[h] ?? '')).map(escapeCell).join(',')
  );

  const csvContent = [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ProcurementSheet() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isLocked, setIsLocked] = useState(false);

  const { intakeLogs } = useIntakeContext();
  const { suppliers } = useSupplierContext();
  const { expenses } = useSourcExpenseContext();

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

  // Dynamic Data Aggregation
  const { rows, routeSummaries, totals } = useMemo(() => {
    const dayLogs = (intakeLogs || []).filter((log) => {
      const lDate = (log.date || '').slice(0, 10);
      return lDate === date || log.date === date;
    });

    const supplierGroups = {};
    dayLogs.forEach((log) => {
      const name = log.supplierName || 'Unknown';
      if (!supplierGroups[name]) {
        supplierGroups[name] = {
          farmer: name,
          code: log.supplierId || 'SUP-XXX',
          route: log.area || 'General',
          morningLiters: 0,
          morningFatSum: 0,
          morningCount: 0,
          eveningLiters: 0,
          eveningFatSum: 0,
          eveningCount: 0,
          totalLiters: 0,
          totalCost: 0,
        };
      }
      
      const qty = parseFloat(log.quantity) || 0;
      const fat = parseFloat(log.fat) || 0;
      const cost = parseFloat(log.totalCost) || 0;

      if (log.shift === 'Morning') {
        supplierGroups[name].morningLiters += qty;
        supplierGroups[name].morningFatSum += fat;
        supplierGroups[name].morningCount += 1;
      } else {
        supplierGroups[name].eveningLiters += qty;
        supplierGroups[name].eveningFatSum += fat;
        supplierGroups[name].eveningCount += 1;
      }

      supplierGroups[name].totalLiters += qty;
      supplierGroups[name].totalCost += cost;
    });

    const calculatedRows = Object.values(supplierGroups).map((g) => {
      const morningFat = g.morningCount > 0 ? g.morningFatSum / g.morningCount : 0;
      const eveningFat = g.eveningCount > 0 ? g.eveningFatSum / g.eveningCount : 0;
      const weightedFat = (morningFat + eveningFat) / (g.morningCount > 0 && g.eveningCount > 0 ? 2 : 1);
      const rate = g.totalLiters > 0 ? g.totalCost / g.totalLiters : 0;

      return {
        ...g,
        morningFat,
        eveningFat,
        weightedFat,
        rate,
        grossDue: g.totalCost,
        advanceDeduction: 0, // Mock for now, you could fetch from ledgers
        netPayable: g.totalCost,
        dispatchStatus: 'Completed',
      };
    });

    const routes = {};
    calculatedRows.forEach(r => {
      if (!routes[r.route]) {
        routes[r.route] = { name: r.route, farmers: 0, liters: 0, fatSum: 0, payable: 0, color: '#009966' };
      }
      routes[r.route].farmers += 1;
      routes[r.route].liters += r.totalLiters;
      routes[r.route].fatSum += r.weightedFat;
      routes[r.route].payable += r.netPayable;
    });

    const routeSummariesArr = Object.values(routes).map(r => ({
      ...r,
      avgFat: r.farmers > 0 ? (r.fatSum / r.farmers).toFixed(2) : 0
    }));

    const totalCollected = calculatedRows.reduce((sum, r) => sum + r.totalLiters, 0);
    const totalMorning = calculatedRows.reduce((sum, r) => sum + r.morningLiters, 0);
    const totalEvening = calculatedRows.reduce((sum, r) => sum + r.eveningLiters, 0);
    const totalNetPayable = calculatedRows.reduce((sum, r) => sum + r.netPayable, 0);
    
    // Average fat across all logs
    const avgFat = dayLogs.length > 0 
      ? (dayLogs.reduce((sum, log) => sum + (parseFloat(log.fat) || 0), 0) / dayLogs.length).toFixed(2)
      : 0;

    return {
      rows: calculatedRows,
      routeSummaries: routeSummariesArr,
      totals: { totalCollected, totalMorning, totalEvening, totalNetPayable, avgFat, farmersCount: calculatedRows.length }
    };
  }, [intakeLogs, date]);

  const handlePrint = () => window.print();

  const handleDownloadCSV = () => {
    // 1. Export Intake Data
    const intakeHeaders = ['Supplier', 'Code', 'Route', 'Morning (L)', 'Evening (L)', 'Total (L)', 'Avg Fat %', 'Net Rate', 'Gross Due (Rs)', 'Net Payable (Rs)', 'Status'];
    const intakeCsvRows = rows.map(r => [
      r.farmer, r.code, r.route, r.morningLiters.toFixed(1), r.eveningLiters.toFixed(1), r.totalLiters.toFixed(1),
      r.weightedFat.toFixed(2), r.rate.toFixed(1), r.grossDue, r.netPayable, r.dispatchStatus
    ]);
    
    // 2. Export Expenses Data
    const expenseHeaders = ['Expense ID', 'Date', 'Category', 'Amount (Rs)', 'Payment Mode', 'Logged By'];
    const expenseCsvRows = (expenses || []).filter(e => e.date === date).map(e => [
      e.id, e.date, e.category, e.amount, e.paymentMode, e.loggedBy
    ]);

    // 3. Combine them with sections
    const combinedData = [
      ['=== PROCUREMENT INTAKE SHEET ==='],
      intakeHeaders,
      ...intakeCsvRows,
      [],
      ['=== SOURCING EXPENSES TODAY ==='],
      expenseHeaders,
      ...expenseCsvRows
    ];

    exportToCSV(`Procurement_Sheet_${date}`, ['Pure Milk Bar Operations'], combinedData);
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#d97706]" />
            Daily Procurement Master Sheet
          </h2>
          <p className="text-sm text-slate-500">
            Daily intake reconciliation, route-wise collections, weighted fat rates, and net supplier settlements.
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
            id: 'total_procured',
            title: 'Total Procured Today',
            amount: `${totals.totalCollected.toFixed(1)} L`,
            sub: `${totals.farmersCount} Total farmers intake`,
            icon: Droplets,
            color: '#009966',
            badge: 'Intake',
          },
          {
            id: 'morning_session',
            title: 'Morning Session',
            amount: `${totals.totalMorning.toFixed(1)} L`,
            sub: `${totals.totalCollected > 0 ? ((totals.totalMorning / totals.totalCollected) * 100).toFixed(1) : 0}% of day`,
            icon: Droplets,
            color: '#155dfc',
            badge: 'Morning',
          },
          {
            id: 'evening_session',
            title: 'Evening Session',
            amount: `${totals.totalEvening.toFixed(1)} L`,
            sub: `${totals.totalCollected > 0 ? ((totals.totalEvening / totals.totalCollected) * 100).toFixed(1) : 0}% of day`,
            icon: Droplets,
            color: '#8b5cf6',
            badge: 'Evening',
          },
          {
            id: 'average_fat',
            title: 'Average Fat',
            amount: `${totals.avgFat}%`,
            sub: 'Calculated over all batches',
            icon: Layers,
            color: '#0092b8',
            badge: 'Quality',
          },
          {
            id: 'total_payable',
            title: 'Total Payable Today',
            amount: `Rs. ${totals.totalNetPayable.toLocaleString()}`,
            sub: 'Net after deductions',
            icon: DollarSign,
            color: '#d97706',
            badge: 'Finance',
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

      {/* Route-Wise Collections Cards */}
      {routeSummaries.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 mt-4">
            Route-Wise Procurement Totals
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {routeSummaries.map((r) => (
              <div
                key={r.name}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="font-bold text-slate-900 text-xs truncate">
                    {r.name}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: r.color }}
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Collected:</span>
                    <span className="font-bold text-slate-900 tabular">{r.liters.toFixed(1)} L</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Suppliers:</span>
                    <span className="font-semibold text-slate-700">{r.farmers} Farmers</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Avg Fat%:</span>
                    <span className="font-bold text-blue-600">{r.avgFat}%</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                    <span className="font-bold text-slate-700">Payable:</span>
                    <span className="font-bold text-slate-900 tabular">
                      Rs. {r.payable.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Master Procurement Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden mt-4">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-slate-900 font-display text-sm sm:text-base">
              Daily Master Intake & Payables Sheet
            </h4>
            <p className="text-xs text-slate-500">
              Shift-wise intake volume, quality testing, and final calculated payables.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs sm:text-sm">
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow>
                <TableHead className="py-3 px-3 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  Supplier
                </TableHead>
                <TableHead className="py-3 px-3 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                  Morning (L/Fat)
                </TableHead>
                <TableHead className="py-3 px-3 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                  Evening (L/Fat)
                </TableHead>
                <TableHead className="py-3 px-3 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                  Total (L)
                </TableHead>
                <TableHead className="py-3 px-3 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">
                  Avg Fat
                </TableHead>
                <TableHead className="py-3 px-3 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                  Net Rate
                </TableHead>
                <TableHead className="py-3 px-3 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                  Gross (Rs.)
                </TableHead>
                <TableHead className="py-3 px-3 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                  Advance (Rs.)
                </TableHead>
                <TableHead className="py-3 px-3 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                  Net Due (Rs.)
                </TableHead>
                <TableHead className="py-3 px-3 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">
                  Dispatch
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow
                    key={row.code}
                    className="hover:bg-slate-50/60 transition-colors duration-150"
                  >
                    <TableCell className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 font-display">{row.farmer}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {row.code} • {row.route}
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-3 text-right tabular text-xs">
                      <span className="font-bold text-slate-800">{row.morningLiters.toFixed(1)} L</span>
                      <span className="text-[11px] text-amber-600 block">({row.morningFat.toFixed(2)}%)</span>
                    </TableCell>

                    <TableCell className="py-3.5 px-3 text-right tabular text-xs">
                      <span className="font-bold text-slate-800">{row.eveningLiters.toFixed(1)} L</span>
                      <span className="text-[11px] text-indigo-600 block">({row.eveningFat.toFixed(2)}%)</span>
                    </TableCell>

                    <TableCell className="py-3.5 px-3 text-right font-bold text-slate-900 tabular">
                      {row.totalLiters.toFixed(1)} L
                    </TableCell>

                    <TableCell className="py-3.5 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold tabular text-xs">
                        {row.weightedFat.toFixed(2)}%
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5 px-3 text-right font-medium text-slate-700 tabular text-xs">
                      Rs. {row.rate.toFixed(1)}
                    </TableCell>

                    <TableCell className="py-3.5 px-3 text-right font-semibold text-slate-800 tabular text-xs">
                      Rs. {row.grossDue.toLocaleString()}
                    </TableCell>

                    <TableCell className="py-3.5 px-3 text-right text-rose-600 font-medium tabular text-xs">
                      {row.advanceDeduction > 0
                        ? `-Rs. ${row.advanceDeduction.toLocaleString()}`
                        : '-'}
                    </TableCell>

                    <TableCell className="py-3.5 px-3 text-right font-bold text-emerald-700 tabular">
                      Rs. {row.netPayable.toLocaleString()}
                    </TableCell>

                    <TableCell className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {row.dispatchStatus}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="py-8 text-center text-slate-500">
                    No intake records found for {date}.
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
            <span>•</span>
            <span>
              Morning: <strong>{totals.totalMorning.toFixed(1)} L</strong> | Evening:{' '}
              <strong>{totals.totalEvening.toFixed(1)} L</strong>
            </span>
          </div>

          <div className="text-right">
            <span className="text-slate-500 font-medium mr-2">Total Net Payable:</span>
            <span className="text-base font-bold text-slate-900 tabular font-display">
              Rs. {totals.totalNetPayable.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
