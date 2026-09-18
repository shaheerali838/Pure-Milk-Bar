import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Download,
  Printer,
  CheckCircle2,
  Lock,
  Layers,
  Droplets,
  Truck,
  DollarSign,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

const ROUTE_SUMMARIES = [
  {
    name: 'Green Meadows Route',
    farmers: 12,
    liters: 820.0,
    avgFat: 4.8,
    payable: 118900,
    color: '#009966',
  },
  {
    name: 'North Valley Route',
    farmers: 10,
    liters: 680.0,
    avgFat: 4.5,
    payable: 95200,
    color: '#155dfc',
  },
  {
    name: 'Highland Farms Route',
    farmers: 8,
    liters: 540.5,
    avgFat: 4.4,
    payable: 75670,
    color: '#0092b8',
  },
  {
    name: 'Riverside Dairy Route',
    farmers: 6,
    liters: 380.0,
    avgFat: 4.9,
    payable: 55350,
    color: '#d97706',
  },
];

const MASTER_PROCUREMENT_ROWS = [
  {
    code: 'SUP-101',
    farmer: 'Rahim Ullah Dairy',
    route: 'Green Meadows Route',
    morningLiters: 45.0,
    morningFat: 6.8,
    eveningLiters: 40.0,
    eveningFat: 6.7,
    totalLiters: 85.0,
    weightedFat: 6.75,
    rate: 148.5,
    grossDue: 12622.5,
    advanceDeduction: 1000.0,
    netPayable: 11622.5,
    dispatchStatus: 'Transferred to Silo 1',
  },
  {
    code: 'SUP-102',
    farmer: 'Gulzar Agro Farms',
    route: 'North Valley Route',
    morningLiters: 65.0,
    morningFat: 4.2,
    eveningLiters: 55.0,
    eveningFat: 3.9,
    totalLiters: 120.0,
    weightedFat: 4.06,
    rate: 136.5,
    grossDue: 16380.0,
    advanceDeduction: 1500.0,
    netPayable: 14880.0,
    dispatchStatus: 'Transferred to Silo 2',
  },
  {
    code: 'SUP-103',
    farmer: 'Highland Pure Milk Co.',
    route: 'Highland Farms Route',
    morningLiters: 50.0,
    morningFat: 5.1,
    eveningLiters: 45.0,
    eveningFat: 5.0,
    totalLiters: 95.0,
    weightedFat: 5.05,
    rate: 142.0,
    grossDue: 13490.0,
    advanceDeduction: 0,
    netPayable: 13490.0,
    dispatchStatus: 'Transferred to Silo 1',
  },
  {
    code: 'SUP-104',
    farmer: 'Chaudhry Akram Dairy',
    route: 'Riverside Dairy Route',
    morningLiters: 35.0,
    morningFat: 6.9,
    eveningLiters: 30.0,
    eveningFat: 6.8,
    totalLiters: 65.0,
    weightedFat: 6.85,
    rate: 149.0,
    grossDue: 9685.0,
    advanceDeduction: 800.0,
    netPayable: 8885.0,
    dispatchStatus: 'Transferred to Silo 1',
  },
  {
    code: 'SUP-105',
    farmer: 'Bismillah Milk Center',
    route: 'Green Meadows Route',
    morningLiters: 60.0,
    morningFat: 4.3,
    eveningLiters: 50.0,
    eveningFat: 4.2,
    totalLiters: 110.0,
    weightedFat: 4.25,
    rate: 138.0,
    grossDue: 15180.0,
    advanceDeduction: 1200.0,
    netPayable: 13980.0,
    dispatchStatus: 'Transferred to Processing',
  },
];

export default function ProcurementSheet() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedRoute, setSelectedRoute] = useState('All Routes');
  const [isLocked, setIsLocked] = useState(false);

  const filteredRows = MASTER_PROCUREMENT_ROWS.filter((r) =>
    selectedRoute === 'All Routes' ? true : r.route === selectedRoute
  );

  const totalCollected = MASTER_PROCUREMENT_ROWS.reduce((sum, r) => sum + r.totalLiters, 0);
  const totalMorning = MASTER_PROCUREMENT_ROWS.reduce((sum, r) => sum + r.morningLiters, 0);
  const totalEvening = MASTER_PROCUREMENT_ROWS.reduce((sum, r) => sum + r.eveningLiters, 0);
  const totalNetPayable = MASTER_PROCUREMENT_ROWS.reduce((sum, r) => sum + r.netPayable, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#d97706]" />
            Daily Procurement Master Sheet
          </h2>
          <p className="text-sm text-slate-500">
            Daily intake reconciliation, route-wise collections, weighted fat rates, and net supplier settlements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3.5 h-[38px] text-xs font-semibold text-slate-700 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-none outline-none bg-transparent cursor-pointer"
            />
          </div>

          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center gap-2 px-3.5 h-[38px] rounded-full text-xs font-semibold border-slate-200 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </Button>

          <Button
            onClick={() => setIsLocked(!isLocked)}
            className="flex items-center gap-2 px-4 h-[38px] rounded-full text-white text-xs font-semibold shadow-xs"
            style={{ backgroundColor: isLocked ? '#059669' : '#d97706' }}
          >
            {isLocked ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Day Reconciled & Locked
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" /> Lock Daily Sheet
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Procured Today
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular font-display">
            2,420.5 <span className="text-xs font-medium text-amber-600">L</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">36 Total farmers intake</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Morning Session
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular font-display">
            1,380.0 <span className="text-xs font-medium text-slate-500">L</span>
          </p>
          <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">57.0% of day intake</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Evening Session
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular font-display">
            1,040.5 <span className="text-xs font-medium text-slate-500">L</span>
          </p>
          <p className="text-[11px] text-indigo-600 mt-0.5 font-medium">43.0% of day intake</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Weighted Avg Fat
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-1 tabular font-display">
            4.62%
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Avg SNF: 8.65%</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Payable Today
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular font-display">
            Rs. 345,120
          </p>
          <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">Net after deductions</p>
        </div>
      </div>

      {/* Route-Wise Collections Cards */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Route-Wise Procurement Totals
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {ROUTE_SUMMARIES.map((r) => (
            <div
              key={r.name}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="font-bold text-slate-900 text-xs truncate">
                  {r.name}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: r.color }}
                />
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Collected:</span>
                  <span className="font-bold text-slate-900 tabular">{r.liters} L</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Suppliers:</span>
                  <span className="font-semibold text-slate-700">{r.farmers} Farmers</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Avg Fat%:</span>
                  <span className="font-bold text-blue-600">{r.avgFat}%</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                  <span className="font-bold text-slate-700">Payable:</span>
                  <span className="font-bold text-slate-900 tabular">
                    Rs. {r.payable.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Master Procurement Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-slate-900 font-display text-sm sm:text-base">
              Daily Master Intake & Payables Sheet
            </h4>
            <p className="text-xs text-slate-500">
              Shift-wise intake volume, quality testing, and final calculated payables.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="h-[36px] px-3 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 transition-colors"
            >
              <option value="All Routes">All Routes</option>
              {ROUTE_SUMMARIES.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
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
              {filteredRows.map((row) => (
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
                    <span className="text-[11px] text-amber-600 block">({row.morningFat}%)</span>
                  </TableCell>

                  <TableCell className="py-3.5 px-3 text-right tabular text-xs">
                    <span className="font-bold text-slate-800">{row.eveningLiters.toFixed(1)} L</span>
                    <span className="text-[11px] text-indigo-600 block">({row.eveningFat}%)</span>
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
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-600">
            <span>
              Total Filtered Volume: <strong>{totalCollected.toFixed(1)} Liters</strong>
            </span>
            <span>•</span>
            <span>
              Morning: <strong>{totalMorning.toFixed(1)} L</strong> | Evening:{' '}
              <strong>{totalEvening.toFixed(1)} L</strong>
            </span>
          </div>

          <div className="text-right">
            <span className="text-slate-500 font-medium mr-2">Total Net Payable:</span>
            <span className="text-base font-bold text-slate-900 tabular font-display">
              Rs. {totalNetPayable.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
