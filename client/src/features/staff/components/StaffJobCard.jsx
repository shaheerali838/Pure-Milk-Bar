import React from 'react';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import { Typography } from '@/components/common/Typography';

export default function StaffJobCard({ staff }) {
  if (!staff) return null;

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
      <div className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-slate-700">
        <Briefcase className="w-4 h-4 text-slate-500" />
        Job &amp; Assignment
      </div>
      <div className="space-y-2.5 divide-y divide-slate-200/60 text-xs text-slate-700">
        <div className="flex justify-between items-center pt-1.5">
          <span className="text-slate-500">Official Role:</span>
          <span className="font-bold text-slate-800">{staff.role}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-slate-500">Shift Schedule:</span>
          <span className="font-bold text-slate-800">
            {staff.shift || 'Morning'}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-slate-500">Duty Location / Route:</span>
          <span className="font-semibold text-slate-800">
            {staff.route || 'Farm Base'}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-slate-500">Registration Date:</span>
          <span className="font-mono text-slate-700">
            {staff.joinedDate || 'Recently'}
          </span>
        </div>
      </div>
    </div>
  );
}
