import React, { useState } from 'react';
import {
  Search,
  X,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Wallet,
  Sun,
  Moon,
} from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

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

export default function IntakeHistory({ onView, onEdit, onPaySupplier }) {
  const { intakeLogs, deleteIntake, updateBatchSettlement } = useIntakeContext();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('All'); // 'All' | 'Today' | 'Custom'
  const [customDate, setCustomDate] = useState('');
  const [shiftFilter, setShiftFilter] = useState('All'); // 'All' | 'Morning' | 'Evening'
  const [settlementFilter, setSettlementFilter] = useState('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const todayStr = getTodayDateStr();

  const filteredLogs = intakeLogs.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      item.supplierName?.toLowerCase().includes(q) ||
      (item.id && String(item.id).toLowerCase().includes(q)) ||
      (item.area && item.area.toLowerCase().includes(q)) ||
      (item.receivedBy && item.receivedBy.toLowerCase().includes(q));

    // Shift filter (All, Morning, Evening)
    const matchesShift =
      shiftFilter === 'All'
        ? true
        : (item.shift || '').toLowerCase() === shiftFilter.toLowerCase();

    // Date filter (All, Today, Custom date)
    const itemDate = normalizeDate(item.date);
    let matchesDate = true;
    if (dateFilter === 'Today') {
      matchesDate = itemDate === todayStr;
    } else if (dateFilter === 'Custom' && customDate) {
      matchesDate = itemDate === customDate;
    }

    // Settlement filter (All, Paid, Pending)
    const matchesSettlement =
      settlementFilter === 'All'
        ? true
        : (item.settlement || '').toLowerCase() === settlementFilter.toLowerCase();

    return matchesSearch && matchesShift && matchesDate && matchesSettlement;
  });

  const handleDelete = (id) => {
    deleteIntake(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      {/* Search and Filters Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col xl:flex-row gap-3 items-start xl:items-center justify-between">
        {/* Search Input */}
        <div className="flex items-center gap-2 w-full xl:w-72 bg-slate-50 border border-slate-200 rounded-full px-3.5 h-[38px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search supplier, slip #, receiver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-700 placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls (Date, Shift, Settlement, Pay) */}
        <div className="flex items-center gap-2 flex-wrap w-full xl:w-auto">
          {/* 1. Date Filter (All / Today / Custom Date) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => {
                setDateFilter('All');
                setCustomDate('');
              }}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                dateFilter === 'All'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'hover:text-slate-900'
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
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                dateFilter === 'Today'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Today
            </button>
          </div>

          {/* Date Picker Input */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 h-[32px] text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
                className="text-slate-400 hover:text-slate-600 text-xs font-bold ml-1"
                title="Clear date"
              >
                ✕
              </button>
            )}
          </div>

          {/* 2. Shift Filter (All / Morning / Evening) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold text-slate-600">
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

          {/* 3. Settlement Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold text-slate-600">
            {['All', 'Paid', 'Pending'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSettlementFilter(st)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  settlementFilter === st
                    ? 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Pay Supplier Button */}
          <button
            type="button"
            onClick={() => onPaySupplier && onPaySupplier(null)}
            className="flex items-center gap-1.5 px-3.5 h-[32px] rounded-full text-xs font-bold text-white bg-[#009966] hover:brightness-110 shadow-xs transition-all cursor-pointer"
            title="Disburse payment to a supplier"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Pay Supplier</span>
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <Table className="w-full text-left text-xs sm:text-sm">
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                Date & Slip #
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                Supplier Name
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">
                Shift
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                Quantity
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                Rate/L
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                Total Cost
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">
                Quality (Fat|LR)
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">
                Settlement
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-slate-100">
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-slate-400">
                  <Droplets className="w-8 h-8 mx-auto text-slate-300 mb-2 opacity-50" />
                  <p className="font-semibold text-slate-600">No intake slips found</p>
                  <p className="text-xs text-slate-400 mt-0.5">Try adjusting search or shift filter</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => {
                const isMorning = log.shift.toLowerCase() === 'morning';

                return (
                  <TableRow
                    key={log.id}
                    onClick={() => onView(log)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                  >
                    {/* Date & Slip ID */}
                    <TableCell className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.date}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {log.time}
                      </div>
                    </TableCell>

                    {/* Supplier Name */}
                    <TableCell className="py-3 px-4 font-bold text-slate-800">
                      <div>{log.supplierName}</div>
                      {log.area && (
                        <div className="text-[11px] text-slate-400 font-normal">
                          {log.area}
                        </div>
                      )}
                    </TableCell>

                    {/* Shift */}
                    <TableCell className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isMorning
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {log.shift}
                      </span>
                    </TableCell>

                    {/* Quantity */}
                    <TableCell className="py-3 px-4 text-right font-bold text-slate-900 tabular">
                      {log.quantity.toFixed(1)} L
                    </TableCell>

                    {/* Rate / Liter */}
                    <TableCell className="py-3 px-4 text-right font-medium text-slate-700 tabular">
                      Rs. {log.ratePerLiter}
                    </TableCell>

                    {/* Total Cost */}
                    <TableCell className="py-3 px-4 text-right font-bold text-emerald-700 tabular">
                      Rs. {log.totalCost.toLocaleString()}
                    </TableCell>

                    {/* Quality: Fat & LR */}
                    <TableCell className="py-3 px-4 text-center text-xs tabular">
                      <span className="font-bold text-blue-600">{log.fat}%</span>
                      <span className="text-slate-300 mx-1">|</span>
                      <span className="text-slate-600 font-semibold">{log.lr} LR</span>
                    </TableCell>

                    {/* Settlement */}
                    <TableCell className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center justify-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold border-0 ${
                              log.settlement === 'Paid'
                                ? 'bg-emerald-100 text-emerald-700'
                                : log.settlement === 'Partial'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {log.settlement}
                          </Badge>

                          {log.settlement !== 'Paid' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onPaySupplier) onPaySupplier(log);
                              }}
                              title="Pay Supplier for this delivery"
                              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#009966] text-white hover:brightness-110 shadow-2xs transition-all cursor-pointer select-none"
                            >
                              <Wallet className="w-2.5 h-2.5" />
                              <span>Pay</span>
                            </button>
                          )}
                        </div>

                        {log.settlement === 'Partial' && (
                          <span className="text-[9px] font-mono text-slate-500 font-semibold">
                            Paid: Rs. {(log.paidAmount !== undefined ? log.paidAmount : Math.round(log.totalCost * 0.5)).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Action Buttons */}
                    <TableCell className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {/* View Button */}
                        <button
                          type="button"
                          onClick={() => onView(log)}
                          title="View Intake Slip"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => onEdit(log)}
                          title="Edit Intake Entry"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(log.id)}
                          title="Delete Intake Entry"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          Showing{' '}
          <strong className="text-slate-800 font-semibold">{filteredLogs.length}</strong> of{' '}
          <strong className="text-slate-800 font-semibold">{intakeLogs.length}</strong> intake slips
        </div>
        <div className="flex items-center gap-1 font-medium">
          <span>Milk Procurement Register • Pur Milk Bar Dairy ERP</span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 font-display">
              Delete Intake Entry?
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to remove this milk collection slip? This will recalculate your totals.
            </p>

            <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-3.5 h-[34px] rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 h-[34px] rounded-full text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
