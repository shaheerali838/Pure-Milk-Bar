import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Typography } from '@/components/common/Typography';

export default function StaffScheduleCards({ staff }) {
  if (!staff) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Card 1: Shift Schedule */}
      <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/70 space-y-1">
        <div className="flex items-center gap-1.5 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" />
          Assigned Shift Schedule
        </div>
        <p className="text-base font-bold text-slate-800">
          {staff.shift || 'Morning'} Shift
        </p>
        <Typography variant="caption" color="muted" className="text-[11px] block">
          Standard 8-hour operational duty window
        </Typography>
      </div>

      {/* Card 2: Workstation / Route (Only shown for delivery staff) */}
      {(() => {
        const r = (staff.role || '').toLowerCase();
        const isDelivery =
          r.includes('delivery') ||
          r.includes('rider') ||
          r.includes('driver') ||
          r.includes('courier');

        if (!isDelivery) return null;

        return (
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              Assigned Delivery Route
            </div>
            <p className="text-base font-bold text-slate-800 truncate">
              {staff.route && staff.route.toLowerCase() !== 'not assigned'
                ? staff.route
                : 'Unassigned'}
            </p>
            <Typography variant="caption" color="muted" className="text-[11px] block">
              Assigned customer delivery sector
            </Typography>
          </div>
        );
      })()}
    </div>
  );
}
