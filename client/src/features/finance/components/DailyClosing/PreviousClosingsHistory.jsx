import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  ChevronDown,
  ChevronUp,
  Lock,
  Search,
  Eye,
  Download,
  Calendar,
  Layers,
  FileText,
  X,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getClosingHistory, exportDailyClosingCsv } from '../../services/dailyClosingService';
import { useDailyClose } from '@/context/DailyCloseContext';
import DailyClosingModuleDetails from './DailyClosingModuleDetails';

const parseClosingStock = (item) => {
  const stock = item?.closingStock || item?.summarySnapshot?.closingStock;
  let farm = 0;
  let supplier = 0;
  let dahi = 0;

  if (stock) {
    if (typeof stock.farm === 'object' && stock.farm !== null) {
      farm = stock.farm.total ?? (Number(stock.farm.cow || 0) + Number(stock.farm.buffalo || 0));
    } else {
      farm = Number(stock.farm || 0);
    }

    if (typeof stock.supplier === 'object' && stock.supplier !== null) {
      supplier = stock.supplier.total ?? (Number(stock.supplier.cow || 0) + Number(stock.supplier.buffalo || 0));
    } else {
      supplier = Number(stock.supplier || 0);
    }

    if (typeof stock.dahi === 'object' && stock.dahi !== null) {
      dahi = stock.dahi.total ?? (Number(stock.dahi.farmDahi || 0) + Number(stock.dahi.supplierDahi || 0));
    } else {
      dahi = Number(stock.dahi || 0);
    }
  } else {
    farm = Number(item?.physicalMilk ?? item?.expectedMilk ?? 0);
  }

  return {
    farm: Number(farm.toFixed(1)),
    supplier: Number(supplier.toFixed(1)),
    dahi: Number(dahi.toFixed(1)),
  };
};

export default function PreviousClosingsHistory({ onSelectDate, refreshTrigger = 0 }) {
  const [isOpen, setIsOpen] = useState(true);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal inspection state
  const [selectedClosing, setSelectedClosing] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const fetchHistory = () => {
    setLoading(true);
    getClosingHistory(100)
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch((err) => console.warn('History fetch notice:', err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const formatRs = (val) => `Rs. ${Number(val || 0).toLocaleString('en-PK')}`;
  const formatL = (val) => `${Number(val || 0).toFixed(1)} L`;

  const { dailyCloseHistory = [] } = useDailyClose();

  const mergedHistory = useMemo(() => {
    // 1. Context items from dailyCloseHistory
    const contextItems = (dailyCloseHistory || []).map((item, idx) => {
      const stock = parseClosingStock(item);
      const rev = Number(item.totalRevenue ?? 0);
      const exp = Number(item.totalExpenses ?? 0);
      const profit = Number(item.totalBusinessProfit ?? item.netProfit ?? (rev - exp));
      return {
        id: `context-close-${item.date || idx}`,
        date: item.date,
        status: 'CLOSED',
        totalRevenue: rev,
        totalExpenses: exp,
        netProfit: profit,
        grossRevenue: rev,
        estimatedProfit: profit,
        closingStock: stock,
        expectedMilk: stock.farm + stock.supplier,
        physicalMilk: stock.farm + stock.supplier,
        closedBy: item.closedBy || 'Supervisor (Daily Close)',
        closedAt: item.closedAt,
        farm: item.farm,
        supplier: item.supplier,
        totalBusinessProfit: item.totalBusinessProfit ?? profit,
        isContext: true,
      };
    });

    // 2. Server items
    const serverItems = (history || []).map((h) => {
      const stock = parseClosingStock(h);
      const rev = Number(h.totalRevenue ?? h.grossRevenue ?? h.totalCollected ?? 0);
      const exp = Number(h.totalExpenses ?? 0);
      const profit = Number(h.totalBusinessProfit ?? h.netProfit ?? h.estimatedProfit ?? (rev - exp));
      const farm = h.farm || h.summarySnapshot?.farm;
      const supplier = h.supplier || h.summarySnapshot?.supplier;
      return {
        ...h,
        totalRevenue: rev,
        totalExpenses: exp,
        netProfit: profit,
        grossRevenue: rev,
        estimatedProfit: profit,
        closingStock: stock,
        farm,
        supplier,
        totalBusinessProfit: h.totalBusinessProfit ?? h.summarySnapshot?.totalBusinessProfit ?? profit,
      };
    });

    // Merge by date (Context items first for fresh state)
    const map = new Map();
    contextItems.forEach((it) => {
      if (it.date) map.set(it.date, it);
    });
    serverItems.forEach((it) => {
      if (it.date && !map.has(it.date)) {
        map.set(it.date, it);
      } else if (it.date && map.has(it.date)) {
        const existing = map.get(it.date);
        map.set(it.date, { ...it, ...existing });
      }
    });

    return Array.from(map.values()).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [dailyCloseHistory, history]);

  // Filtered History
  const filteredHistory = useMemo(() => {
    return mergedHistory.filter((item) => {
      const matchSearch =
        !searchFilter ||
        item.date?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.closedBy?.toLowerCase().includes(searchFilter.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [mergedHistory, searchFilter, statusFilter]);

  const handleOpenReportModal = (closing) => {
    setSelectedClosing(closing);
    setReportModalOpen(true);
  };

  const handleExportSingleCsv = (closing) => {
    if (!closing) return;
    const exportData = closing.summarySnapshot || {
      date: closing.date,
      period: 'today',
      status: closing.status,
      closing: {
        closedBy: closing.closedBy,
        closedAt: closing.closedAt,
        physicalMilk: closing.physicalMilk,
        milkVariance: closing.milkVariance,
        physicalCash: closing.physicalCash,
        cashVariance: closing.cashVariance,
        varianceReason: closing.varianceReason,
      },
      milk: {
        expectedClosing: closing.expectedMilk,
      },
      collections: {
        totalCollected: closing.totalCollected,
      },
      profit: {
        grossRevenue: closing.grossRevenue,
        estimatedProfit: closing.estimatedProfit,
      },
      expenses: {
        total: closing.totalExpenses,
      },
      cash: {
        expectedInDrawer: closing.expectedCash,
      },
      products: closing.productStockSnapshot || [],
    };
    exportDailyClosingCsv(exportData);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all">
      {/* Accordion Header */}
      <div
        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40 cursor-pointer select-none border-b border-slate-100 dark:border-slate-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:text-emerald-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Previous Closing Logs (Archived Day-End History)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {history.length} Saved Closings
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              All past finalized daily closings, physical milk dipsticks, drawer cash, profit, and audit logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              fetchHistory();
            }}
            className="text-xs h-8 text-slate-500 hover:text-slate-900"
          >
            Refresh Logs
          </Button>
          <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by date (YYYY-MM-DD) or closed by..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="CLOSED">CLOSED</option>
                <option value="APPROVED">APPROVED</option>
                <option value="RECONCILED">RECONCILED</option>
                <option value="LOCKED">LOCKED</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400 animate-pulse">
              Loading closing records from database...
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 italic bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              No historical daily closing records found matching your filter.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-2 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Total Revenue</th>
                    <th className="py-3 px-3 text-right">Total Expenses</th>
                    <th className="py-3 px-3 text-right">Net Profit</th>
                    <th className="py-3 px-4 text-center">Closing Stock (Farm / Sup / Dahi)</th>
                    <th className="py-3 px-3">Closed By</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredHistory.map((h) => (
                    <tr
                      key={h.id}
                      className="hover:bg-emerald-50/30 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{h.date}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <Lock className="w-2.5 h-2.5" />
                          {h.status || 'CLOSED'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                        {formatRs(h.totalRevenue)}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-rose-600 dark:text-rose-400">
                        {formatRs(h.totalExpenses)}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-black ${
                          (h.netProfit ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                        }`}
                      >
                        <div>{formatRs(h.netProfit)}</div>
                        {(h.farm || h.supplier) && (
                          <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1.5 mt-0.5 whitespace-nowrap">
                            {h.farm && (
                              <span className={h.farm.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}>
                                Farm: {h.farm.netProfit >= 0 ? '+' : ''}{Math.round(h.farm.netProfit).toLocaleString()}
                              </span>
                            )}
                            {h.farm && h.supplier && <span className="opacity-40">|</span>}
                            {h.supplier && (
                              <span className={h.supplier.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}>
                                Sup: {h.supplier.netProfit >= 0 ? '+' : ''}{Math.round(h.supplier.netProfit).toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 flex-wrap justify-center text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 font-bold" title="Farm Milk Closing Stock">
                            Farm: {h.closingStock?.farm ?? 0} L
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 font-bold" title="Supplier Milk Closing Stock">
                            Sup: {h.closingStock?.supplier ?? 0} L
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold" title="Dahi Closing Stock">
                            Dahi: {h.closingStock?.dahi ?? 0} kg
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-xs">
                        {h.closedBy}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenReportModal(h)}
                            className="h-7 px-2 text-[11px] font-semibold border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 gap-1"
                            title="Inspect Full Day Report & Module Logs"
                          >
                            <Eye className="w-3 h-3 text-emerald-600" />
                            View Report
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => onSelectDate && onSelectDate(h.date)}
                            className="h-7 px-2 text-[11px] text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 gap-1"
                            title="Load in Main Workspace"
                          >
                            Load
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleExportSingleCsv(h)}
                            className="h-7 px-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            title="Download Day CSV"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Complete Historical Day Report Inspector Modal */}
      {selectedClosing && (
        <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
            <DialogHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      Archived Closing Report — {selectedClosing.date}
                    </DialogTitle>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Closed by <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedClosing.closedBy}</span> on{' '}
                      {selectedClosing.closedAt ? new Date(selectedClosing.closedAt).toLocaleString() : selectedClosing.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportSingleCsv(selectedClosing)}
                    className="gap-1.5 text-xs h-8"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setReportModalOpen(false);
                      onSelectDate && onSelectDate(selectedClosing.date);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs h-8"
                  >
                    Open in Main Workspace
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 pt-2">
              {/* Top Key Metrics Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 uppercase block font-semibold">Milk Measured</span>
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {formatL(selectedClosing.physicalMilk)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Exp: {formatL(selectedClosing.expectedMilk)} (Var: {selectedClosing.milkVariance > 0 ? `+${selectedClosing.milkVariance}` : selectedClosing.milkVariance}L)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 uppercase block font-semibold">Collections</span>
                  <span className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-300">
                    {formatRs(selectedClosing.totalCollected)}
                  </span>
                  <span className="text-[10px] text-emerald-600/80 block mt-0.5">
                    Rev: {formatRs(selectedClosing.grossRevenue)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                  <span className="text-[11px] text-blue-700 dark:text-blue-400 uppercase block font-semibold">Cash in Drawer</span>
                  <span className="text-base sm:text-lg font-black text-blue-800 dark:text-blue-300">
                    {formatRs(selectedClosing.expectedCash)}
                  </span>
                  <span className="text-[10px] text-blue-600/80 block mt-0.5">
                    Expenses: {formatRs(selectedClosing.totalExpenses)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                  <span className="text-[11px] text-teal-700 dark:text-teal-400 uppercase block font-semibold">Day Net Profit</span>
                  <span className={`text-base sm:text-lg font-black ${selectedClosing.estimatedProfit >= 0 ? 'text-teal-800 dark:text-teal-300' : 'text-rose-600'}`}>
                    {formatRs(selectedClosing.estimatedProfit)}
                  </span>
                  <span className="text-[10px] text-teal-600/80 block mt-0.5">
                    Status: {selectedClosing.status}
                  </span>
                </div>
              </div>

              {/* Segregated Farm & Supplier Financial P&L Cards */}
              {(selectedClosing.farm || selectedClosing.supplier) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  {selectedClosing.farm && (
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          🚜 Farm Operations P&L
                        </span>
                        <span className={`text-xs font-black ${selectedClosing.farm.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatRs(selectedClosing.farm.netProfit)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Total Revenue</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{formatRs(selectedClosing.farm.totalRevenue)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Farm Expenses</span>
                          <span className="font-medium text-rose-600">{formatRs(selectedClosing.farm.totalExpenses)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedClosing.supplier && (
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          🏪 Supplier Sourcing P&L
                        </span>
                        <span className={`text-xs font-black ${selectedClosing.supplier.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatRs(selectedClosing.supplier.netProfit)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Revenue</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{formatRs(selectedClosing.supplier.totalRevenue)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Procurement</span>
                          <span className="font-medium text-amber-600">{formatRs(selectedClosing.supplier.totalProcurementCost)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Expenses</span>
                          <span className="font-medium text-rose-600">{formatRs(selectedClosing.supplier.totalExpenses)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Variance explanation or supervisor notes if any */}
              {(selectedClosing.varianceReason || selectedClosing.supervisorNotes) && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl space-y-1 text-xs text-amber-900 dark:text-amber-200">
                  {selectedClosing.varianceReason && (
                    <div>
                      <span className="font-bold">Variance Reason: </span>
                      <span>{selectedClosing.varianceReason}</span>
                    </div>
                  )}
                  {selectedClosing.supervisorNotes && (
                    <div>
                      <span className="font-bold">Supervisor Notes: </span>
                      <span>{selectedClosing.supervisorNotes}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Product Stock Flow Snapshot Table */}
              {Array.isArray(selectedClosing.productStockSnapshot) && selectedClosing.productStockSnapshot.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    Product Stock Flow Snapshot
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300 uppercase">
                          <th className="py-2 px-3">Product</th>
                          <th className="py-2 px-3 text-right">Opening</th>
                          <th className="py-2 px-3 text-right">Produced</th>
                          <th className="py-2 px-3 text-right">Sold</th>
                          <th className="py-2 px-3 text-right">Wasted</th>
                          <th className="py-2 px-3 text-right font-bold text-emerald-700">Closing Stock</th>
                          <th className="py-2 px-3 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {selectedClosing.productStockSnapshot.map((p, idx) => (
                          <tr key={p.productId || idx}>
                            <td className="py-2 px-3 font-semibold">{p.name} <span className="text-[10px] text-slate-400">({p.unit})</span></td>
                            <td className="py-2 px-3 text-right">{p.openingStock ?? 0}</td>
                            <td className="py-2 px-3 text-right text-blue-600">{p.produced ?? 0}</td>
                            <td className="py-2 px-3 text-right text-indigo-600">{p.sold ?? 0}</td>
                            <td className="py-2 px-3 text-right text-rose-500">{p.wasted ?? 0}</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700">{p.closingStock ?? p.physicalCount ?? p.expectedClosing ?? 0}</td>
                            <td className="py-2 px-3 text-right font-semibold">{formatRs(p.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Module Logs Breakdown */}
              {selectedClosing.summarySnapshot?.breakdown && (
                <div className="space-y-2">
                  <DailyClosingModuleDetails
                    breakdown={selectedClosing.summarySnapshot.breakdown}
                    isClosed={true}
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
