import React from 'react';
import { Eye, User, MapPin, PackageOpen } from 'lucide-react';
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

export default function CustomerDeliveryBreakdownTable({
  rawCustomers = [],
  filteredDeliveries = [],
  onViewCustomerDropPoints,
}) {
  // Aggregate deliveries per customer
  const customerBreakdowns = rawCustomers.map((customer) => {
    const custDeliveries = filteredDeliveries.filter(
      (d) =>
        String(d.customerId) === String(customer.id) ||
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
    const totalBottles = custDeliveries.reduce(
      (sum, d) => sum + (Number(d.bottlesReturned) || 0),
      0
    );

    return {
      customer,
      custDeliveries,
      totalRuns,
      totalLiters,
      totalCodCollected,
      totalBottles,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
            <TableHead className="min-w-[180px] py-1.5 text-xs">Customer Name & Area</TableHead>
            <TableHead className="min-w-[100px] py-1.5 text-xs">Drop Runs</TableHead>
            <TableHead className="min-w-[110px] py-1.5 text-xs">Milk Delivered</TableHead>
            <TableHead className="min-w-[120px] py-1.5 text-xs">COD Collected</TableHead>
            <TableHead className="min-w-[110px] py-1.5 text-xs">Bottles Returned</TableHead>
            <TableHead className="w-[100px] py-1.5 text-xs">Khata Balance</TableHead>
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
                totalBottles,
              }) => {
                const khataBal = Number(customer.khataBalance) || 0;

                return (
                  <TableRow
                    key={customer.id}
                    onClick={() =>
                      onViewCustomerDropPoints &&
                      onViewCustomerDropPoints(customer, custDeliveries)
                    }
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Customer */}
                    <TableCell className="align-top py-2">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-display">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
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

                    {/* Drop Runs */}
                    <TableCell className="align-top py-2">
                      <span className="text-xs font-bold text-slate-800 tabular">
                        {totalRuns} {totalRuns === 1 ? 'run' : 'runs'}
                      </span>
                    </TableCell>

                    {/* Total Liters */}
                    <TableCell className="align-top py-2">
                      <span className="text-xs font-bold text-emerald-700 tabular">
                        {totalLiters.toFixed(1)} L
                      </span>
                    </TableCell>

                    {/* COD Collected */}
                    <TableCell className="align-top py-2">
                      <span className="text-xs font-bold text-slate-900 tabular">
                        Rs. {totalCodCollected.toLocaleString()}
                      </span>
                    </TableCell>

                    {/* Bottles */}
                    <TableCell className="align-top py-2">
                      <span className="text-xs font-medium text-slate-700 tabular">
                        {totalBottles}
                      </span>
                    </TableCell>

                    {/* Khata Balance */}
                    <TableCell className="align-top py-2">
                      <Badge
                        variant={khataBal > 0 ? 'amber' : 'green'}
                        className="text-[10px] px-1.5 py-0"
                      >
                        Rs. {khataBal.toLocaleString()}
                      </Badge>
                    </TableCell>

                    {/* Action */}
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
      </Table>
    </div>
  );
}
