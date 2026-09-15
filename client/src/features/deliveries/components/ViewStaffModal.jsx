import React from 'react';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
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
  Bike,
  Footprints,
  Phone,
  MapPin,
  Car,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Power,
} from 'lucide-react';

export default function ViewStaffModal({ staff, isOpen, onClose }) {
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
      onClose();
    }
  };

  const handleToggle = () => {
    toggleStaffActive(staff.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader className="pb-2 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>{staff.name}</span>
                <Badge variant={staff.active ? 'green' : 'slate'} className="text-xs">
                  {staff.active ? 'Active' : 'Inactive'}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                {isRider ? 'Delivery Rider (Vehicle)' : 'Walking Delivery Man'} · Added{' '}
                {new Date(staff.createdAt || Date.now()).toLocaleDateString()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Staff Profile Card */}
        <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-900/60 text-purple-300 border border-purple-700/50 flex items-center justify-center text-xl font-bold font-display">
              {isRider ? <Bike className="w-6 h-6" /> : <Footprints className="w-6 h-6" />}
            </div>
            <div>
              <h4 className="font-bold text-base font-display">{staff.name}</h4>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="tabular">{staff.phone || 'No phone'}</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Today's Status
            </span>
            <p className="text-xs font-semibold text-emerald-400 mt-0.5">
              {pendingToday} pending · {deliveredToday} done
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-200/50 text-slate-600">
            <span className="text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Assigned Route:
            </span>
            <span className="font-semibold text-slate-900">{staff.route || 'General Area'}</span>
          </div>

          {isRider && staff.vehicle && (
            <div className="flex justify-between py-1 border-b border-slate-200/50 text-slate-600">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                Vehicle Registration:
              </span>
              <span className="font-semibold text-slate-900">{staff.vehicle}</span>
            </div>
          )}

          <div className="flex justify-between py-1 border-b border-slate-200/50 text-slate-600">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Total Lifetime Runs:
            </span>
            <span className="font-semibold text-slate-900 tabular">{assignedDeliveries.length}</span>
          </div>

          <div className="flex justify-between py-1 text-slate-600">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Status:
            </span>
            <span className={`font-semibold ${staff.active ? 'text-emerald-700' : 'text-slate-500'}`}>
              {staff.active ? 'Active on Delivery Fleet' : 'Inactive / Off Duty'}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggle}
              className="text-xs text-slate-700 hover:text-slate-900"
            >
              <Power className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              {staff.active ? 'Set Inactive' : 'Set Active'}
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              className="text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Remove
            </Button>
          </div>

          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
