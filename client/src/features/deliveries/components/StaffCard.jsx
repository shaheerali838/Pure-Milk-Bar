import React from 'react';
import { Bike, Footprints, Phone, MapPin, CheckCircle2, Clock, Car } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDeliveryContext } from '@/context/DeliveryContext';

export default function StaffCard({ staff, onClick }) {
  const { deliveries = [] } = useDeliveryContext();

  const todayStr = new Date().toISOString().split('T')[0];

  // Count today's deliveries assigned to this staff member
  const staffDeliveriesToday = deliveries.filter((d) => {
    const isToday = d.date && d.date.split('T')[0] === todayStr;
    const isThisStaff =
      d.riderNameSnapshot &&
      staff.name &&
      d.riderNameSnapshot.toLowerCase().trim() === staff.name.toLowerCase().trim();
    return isToday && isThisStaff;
  });

  const pendingCount = staffDeliveriesToday.filter((d) => d.status === 'PENDING').length;
  const deliveredCount = staffDeliveriesToday.filter((d) => d.status === 'DELIVERED').length;

  let deliveryStatusText = 'No deliveries assigned today';
  if (pendingCount > 0) {
    deliveryStatusText = `${pendingCount} ${pendingCount === 1 ? 'delivery' : 'deliveries'} still pending`;
  } else if (deliveredCount > 0) {
    deliveryStatusText = `All ${deliveredCount} ${deliveredCount === 1 ? 'delivery' : 'deliveries'} completed today`;
  }

  const isRider = staff.type === 'RIDER';

  return (
    <div
      onClick={() => onClick && onClick(staff)}
      className="cursor-pointer bg-white border border-slate-200/90 hover:border-purple-300 rounded-xl p-3 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
    >
      <div>
        {/* Header: Name, Type Badge & Active Badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
                isRider
                  ? 'bg-purple-50 text-purple-600 border border-purple-100'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}
            >
              {isRider ? (
                <Bike className="w-4 h-4 group-hover:scale-110 transition-transform" />
              ) : (
                <Footprints className="w-4 h-4 group-hover:scale-110 transition-transform" />
              )}
            </div>
            <div>
              <h4 className="font-display font-bold text-slate-900 text-xs leading-snug group-hover:text-purple-700 transition-colors">
                {staff.name}
              </h4>
              <p className="text-[10px] font-medium text-slate-500">
                {isRider ? 'Delivery Rider' : 'Walking Delivery Man'}
              </p>
            </div>
          </div>

          <Badge variant={staff.active ? 'green' : 'slate'} className="text-[9px] px-1.5 py-0">
            {staff.active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Staff Details */}
        <div className="space-y-1 text-[11px] text-slate-600 mb-2 bg-slate-50/70 p-2 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="font-medium tabular">{staff.phone || 'No phone provided'}</span>
          </div>

          {isRider && staff.vehicle && (
            <div className="flex items-center gap-1.5 text-slate-700">
              <Car className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{staff.vehicle}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-slate-700">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{staff.route || 'General Delivery Area'}</span>
          </div>
        </div>
      </div>

      {/* Footer: Delivery Status */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1 font-medium">
          {pendingCount > 0 ? (
            <Clock className="w-3 h-3 text-amber-500" />
          ) : (
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          )}
          <span className={pendingCount > 0 ? 'text-amber-700 font-semibold' : 'text-slate-500'}>
            {deliveryStatusText}
          </span>
        </div>
        <span className="text-[10px] font-semibold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
          View details →
        </span>
      </div>
    </div>
  );
}
