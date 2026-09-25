import React from 'react';
import { useDeliveryContext } from '@/context/DeliveryContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  MapPin,
  Calendar,
  Clock,
  Bike,
  Package,
  CreditCard,
  CheckCircle2,
  XCircle,
  SkipForward,
} from 'lucide-react';

export default function ViewDeliveryModal({ delivery, isOpen, onClose }) {
  const { updateDeliveryStatus } = useDeliveryContext();

  if (!delivery) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="green">Delivered</Badge>;
      case 'PENDING':
        return <Badge variant="amber">Pending</Badge>;
      case 'FAILED':
        return <Badge variant="rose">Failed</Badge>;
      case 'SKIPPED':
        return <Badge variant="slate">Skipped</Badge>;
      default:
        return <Badge variant="slate">{status || 'Unknown'}</Badge>;
    }
  };

  const handleStatusChange = (newStatus) => {
    updateDeliveryStatus(delivery.id, newStatus);
    onClose();
  };

  const codAmount = Number(delivery.codAmountToCollect) || 0;
  const bottles = Number(delivery.bottlesReturned) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-2 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Delivery Run {delivery.runCode}</span>
                {getStatusBadge(delivery.status)}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Created on {new Date(delivery.createdAt || Date.now()).toLocaleString()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Top Banner with Customer & Items */}
        <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              {delivery.customerId || (delivery.customerName && delivery.customerName !== 'Walk-in / Guest Delivery' && delivery.customerName !== 'N/A') ? 'Customer & Drop Point' : 'Direct Drop Point'}
            </span>
            <h4 className="text-base font-bold font-display flex items-center gap-1.5 mt-0.5">
              <User className="w-4 h-4 text-emerald-400" />
              {delivery.customerName && delivery.customerName !== 'Walk-in / Guest Delivery' && delivery.customerName !== 'N/A' ? delivery.customerName : 'Walk-in / Guest Order'}
            </h4>
            {delivery.deliveryAddress && (
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {delivery.deliveryAddress}
              </p>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Items Summary
            </span>
            {delivery.qtyLiters > 0 && (
              <p className="text-xl font-bold font-display text-emerald-300 tabular">
                {delivery.qtyLiters} Liters
              </p>
            )}
            <p className="text-[11px] text-slate-400 max-w-xs">{delivery.itemDescription || 'Dairy Products'}</p>
          </div>
        </div>

        {/* Structured items list */}
        {Array.isArray(delivery.items) && delivery.items.length > 0 && (
          <div className="bg-white border border-slate-200/70 rounded-xl p-3 shadow-2xs space-y-2">
            <h5 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1.5">
              Purchased Products
            </h5>
            <div className="divide-y divide-slate-100 text-xs">
              {delivery.items.map((it, idx) => (
                <div key={idx} className="py-1.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{it.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-mono text-[11px]">
                      {it.quantity} {it.unit || 'unit'} {it.unitPrice > 0 ? `@ Rs. ${it.unitPrice}` : ''}
                    </span>
                    {it.subtotal > 0 && (
                      <span className="font-bold font-mono text-slate-900">
                        Rs. {Number(it.subtotal).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2">
            <h5 className="font-bold text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Schedule &amp; Logistics
            </h5>
            <div className="space-y-1 text-slate-600">
              <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                <span className="text-slate-400">Delivery Date:</span>
                <span className="font-semibold text-slate-900 tabular">{delivery.date}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                <span className="text-slate-400">Shift:</span>
                <span className="font-semibold text-slate-900">{delivery.shift || 'Standard'}</span>
              </div>
              {delivery.route && (
                <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                  <span className="text-slate-400">Route:</span>
                  <span className="font-semibold text-slate-900">{delivery.route}</span>
                </div>
              )}
              {Boolean(delivery.riderId || (delivery.riderNameSnapshot && delivery.riderNameSnapshot !== 'Unassigned')) && (
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Staff Assigned:</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <Bike className="w-3.5 h-3.5 text-purple-600" />
                    {delivery.riderNameSnapshot}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2">
            <h5 className="font-bold text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              Payment &amp; Dues
            </h5>
            <div className="space-y-1 text-slate-600">
              <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                <span className="text-slate-400">Payment Mode:</span>
                <span className="font-semibold text-slate-900">{delivery.paymentMode}</span>
              </div>
              {delivery.amountPaid > 0 && (
                <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    Rs. {Number(delivery.amountPaid).toLocaleString()}
                  </span>
                </div>
              )}
              {(Number(delivery.amountDue) > 0 || codAmount > 0) && (
                <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                  <span className="text-slate-400">Due / Baqi to Collect:</span>
                  <span className="font-bold text-rose-600 font-mono tabular">
                    Rs. {(Number(delivery.amountDue) || codAmount).toLocaleString()}
                  </span>
                </div>
              )}
              {bottles > 0 && (
                <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                  <span className="text-slate-400">Bottles Returned:</span>
                  <span className="font-semibold text-slate-900 tabular">{bottles}</span>
                </div>
              )}
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Payment Status:</span>
                <span className="font-bold text-slate-900">
                  {delivery.paymentStatus || (codAmount > 0 ? 'PARTIAL / DUE' : 'PAID')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {delivery.status === 'PENDING' && (
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
            <p className="text-xs font-bold text-amber-900">Update Delivery Run Status</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleStatusChange('DELIVERED')}
                className="text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Mark Delivered
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('SKIPPED')}
                className="text-xs border-amber-300 text-amber-900 hover:bg-amber-100"
              >
                <SkipForward className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                Mark Skipped
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleStatusChange('FAILED')}
                className="text-xs"
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                Mark Failed
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="pt-3 border-t border-slate-100 flex justify-end">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
