import React from 'react';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Package,
  CreditCard,
  CheckCircle2,
  Clock,
  Bike,
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

export default function CustomerDropPointsDetailView({
  customer,
  deliveries = [],
  timeRangeLabel = 'Selected Period',
  onBack,
}) {
  if (!customer) return null;

  const totalRuns = deliveries.length;
  const totalLiters = deliveries.reduce((sum, d) => sum + (Number(d.qtyLiters) || 0), 0);
  const totalCod = deliveries.reduce((sum, d) => sum + (Number(d.codAmountToCollect) || 0), 0);
  const totalBottles = deliveries.reduce((sum, d) => sum + (Number(d.bottlesReturned) || 0), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="green" className="text-[10px] px-1.5 py-0">Delivered</Badge>;
      case 'PENDING':
        return <Badge variant="amber" className="text-[10px] px-1.5 py-0">Pending</Badge>;
      case 'FAILED':
        return <Badge variant="rose" className="text-[10px] px-1.5 py-0">Failed</Badge>;
      case 'SKIPPED':
        return <Badge variant="slate" className="text-[10px] px-1.5 py-0">Skipped</Badge>;
      default:
        return <Badge variant="slate" className="text-[10px] px-1.5 py-0">{status || 'Unknown'}</Badge>;
    }
  };

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
            title="Back to Customer Breakdown"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight font-display leading-none flex items-center gap-2">
              <span>Customer Drop Points &bull; {customer.name}</span>
              <Badge variant="green" className="text-[10px]">
                {timeRangeLabel}
              </Badge>
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Area: {customer.area || 'Model Town'} &bull; Phone: {customer.phone || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center text-lg font-bold font-display">
            {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Customer Account
            </span>
            <h3 className="text-base font-bold font-display">{customer.name}</h3>
            <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              {customer.address || customer.area || 'Standard Area'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 text-right">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Volume
            </span>
            <p className="text-lg font-black font-display text-emerald-300 tabular leading-tight">
              {totalLiters.toFixed(1)} L
            </p>
            <p className="text-[10px] text-slate-400">{totalRuns} drop runs</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              COD Paid
            </span>
            <p className="text-lg font-black font-display text-emerald-400 tabular leading-tight">
              Rs. {totalCod.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400">{totalBottles} bottles returned</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs space-y-2">
        <h4 className="font-bold text-slate-900 text-xs font-display flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-emerald-600" />
          Delivery Drop Points Log ({deliveries.length})
        </h4>

        {deliveries.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No delivery runs recorded for {customer.name} during this timeframe.
          </p>
        ) : (
          <div className="rounded-lg border border-slate-200/80 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="w-[120px] py-1 text-xs">Run Code & Date</TableHead>
                  <TableHead className="py-1 text-xs">Shift</TableHead>
                  <TableHead className="py-1 text-xs">Item Description</TableHead>
                  <TableHead className="py-1 text-xs">Quantity</TableHead>
                  <TableHead className="py-1 text-xs">Rider Assigned</TableHead>
                  <TableHead className="py-1 text-xs">Payment Mode</TableHead>
                  <TableHead className="py-1 text-xs">COD Amount</TableHead>
                  <TableHead className="py-1 text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="text-xs font-mono tabular py-2">
                      <div className="font-bold text-slate-900">{delivery.runCode}</div>
                      <div className="text-[10px] text-slate-500">{delivery.date}</div>
                    </TableCell>
                    <TableCell className="text-xs py-2 font-medium text-slate-800">
                      {delivery.shift}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 py-2">
                      {delivery.itemDescription}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-emerald-700 tabular py-2">
                      {delivery.qtyLiters} L
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 py-2 flex items-center gap-1">
                      <Bike className="w-3 h-3 text-purple-600" />
                      {delivery.riderNameSnapshot || 'Unassigned'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 py-2">
                      {delivery.paymentMode}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-900 tabular py-2">
                      Rs. {Number(delivery.codAmountToCollect || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs py-2">
                      {getStatusBadge(delivery.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
