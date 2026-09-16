import React from 'react';
import { Fuel, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useFuelLogContext } from '@/context/FuelLogContext';

export default function FuelLogTable({ fuelLogs = [] }) {
  const { deleteFuelLog } = useFuelLogContext();

  const totalCost = fuelLogs.reduce((acc, log) => acc + (Number(log.amount) || 0), 0);
  const totalLiters = fuelLogs.reduce((acc, log) => acc + (Number(log.liters) || 0), 0);
  const totalDistance = fuelLogs.reduce((acc, log) => acc + (Number(log.distanceKm) || 0), 0);

  const handleDelete = (e, id, staffName) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the fuel log for ${staffName}?`)) {
      deleteFuelLog(id);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="w-[110px] py-1.5 text-xs">Date</TableHead>
              <TableHead className="min-w-[150px] py-1.5 text-xs">Staff Member</TableHead>
              <TableHead className="min-w-[90px] py-1.5 text-xs">Fuel (L)</TableHead>
              <TableHead className="min-w-[110px] py-1.5 text-xs">Amount Paid</TableHead>
              <TableHead className="min-w-[110px] py-1.5 text-xs">Distance (km)</TableHead>
              <TableHead className="min-w-[160px] py-1.5 text-xs">Notes</TableHead>
              <TableHead className="w-[60px] text-right py-1.5 text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {fuelLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-1 py-4">
                    <Fuel className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                    <p className="text-xs font-semibold text-slate-600 font-display">
                      No fuel receipts logged yet
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-sm">
                      Record fuel purchases and kilometer readings for your delivery riders.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              fuelLogs.map((log) => {
                const amount = Number(log.amount) || 0;
                const liters = Number(log.liters) || 0;
                const distance = Number(log.distanceKm) || 0;

                return (
                  <TableRow
                    key={log.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <TableCell className="text-xs font-semibold text-slate-900 font-mono tabular py-2">
                      {log.date || '—'}
                    </TableCell>

                    <TableCell className="text-xs font-bold text-slate-900 font-display py-2">
                      {log.staffName || 'Unassigned'}
                    </TableCell>

                    <TableCell className="text-xs font-semibold text-slate-700 tabular py-2">
                      {liters.toFixed(1)} L
                    </TableCell>

                    <TableCell className="text-xs font-bold text-slate-900 tabular py-2">
                      Rs. {amount.toLocaleString()}
                    </TableCell>

                    <TableCell className="text-xs font-medium text-slate-600 tabular py-2">
                      {distance > 0 ? `${distance} km` : '—'}
                    </TableCell>

                    <TableCell className="text-xs text-slate-500 py-2">
                      {log.notes || '—'}
                    </TableCell>

                    <TableCell className="text-right py-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(e, log.id, log.staffName)}
                        className="h-6 w-6 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete receipt"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {fuelLogs.length > 0 && (
        <div className="bg-slate-900 text-white px-3.5 py-2 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs">
          <div className="flex items-center gap-1.5 font-display font-semibold text-xs">
            <Fuel className="w-3.5 h-3.5 text-blue-400" />
            <span>Fuel Summary Totals</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs">
            <div>
              <span className="text-slate-400 mr-1 text-[11px]">Total Fuel Cost:</span>
              <span className="font-bold text-emerald-400 tabular">
                Rs. {totalCost.toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-slate-400 mr-1 text-[11px]">Total Fuel Liters:</span>
              <span className="font-bold text-blue-300 tabular">
                {totalLiters.toFixed(1)} L
              </span>
            </div>

            <div>
              <span className="text-slate-400 mr-1 text-[11px]">Total Distance:</span>
              <span className="font-bold text-amber-300 tabular">
                {totalDistance.toLocaleString()} km
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
