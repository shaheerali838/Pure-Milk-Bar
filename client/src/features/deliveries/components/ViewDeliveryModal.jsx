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

        <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              Customer Details
            </span>
            <h4 className="text-base font-bold font-display flex items-center gap-1.5 mt-0.5">
              <User className="w-4 h-4 text-emerald-400" />
              {delivery.customerName || 'N/A'}
            </h4>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {delivery.deliveryAddress || 'No address specified'}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Order Quantity
            </span>
            <p className="text-xl font-bold font-display text-emerald-300 tabular">
              {delivery.qtyLiters} Liters
            </p>
            <p className="text-[11px] text-slate-400">{delivery.itemDescription}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2">
            <h5 className="font-bold text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Schedule & Logistics
            </h5>
            <div className="space-y-1 text-slate-600">
              <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                <span className="text-slate-400">Delivery Date:</span>
                <span className="font-semibold text-slate-900 tabular">{delivery.date}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                <span className="text-slate-400">Shift:</span>
                <span className="font-semibold text-slate-900">{delivery.shift}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                <span className="text-slate-400">Route:</span>
                <span className="font-semibold text-slate-900">{delivery.route || 'Standard Route'}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Staff Assigned:</span>
                <span className="font-semibold text-slate-900">
                  {delivery.riderNameSnapshot || 'Unassigned'} ({delivery.staffType})
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2">
            <h5 className="font-bold text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              Payment & Inventory
            </h5>
            <div className="space-y-1 text-slate-600">
              <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                <span className="text-slate-400">Payment Mode:</span>
                <span className="font-semibold text-slate-900">{delivery.paymentMode}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                <span className="text-slate-400">COD Amount:</span>
                <span className="font-bold text-slate-900 tabular">
                  {codAmount > 0 ? `Rs. ${codAmount.toLocaleString()}` : 'Rs. 0 (Paid / Khata)'}
                </span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                <span className="text-slate-400">Bottles Returned:</span>
                <span className="font-semibold text-slate-900 tabular">{bottles}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Delivered Timestamp:</span>
                <span className="font-semibold text-slate-900">
                  {delivery.deliveredAt
                    ? new Date(delivery.deliveredAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Not Delivered Yet'}
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
