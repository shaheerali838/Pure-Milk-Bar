import React from 'react';
import { Eye, PackageOpen, MapPin, User, Bike } from 'lucide-react';
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

export default function DeliveryTable({ deliveries = [], onViewDelivery }) {
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

  const getShiftBadge = (shift) => {
    if (shift === 'MORNING') {
      return (
        <Badge variant="amber" className="text-[9px] px-1.5 py-0 font-medium">
          Morning
        </Badge>
      );
    }
    return (
      <Badge variant="indigo" className="text-[9px] px-1.5 py-0 font-medium">
        Evening
      </Badge>
    );
  };

  const getPaymentBadge = (mode) => {
    switch (mode) {
      case 'CASH':
        return <Badge variant="green" className="text-[9px] px-1.5 py-0">Cash</Badge>;
      case 'KHATA':
        return <Badge variant="amber" className="text-[9px] px-1.5 py-0">Khata</Badge>;
      case 'ONLINE':
        return <Badge variant="indigo" className="text-[9px] px-1.5 py-0">Online</Badge>;
      case 'PREPAID':
        return <Badge variant="slate" className="text-[9px] px-1.5 py-0">Prepaid</Badge>;
      default:
        return <Badge variant="slate" className="text-[9px] px-1.5 py-0">{mode}</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden print:border-none print:shadow-none">
      <div className="hidden print:block p-3 border-b border-slate-300 text-black">
        <h2 className="text-lg font-bold font-display">Pure Milk Bar — Daily Delivery Run Sheet</h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Generated on {new Date().toLocaleDateString()} · Total Drop Points: {deliveries.length}
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
            <TableHead className="w-[120px] py-1.5 text-xs">Date &amp; Shift</TableHead>
            <TableHead className="min-w-[170px] py-1.5 text-xs">Customer / Drop</TableHead>
            <TableHead className="min-w-[180px] py-1.5 text-xs">Purchased Items</TableHead>
            <TableHead className="min-w-[130px] py-1.5 text-xs">Rider / Route</TableHead>
            <TableHead className="min-w-[140px] py-1.5 text-right text-xs">Payment &amp; Dues</TableHead>
            <TableHead className="w-[90px] py-1.5 text-xs">Status</TableHead>
            <TableHead className="w-[70px] text-right py-1.5 text-xs no-print">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {deliveries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-36 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400 space-y-1.5 py-4">
                  <PackageOpen className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                  <p className="text-xs font-semibold text-slate-600 font-display">
                    No deliveries found
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-sm">
                    There are no delivery drop runs matching your filter criteria.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            deliveries.map((delivery) => {
              const hasRider = Boolean(delivery.riderId || (delivery.riderNameSnapshot && delivery.riderNameSnapshot !== 'Unassigned'));
              const hasCustomerInfo = Boolean(delivery.customerId || (delivery.customerName && delivery.customerName !== 'Walk-in / Guest Delivery' && delivery.customerName !== 'N/A'));
              const hasItemsArray = Array.isArray(delivery.items) && delivery.items.length > 0;
              const totalDue = Number(delivery.amountDue) || 0;
              const paidAmt = Number(delivery.amountPaid) || 0;
              const codAmount = Number(delivery.codAmountToCollect) || (totalDue > 0 ? totalDue : 0);

              return (
                <TableRow
                  key={delivery.id}
                  onClick={() => onViewDelivery && onViewDelivery(delivery)}
                  className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <TableCell className="align-top py-2">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-slate-900 font-mono tabular leading-none">
                        {delivery.date || '—'}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {getShiftBadge(delivery.shift)}
                        <span className="text-[9px] text-slate-400 font-mono">
                          {delivery.runCode}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Customer / Drop Point */}
                  <TableCell className="align-top py-2">
                    <div className="space-y-0.5">
                      {hasCustomerInfo ? (
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1 font-display leading-none">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{delivery.customerName}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] font-semibold text-slate-500 italic">
                          Walk-in / Direct Drop
                        </div>
                      )}
                      {delivery.deliveryAddress && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[190px]" title={delivery.deliveryAddress}>
                            {delivery.deliveryAddress}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Purchased Items List */}
                  <TableCell className="align-top py-2">
                    {hasItemsArray ? (
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {delivery.items.map((it, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-1.5 py-0.2 bg-slate-100 rounded text-[10px] text-slate-800 font-medium"
                          >
                            {it.name}: <strong className="ml-0.5 text-emerald-700">{it.quantity} {it.unit || ''}</strong>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-slate-800 leading-none">
                          {delivery.itemDescription || 'Fresh Milk'}
                        </div>
                        {delivery.qtyLiters > 0 && (
                          <div className="text-[11px] font-medium text-emerald-700">
                            {delivery.qtyLiters} Liters
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>

                  {/* Rider & Route (Conditional) */}
                  <TableCell className="align-top py-2">
                    <div className="space-y-0.5">
                      {hasRider ? (
                        <div className="text-xs font-medium text-slate-800 flex items-center gap-1 leading-none">
                          <Bike className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{delivery.riderNameSnapshot}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No rider assigned</span>
                      )}
                      {delivery.route && (
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]" title={delivery.route}>
                          {delivery.route}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Payment & Dues breakdown */}
                  <TableCell className="align-top py-2 text-right">
                    <div className="space-y-0.5 inline-flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        {getPaymentBadge(delivery.paymentMode)}
                        {delivery.paymentStatus && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            delivery.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700'
                              : delivery.paymentStatus === 'PARTIAL'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {delivery.paymentStatus}
                          </span>
                        )}
                      </div>
                      {codAmount > 0 && (
                        <div className="text-[11px] font-bold text-rose-600 font-mono tabular">
                          Due: Rs. {codAmount.toLocaleString()}
                        </div>
                      )}
                      {paidAmt > 0 && (
                        <div className="text-[10px] text-emerald-700 font-mono">
                          Paid: Rs. {paidAmt.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="align-top py-2">
                    {getStatusBadge(delivery.status)}
                  </TableCell>

                  <TableCell className="align-top py-2 text-right no-print">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDelivery(delivery);
                      }}
                      className="h-6.5 px-2 text-[11px] font-medium text-slate-700 hover:text-emerald-700 hover:border-emerald-300"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
