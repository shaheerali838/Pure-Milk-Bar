import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Download,
  Printer,
  CheckCircle2,
  Lock,
  Droplets,
  Layers,
  Banknote,
  DollarSign,
  Sun,
  Moon,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProcurementMasterTable from '../components/procurementSheet/ProcurementMasterTable';
import ProcurementKPICards from '../components/procurementSheet/ProcurementKPICards';

import { useIntakeContext } from '@/context/IntakeContext';
import { useSupplierContext } from '@/context/SupplierContext';
import { useSourcExpenseContext } from '@/context/SourcExpenseContext';
import { usePOSContext } from '@/context/POSContext';
import { useDailyClose } from '@/context/DailyCloseContext';
import { exportMultiSectionCSV } from '@/utils/csvExport';
import { PageSkeleton } from '@/components/ui/skeleton';
import { getTodayDateStr } from '@/utils/dateUtils';

const normalizeDate = (dateVal) => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateVal)) return dateVal.slice(0, 10);
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal).slice(0, 10);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function ProcurementSheet() {
  const todayStr = getTodayDateStr();
  const [date, setDate] = useState(() => todayStr);
  const [isLocked, setIsLocked] = useState(false);
  const [shiftFilter, setShiftFilter] = useState('All'); // 'All' | 'Morning' | 'Evening'

  const { intakeLogs, isLoading: isIntakeLoading } = useIntakeContext();
  const { suppliers, isLoading: isSupplierLoading } = useSupplierContext();
  const { expenses } = useSourcExpenseContext();
  const { supplierSalesHistory = [], salesHistory = [] } = usePOSContext() || {};

  const isToday = date === todayStr;

  const handlePrevDay = () => {
    const parts = (date || '').split('-').map(Number);
    const cur = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date();
    cur.setDate(cur.getDate() - 1);
    handleDateChange(normalizeDate(cur));
  };

  const handleNextDay = () => {
    const parts = (date || '').split('-').map(Number);
    const cur = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date();
    cur.setDate(cur.getDate() + 1);
    handleDateChange(normalizeDate(cur));
  };

  // Dynamic Data Aggregation
  const { rows, routeSummaries, totals } = useMemo(() => {
    const dayLogs = (intakeLogs || []).filter((log) => {
      const lDate = normalizeDate(log.date);
      return lDate === date;
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
      const shift = (log.shift || '').toLowerCase();

      if (shift === 'morning') {
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

    const allCalculatedRows = Object.values(supplierGroups).map((g) => {
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
        advanceDeduction: 0,
        netPayable: g.totalCost,
        dispatchStatus: 'Completed',
      };
    });

    // Filter rows based on shiftFilter
    const calculatedRows = allCalculatedRows.filter((r) => {
      if (shiftFilter === 'Morning') return r.morningLiters > 0;
      if (shiftFilter === 'Evening') return r.eveningLiters > 0;
      return true;
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
    
    // Average fat across day logs
    const avgFat = dayLogs.length > 0 
      ? (dayLogs.reduce((sum, log) => sum + (parseFloat(log.fat) || 0), 0) / dayLogs.length).toFixed(2)
      : 0;

    // Supplier POS Sales for the selected date
    const activeSupplierSales = supplierSalesHistory.length > 0 ? supplierSalesHistory : salesHistory;
    let daySupplierSales = 0;
    activeSupplierSales.forEach((sale) => {
      const sDate = normalizeDate(sale.date || sale.timestamp || sale.formattedDate);
      if (sDate === date) {
        (sale.items || []).forEach((item) => {
          const src = (item.source || '').toLowerCase();
          if (supplierSalesHistory.length === 0 && src.includes('farm')) return;
          daySupplierSales += Number(item.subtotal || item.effectiveRevenue) || ((Number(item.quantity) || 0) * (Number(item.price) || 0));
        });
      }
    });

    const totalDayExpenses = (expenses || []).filter(e => normalizeDate(e.date) === date).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const daySupplierNetProfit = daySupplierSales - totalNetPayable - totalDayExpenses;

    return {
      rows: calculatedRows,
      routeSummaries: routeSummariesArr,
      totals: {
        totalCollected,
        totalMorning,
        totalEvening,
        totalNetPayable,
        avgFat,
        farmersCount: calculatedRows.length,
        totalSupplierSales: daySupplierSales,
        totalExpenses: totalDayExpenses,
        daySupplierNetProfit,
      },
    };
  }, [intakeLogs, expenses, supplierSalesHistory, salesHistory, date, shiftFilter]);

  const handlePrint = () => window.print();

  const handleDownloadCSV = () => {
    // 1. Export Intake Data
    const intakeHeaders = ['Supplier', 'Code', 'Route', 'Morning (L)', 'Evening (L)', 'Total (L)', 'Avg Fat %', 'Net Rate (Rs/L)', 'Gross Due (Rs)', 'Net Payable (Rs)', 'Status'];
    const intakeCsvRows = rows.map(r => [
      r.farmer,
      r.code,
      r.route,
      r.morningLiters.toFixed(1),
      r.eveningLiters.toFixed(1),
      r.totalLiters.toFixed(1),
      r.weightedFat.toFixed(2),
      `Rs. ${r.rate.toFixed(1)}`,
      `Rs. ${Number(r.grossDue || 0).toLocaleString()}`,
      `Rs. ${Number(r.netPayable || 0).toLocaleString()}`,
      r.dispatchStatus || 'Accepted'
    ]);
    
    // 2. Export Expenses Data
    const expenseHeaders = ['Expense ID', 'Date', 'Category', 'Amount (Rs)', 'Payment Mode', 'Logged By'];
    const expenseCsvRows = (expenses || []).filter(e => e.date === date).map(e => [
      e.id,
      e.date,
      e.category,
      `Rs. ${Number(e.amount || 0).toLocaleString()}`,
      e.paymentMode || e.paymentMethod || 'Cash',
      e.loggedBy || e.authorizedBy || 'Admin'
    ]);

    const totalExpenseAmount = (expenses || []).filter(e => e.date === date).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    exportMultiSectionCSV({
      filename: `Procurement_Master_Sheet_${date}`,
      title: 'Pure Milk Bar ERP — Daily Milk Procurement Master Sheet',
      metadata: [
        ['Sheet Date', date],
        ['Total Sourced Volume', `${totals.totalCollected.toFixed(1)} Liters`],
        ['Total Procurement Cost (Purchases)', `Rs. ${totals.totalNetPayable.toLocaleString()}`],
        ['Supplier POS Sales (Milk + Dahi)', `Rs. ${totals.totalSupplierSales.toLocaleString()}`],
        ['Sourcing Overhead Expenses', `Rs. ${totals.totalExpenses.toLocaleString()}`],
        ['Supplier Net Profit (Bachat)', `Rs. ${totals.daySupplierNetProfit.toLocaleString()}`],
        ['Average Fat %', `${totals.avgFat}%`],
        ['Active Suppliers Count', totals.farmersCount],
      ],
      sections: [
        {
          title: 'Daily Farmer Milk Intake & Quality Breakdown',
          description: 'Route-wise farmer milk collection, test metrics and net dues',
          headers: intakeHeaders,
          rows: intakeCsvRows,
          summaryRows: [
            ['TOTAL INTAKE', '', '', totals.totalMorning.toFixed(1), totals.totalEvening.toFixed(1), `${totals.totalCollected.toFixed(1)} L`, `${totals.avgFat}%`, '', '', `Rs. ${totals.totalNetPayable.toLocaleString()}`, `Suppliers: ${rows.length}`],
          ],
        },
        {
          title: 'Daily Sourcing & Procurement Expenses',
          description: 'Transport, chiller operation, and procurement handling overheads',
          headers: expenseHeaders,
          rows: expenseCsvRows,
          summaryRows: [
            ['TOTAL EXPENSES', '', '', `Rs. ${totalExpenseAmount.toLocaleString()}`, '', `Vouchers: ${expenseCsvRows.length}`],
          ],
        },
      ],
    });
  };

  if ((isIntakeLoading || isSupplierLoading) && intakeLogs.length === 0 && suppliers.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#d97706]" />
            Daily Procurement Master Sheet
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Shift Filter: All, Morning, Evening */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold text-slate-600 shadow-2xs">
            {['All', 'Morning', 'Evening'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setShiftFilter(s)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                  shiftFilter === s
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                {s === 'Morning' && <Sun className="w-3 h-3 text-amber-500" />}
                {s === 'Evening' && <Moon className="w-3 h-3 text-indigo-500" />}
                <span>{s}</span>
              </button>
            ))}
          </div>

          {/* Date Navigator */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevDay}
              className="px-2.5 h-9.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer shadow-xs"
              title="Previous Day"
            >
              &larr; Prev
            </button>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3.5 h-9.5 text-xs font-semibold text-slate-700 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="border-none outline-none bg-transparent cursor-pointer font-bold text-xs"
              />
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              className="px-2.5 h-9.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer shadow-xs"
              title="Next Day"
            >
              Next &rarr;
            </button>

            {!isToday && (
              <button
                type="button"
                onClick={() => handleDateChange(todayStr)}
                className="px-3 h-9.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition cursor-pointer shadow-xs"
                title="Jump to Today"
              >
                Today
              </button>
            )}
          </div>

          <Button
            onClick={handleDownloadCSV}
            variant="outline"
            className="flex items-center gap-2 px-3.5 h-9.5 rounded-full text-xs font-semibold border-emerald-200 text-emerald-700 hover:bg-emerald-50 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center gap-2 px-3.5 h-9.5 rounded-full text-xs font-semibold border-slate-200 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </Button>

          <Button
            onClick={() => setIsLocked(!isLocked)}
            className="flex items-center gap-2 px-4 h-9.5 rounded-full text-white text-xs font-semibold shadow-xs"
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

      {/* Primary KPI Ribbon (Purchases, POS Sales, Expenses, Net Profit, Quality) */}
      <ProcurementKPICards totals={totals} />

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

      {/* Detailed Master Procurement Table Component */}
      <ProcurementMasterTable rows={rows} totals={totals} date={date} />
    </div>
  );
}
