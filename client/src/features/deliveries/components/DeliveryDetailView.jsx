import React from 'react';
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Clock,
  Bike,
  CreditCard,
  CheckCircle2,
  XCircle,
  SkipForward,
  Trash2,
} from 'lucide-react';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DeliveryDetailView({ delivery, onBack }) {
  const { updateDeliveryStatus, deleteDelivery } = useDeliveryContext();

  if (!delivery) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="green" className="text-xs px-2 py-0.5">Delivered</Badge>;
      case 'PENDING':
        return <Badge variant="amber" className="text-xs px-2 py-0.5">Pending</Badge>;
      case 'FAILED':
        return <Badge variant="rose" className="text-xs px-2 py-0.5">Failed</Badge>;
      case 'SKIPPED':
        return <Badge variant="slate" className="text-xs px-2 py-0.5">Skipped</Badge>;
      default:
        return <Badge variant="slate" className="text-xs px-2 py-0.5">{status || 'Unknown'}</Badge>;
    }
  };

  const handleStatusChange = (newStatus) => {
    updateDeliveryStatus(delivery.id, newStatus);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete delivery run ${delivery.runCode}?`)) {
      deleteDelivery(delivery.id);
      if (onBack) onBack();
    }
  };

  const codAmount = Number(delivery.codAmountToCollect) || 0;
  const bottles = Number(delivery.bottlesReturned) || 0;

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
            title="Back to Deliveries"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight font-display flex items-center gap-2 leading-none">
              Delivery Run {delivery.runCode}
              {getStatusBadge(delivery.status)}
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Scheduled on {delivery.date} &bull; Shift: {delivery.shift} &bull; Created {new Date(delivery.createdAt || Date.now()).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="h-7 px-2.5 text-xs text-rose-700 hover:bg-rose-50 border-rose-200 cursor-pointer"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete Run
          </Button>
        </div>
      </div>

      {/* Top Banner with Customer & Items */}
      <div className="bg-slate-900 text-white rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center text-lg font-bold font-display">
            {delivery.customerName && delivery.customerName !== 'Walk-in / Guest Delivery' ? delivery.customerName.charAt(0).toUpperCase() : '📦'}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 leading-none">
              {delivery.customerId || (delivery.customerName && delivery.customerName !== 'Walk-in / Guest Delivery' && delivery.customerName !== 'N/A') ? 'Customer & Drop Point' : 'Direct Drop Point'}
            </span>
            <h3 className="text-base font-bold font-display flex items-center gap-1.5 mt-0.5 leading-tight">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              {delivery.customerName && delivery.customerName !== 'Walk-in / Guest Delivery' && delivery.customerName !== 'N/A' ? delivery.customerName : 'Walk-in / Guest Order'}
            </h3>
            {delivery.deliveryAddress && (
              <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                {delivery.deliveryAddress}
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
            Items Summary
          </span>
          {delivery.qtyLiters > 0 && (
            <p className="text-xl font-black font-display text-emerald-300 tabular leading-tight">
              {delivery.qtyLiters} Liters
            </p>
          )}
          <p className="text-[11px] text-slate-300 max-w-xs">{delivery.itemDescription || 'Dairy Products'}</p>
        </div>
      </div>

      {/* Structured Items Table if available */}
      {Array.isArray(delivery.items) && delivery.items.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs space-y-2">
          <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs border-b border-slate-100 pb-1.5">
            Purchased Products &amp; Quantities
          </h4>
          <div className="divide-y divide-slate-100 text-xs">
            {delivery.items.map((it, idx) => (
              <div key={idx} className="py-1.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900">{it.name}</span>
                  <span className="text-slate-400 ml-2 font-mono text-[11px]">
                    {it.quantity} {it.unit || 'unit'} {it.unitPrice > 0 ? `@ Rs. ${it.unitPrice}` : ''}
                  </span>
                </div>
                {it.subtotal > 0 && (
                  <span className="font-bold font-mono text-slate-900">
                    Rs. {Number(it.subtotal).toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs space-y-2">
          <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Schedule &amp; Delivery Route
          </h4>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between py-0.5 border-b border-slate-100">
              <span className="text-slate-400">Delivery Date:</span>
              <span className="font-semibold text-slate-900 tabular">{delivery.date}</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-100">
              <span className="text-slate-400">Shift Timing:</span>
              <span className="font-semibold text-slate-900">{delivery.shift || 'Standard'}</span>
            </div>
            {delivery.route && (
              <div className="flex justify-between py-0.5 border-b border-slate-100">
                <span className="text-slate-400">Assigned Route:</span>
                <span className="font-semibold text-slate-900">{delivery.route}</span>
              </div>
            )}
            {/* Only show rider if assigned */}
            {Boolean(delivery.riderId || (delivery.riderNameSnapshot && delivery.riderNameSnapshot !== 'Unassigned')) && (
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Assigned Rider:</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <Bike className="w-3 h-3 text-purple-600" />
                  {delivery.riderNameSnapshot} {delivery.staffType ? `(${delivery.staffType})` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs space-y-2">
          <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
            Payment Terms &amp; Amounts
          </h4>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between py-0.5 border-b border-slate-100">
              <span className="text-slate-400">Payment Mode:</span>
              <span className="font-semibold text-slate-900">{delivery.paymentMode}</span>
            </div>
            {delivery.amountPaid > 0 && (
              <div className="flex justify-between py-0.5 border-b border-slate-100">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  Rs. {Number(delivery.amountPaid).toLocaleString()}
                </span>
              </div>
            )}
            {(Number(delivery.amountDue) > 0 || codAmount > 0) && (
              <div className="flex justify-between py-0.5 border-b border-slate-100">
                <span className="text-slate-400">Due / Baqi to Collect:</span>
                <span className="font-bold text-rose-600 font-mono tabular">
                  Rs. {(Number(delivery.amountDue) || codAmount).toLocaleString()}
                </span>
              </div>
            )}
            {bottles > 0 && (
              <div className="flex justify-between py-0.5 border-b border-slate-100">
                <span className="text-slate-400">Bottles Collected:</span>
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

      <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs space-y-2">
        <h4 className="font-bold text-slate-900 text-xs">Update Delivery Run Status</h4>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={delivery.status === 'DELIVERED' ? 'default' : 'primary'}
            size="sm"
            onClick={() => handleStatusChange('DELIVERED')}
            className="h-7 text-xs cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            {delivery.status === 'DELIVERED' ? 'Delivered ✓' : 'Mark Delivered'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange('PENDING')}
            className={`h-7 text-xs cursor-pointer ${delivery.status === 'PENDING' ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold' : ''}`}
          >
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Mark Pending
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange('SKIPPED')}
            className={`h-7 text-xs cursor-pointer ${delivery.status === 'SKIPPED' ? 'border-slate-500 bg-slate-100 text-slate-900 font-bold' : ''}`}
          >
            <SkipForward className="w-3.5 h-3.5 mr-1 text-slate-600" />
            Mark Skipped
          </Button>

          <Button
            type="button"
            variant={delivery.status === 'FAILED' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('FAILED')}
            className="h-7 text-xs text-rose-700 hover:bg-rose-50 border-rose-300 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Mark Failed
          </Button>
        </div>
      </div>
    </div>
  );
}
