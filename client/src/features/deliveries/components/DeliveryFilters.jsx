import React from 'react';
import { Search, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDeliveryContext } from '@/context/DeliveryContext';

export default function DeliveryFilters({
  searchQuery,
  setSearchQuery,
  typeFilter = 'ALL',
  setTypeFilter,
  shiftFilter,
  setShiftFilter,
  statusFilter,
  setStatusFilter,
  dateFilter: propDateFilter,
  setDateFilter: propSetDateFilter,
  startDate: propStartDate,
  setStartDate: propSetStartDate,
  endDate: propEndDate,
  setEndDate: propSetEndDate,
}) {
  const deliveryCtx = useDeliveryContext();
  const dateFilter = propDateFilter || deliveryCtx.dateFilter || 'Today';
  const setDateFilter = propSetDateFilter || deliveryCtx.setDateFilter;
  const startDate = propStartDate !== undefined ? propStartDate : deliveryCtx.startDate;
  const setStartDate = propSetStartDate || deliveryCtx.setStartDate;
  const endDate = propEndDate !== undefined ? propEndDate : deliveryCtx.endDate;
  const setEndDate = propSetEndDate || deliveryCtx.setEndDate;

  const dateOptions = [
    { id: 'Today', label: 'Today' },
    { id: 'Weekly', label: 'Weekly' },
    { id: 'Monthly', label: 'Monthly' },
    { id: 'Custom Range', label: 'Custom Range' },
  ];

  return (
    <div className="space-y-1.5">
      <div className="bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-1.5">
        {/* Date Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200/80 overflow-x-auto no-scrollbar">
          {dateOptions.map((opt) => {
            const active = dateFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDateFilter && setDateFilter(opt.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Custom Range Date Pickers */}
        {dateFilter === 'Custom Range' && (
          <div className="flex items-center gap-1.5 bg-white p-0.5 px-1.5 rounded-lg border border-emerald-200 shadow-2xs">
            <div className="flex items-center gap-1 text-[11px] text-slate-600">
              <Calendar className="w-3 h-3 text-emerald-600" />
              <span>From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate && setStartDate(e.target.value)}
                className="h-6 px-1.5 py-0.5 text-xs font-bold border border-slate-200 rounded outline-none bg-slate-50 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-600">
              <span>To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate && setEndDate(e.target.value)}
                className="h-6 px-1.5 py-0.5 text-xs font-bold border border-slate-200 rounded outline-none bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search customer, phone, route..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-7.5 pl-8 pr-2.5 py-0.5 bg-white border border-slate-200 rounded-md text-xs focus-visible:border-emerald-500 focus-visible:ring-0 placeholder:text-slate-400"
          />
        </div>

        {/* Type Filter */}
        {setTypeFilter && (
          <div className="w-32">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full h-7.5 px-2 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700 cursor-pointer">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">
                  All Orders
                </SelectItem>
                <SelectItem value="ONTIME" className="text-xs font-bold text-amber-700">
                  ⚡ One-Time Orders
                </SelectItem>
                <SelectItem value="MONTHLY" className="text-xs font-semibold text-slate-700">
                  Regular Subscriptions
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Shift Filter */}
        <div className="w-28">
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

        {/* Status Filter */}
        <div className="w-28">
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
    </div>
  );
}
