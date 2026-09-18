import React, { useState } from 'react';
import {
  Bike,
  Footprints,
  Fuel,
  Package,
  CheckCircle2,
  Clock,
  Car,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useFuelLogContext } from '@/context/FuelLogContext';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function StaffPerformanceFuelSection({ staff }) {
  const { deliveries = [] } = useDeliveryContext();
  const { fuelLogs = [] } = useFuelLogContext();

  const [activeTab, setActiveTab] = useState('runs'); // 'runs' | 'fuel'
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' | 'month' | 'today'
  const [searchQuery, setSearchQuery] = useState('');

  if (!staff) return null;

  const roleLower = (staff.role || '').toLowerCase();
  const isDeliveryStaff =
    roleLower.includes('delivery') ||
    roleLower.includes('rider') ||
    roleLower.includes('courier') ||
    roleLower.includes('walk') ||
    roleLower.includes('boy') ||
    roleLower.includes('driver');

  // Filter staff deliveries
  const staffDeliveriesAll = deliveries.filter(
    (d) =>
      d.riderNameSnapshot &&
      staff.name &&
      d.riderNameSnapshot.toLowerCase().trim() === staff.name.toLowerCase().trim()
  );

  // Filter staff fuel logs
  const staffFuelLogsAll = fuelLogs.filter(
    (f) =>
      f.staffName &&
      staff.name &&
      f.staffName.toLowerCase().trim() === staff.name.toLowerCase().trim()
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const isDateInFilter = (dateStr) => {
    if (!dateStr) return false;
    const d = dateStr.split('T')[0];
    if (timeFilter === 'today') return d === todayStr;
    if (timeFilter === 'month') return d.startsWith(currentMonthStr);
    return true;
  };

  const filteredDeliveries = staffDeliveriesAll
    .filter((d) => isDateInFilter(d.date))
    .filter((d) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        (d.runCode && d.runCode.toLowerCase().includes(q)) ||
        (d.customerName && d.customerName.toLowerCase().includes(q)) ||
        (d.deliveryAddress && d.deliveryAddress.toLowerCase().includes(q)) ||
        (d.status && d.status.toLowerCase().includes(q))
      );
    });

  const filteredFuelLogs = staffFuelLogsAll
    .filter((f) => isDateInFilter(f.date))
    .filter((f) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        (f.notes && f.notes.toLowerCase().includes(q)) ||
        (f.date && f.date.includes(q))
      );
    });

  // Calculate Metrics
  const totalRuns = staffDeliveriesAll.length;
  const completedRuns = staffDeliveriesAll.filter((d) => d.status === 'DELIVERED').length;
  const totalLiters = staffDeliveriesAll.reduce((sum, d) => sum + (Number(d.qtyLiters) || 0), 0);
  const totalCod = staffDeliveriesAll.reduce((sum, d) => sum + (Number(d.codAmountToCollect) || 0), 0);
  const totalFuelLiters = staffFuelLogsAll.reduce((sum, f) => sum + (Number(f.liters) || 0), 0);
  const totalFuelCost = staffFuelLogsAll.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const totalDistance = staffFuelLogsAll.reduce((sum, f) => sum + (Number(f.distanceKm) || 0), 0);

  return (
    <div className="space-y-4 pt-2 border-t border-slate-200/80">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Bike className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-display">
              Rider Performance, Delivery Runs &amp; Fuel Logs
            </h4>
            <p className="text-[11px] text-slate-500">
              Live operational metrics, route logs, and petrol/mileage expenses for {staff.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setTimeFilter('all')}
            className={`px-2.5 py-0.5 rounded font-bold transition cursor-pointer ${
              timeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Time
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('month')}
            className={`px-2.5 py-0.5 rounded font-bold transition cursor-pointer ${
              timeFilter === 'month'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('today')}
            className={`px-2.5 py-0.5 rounded font-bold transition cursor-pointer ${
              timeFilter === 'today'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed Runs</span>
            <Package className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-lg font-black text-slate-900 font-display tabular">
            {completedRuns} <span className="text-xs font-normal text-slate-400">/ {totalRuns}</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>{totalRuns > 0 ? ((completedRuns / totalRuns) * 100).toFixed(0) : 0}% success rate</span>
          </div>
        </div>

        <div className="p-3 bg-emerald-50/50 border border-emerald-200/70 rounded-xl">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Milk Delivered</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg font-black text-emerald-800 font-display tabular">
            {totalLiters.toFixed(1)} <span className="text-xs font-normal">Liters</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            COD: Rs. {totalCod.toLocaleString()}
          </div>
        </div>

        <div className="p-3 bg-blue-50/50 border border-blue-200/70 rounded-xl">
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Fuel Consumed</span>
            <Fuel className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-lg font-black text-blue-900 font-display tabular">
            {totalFuelLiters.toFixed(1)} <span className="text-xs font-normal">L</span>
          </div>
          <div className="text-[10px] text-blue-700 font-semibold mt-0.5">
            Rs. {totalFuelCost.toLocaleString()} expense
          </div>
        </div>

        <div className="p-3 bg-amber-50/50 border border-amber-200/70 rounded-xl">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Distance Covered</span>
            <Car className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-lg font-black text-amber-900 font-display tabular">
            {totalDistance} <span className="text-xs font-normal">KM</span>
          </div>
          <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
            {staffFuelLogsAll.length} fuel receipts
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-b border-slate-200 pb-1.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('runs')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'runs'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Delivery Runs Log ({filteredDeliveries.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fuel')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'fuel'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            Fuel Expense Receipts ({filteredFuelLogs.length})
          </button>
        </div>

        <div className="relative w-48 sm:w-56">
          <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Tab 1: Delivery Runs */}
      {activeTab === 'runs' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          {filteredDeliveries.length === 0 ? (
            <div className="py-8 text-center px-4 space-y-1">
              <Package className="w-7 h-7 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600 font-display">
                No delivery runs found
              </p>
              <p className="text-[11px] text-slate-400">
                {timeFilter !== 'all'
                  ? 'No runs match the selected timeframe.'
                  : `Assign deliveries to ${staff.name} in Doorstep Deliveries or POS.`}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="w-[120px] py-1.5 text-xs">Run Code &amp; Date</TableHead>
                  <TableHead className="py-1.5 text-xs">Customer</TableHead>
                  <TableHead className="py-1.5 text-xs">Drop Address</TableHead>
                  <TableHead className="py-1.5 text-xs">Milk Qty</TableHead>
                  <TableHead className="py-1.5 text-xs">COD Amount</TableHead>
                  <TableHead className="py-1.5 text-xs">Payment</TableHead>
                  <TableHead className="py-1.5 text-xs text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.map((delivery) => (
                  <TableRow key={delivery.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="text-xs font-mono tabular py-2">
                      <div className="font-bold text-slate-900">{delivery.runCode}</div>
                      <div className="text-[10px] text-slate-500">{delivery.date} ({delivery.shift})</div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-900 py-2 font-display">
                      {delivery.customerName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 py-2 truncate max-w-[180px]">
                      {delivery.deliveryAddress || 'Standard Area'}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-emerald-700 tabular py-2">
                      {delivery.qtyLiters} L
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-900 tabular py-2">
                      Rs. {Number(delivery.codAmountToCollect || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 py-2">
                      {delivery.paymentMode || 'CASH'}
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right">
                      <Badge
                        variant={
                          delivery.status === 'DELIVERED'
                            ? 'green'
                            : delivery.status === 'PENDING'
                            ? 'amber'
                            : 'rose'
                        }
                        className="text-[10px] px-1.5 py-0"
                      >
                        {delivery.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Tab 2: Fuel Receipts */}
      {activeTab === 'fuel' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          {filteredFuelLogs.length === 0 ? (
            <div className="py-8 text-center px-4 space-y-1">
              <Fuel className="w-7 h-7 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600 font-display">
                No fuel logs recorded
              </p>
              <p className="text-[11px] text-slate-400">
                Log petrol receipts from POS delivery checkout or the Doorstep Deliveries &gt; Fuel Log tab.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="w-[120px] py-1.5 text-xs">Date</TableHead>
                  <TableHead className="py-1.5 text-xs">Fuel (Liters)</TableHead>
                  <TableHead className="py-1.5 text-xs">Amount Paid</TableHead>
                  <TableHead className="py-1.5 text-xs">Distance (KM)</TableHead>
                  <TableHead className="py-1.5 text-xs">Notes / Station</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFuelLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="text-xs font-mono tabular py-2 text-slate-700">
                      {log.date}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-blue-700 tabular py-2">
                      {Number(log.liters || 0).toFixed(1)} L
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-900 tabular py-2">
                      Rs. {Number(log.amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-amber-800 tabular py-2">
                      {log.distanceKm ? `${log.distanceKm} km` : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 py-2">
                      {log.notes || 'Routine fuel refill'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}
