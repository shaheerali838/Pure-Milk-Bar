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

export default function IntakeHistory({ onView, onEdit }) {
  const { intakeLogs, deleteIntake, updateBatchSettlement } = useIntakeContext();
  const [search, setSearch] = useState('');
  const [shiftFilter, setShiftFilter] = useState('All');
  const [settlementFilter, setSettlementFilter] = useState('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filteredLogs = intakeLogs.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      item.supplierName.toLowerCase().includes(q) ||
      (item.id && item.id.toLowerCase().includes(q)) ||
      (item.area && item.area.toLowerCase().includes(q)) ||
      (item.receivedBy && item.receivedBy.toLowerCase().includes(q));

    const matchesShift = shiftFilter === 'All' ? true : item.shift === shiftFilter;
    const matchesSettlement =
      settlementFilter === 'All' ? true : item.settlement === settlementFilter;

    return matchesSearch && matchesShift && matchesSettlement;
  });

  const handleDelete = (id) => {
    deleteIntake(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      {/* Search and Filters Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="flex items-center gap-2 w-full md:w-80 bg-slate-50 border border-slate-200 rounded-full px-3.5 h-[38px]">
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

        {/* Filter Badges */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          {/* Shift Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold text-slate-600">
            {['All', 'Morning', 'Evening'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setShiftFilter(s)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  shiftFilter === s
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Settlement Filter */}
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
        </div>
      </div>

      {/* History Table */}
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
                Quantity (L)
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                Rate / Liter
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                Total Cost
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">
                Quality (Fat/LR)
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">
                Settlement
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                Received By
              </TableHead>
              <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-slate-100">
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-14 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                      <Droplets className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 font-display">
                      No Intake Records Found
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs">
                      {search
                        ? 'No intake slips match your active search filters.'
                        : 'No intake entries recorded yet. Click "Log Single Intake" or "Shift Intake Entry" above.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow
                  key={log.id}
                  onClick={() => onView(log)}
                  className="hover:bg-slate-50/60 transition-colors duration-150 cursor-pointer"
                >
                  {/* Date & Slip # */}
                  <TableCell className="py-3 px-4">
                    <span className="font-mono font-bold text-blue-600 text-xs block">
                      {log.id}
                    </span>
                    <span className="text-[11px] text-slate-400">{log.date}</span>
                  </TableCell>

                  {/* Supplier Name */}
                  <TableCell className="py-3 px-4">
                    <span className="font-bold text-slate-900 font-display block">
                      {log.supplierName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {log.area || log.supplierId}
                    </span>
                  </TableCell>

                  {/* Shift */}
                  <TableCell className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        log.shift === 'Morning'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                      }`}
                    >
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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (updateBatchSettlement) {
                          updateBatchSettlement(
                            log.id,
                            log.settlement === 'Paid' ? 'Pending' : 'Paid'
                          );
                        }
                      }}
                      title="Click to toggle settlement between Paid and Pending"
                      className="cursor-pointer transition-transform hover:scale-105 select-none"
                    >
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold border-0 ${
                          log.settlement === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : log.settlement === 'Partial'
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {log.settlement}
                      </Badge>
                    </button>
                  </TableCell>

                  {/* Received By */}
                  <TableCell className="py-3 px-4 text-slate-600 text-xs">
                    {log.receivedBy || 'Staff'}
                  </TableCell>

                  {/* Actions */}
                  <TableCell
                    className="py-3 px-4 text-right"
                    onClick={(e) => e.stopPropagation()} // don't trigger row click
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onView(log)}
                        title="View Slip"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(log)}
                        title="Edit Entry"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(log.id)}
                        title="Delete Entry"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
