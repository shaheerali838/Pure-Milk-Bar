import React, { useState } from 'react';
import {
  ArrowLeft,
  Fuel,
  Calendar,
  User,
  Car,
  DollarSign,
  Search,
  Download,
  Gauge,
  FileText,
  Clock,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { exportTableToCSV } from '@/utils/csvExport';

export default function FuelExpensesDetailView({
  fuelLogs = [],
  staffList = [],
  onBack,
}) {
  const now = new Date();
  const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayUTC = now.toISOString().split('T')[0];
  const currentMonthStr = todayLocal.substring(0, 7);

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayLocal = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;
  const yesterdayUTC = yesterdayDate.toISOString().split('T')[0];

  // Time filter: 'today' | 'yesterday' | 'weekly' | 'monthly' | 'all' | 'custom'
  const [dateFilter, setDateFilter] = useState('today');
  const [customDate, setCustomDate] = useState(todayLocal);
  const [selectedStaff, setSelectedStaff] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const isLogDateMatch = (logDate) => {
    if (!logDate) return false;
    let dateStr = '';
    if (typeof logDate === 'string') {
      dateStr = logDate.includes('T') ? logDate.split('T')[0] : logDate.slice(0, 10);
    } else if (logDate instanceof Date) {
      dateStr = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}-${String(logDate.getDate()).padStart(2, '0')}`;
    } else {
      dateStr = String(logDate).slice(0, 10);
    }

    if (dateFilter === 'today') {
      return dateStr === todayLocal || dateStr === todayUTC;
    }

    if (dateFilter === 'yesterday') {
      return dateStr === yesterdayLocal || dateStr === yesterdayUTC;
    }

    if (dateFilter === 'weekly') {
      const targetDate = new Date(dateStr);
      const diffDays = (now.getTime() - targetDate.getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }

    if (dateFilter === 'monthly') {
      return dateStr.startsWith(currentMonthStr) || dateStr.startsWith(todayUTC.substring(0, 7));
    }

    if (dateFilter === 'custom') {
      return dateStr === customDate;
    }

    if (dateFilter === 'all') {
      return true;
    }

    return true;
  };

  // Filter fuel logs
  const filteredLogs = fuelLogs.filter((log) => {
    const matchesDate = isLogDateMatch(log.date || log.createdAt);

    const matchesStaff =
      selectedStaff === 'ALL' ||
      (log.staffName &&
        log.staffName.toLowerCase().trim() === selectedStaff.toLowerCase().trim());

    const term = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (log.staffName && log.staffName.toLowerCase().includes(term)) ||
      (log.notes && log.notes.toLowerCase().includes(term)) ||
      (log.vehiclePlate && log.vehiclePlate.toLowerCase().includes(term)) ||
      (log.source && log.source.toLowerCase().includes(term));

    return matchesDate && matchesStaff && matchesSearch;
  });

  // Calculate aggregates
  const totalAmount = filteredLogs.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const totalLiters = filteredLogs.reduce((sum, f) => sum + (Number(f.liters) || 0), 0);
  const totalDistance = filteredLogs.reduce((sum, f) => sum + (Number(f.distanceKm) || 0), 0);
  const averagePricePerLiter = totalLiters > 0 ? Math.round(totalAmount / totalLiters) : 0;

  // Breakdown by staff/rider
  const staffBreakdownMap = new Map();
  filteredLogs.forEach((log) => {
    const name = log.staffName || 'General Delivery';
    const curr = staffBreakdownMap.get(name) || { name, amount: 0, liters: 0, count: 0, distanceKm: 0 };
    curr.amount += Number(log.amount) || 0;
    curr.liters += Number(log.liters) || 0;
    curr.count += 1;
    curr.distanceKm += Number(log.distanceKm) || 0;
    staffBreakdownMap.set(name, curr);
  });
  const staffBreakdown = Array.from(staffBreakdownMap.values()).sort((a, b) => b.amount - a.amount);

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Staff / Rider Name',
      'Fuel Quantity (Liters)',
      'Amount Paid (PKR)',
      'Distance (KM)',
      'Source / Entry Type',
      'Notes & Remarks',
    ];
    const rows = filteredLogs.map((log) => [
      log.date || '-',
      log.staffName || 'General Delivery',
      Number(log.liters || 0),
      Number(log.amount || 0),
      Number(log.distanceKm || 0),
      log.source || 'Vehicle Log',
      log.notes || '-',
    ]);

    exportTableToCSV({
      filename: `Fuel_Expenses_Report_${dateFilter}_${todayLocal}`,
      title: 'Vehicle Fuel & Fleet Operating Expenses Statement',
      metadata: [
        ['Filter Period', dateFilter.toUpperCase()],
        ['Total Fuel Spent', `Rs. ${totalAmount.toLocaleString()}`],
        ['Total Liters Consumed', `${totalLiters.toFixed(1)} L`],
        ['Total Distance Covered', `${totalDistance} KM`],
        ['Receipts Count', filteredLogs.length],
      ],
      headers,
      rows,
      summaryRows: [
        ['TOTALS', '', `${totalLiters.toFixed(1)} L`, `Rs. ${totalAmount.toLocaleString()}`, `${totalDistance} KM`, '', `Receipts: ${filteredLogs.length}`],
      ],
    });
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-200 pb-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8.5 w-8.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Back to Rider & Delivery Finance"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
              <Fuel className="w-5 h-5 text-purple-600" />
              <span>Fuel &amp; Fleet Expenses Breakdown</span>
              <Badge variant="purple" className="text-[10px] uppercase font-bold">
                {dateFilter === 'today' ? 'Today' : dateFilter === 'yesterday' ? 'Yesterday' : dateFilter === 'weekly' ? 'This Week' : dateFilter === 'monthly' ? 'This Month' : dateFilter === 'custom' ? customDate : 'All Time'}
              </Badge>
            </h1>
            <p className="text-xs text-slate-500">
              Detailed ledger of fuel receipts logged per rider &amp; vehicle
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 px-3 text-xs font-semibold text-purple-800 hover:text-purple-950 border-purple-300 bg-purple-50 hover:bg-purple-100 shadow-2xs cursor-pointer gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-purple-700" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Card className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl shadow-2xs space-y-0.5">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
            TOTAL FUEL EXPENSE
          </span>
          <span className="text-xl sm:text-2xl font-black text-purple-950 block font-mono tabular">
            Rs. {totalAmount.toLocaleString()}
          </span>
          <span className="text-[10px] text-purple-600 font-medium">
            {filteredLogs.length} receipts logged
          </span>
        </Card>

        <Card className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl shadow-2xs space-y-0.5">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
            FUEL CONSUMED
          </span>
          <span className="text-xl sm:text-2xl font-black text-blue-950 block font-mono tabular">
            {totalLiters.toFixed(1)} L
          </span>
          <span className="text-[10px] text-blue-600 font-medium">
            Avg ~Rs. {averagePricePerLiter}/L
          </span>
        </Card>

        <Card className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl shadow-2xs space-y-0.5">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
            DISTANCE TRAVELED
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-950 block font-mono tabular">
            {totalDistance} KM
          </span>
          <span className="text-[10px] text-amber-600 font-medium">
            Fleet mileage covered
          </span>
        </Card>

        <Card className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl shadow-2xs space-y-0.5">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            STAFF ATTRIBUTED
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-950 block font-mono tabular">
            {staffBreakdown.length} {staffBreakdown.length === 1 ? 'Rider' : 'Riders'}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">
            Active drivers with fuel
          </span>
        </Card>
      </div>

      {/* Staff Breakdown Pill Strip */}
      {staffBreakdown.length > 0 && (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xs flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
              Per-Person Fuel Breakdown:
            </span>
            {selectedStaff !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedStaff('ALL')}
                className="text-[10px] text-purple-300 hover:text-white underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {staffBreakdown.map((sb) => {
              const isSelected = selectedStaff.toLowerCase() === sb.name.toLowerCase();
              return (
                <button
                  type="button"
                  key={sb.name}
                  onClick={() => setSelectedStaff(isSelected ? 'ALL' : sb.name)}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-2 text-xs transition cursor-pointer border ${
                    isSelected
                      ? 'bg-purple-600 border-purple-400 text-white ring-2 ring-purple-300'
                      : 'bg-slate-800/90 border-slate-700 hover:bg-slate-700/80 text-slate-200'
                  }`}
                  title={`Click to filter by ${sb.name}`}
                >
                  <div className="flex items-center gap-1 font-bold font-display">
                    <User className="w-3 h-3 text-purple-300" />
                    <span>{sb.name}:</span>
                  </div>
                  <span className={`font-mono font-black tabular ${isSelected ? 'text-white' : 'text-emerald-400'}`}>
                    Rs. {sb.amount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-300">
                    ({sb.liters.toFixed(1)} L &bull; {sb.count} logs)
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                dateFilter === 'today'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('yesterday')}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                dateFilter === 'yesterday'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yesterday
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('weekly')}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                dateFilter === 'weekly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('monthly')}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                dateFilter === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                dateFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('custom')}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                dateFilter === 'custom'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom Date
            </button>
          </div>

          {dateFilter === 'custom' && (
            <Input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="h-8 w-32 text-xs tabular"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-40">
            <Select value={selectedStaff} onValueChange={(v) => setSelectedStaff(v)}>
              <SelectTrigger className="h-8 text-xs bg-white">
                <SelectValue placeholder="All Staff / Riders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">All Staff / Riders</SelectItem>
                {staffList.map((s) => (
                  <SelectItem key={s.id} value={s.name} className="text-xs">
                    {s.name} ({s.type === 'RIDER' ? 'Rider' : 'Staff'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search notes / vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-2.5 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Detail Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-360px)]">
          <Table className="w-full text-left border-collapse min-w-[850px]">
            <TableHeader className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
              <TableRow className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:bg-slate-50">
                <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">DATE</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">STAFF / RIDER</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">FUEL LITERS</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">AMOUNT PAID</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">DISTANCE (KM)</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-center text-slate-400 font-bold">SOURCE</TableHead>
                <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">NOTES / REMARKS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-3.5 py-10 text-center text-slate-400 font-medium">
                    <Fuel className="w-8 h-8 text-slate-300 mx-auto mb-1.5 stroke-[1.5]" />
                    <p className="font-semibold text-slate-600 font-display text-xs">
                      No fuel logs found for this timeframe
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Fuel receipts recorded from POS or Delivery will appear here automatically.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log, idx) => (
                  <TableRow key={log.id || idx} className="hover:bg-purple-50/40 transition-colors">
                    <TableCell className="px-3.5 py-2 font-mono text-slate-800 font-semibold tabular whitespace-nowrap">
                      {log.date}
                    </TableCell>

                    <TableCell className="px-3.5 py-2 font-bold text-slate-900 font-display whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>{log.staffName || 'General Delivery'}</span>
                        </div>
                        {(log.vehiclePlate || log.shift) && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-normal">
                            {log.vehiclePlate && (
                              <span className="font-mono bg-slate-100 px-1 rounded text-slate-700 font-bold">
                                {log.vehiclePlate}
                              </span>
                            )}
                            {log.shift && (
                              <span className="text-[9px] uppercase text-purple-700 font-semibold">
                                &bull; {log.shift}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-3.5 py-2 text-right font-bold text-blue-700 tabular whitespace-nowrap">
                      {Number(log.liters || 0).toFixed(1)} L
                    </TableCell>

                    <TableCell className="px-3.5 py-2 text-right font-black text-slate-900 tabular whitespace-nowrap">
                      Rs. {Number(log.amount || 0).toLocaleString()}
                    </TableCell>

                    <TableCell className="px-3.5 py-2 text-right font-medium text-slate-700 tabular whitespace-nowrap">
                      {Number(log.distanceKm || 0) > 0 ? `${log.distanceKm} km` : '—'}
                    </TableCell>

                    <TableCell className="px-3.5 py-2 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {log.source === 'FINANCE_EXPENSE' ? 'POS / Finance' : 'Vehicle Log'}
                      </span>
                    </TableCell>

                    <TableCell className="px-3.5 py-2 text-slate-500 max-w-[220px] truncate">
                      {log.notes || 'Fuel receipt cleared'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {filteredLogs.length > 0 && (
              <TableFooter className="border-t-2 border-slate-200 bg-slate-50/90 font-bold text-xs text-slate-900">
                <TableRow>
                  <TableCell colSpan={2} className="px-3.5 py-2 uppercase font-black text-slate-800">
                    Total ({filteredLogs.length} Receipts)
                  </TableCell>
                  <TableCell className="px-3.5 py-2 text-right text-blue-700 tabular">
                    {totalLiters.toFixed(1)} L
                  </TableCell>
                  <TableCell className="px-3.5 py-2 text-right font-black text-slate-900 tabular">
                    Rs. {totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-3.5 py-2 text-right tabular">
                    {totalDistance} km
                  </TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </div>
    </div>
  );
}
