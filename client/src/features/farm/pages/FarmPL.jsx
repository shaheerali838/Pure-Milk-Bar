import React, { useState } from 'react';
import { Calendar, Download, Filter, RotateCcw } from 'lucide-react';
import { useExpense } from '@/context/ExpenseContext';
import { usePOSContext } from '@/context/POSContext';
import { useAnimalContext } from '@/context/AnimalContext';
import { useStaffContext } from '@/context/StaffContext';
import { useDailyClose } from '@/context/DailyCloseContext';
import { exportMultiSectionCSV } from '@/utils/csvExport';
import { getPktTodayString, normalizeDateStr, getActiveBusinessDate } from '@/utils/dateUtils';
import DateHeader from '@/components/common/DateHeader';
import { useGlobalDate } from '@/context/GlobalDateContext';

import PLCardOverflow from '../components/F&LReport/PLCardOverflow';
import SellingRevenue from '../components/F&LReport/SellingRevenue';
import ProductRevenueBreakdown from '../components/F&LReport/ProductRevenueBreakdown';
import ProfitLossSummary from '../components/F&LReport/ProfitLossSummary';
import PLDetailView from '../components/F&LReport/PLDetailView';
import { useFarmPLMetrics } from '../components/F&LReport/useFarmPLMetrics';

export default function FarmPL() {
  const { expenses = [], fetchExpenses } = useExpense();
  const { farmSalesHistory = [], farmSalesMetrics } = usePOSContext();
  const { milkingLogs = [] } = useAnimalContext();
  const { salaryPayments = [], deleteSalaryPayment } = useStaffContext();
  const { activeDate } = useDailyClose() || {};
  const effectiveToday = activeDate || getActiveBusinessDate();

  const handleDeleteSalaryPayment = async (paymentId) => {
    try {
      await deleteSalaryPayment(paymentId);
    } catch (err) {
      console.warn('Delete salary error in FarmPL:', err.message);
    }
    if (fetchExpenses) fetchExpenses();
  };

  // 1. Filter & Date State strictly initialized to Today
  const { globalDate, setGlobalDate } = useGlobalDate();
  const [selectedDate, setSelectedDate] = useState(() => globalDate || new Date().toISOString().split('T')[0]);
  const [dateFilterMode, setDateFilterMode] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  React.useEffect(() => {
    if (globalDate) {
      setSelectedDate(globalDate);
      if (globalDate === new Date().toISOString().split('T')[0]) {
        setDateFilterMode('today');
      } else {
        setDateFilterMode('custom');
      }
    }
  }, [globalDate]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (typeof setGlobalDate === 'function') setGlobalDate(newDate);
    if (newDate === new Date().toISOString().split('T')[0]) {
      setDateFilterMode('today');
    } else {
      setDateFilterMode('custom');
    }
  };

  // 2. Slide-over / Detail view state
  const [activeCardDrawer, setActiveCardDrawer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 3. Dynamic Financial & Product Stream Calculations via custom hook
  const {
    filteredSales,
    filteredExpenses,
    filteredSalaries,
    totalStaffSalaryPaidInPeriod,
    calculatedMetrics,
    todayLocal,
    todayISO,
  } = useFarmPLMetrics({
    farmSalesHistory,
    expenses,
    salaryPayments,
    milkingLogs,
    dateFilterMode,
    selectedDate,
    startDate,
    endDate,
  });

  // 4. CSV Export Feature
  const handleExportCSV = () => {
    exportMultiSectionCSV({
      filename: `Pure_Milk_Bar_Farm_PL_Report_${dateFilterMode}_${todayISO}`,
      title: 'Pure Milk Bar — Farm Operations Profit & Loss (P&L) Report',
      metadata: [
        ['Filter Mode', dateFilterMode.toUpperCase()],
        ['Selected Date', selectedDate || 'All Period Range'],
        ['Gross Farm Revenue', `Rs. ${calculatedMetrics.grossRevenue.toLocaleString()}`],
        ['Total Farm Costs', `Rs. ${calculatedMetrics.totalFarmCost.toLocaleString()}`],
        ['Net Realized Profit', `Rs. ${calculatedMetrics.netProfit.toLocaleString()}`],
        ['Net Margin %', `${calculatedMetrics.netMargin}%`],
        ['Profit Per Liter', `Rs. ${calculatedMetrics.profitPerLiter} / L`],
      ],
      sections: [
        {
          title: 'Executive KPI Summary',
          description: 'High level operational performance, unit economics and profitability metrics',
          headers: ['Executive Metric', 'Value (PKR / %)', 'Operational Context / Notes'],
          rows: [
            ['Gross Farm Revenue', `Rs. ${calculatedMetrics.grossRevenue.toLocaleString()}`, 'Consolidated inflow from all sales channels'],
            ['Raw Fresh Milk Revenue', `Rs. ${calculatedMetrics.rawMilkRevenue.toLocaleString()}`, `Total Volume: ${calculatedMetrics.rawMilkVolume} L`],
            ['Value-Added Products Revenue', `Rs. ${calculatedMetrics.valueAddedRevenue.toLocaleString()}`, 'Processed items (Farm Dahi, Sweets, etc.)'],
            ['Total Operating Farm Costs', `Rs. ${calculatedMetrics.totalFarmCost.toLocaleString()}`, 'All operational farm feed, labor and facility bills'],
            ['Net Operating Profit', `Rs. ${calculatedMetrics.netProfit.toLocaleString()}`, 'Take-home bottomline profit'],
            ['Net Margin Efficiency %', `${calculatedMetrics.netMargin}%`, 'Operational margin ratio'],
            ['Profit Return Per Liter', `Rs. ${calculatedMetrics.profitPerLiter} / L`, 'Unit return realized per produced liter'],
          ],
        },
        {
          title: 'Farm Products Revenue Breakdown',
          description: 'Volume outputs, realized selling rates and gross margins by product line',
          headers: ['Product Name', 'Category', 'Total Output', 'Selling Rate (Rs)', 'Gross Realized (Rs)', 'Net Profit (Rs)', 'Net Margin %'],
          rows: calculatedMetrics.farmProductsTableData.map((p) => [
            p.name,
            p.category,
            p.totalOutput,
            `Rs. ${p.sellingRate}`,
            `Rs. ${Number(p.grossRealized || 0).toLocaleString()}`,
            `Rs. ${Number(p.netProfit || 0).toLocaleString()}`,
            `${p.netMargin}%`,
          ]),
        },
        {
          title: 'Selling Channels Performance',
          description: 'Volume and revenue breakdown across distribution channels',
          headers: ['Channel Name', 'Orders Count', 'Revenue (PKR)', 'Channel Share (%)'],
          rows: [
            ['Doorstep Delivery', calculatedMetrics.doorstepCount, `Rs. ${calculatedMetrics.doorstepRevenue.toLocaleString()}`, `${calculatedMetrics.doorstepShare}%`],
            ['POS & Farm Gate', calculatedMetrics.posCount, `Rs. ${calculatedMetrics.posRevenue.toLocaleString()}`, `${calculatedMetrics.posShare}%`],
            ['Bulk Wholesale', calculatedMetrics.wholesaleCount, `Rs. ${calculatedMetrics.wholesaleRevenue.toLocaleString()}`, `${calculatedMetrics.wholesaleShare}%`],
          ],
        },
        {
          title: 'Recorded Farm Operating Expenses',
          description: 'Itemized operational vouchers for feed, labor, fuel and veterinary care',
          headers: ['Expense ID', 'Date', 'Category', 'Description', 'Payment Method', 'Amount (PKR)', 'Authorized By'],
          rows: filteredExpenses.map((exp) => [
            exp.id || 'N/A',
            exp.date || '-',
            exp.category || 'General',
            exp.description || 'Farm expense',
            exp.paymentMethod || 'Cash',
            `Rs. ${Number(exp.amount || 0).toLocaleString()}`,
            exp.authorizedBy || 'Admin',
          ]),
          summaryRows: [
            ['TOTAL EXPENSES', '', '', '', '', `Rs. ${filteredExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0).toLocaleString()}`, `Vouchers: ${filteredExpenses.length}`],
          ],
        },
      ],
    });
  };

  // 5. Full Page Detail / Drawer Views
  if (selectedProduct || activeCardDrawer) {
    return (
      <PLDetailView
        selectedProduct={selectedProduct}
        onClearProduct={() => setSelectedProduct(null)}
        activeCardDrawer={activeCardDrawer}
        onClearDrawer={() => setActiveCardDrawer(null)}
        calculatedMetrics={calculatedMetrics}
        filteredSales={filteredSales}
        filteredExpenses={filteredExpenses}
        filteredSalaries={filteredSalaries}
        onDeleteSalaryPayment={handleDeleteSalaryPayment}
      />
    );
  }

  // 6. Main Dashboard View
  return (
    <div className="flex flex-col gap-2 pb-16 animate-in fade-in duration-200">
      {/* DateHeader at Top of Farm P&L */}
      <DateHeader
        date={selectedDate}
        setDate={handleDateChange}
        title="Farm Profit & Loss (P&L)"
        subtitle={`Realized farm sales, herd feed costs, wages, and net profit strictly for ${selectedDate}`}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Farm Profit &amp; Loss (P&amp;L)
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live Context Sync
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setDateFilterMode('today');
                setSelectedDate(todayLocal);
                setStartDate('');
                setEndDate('');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                dateFilterMode === 'today'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                setDateFilterMode('this_week');
                setSelectedDate('');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                dateFilterMode === 'this_week'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => {
                setDateFilterMode('this_month');
                setSelectedDate('');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                dateFilterMode === 'this_month'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => {
                setDateFilterMode('all');
                setSelectedDate('');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                dateFilterMode === 'all'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => {
                setDateFilterMode('custom');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                dateFilterMode === 'custom'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom Range
            </button>
          </div>

          {dateFilterMode === 'custom' && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs text-xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-slate-400 font-medium">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setSelectedDate('');
                }}
                className="border-none outline-hidden text-xs font-semibold text-slate-700 bg-transparent cursor-pointer"
              />
              <span className="text-slate-400 font-medium">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setSelectedDate('');
                }}
                className="border-none outline-hidden text-xs font-semibold text-slate-700 bg-transparent cursor-pointer"
              />
              {(startDate || endDate || selectedDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setSelectedDate('');
                    setDateFilterMode('today');
                  }}
                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer ml-1"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export P&amp;L Report CSV
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Active Filter:{' '}
            <strong className="text-slate-800 font-semibold capitalize">
              {dateFilterMode === 'custom' && selectedDate ? selectedDate : dateFilterMode.replace('_', ' ')}
            </strong>
          </span>
          <span className="text-slate-300">&bull;</span>
          <span>{filteredSales.length} sales recorded</span>
          <span className="text-slate-300">&bull;</span>
          <span>{filteredExpenses.length} expenses logged</span>
        </div>

        {dateFilterMode !== 'all' && (
          <button
            type="button"
            onClick={() => {
              setDateFilterMode('all');
              setSelectedDate('');
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-700 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset to All Time
          </button>
        )}
      </div>

      <PLCardOverflow
        rawMilkRevenue={calculatedMetrics.rawMilkRevenue}
        rawMilkVolume={calculatedMetrics.rawMilkVolume}
        rawMilkShare={calculatedMetrics.rawMilkShare}
        valueAddedRevenue={calculatedMetrics.valueAddedRevenue}
        valueAddedCount={calculatedMetrics.valueAddedCount}
        valueAddedMargin={calculatedMetrics.valueAddedMarginPercent}
        grossRevenue={calculatedMetrics.grossRevenue}
        totalFarmCost={calculatedMetrics.totalFarmCost}
        totalStaffSalaryPaid={calculatedMetrics.totalStaffSalaryPaid}
        salaryPaymentsCount={calculatedMetrics.salaryPaymentsCount}
        expensesCount={calculatedMetrics.expensesCount}
        netProfit={calculatedMetrics.netProfit}
        netMargin={calculatedMetrics.netMargin}
        profitPerLiter={calculatedMetrics.profitPerLiter}
        onSelectCard={(cardId) => {
          setSelectedProduct(null);
          setActiveCardDrawer(cardId);
        }}
      />

      <SellingRevenue
        sales={filteredSales}
        expenses={filteredExpenses}
        categoryBreakdown={calculatedMetrics.categoryBreakdown}
      />

      <ProductRevenueBreakdown
        productsData={calculatedMetrics.farmProductsTableData}
        onSelectProduct={(prod) => {
          setActiveCardDrawer(null);
          setSelectedProduct(prod);
        }}
      />

      <ProfitLossSummary
        incomeData={{
          milkSales: calculatedMetrics.rawMilkRevenue,
          dairyProducts: calculatedMetrics.valueAddedRevenue,
        }}
        expenses={filteredExpenses}
        totalStaffSalaryPaid={totalStaffSalaryPaidInPeriod}
        dahiData={{
          milkCostTransferred: farmSalesMetrics?.milkCostTransferred || 0,
          totalDahiCost: farmSalesMetrics?.dahiProductionCost || 0,
          dahiSales: farmSalesMetrics?.dahiRevenue || 0,
          dahiNetProfit: farmSalesMetrics?.dahiNetProfit || 0,
        }}
      />
    </div>
  );
}
