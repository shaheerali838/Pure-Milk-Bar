import React, { useState, useMemo } from 'react';
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
  ChevronDown,
  ChevronUp,
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
  const { intakeLogs, deleteIntake } = useIntakeContext();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('All'); // 'All' | 'Today' | 'Custom'
  const [customDate, setCustomDate] = useState('');
  const [shiftFilter, setShiftFilter] = useState('All'); // 'All' | 'Morning' | 'Evening'
  const [settlementFilter, setSettlementFilter] = useState('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [expandedKeys, setExpandedKeys] = useState(() => new Set());

  const todayStr = getTodayDateStr();

  const toggleExpand = (key) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // 1. Filter base logs by search, date, shift, and settlement
  const filteredLogs = useMemo(() => {
    return intakeLogs.filter((item) => {
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
  }, [intakeLogs, search, shiftFilter, dateFilter, customDate, todayStr, settlementFilter]);

  // 2. Group records by supplier & date so each supplier has ONLY ONE main row
  const groupedRecords = useMemo(() => {
    const map = new Map();

    filteredLogs.forEach((log) => {
      const dKey = normalizeDate(log.date);
      const sKey = (log.supplierId || log.supplierName || 'supplier').trim();
      const groupKey = `${sKey}_${dKey}`;

      if (!map.has(groupKey)) {
        map.set(groupKey, {
          key: groupKey,
          date: log.date,
          dateKey: dKey,
          supplierId: log.supplierId,
          supplierName: log.supplierName,
          area: log.area,
          slips: [],
        });
      }
      map.get(groupKey).slips.push(log);
    });

    return Array.from(map.values()).map((group) => {
      const slips = group.slips;
      const morningSlip = slips.find((s) => (s.shift || '').toLowerCase() === 'morning');
      const eveningSlip = slips.find((s) => (s.shift || '').toLowerCase() === 'evening');

      const totalQuantity = slips.reduce((sum, s) => sum + (parseFloat(s.quantity) || 0), 0);
      const totalCost = slips.reduce((sum, s) => sum + (parseFloat(s.totalCost) || 0), 0);
      const totalPaid = slips.reduce((sum, s) => sum + (parseFloat(s.paidAmount) || 0), 0);
      const totalPending = slips.reduce((sum, s) => {
        const due =
          s.pendingAmount !== undefined
            ? parseFloat(s.pendingAmount)
            : (parseFloat(s.totalCost) || 0) - (parseFloat(s.paidAmount) || 0);
        return sum + (due > 0 ? due : 0);
      }, 0);

      // Average Rate / Liter
      const avgRate =
        totalQuantity > 0 ? Math.round(totalCost / totalQuantity) : slips[0]?.ratePerLiter || 220;

      // Weighted average Quality (Fat & LR)
      const avgFat =
        totalQuantity > 0
          ? (
              slips.reduce(
                (sum, s) => sum + (parseFloat(s.quantity) || 0) * (parseFloat(s.fat) || 0),
                0
              ) / totalQuantity
            ).toFixed(1)
          : slips[0]?.fat || 4.5;

      const avgLr =
        totalQuantity > 0
          ? (
              slips.reduce(
                (sum, s) => sum + (parseFloat(s.quantity) || 0) * (parseFloat(s.lr) || 0),
                0
              ) / totalQuantity
            ).toFixed(1)
          : slips[0]?.lr || 28.0;

      const isPaid = totalPending <= 0 && totalCost > 0;
      const isPartial = totalPaid > 0 && totalPending > 0;
      const settlement = isPaid ? 'Paid' : isPartial ? 'Partial' : 'Pending';

      // First unpaid slip or latest slip for paying
      const targetPaySlip = slips.find((s) => s.settlement !== 'Paid') || slips[0];

      return {
        ...group,
        morningSlip,
        eveningSlip,
        totalQuantity,
        totalCost,
        totalPaid,
        totalPending,
        ratePerLiter: avgRate,
        fat: avgFat,
        lr: avgLr,
        settlement,
        targetPaySlip,
        hasBoth: Boolean(morningSlip && eveningSlip),
      };
    });
  }, [filteredLogs]);

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

      {/* Procurement History Table */}
      <div className="overflow-x-auto">
        <Table className="w-full text-left text-xs sm:text-sm">
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                Date &amp; Slip #
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                Supplier Name
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">
                Shift
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                Total Quantity
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                Total Rate/L
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                Total Cost
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">
                Quality (Fat|LR)
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">
                Total Settlement
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-slate-100">
            {groupedRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-slate-400">
                  <Droplets className="w-8 h-8 mx-auto text-slate-300 mb-2 opacity-50" />
                  <p className="font-semibold text-slate-600">No intake slips found</p>
                  <p className="text-xs text-slate-400 mt-0.5">Try adjusting search or shift filter</p>
                </TableCell>
              </TableRow>
            ) : (
              groupedRecords.map((group) => {
                const isExpanded = expandedKeys.has(group.key);
                const hasMultipleShifts = group.slips.length > 1;

                return (
                  <React.Fragment key={group.key}>
                    {/* Primary Consolidated Row */}
                    <TableRow
                      onClick={() => toggleExpand(group.key)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors group ${
                        isExpanded ? 'bg-slate-50/50' : ''
                      }`}
                    >
                      {/* Date & Slip ID */}
                      <TableCell className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{group.date}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                          {hasMultipleShifts ? (
                            <span className="text-emerald-700 font-semibold">
                              {group.slips.length} Shifts (Click to expand)
                            </span>
                          ) : (
                            <span>{group.slips[0]?.time || group.slips[0]?.shift || 'Shift'}</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Supplier Name */}
                      <TableCell className="py-3.5 px-4 font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span>{group.supplierName}</span>
                          {hasMultipleShifts && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(group.key);
                              }}
                              className="text-slate-400 hover:text-emerald-700 transition"
                              title={isExpanded ? 'Collapse shifts' : 'Expand shifts'}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>
                          )}
                        </div>
                        {group.area && (
                          <div className="text-[11px] text-slate-400 font-normal">
                            {group.area}
                          </div>
                        )}
                      </TableCell>

                      {/* Shift Badge (Shows Both, or specific active shift) */}
                      <TableCell className="py-3.5 px-4 text-center">
                        {group.morningSlip && group.eveningSlip ? (
                          <div className="inline-flex items-center gap-1 flex-wrap justify-center">
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Sun className="w-2.5 h-2.5" />
                              Morning
                            </span>
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Moon className="w-2.5 h-2.5" />
                              Evening
                            </span>
                          </div>
                        ) : group.morningSlip ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Sun className="w-3 h-3 text-amber-500" />
                            Morning
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Moon className="w-3 h-3 text-indigo-500" />
                            Evening
                          </span>
                        )}
                      </TableCell>

                      {/* Total Quantity */}
                      <TableCell className="py-3.5 px-4 text-right font-bold text-slate-900 tabular text-sm">
                        {group.totalQuantity.toFixed(1)} L
                      </TableCell>

                      {/* Rate / Liter */}
                      <TableCell className="py-3.5 px-4 text-right font-medium text-slate-700 tabular text-xs">
                        Rs. {group.ratePerLiter}
                      </TableCell>

                      {/* Total Cost */}
                      <TableCell className="py-3.5 px-4 text-right font-bold text-emerald-700 tabular text-sm">
                        Rs. {group.totalCost.toLocaleString()}
                      </TableCell>

                      {/* Quality: Fat & LR */}
                      <TableCell className="py-3.5 px-4 text-center text-xs tabular">
                        <span className="font-bold text-blue-600">{group.fat}%</span>
                        <span className="text-slate-300 mx-1">|</span>
                        <span className="text-slate-600 font-semibold">{group.lr} LR</span>
                      </TableCell>

                      {/* Settlement */}
                      <TableCell className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center justify-center gap-1.5">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold border-0 ${
                                group.settlement === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : group.settlement === 'Partial'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {group.settlement}
                            </Badge>

                            {group.settlement !== 'Paid' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onPaySupplier) onPaySupplier(group.targetPaySlip);
                                }}
                                title="Pay Supplier for this delivery"
                                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#009966] text-white hover:brightness-110 shadow-2xs transition-all cursor-pointer select-none"
                              >
                                <Wallet className="w-2.5 h-2.5" />
                                <span>Pay</span>
                              </button>
                            )}
                          </div>

                          {group.totalPaid > 0 && (
                            <span className="text-[9px] font-mono text-slate-500 font-semibold">
                              Paid: Rs. {group.totalPaid.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Action Buttons */}
                      <TableCell className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle Expand Button */}
                          <button
                            type="button"
                            onClick={() => toggleExpand(group.key)}
                            title={isExpanded ? 'Hide Shift Details' : 'View Shift Details'}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>

                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => onView(group.slips[0])}
                            title="View Intake Slip"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => onEdit(group.slips[0])}
                            title="Edit Intake Entry"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(group.slips[0]?.id)}
                            title="Delete Intake Entry"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expandable Sub-Detail: Shows both Morning and Evening procurements */}
                    {isExpanded && (
                      <TableRow className="bg-slate-50/50 border-b border-slate-200">
                        <TableCell colSpan={9} className="p-3 sm:p-4">
                          <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                                  {group.supplierName} — Shift Breakdown
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                  Date: {group.date}
                                </span>
                              </div>
                              <span className="text-[11px] font-medium text-slate-400">
                                Detailed Morning &amp; Evening Procurements
                              </span>
                            </div>

                            {/* Shifts Table */}
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                                    <th className="py-2 px-3">Shift</th>
                                    <th className="py-2 px-3">Time</th>
                                    <th className="py-2 px-3 text-right">Quantity</th>
                                    <th className="py-2 px-3 text-right">Rate/L</th>
                                    <th className="py-2 px-3 text-right">Total Cost</th>
                                    <th className="py-2 px-3 text-center">Quality (Fat|LR)</th>
                                    <th className="py-2 px-3 text-center">Settlement</th>
                                    <th className="py-2 px-3 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {group.slips.map((slip) => {
                                    const isMorn = (slip.shift || '').toLowerCase() === 'morning';
                                    const slipPaid = slip.paidAmount || 0;
                                    const slipDue =
                                      slip.pendingAmount !== undefined
                                        ? slip.pendingAmount
                                        : Math.max(0, slip.totalCost - slipPaid);

                                    return (
                                      <tr key={slip.id} className="hover:bg-slate-50/60 transition">
                                        <td className="py-2.5 px-3">
                                          <span
                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                                            {slip.shift}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                                          {slip.time || (isMorn ? 'Morning' : 'Evening')}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular">
                                          {slip.quantity.toFixed(1)} L
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-medium text-slate-600 tabular">
                                          Rs. {slip.ratePerLiter}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700 tabular">
                                          Rs. {slip.totalCost.toLocaleString()}
                                        </td>
                                        <td className="py-2.5 px-3 text-center text-xs tabular">
                                          <span className="font-bold text-blue-600">{slip.fat}%</span>
                                          <span className="text-slate-300 mx-1">|</span>
                                          <span className="text-slate-600 font-semibold">{slip.lr} LR</span>
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                            <Badge
                                              variant="outline"
                                              className={`text-[9px] font-semibold border-0 ${
                                                slip.settlement === 'Paid'
                                                  ? 'bg-emerald-100 text-emerald-700'
                                                  : slip.settlement === 'Partial'
                                                  ? 'bg-blue-100 text-blue-700'
                                                  : 'bg-amber-100 text-amber-800'
                                              }`}
                                            >
                                              {slip.settlement}
                                            </Badge>
                                            {slip.settlement !== 'Paid' && (
                                              <button
                                                type="button"
                                                onClick={() => onPaySupplier && onPaySupplier(slip)}
                                                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#009966] text-white hover:brightness-110 shadow-2xs transition cursor-pointer"
                                              >
                                                <Wallet className="w-2.5 h-2.5" />
                                                <span>Pay</span>
                                              </button>
                                            )}
                                          </div>
                                          {slipPaid > 0 && (
                                            <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                                              Paid: Rs. {slipPaid.toLocaleString()}
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                          <div className="flex items-center justify-end gap-1">
                                            <button
                                              type="button"
                                              onClick={() => onView(slip)}
                                              title="View Slip Details"
                                              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                            >
                                              <Eye className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => onEdit(slip)}
                                              title="Edit Shift Record"
                                              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                                            >
                                              <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setConfirmDeleteId(slip.id)}
                                              title="Delete Shift Record"
                                              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
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
          <strong className="text-slate-800 font-semibold">{groupedRecords.length}</strong> supplier{groupedRecords.length === 1 ? '' : 's'} (
          <strong className="text-slate-800 font-semibold">{filteredLogs.length}</strong> intake slip{filteredLogs.length === 1 ? '' : 's'})
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
