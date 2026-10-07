import React from 'react';
import { Search, Calendar } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CustomerFilters() {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter = 'Today',
    setDateFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = useCustomerContext();

  const filterOptions = [
    { id: 'Today', label: 'Today' },
    { id: 'Weekly', label: 'Weekly' },
    { id: 'Monthly', label: 'Monthly' },
    { id: 'Custom Range', label: 'Custom Range' },
  ];


  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Date Filter Pills */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200/90 shadow-2xs overflow-x-auto no-scrollbar">
          {filterOptions.map((opt) => {
            const active = dateFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDateFilter(opt.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Custom Range Date Pickers */}
        {dateFilter === 'Custom Range' && (
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-blue-200 shadow-2xs">
            <div className="flex items-center gap-1 text-[11px] text-slate-600">
              <Calendar className="w-3 h-3 text-blue-600" />
              <span>From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-6 px-1.5 py-0.5 text-xs font-bold border border-slate-200 rounded outline-none bg-slate-50 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-600">
              <span>To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-6 px-1.5 py-0.5 text-xs font-bold border border-slate-200 rounded outline-none bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* Search & Status Controls */}
        <div className="flex items-center gap-2 flex-1 justify-end min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer, phone, area..."
              className="compact-control w-full pl-8 pr-2.5 py-1 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-700 placeholder-slate-400 shadow-none"
            />
          </div>

          <div className="w-32">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="compact-control h-[30px] bg-white text-xs font-semibold text-slate-700 shadow-none">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
