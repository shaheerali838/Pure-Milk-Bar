import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Milk,
  Receipt,
  Scale,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  X,
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

const SUPPLIER_LEDGER = [
  {
    id: 'SUP-101',
    name: 'Rahim Ullah Dairy',
    route: 'Green Meadows Route',
    liters: 18450,
    avgFat: 6.8,
    grossEarned: 2740200,
    advances: 150000,
    paid: 2590200,
    balance: 0,
    status: 'Settled',
  },
  {
    id: 'SUP-102',
    name: 'Gulzar Agro Farms',
    route: 'North Valley Route',
    liters: 24600,
    avgFat: 4.2,
    grossEarned: 3394800,
    advances: 200000,
    paid: 3050000,
    balance: 144800,
    status: 'Partial',
  },
  {
    id: 'SUP-103',
    name: 'Highland Pure Milk Co.',
    route: 'Highland Farms',
    liters: 19800,
    avgFat: 5.1,
    grossEarned: 2772000,
    advances: 100000,
    paid: 2672000,
    balance: 0,
    status: 'Settled',
  },
  {
    id: 'SUP-104',
    name: 'Chaudhry Akram Dairy',
    route: 'Riverside Dairy Route',
    liters: 13200,
    avgFat: 6.9,
    grossEarned: 1927200,
    advances: 80000,
    paid: 1750000,
    balance: 97200,
    status: 'Partial',
  },
  {
    id: 'SUP-105',
    name: 'Bismillah Milk Center',
    route: 'Green Meadows Route',
    liters: 22900,
    avgFat: 4.3,
    grossEarned: 3171650,
    advances: 250000,
    paid: 2921650,
    balance: 0,
    status: 'Settled',
  },
  {
    id: 'SUP-106',
    name: 'Malik Zafar & Sons',
    route: 'North Valley Route',
    liters: 9400,
    avgFat: 6.6,
    grossEarned: 1353600,
    advances: 50000,
    paid: 1297100,
    balance: 6500,
    status: 'Pending',
  },
];

export default function SupplierPL() {
  const [ledger, setLedger] = useState(SUPPLIER_LEDGER);
  const [period, setPeriod] = useState('This Month');
  const [settleModal, setSettleModal] = useState(null);
  const [settleAmount, setSettleAmount] = useState('');

  // Overall Sourcing Economics
  const totalVolume = ledger.reduce((sum, item) => sum + item.liters, 0);
  const totalRawCost = ledger.reduce((sum, item) => sum + item.grossEarned, 0);
  const totalOverhead = 185400; // From Sourcing Expenses
  const totalAllInCost = totalRawCost + totalOverhead;
  const avgSellingPricePerL = 190.0;
  const totalRealizedRevenue = totalVolume * avgSellingPricePerL;
  const grossProfit = totalRealizedRevenue - totalAllInCost;
  const marginPercent = ((grossProfit / totalRealizedRevenue) * 100).toFixed(1);

  const costPerLiterRaw = (totalRawCost / (totalVolume || 1)).toFixed(2);
  const overheadPerLiter = (totalOverhead / (totalVolume || 1)).toFixed(2);
  const allInCostPerLiter = (parseFloat(costPerLiterRaw) + parseFloat(overheadPerLiter)).toFixed(2);
  const spreadPerLiter = (avgSellingPricePerL - parseFloat(allInCostPerLiter)).toFixed(2);

  const totalOutstanding = ledger.reduce((sum, item) => sum + item.balance, 0);

  const handleSettle = (e) => {
    e.preventDefault();
    if (!settleModal) return;
    const payment = parseFloat(settleAmount) || 0;

    setLedger((prev) =>
      prev.map((item) => {
        if (item.id === settleModal.id) {
          const newBal = Math.max(0, item.balance - payment);
          return {
            ...item,
            paid: item.paid + payment,
            balance: newBal,
            status: newBal === 0 ? 'Settled' : 'Partial',
          };
        }
        return item;
      })
    );

    setSettleModal(null);
    setSettleAmount('');
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0092b8]" />
            Supplier Procurement P&L & Economics
          </h2>
          <p className="text-sm text-slate-500">
            Procured milk economics, landed cost per liter, realized sales margins, and supplier accounts ledger.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full text-xs font-semibold text-slate-600">
            {['This Week', 'This Month', 'Last 30 Days'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3.5 py-1.5 rounded-full transition-all ${
                  period === p
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Procured Volume
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular font-display">
            {totalVolume.toLocaleString()}{' '}
            <span className="text-xs font-medium text-slate-500">Liters</span>
          </p>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.4% vs last period</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Procurement Cost
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular font-display">
            Rs. {totalAllInCost.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Raw: Rs. {costPerLiterRaw}/L + Exp: Rs. {overheadPerLiter}/L
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Realized Value
          </p>
          <p className="text-2xl font-bold text-blue-700 mt-1 tabular font-display">
            Rs. {totalRealizedRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Avg selling rate @ Rs. {avgSellingPricePerL}/L
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Gross Procurement Margin
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-1 tabular font-display">
            +Rs. {grossProfit.toLocaleString()}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
              {marginPercent}% Margin
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Rs. +{spreadPerLiter}/L spread
            </span>
          </div>
        </div>
      </div>

      {/* Sourcing Cost & Margin Waterfall Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#0092b8]" />
          Landed Cost Economics Per Liter (PKR)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-xs font-semibold text-slate-500">1. Farm Gate Milk Rate</span>
            <p className="text-xl font-bold text-slate-900 mt-1 tabular">
              Rs. {costPerLiterRaw}{' '}
              <span className="text-xs font-normal text-slate-500">/ L</span>
            </p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Weighted average rate by fat
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-xs font-semibold text-slate-500">2. Collection & Transport</span>
            <p className="text-xl font-bold text-slate-900 mt-1 tabular">
              +Rs. 1.25 <span className="text-xs font-normal text-slate-500">/ L</span>
            </p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Fuel, cans & collection vans
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-xs font-semibold text-slate-500">3. Chilling & Testing</span>
            <p className="text-xl font-bold text-slate-900 mt-1 tabular">
              +Rs. 1.25 <span className="text-xs font-normal text-slate-500">/ L</span>
            </p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Electricity, generator & chemicals
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800">4. Net Realized Spread</span>
            <p className="text-xl font-bold text-emerald-700 mt-1 tabular">
              +Rs. {spreadPerLiter} <span className="text-xs font-normal">/ L</span>
            </p>
            <span className="text-[11px] text-emerald-600 mt-0.5 block font-medium">
              Gross profit per liter sold
            </span>
          </div>
        </div>
      </div>

      {/* Supplier Accounts & Settlement Ledger Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 font-display text-sm sm:text-base">
              Supplier Accounts & Settlement Ledger
            </h4>
            <p className="text-xs text-slate-500">
              Total volume supplied, payments disbursed, and pending farmer settlements.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium">Total Pending Dues:</span>
            <span className="text-sm font-bold text-amber-600 ml-1.5 tabular font-display">
              Rs. {totalOutstanding.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs sm:text-sm">
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  Supplier ID & Farmer
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  Route
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[11px] tracking-wider text-right">
                  Volume (L)
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[11px] tracking-wider text-right">
                  Gross Earned
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[11px] tracking-wider text-right">
                  Advances
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[11px] tracking-wider text-right">
                  Paid
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[11px] tracking-wider text-right">
                  Balance Due
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[11px] tracking-wider text-center">
                  Status
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[11px] tracking-wider text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {ledger.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-slate-50/60 transition-colors duration-150"
                >
                  <TableCell className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 font-display">{row.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{row.id}</div>
                  </TableCell>

                  <TableCell className="py-3.5 px-4 text-slate-600 text-xs">
                    {row.route}
                  </TableCell>

                  <TableCell className="py-3.5 px-4 text-right font-semibold text-slate-800 tabular">
                    {row.liters.toLocaleString()} L
                  </TableCell>

                  <TableCell className="py-3.5 px-4 text-right font-bold text-slate-900 tabular">
                    Rs. {row.grossEarned.toLocaleString()}
                  </TableCell>

                  <TableCell className="py-3.5 px-4 text-right text-rose-600 font-medium tabular">
                    Rs. {row.advances.toLocaleString()}
                  </TableCell>

                  <TableCell className="py-3.5 px-4 text-right text-emerald-700 font-bold tabular">
                    Rs. {row.paid.toLocaleString()}
                  </TableCell>

                  <TableCell className="py-3.5 px-4 text-right font-bold tabular">
                    <span
                      className={
                        row.balance > 0 ? 'text-amber-600' : 'text-slate-400'
                      }
                    >
                      Rs. {row.balance.toLocaleString()}
                    </span>
                  </TableCell>

                  <TableCell className="py-3.5 px-4 text-center">
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-semibold border-0 ${
                        row.status === 'Settled'
                          ? 'bg-emerald-100 text-emerald-700'
                          : row.status === 'Partial'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3.5 px-4 text-right">
                    {row.balance > 0 ? (
                      <button
                        onClick={() => {
                          setSettleModal(row);
                          setSettleAmount(row.balance.toString());
                        }}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-[#0092b8] text-white hover:brightness-110 cursor-pointer shadow-2xs"
                      >
                        Settle
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Clear
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Settlement Modal */}
      {settleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#0092b8]" />
                Disburse Supplier Payment
              </h3>
              <button
                onClick={() => setSettleModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSettle} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Farmer:</span>
                  <span>{settleModal.name}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Supplier ID:</span>
                  <span className="font-mono">{settleModal.id}</span>
                </div>
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>Outstanding Balance:</span>
                  <span>Rs. {settleModal.balance.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Settlement Amount (Rs.) *
                </label>
                <input
                  type="number"
                  required
                  max={settleModal.balance}
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full h-[40px] px-3.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-500 font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSettleModal(null)}
                  className="rounded-full h-[38px] px-4 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-full h-[38px] px-5 text-xs font-semibold text-white"
                  style={{ backgroundColor: '#0092b8' }}
                >
                  Confirm Settlement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
