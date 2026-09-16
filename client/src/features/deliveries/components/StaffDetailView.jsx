import React from 'react';
import {
  ArrowLeft,
  Bike,
  Footprints,
  Phone,
  MapPin,
  Car,
  Calendar,
  Clock,
  Trash2,
  Power,
  Package,
} from 'lucide-react';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import { useDeliveryContext } from '@/context/DeliveryContext';
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

export default function StaffDetailView({ staff, onBack, onViewDelivery }) {
  const { toggleStaffActive, deleteStaff } = useDeliveryStaffContext();
  const { deliveries = [] } = useDeliveryContext();

  if (!staff) return null;

  const isRider = staff.type === 'RIDER';
  const todayStr = new Date().toISOString().split('T')[0];

  const assignedDeliveries = deliveries.filter(
    (d) =>
      d.riderNameSnapshot &&
      staff.name &&
      d.riderNameSnapshot.toLowerCase().trim() === staff.name.toLowerCase().trim()
  );

  const todayDeliveries = assignedDeliveries.filter(
    (d) => d.date && d.date.split('T')[0] === todayStr
  );

  const pendingToday = todayDeliveries.filter((d) => d.status === 'PENDING').length;
  const deliveredToday = todayDeliveries.filter((d) => d.status === 'DELIVERED').length;

  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove ${staff.name} from the delivery staff directory?`)) {
      deleteStaff(staff.id);
      if (onBack) onBack();
    }
  };

  const handleToggle = () => {
    toggleStaffActive(staff.id);
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
            title="Back to Fleet & Staff"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight font-display flex items-center gap-2 leading-none">
              <span>{staff.name}</span>
              <Badge variant={staff.active ? 'green' : 'slate'} className="text-xs">
                {staff.active ? 'Active' : 'Inactive'}
              </Badge>
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isRider ? 'Delivery Rider (Motorcycle / Van)' : 'Walking Delivery Man'} &bull; Registered{' '}
              {new Date(staff.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggle}
            className="h-7 px-2.5 text-xs cursor-pointer"
          >
            <Power className="w-3 h-3 mr-1 text-slate-500" />
            {staff.active ? 'Set Inactive' : 'Set Active'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="h-7 px-2.5 text-xs text-rose-700 hover:bg-rose-50 border-rose-200 cursor-pointer"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Remove Staff
          </Button>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-300 border border-purple-800/60 flex items-center justify-center text-lg font-bold font-display">
            {isRider ? <Bike className="w-5 h-5" /> : <Footprints className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 leading-none">
              Staff Member Profile
            </span>
            <h3 className="text-base font-bold font-display flex items-center gap-1.5 mt-0.5 leading-tight">
              {staff.name}
            </h3>
            <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 text-slate-400" />
              <span className="tabular">{staff.phone || 'No phone provided'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 text-right">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
              Today's Deliveries
            </span>
            <p className="text-sm font-bold font-display text-emerald-400 mt-0.5 leading-tight">
              {pendingToday} pending &bull; {deliveredToday} done
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
              Lifetime Runs
            </span>
            <p className="text-xl font-black font-display text-purple-300 tabular leading-tight">
              {assignedDeliveries.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs space-y-2">
          <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            Route & Logistics
          </h4>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between py-0.5 border-b border-slate-100">
              <span className="text-slate-400">Assigned Delivery Area:</span>
              <span className="font-semibold text-slate-900">{staff.route || 'General Area'}</span>
            </div>
            {isRider && (
              <div className="flex justify-between py-0.5 border-b border-slate-100">
                <span className="text-slate-400">Vehicle Info:</span>
                <span className="font-semibold text-slate-900">{staff.vehicle || 'Not assigned'}</span>
              </div>
            )}
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Delivery Role:</span>
              <span className="font-semibold text-slate-900">
                {isRider ? 'Delivery Rider (Motorcycle)' : 'Walking Delivery Boy'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs space-y-2">
          <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Performance & Activity
          </h4>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between py-0.5 border-b border-slate-100">
              <span className="text-slate-400">Status:</span>
              <span className={`font-semibold ${staff.active ? 'text-emerald-700' : 'text-slate-500'}`}>
                {staff.active ? 'Active on Fleet' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-100">
              <span className="text-slate-400">Completed Deliveries:</span>
              <span className="font-bold text-slate-900 tabular">
                {assignedDeliveries.filter((d) => d.status === 'DELIVERED').length}
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Pending Deliveries:</span>
              <span className="font-bold text-amber-700 tabular">
                {assignedDeliveries.filter((d) => d.status === 'PENDING').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs space-y-2">
        <h4 className="font-bold text-slate-900 text-xs font-display flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-emerald-600" />
          Delivery Runs Assigned to {staff.name} ({assignedDeliveries.length})
        </h4>

        {assignedDeliveries.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            No delivery runs have been assigned to {staff.name} yet.
          </p>
        ) : (
          <div className="rounded-lg border border-slate-200/80 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="w-[110px] py-1 text-xs">Date & Shift</TableHead>
                  <TableHead className="py-1 text-xs">Customer</TableHead>
                  <TableHead className="py-1 text-xs">Item & Qty</TableHead>
                  <TableHead className="py-1 text-xs">Route</TableHead>
                  <TableHead className="py-1 text-xs">Payment</TableHead>
                  <TableHead className="py-1 text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedDeliveries.map((delivery) => (
                  <TableRow
                    key={delivery.id}
                    onClick={() => onViewDelivery && onViewDelivery(delivery)}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="text-xs font-mono tabular py-2">
                      {delivery.date} ({delivery.shift})
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-900 py-2 font-display">
                      {delivery.customerName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 py-2">
                      {delivery.itemDescription} ({delivery.qtyLiters} L)
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 py-2">
                      {delivery.route || 'Standard'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 py-2">
                      {delivery.paymentMode} {Number(delivery.codAmountToCollect) > 0 ? `(Rs. ${delivery.codAmountToCollect})` : ''}
                    </TableCell>
                    <TableCell className="text-xs py-2">
                      <Badge variant={delivery.status === 'DELIVERED' ? 'green' : delivery.status === 'PENDING' ? 'amber' : 'slate'} className="text-[10px]">
                        {delivery.status}
                      </Badge>
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
