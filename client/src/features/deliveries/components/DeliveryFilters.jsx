import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DeliveryFilters({
  searchQuery,
  setSearchQuery,
  shiftFilter,
  setShiftFilter,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div className="bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-1.5">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Search by customer name, address, or route..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-7.5 pl-8 pr-2.5 py-0.5 bg-white border border-slate-200 rounded-md text-xs focus-visible:border-emerald-500 focus-visible:ring-0 placeholder:text-slate-400"
        />
      </div>

      <div className="w-32">
        <Select value={shiftFilter} onValueChange={setShiftFilter}>
          <SelectTrigger className="w-full h-7.5 px-2 bg-white border border-slate-200 rounded-md text-xs text-slate-700 cursor-pointer">
            <SelectValue placeholder="All Shifts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-xs">
              All Shifts
            </SelectItem>
            <SelectItem value="MORNING" className="text-xs">
              Morning Shift
            </SelectItem>
            <SelectItem value="EVENING" className="text-xs">
              Evening Shift
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-36">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full h-7.5 px-2 bg-white border border-slate-200 rounded-md text-xs text-slate-700 cursor-pointer">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-xs">
              All Statuses
            </SelectItem>
            <SelectItem value="PENDING" className="text-xs">
              Pending
            </SelectItem>
            <SelectItem value="DELIVERED" className="text-xs">
              Delivered
            </SelectItem>
            <SelectItem value="FAILED" className="text-xs">
              Failed
            </SelectItem>
            <SelectItem value="SKIPPED" className="text-xs">
              Skipped
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
