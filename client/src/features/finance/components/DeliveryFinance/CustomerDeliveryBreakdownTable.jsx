import React from 'react';
import { Eye, User, MapPin, PackageOpen, Bike, CreditCard, Banknote } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCustomerDueBalance } from '@/context/CustomerContext';
import { useLedgerContext } from '@/context/LedgerContext';

export default function CustomerDeliveryBreakdownTable({
  rawCustomers = [],
  filteredDeliveries = [],
  onViewCustomerDropPoints,
}) {
  let ledgerCtx = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ledgerCtx = useLedgerContext();
  } catch (_) {}

  // Aggregate deliveries per customer
  const customerBreakdowns = rawCustomers.map((customer) => {
    const custId = String(customer._id || customer.id);
    const custDeliveries = filteredDeliveries.filter(
      (d) =>
        String(d.customerId) === custId ||
        (d.customerName &&
          customer.name &&
          d.customerName.toLowerCase().trim() === customer.name.toLowerCase().trim())
    );

    const totalRuns = custDeliveries.length;
    const totalLiters = custDeliveries.reduce(
      (sum, d) => sum + (Number(d.qtyLiters) || 0),
      0
    );
    const totalCodCollected = custDeliveries.reduce(
      (sum, d) => sum + (Number(d.codAmountToCollect) || 0),
      0
    );
    const riderNames = Array.from(
      new Set(
        custDeliveries
          .map((d) => d.riderNameSnapshot?.trim())
          .filter((name) => name && name.toLowerCase() !== 'unassigned')
      )
    );

    // Compute dynamic real-time Khata Balance from LedgerContext
    const stats = ledgerCtx?.getCustomerCalculatedStats
      ? ledgerCtx.getCustomerCalculatedStats(customer.id || customer._id)
      : null;

    let dynamicKhataBalance = 0;
    let isAdvance = false;
    let advanceAmount = 0;

    if (stats) {
      dynamicKhataBalance = Number(stats.closingBalance) || 0;
      isAdvance = stats.isAdvanceOpening || (Number(stats.remainingAdvance) > 0);
      advanceAmount = Number(stats.remainingAdvance) || 0;
    } else {
      dynamicKhataBalance = getCustomerDueBalance(customer);
    }

    return {
      customer,
      custDeliveries,
      totalRuns,
      totalLiters,
      totalCodCollected,
      riderNames,
      dynamicKhataBalance,
      isAdvance,
      advanceAmount,
    };
  });

  const totalAllLiters = customerBreakdowns.reduce((sum, c) => sum + c.totalLiters, 0);
  const totalAllCod = customerBreakdowns.reduce((sum, c) => sum + c.totalCodCollected, 0);
  const totalAllKhataDue = customerBreakdowns.reduce((sum, c) => sum + (c.dynamicKhataBalance || 0), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
            <TableHead className="min-w-[180px] py-1.5 text-xs">Customer Name & Area</TableHead>
            <TableHead className="min-w-[90px] py-1.5 text-xs">Drop Runs</TableHead>
            <TableHead className="min-w-[110px] py-1.5 text-xs">Milk Delivered</TableHead>
            <TableHead className="min-w-[120px] py-1.5 text-xs">COD Collected</TableHead>
            <TableHead className="min-w-[130px] py-1.5 text-xs">Delivered By (Rider)</TableHead>
            <TableHead className="min-w-[120px] py-1.5 text-xs">Dynamic Khata Balance</TableHead>
            <TableHead className="w-[80px] text-right py-1.5 text-xs">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {customerBreakdowns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-36 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400 space-y-1.5 py-4">
                  <PackageOpen className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                  <p className="text-xs font-semibold text-slate-600 font-display">
                    No customer deliveries recorded
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-sm">
                    There are no doorstep delivery records matching the selected time range.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            customerBreakdowns.map(
              ({
                customer,
                custDeliveries,
                totalRuns,
                totalLiters,
                totalCodCollected,
                riderNames,
                dynamicKhataBalance,
                isAdvance,
                advanceAmount,
              }) => {
                return (
                  <TableRow
                    key={customer._id || customer.id}
                    onClick={() =>
                      onViewCustomerDropPoints &&
                      onViewCustomerDropPoints(customer, custDeliveries)
                    }
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <TableCell className="align-top py-2">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-display">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{customer.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">
                            {customer.area || customer.address || 'Standard Area'}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="align-top py-2">
                      <span className="text-xs font-bold text-slate-800 tabular">
                        {totalRuns} {totalRuns === 1 ? 'run' : 'runs'}
                      </span>
                    </TableCell>

                    <TableCell className="align-top py-2">
                      <span className="text-xs font-bold text-emerald-700 tabular">
                        {totalLiters.toFixed(1)} L
                      </span>
                    </TableCell>

                    <TableCell className="align-top py-2">
                      <span className="text-xs font-bold text-slate-900 tabular">
                        Rs. {totalCodCollected.toLocaleString()}
                      </span>
                    </TableCell>

                    <TableCell className="align-top py-2">
                      {custDeliveries.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">No delivery</span>
                      ) : riderNames.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {riderNames.map((name) => (
                            <div key={name} className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded bg-purple-50 border border-purple-200/80 text-purple-700 flex items-center justify-center shrink-0">
                                <Bike className="w-3 h-3" />
                              </div>
                              <span
                                className="text-xs font-semibold text-slate-800 truncate max-w-[130px]"
                                title={name}
                              >
                                {name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="align-top py-2">
                      {dynamicKhataBalance > 0 ? (
                        <div className="space-y-0.5">
                          <Badge
                            variant="amber"
                            className="text-[10px] px-2 py-0.5 font-bold font-mono tabular border border-amber-200"
                          >
                            Due: Rs. {dynamicKhataBalance.toLocaleString()}
                          </Badge>
                          <span className="text-[9px] text-amber-700 block font-medium">Unpaid Khata</span>
                        </div>
                      ) : advanceAmount > 0 ? (
                        <div className="space-y-0.5">
                          <Badge
                            variant="blue"
                            className="text-[10px] px-2 py-0.5 font-bold font-mono tabular border border-blue-200"
                          >
                            Adv: Rs. {advanceAmount.toLocaleString()}
                          </Badge>
                          <span className="text-[9px] text-blue-700 block font-medium">Advance Balance</span>
                        </div>
                      ) : (
                        <Badge
                          variant="green"
                          className="text-[10px] px-2 py-0.5 font-bold font-mono tabular border border-emerald-200"
                        >
                          Cleared (Rs. 0)
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="align-top py-2 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewCustomerDropPoints(customer, custDeliveries);
                        }}
                        className="h-6.5 px-2 text-[11px] font-medium text-slate-700 hover:text-emerald-700 hover:border-emerald-300 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Drop Points
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }
            )
          )}
        </TableBody>

        {customerBreakdowns.length > 0 && (
          <TableFooter className="bg-slate-50/90 border-t-2 border-slate-200 font-bold text-xs text-slate-900">
            <TableRow>
              <TableCell colSpan={2} className="py-2 text-slate-800 uppercase font-black">
                Total ({customerBreakdowns.length} Customers)
              </TableCell>
              <TableCell className="py-2 text-emerald-700 font-mono tabular">
                {totalAllLiters.toFixed(1)} L
              </TableCell>
              <TableCell className="py-2 text-slate-900 font-mono tabular">
                Rs. {totalAllCod.toLocaleString()}
              </TableCell>
              <TableCell className="py-2"></TableCell>
              <TableCell className="py-2 font-mono tabular text-amber-700 font-black">
                Rs. {totalAllKhataDue.toLocaleString()} (Due)
              </TableCell>
              <TableCell className="py-2"></TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}

