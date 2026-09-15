import React from 'react';
import { Eye, Bike, Footprints, Fuel, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function RiderPerformanceTable({
  staffList = [],
  filteredDeliveries = [],
  filteredFuelLogs = [],
  onViewRiderDetail,
}) {
  const riderMetrics = staffList.map((staff) => {
    const staffDeliveries = filteredDeliveries.filter(
      (d) =>
        d.riderNameSnapshot &&
        staff.name &&
        d.riderNameSnapshot.toLowerCase().trim() === staff.name.toLowerCase().trim()
    );

    const completedRuns = staffDeliveries.filter((d) => d.status === 'DELIVERED').length;
    const pendingRuns = staffDeliveries.filter((d) => d.status === 'PENDING').length;
    const totalLiters = staffDeliveries.reduce(
      (sum, d) => sum + (Number(d.qtyLiters) || 0),
      0
    );

    const staffFuelLogs = filteredFuelLogs.filter(
      (f) =>
        f.staffName &&
        staff.name &&
        f.staffName.toLowerCase().trim() === staff.name.toLowerCase().trim()
    );

    const totalFuelLiters = staffFuelLogs.reduce(
      (sum, f) => sum + (Number(f.liters) || 0),
      0
    );
    const totalFuelCost = staffFuelLogs.reduce(
      (sum, f) => sum + (Number(f.amount) || 0),
      0
    );
    const totalDistance = staffFuelLogs.reduce(
      (sum, f) => sum + (Number(f.distanceKm) || 0),
      0
    );

    return {
      staff,
      staffDeliveries,
      staffFuelLogs,
      completedRuns,
      pendingRuns,
      totalLiters,
      totalFuelLiters,
      totalFuelCost,
      totalDistance,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
            <TableHead className="min-w-[170px] py-1.5 text-xs">Staff Name & Role</TableHead>
            <TableHead className="min-w-[130px] py-1.5 text-xs">Route & Vehicle</TableHead>
            <TableHead className="min-w-[100px] py-1.5 text-xs">Completed Runs</TableHead>
            <TableHead className="min-w-[110px] py-1.5 text-xs">Volume Delivered</TableHead>
            <TableHead className="min-w-[100px] py-1.5 text-xs">Fuel Used (L)</TableHead>
            <TableHead className="min-w-[110px] py-1.5 text-xs">Fuel Expense</TableHead>
            <TableHead className="w-[80px] text-right py-1.5 text-xs">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {riderMetrics.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-36 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400 space-y-1.5 py-4">
                  <Users className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                  <p className="text-xs font-semibold text-slate-600 font-display">
                    No delivery staff registered
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-sm">
                    Register delivery riders or walking boys in Doorstep Deliveries &gt; Fleet &amp; Staff.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            riderMetrics.map(
              ({
                staff,
                staffDeliveries,
                staffFuelLogs,
                completedRuns,
                pendingRuns,
                totalLiters,
                totalFuelLiters,
                totalFuelCost,
                totalDistance,
              }) => {
                const isRider = staff.type === 'RIDER';

                return (
                  <TableRow
                    key={staff.id}
                    onClick={() =>
                      onViewRiderDetail &&
                      onViewRiderDetail(staff, staffDeliveries, staffFuelLogs)
                    }
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Staff Name & Role */}
                    <TableCell className="align-top py-2">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-display">
                          {isRider ? (
                            <Bike className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          ) : (
                            <Footprints className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                          <span>{staff.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {isRider ? 'Delivery Rider' : 'Walking Delivery Man'}
                        </div>
                      </div>
                    </TableCell>

                    {/* Route & Vehicle */}
                    <TableCell className="align-top py-2">
                      <div className="space-y-0.5 text-xs text-slate-700">
                        <div className="font-medium truncate max-w-[140px]" title={staff.route}>
                          {staff.route || 'General Route'}
                        </div>
                        {isRider && staff.vehicle && (
                          <div className="text-[10px] text-slate-400">
                            {staff.vehicle}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Completed Runs */}
                    <TableCell className="align-top py-2">
                      <div className="text-xs font-bold text-slate-900 tabular">
                        {completedRuns} done
                      </div>
                      {pendingRuns > 0 && (
                        <div className="text-[10px] font-semibold text-amber-700">
                          {pendingRuns} pending
                        </div>
                      )}
                    </TableCell>

                    {/* Volume Delivered */}
                    <TableCell className="align-top py-2">
                      <span className="text-xs font-bold text-emerald-700 tabular">
                        {totalLiters.toFixed(1)} L
                      </span>
                    </TableCell>

                    {/* Fuel Used */}
                    <TableCell className="align-top py-2">
                      <span className="text-xs font-semibold text-blue-700 tabular">
                        {totalFuelLiters > 0 ? `${totalFuelLiters.toFixed(1)} L` : '—'}
                      </span>
                    </TableCell>

                    {/* Fuel Expense */}
                    <TableCell className="align-top py-2">
                      <span className="text-xs font-bold text-slate-900 tabular">
                        Rs. {totalFuelCost.toLocaleString()}
                      </span>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="align-top py-2 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewRiderDetail(staff, staffDeliveries, staffFuelLogs);
                        }}
                        className="h-6.5 px-2 text-[11px] font-medium text-slate-700 hover:text-purple-700 hover:border-purple-300 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Report
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
}
