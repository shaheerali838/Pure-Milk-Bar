import React, { useState } from 'react';
import { Plus, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import StaffCard from './StaffCard';

export default function FleetAndStaff({ onRegisterStaff, onViewStaff }) {
  const { staffList = [] } = useDeliveryStaffContext();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredStaff = staffList.filter((s) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.phone && s.phone.includes(term)) ||
      (s.route && s.route.toLowerCase().includes(term)) ||
      (s.vehicle && s.vehicle.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-1.5">
      <div className="bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-1.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search delivery riders, walking boys, or routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-7.5 pl-8 pr-2.5 py-0.5 bg-white border border-slate-200 rounded-md text-xs focus-visible:border-purple-500 focus-visible:ring-0 placeholder:text-slate-400"
          />
        </div>

        <Button
          type="button"
          onClick={onRegisterStaff}
          className="h-7.5 px-3 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Register New Delivery Staff
        </Button>
      </div>

      {filteredStaff.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 text-center">
          <div className="flex flex-col items-center justify-center text-slate-400 space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 mb-0.5">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700 font-display">
              {staffList.length === 0
                ? 'No delivery staff registered yet'
                : 'No staff members match your search'}
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm">
              {staffList.length === 0
                ? 'Add your farm riders and walking delivery team to assign routes and track daily runs.'
                : 'Try adjusting your search terms to find registered riders or delivery boys.'}
            </p>
            {staffList.length === 0 && (
              <Button
                type="button"
                onClick={onRegisterStaff}
                className="mt-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white cursor-pointer h-7 px-3"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Register First Staff Member
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredStaff.map((staff) => (
            <StaffCard
              key={staff.id}
              staff={staff}
              onClick={() => onViewStaff && onViewStaff(staff)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
