import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export default function ProcurementMasterTable({ rows = [], totals, date }) {
  return (
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
  );
}
