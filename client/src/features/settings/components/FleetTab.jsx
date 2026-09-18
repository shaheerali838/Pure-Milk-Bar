import React, { useState } from 'react';
import {
  Bike,
  Users,
  Plus,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Power,
  Navigation,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import RegisterStaffView from '@/features/deliveries/components/RegisterStaffView';
import { Typography } from '@/components/common/Typography';

export default function FleetTab() {
  const { staffList = [], toggleStaffActive } = useDeliveryStaffContext();
  const [view, setView] = useState('list'); // 'list' | 'add'

  if (view === 'add') {
    return (
      <RegisterStaffView
        onBack={() => setView('list')}
        onComplete={() => setView('list')}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* 1. Registered Delivery Men & Fleet Card */}
      <Card className="border-slate-200/80 shadow-2xs">
        <CardHeader className="p-3.5 pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
              <Bike className="w-3.5 h-3.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 font-display leading-tight">
                Registered Delivery Men &amp; Fleet Roster
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Live delivery riders and walking courier staff. Toggle duty status immediately.
              </CardDescription>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setView('add')}
            className="h-7 px-2.5 text-xs font-bold bg-[#00a86b] hover:bg-[#008f5a] text-white shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
            Add Delivery Man
          </Button>
        </CardHeader>
        <CardContent className="p-3.5 pt-2">
          {staffList.length === 0 ? (
            <div className="py-12 text-center px-4 flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-1">
                <Bike className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 font-display">
                No Delivery Staff Registered Yet
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Add your first rider, walking courier, or loader to start assigning routes.
              </p>
              <Button
                type="button"
                onClick={() => setView('add')}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#00a86b] text-white text-xs font-bold shadow-xs hover:bg-[#008f5a] transition cursor-pointer h-8"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Delivery Man
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Staff Member</th>
                    <th className="py-2.5 px-3">Role &amp; Vehicle</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">Assigned Route</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Duty Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {staffList.map((staff) => {
                    const isActive = staff.active !== false;

                    return (
                      <tr key={staff.id} className="hover:bg-slate-50/50 transition duration-150">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 font-display">
                              {staff.name ? staff.name.charAt(0).toUpperCase() : 'R'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block leading-tight">
                                {staff.name}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">
                                ID #{staff.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {staff.type === 'WALKING' ? 'Walking Courier' : 'Delivery Rider'}
                            </span>
                            <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                              {staff.vehicle || (staff.type === 'WALKING' ? 'On Foot' : 'Motorbike')}
                            </p>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-800 font-bold tabular">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{staff.phone || '—'}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 text-slate-600 truncate max-w-[160px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{staff.route || 'Not Assigned'}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active On Duty
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              Off Duty
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toggleStaffActive(staff.id);
                              const newStatus = isActive ? 'Off Duty' : 'Active On Duty';
                              toast.success(`Rider status updated: ${staff.name} is now ${newStatus}!`);
                            }}
                            className={`h-7 px-2.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                              isActive
                                ? 'text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100'
                                : 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                          >
                            <Power className="w-3 h-3 mr-1" />
                            {isActive ? 'Set Off Duty' : 'Set On Duty'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Territory Routes & Shift Schedules Reference Card */}
      <Card className="border-slate-200/80 shadow-2xs">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-slate-600" />
            <CardTitle className="text-xs font-bold text-slate-900 font-display">
              Territory Routes &amp; Shift Schedule Windows
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>Morning Shift Window</span>
            </div>
            <p className="font-mono text-emerald-900 font-extrabold text-sm">
              05:00 AM – 08:30 AM
            </p>
            <p className="text-[11px] text-emerald-700/80">
              Fresh morning raw cow &amp; buffalo milk doorstep dispatch run
            </p>
          </div>

          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-blue-800 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>Evening Shift Window</span>
            </div>
            <p className="font-mono text-blue-900 font-extrabold text-sm">
              05:00 PM – 08:00 PM
            </p>
            <p className="text-[11px] text-blue-700/80">
              Evening batch deliveries, dahi tubs, and secondary doorstep requests
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
