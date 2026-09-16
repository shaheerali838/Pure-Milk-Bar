import React, { useState } from 'react';
import {
  ArrowLeft,
  Bike,
  Footprints,
  Phone,
  MapPin,
  Car,
  Fuel,
  Package,
  Calendar,
  Clock,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function RiderPerformanceDetailView({
  staff,
  deliveries = [],
  fuelLogs = [],
  timeRangeLabel = 'Selected Period',
  onBack,
}) {
  const [activeSection, setActiveSection] = useState('runs'); // 'runs' | 'fuel'

  if (!staff) return null;

  const isRider = staff.type === 'RIDER';
  const totalRuns = deliveries.length;
  const completedRuns = deliveries.filter((d) => d.status === 'DELIVERED').length;
  const totalLiters = deliveries.reduce((sum, d) => sum + (Number(d.qtyLiters) || 0), 0);
  const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + (Number(f.liters) || 0), 0);
  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const totalDistance = fuelLogs.reduce((sum, f) => sum + (Number(f.distanceKm) || 0), 0);

  return (
    <div className="space-y-2.5 animate-in fade-in duration-150 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-7.5 w-7.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Back to Rider Breakdown"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight font-display leading-none flex items-center gap-2">
              <span>Rider Performance & Fuel Report &bull; {staff.name}</span>
              <Badge variant="green" className="text-[10px]">
                {timeRangeLabel}
              </Badge>
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isRider ? 'Delivery Rider' : 'Walking Delivery Man'} &bull; Route: {staff.route || 'General Area'} &bull; Phone: {staff.phone || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-300 border border-purple-800/60 flex items-center justify-center text-lg font-bold font-display">
            {isRider ? <Bike className="w-5 h-5" /> : <Footprints className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
              Delivery Staff Member
            </span>
            <h3 className="text-base font-bold font-display">{staff.name}</h3>
            <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
              <Car className="w-3 h-3 text-slate-400" />
              {staff.vehicle || 'Standard Vehicle / Foot'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-right">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Deliveries
            </span>
            <p className="text-base font-black font-display text-emerald-400 tabular leading-tight">
              {completedRuns} / {totalRuns} done
            </p>
            <p className="text-[10px] text-slate-400">{totalLiters.toFixed(1)} L milk</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Fuel Consumed
            </span>
            <p className="text-base font-black font-display text-blue-300 tabular leading-tight">
              {totalFuelLiters.toFixed(1)} L
            </p>
            <p className="text-[10px] text-slate-400">Rs. {totalFuelCost.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Distance
            </span>
            <p className="text-base font-black font-display text-amber-300 tabular leading-tight">
              {totalDistance} km
            </p>
            <p className="text-[10px] text-slate-400">{fuelLogs.length} receipts</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveSection('runs')}
          className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeSection === 'runs'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Delivery Runs ({deliveries.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('fuel')}
          className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeSection === 'fuel'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Fuel Receipts ({fuelLogs.length})
        </button>
      </div>

      {activeSection === 'runs' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs space-y-2">
          {deliveries.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No delivery runs recorded for {staff.name} during this timeframe.
            </p>
          ) : (
            <div className="rounded-lg border border-slate-200/80 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="w-[120px] py-1 text-xs">Run Code & Date</TableHead>
                    <TableHead className="py-1 text-xs">Customer</TableHead>
                    <TableHead className="py-1 text-xs">Drop Address</TableHead>
                    <TableHead className="py-1 text-xs">Milk Qty</TableHead>
                    <TableHead className="py-1 text-xs">COD Amount</TableHead>
                    <TableHead className="py-1 text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="text-xs font-mono tabular py-2">
                        <div className="font-bold text-slate-900">{delivery.runCode}</div>
                        <div className="text-[10px] text-slate-500">{delivery.date} ({delivery.shift})</div>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-900 py-2 font-display">
                        {delivery.customerName}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 py-2 truncate max-w-[180px]">
                        {delivery.deliveryAddress}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-emerald-700 tabular py-2">
                        {delivery.qtyLiters} L
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-900 tabular py-2">
                        Rs. {Number(delivery.codAmountToCollect || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs py-2">
                        <Badge
                          variant={
                            delivery.status === 'DELIVERED'
                              ? 'green'
                              : delivery.status === 'PENDING'
                              ? 'amber'
                              : 'slate'
                          }
                          className="text-[10px]"
                        >
                          {delivery.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {activeSection === 'fuel' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs space-y-2">
          {fuelLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No fuel receipts logged for {staff.name} during this timeframe.
            </p>
          ) : (
            <div className="rounded-lg border border-slate-200/80 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="w-[120px] py-1 text-xs">Date</TableHead>
                    <TableHead className="py-1 text-xs">Fuel Liters</TableHead>
                    <TableHead className="py-1 text-xs">Amount Paid</TableHead>
                    <TableHead className="py-1 text-xs">Distance Covered</TableHead>
                    <TableHead className="py-1 text-xs">Notes / Station</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fuelLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="text-xs font-mono tabular py-2 font-bold text-slate-900">
                        {log.date}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-blue-700 tabular py-2">
                        {Number(log.liters || 0).toFixed(1)} L
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-900 tabular py-2">
                        Rs. {Number(log.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-700 tabular py-2">
                        {Number(log.distanceKm || 0) > 0 ? `${log.distanceKm} km` : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 py-2">
                        {log.notes || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
