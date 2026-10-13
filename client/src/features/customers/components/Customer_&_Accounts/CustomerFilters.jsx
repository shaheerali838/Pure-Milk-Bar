import React from 'react';
import { Search, X, Calendar, ChevronDown } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';

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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
      {/* 1. Search Bar */}
      <div className="flex items-center gap-2 w-full sm:w-80 bg-white border border-slate-200/90 rounded-xl px-3.5 h-9.5 shadow-2xs">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by name, phone, or area..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-700 placeholder:text-slate-400"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Filter Controls: Single Date Dropdown + Subtle Status Toggles */}
      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
        {/* Date Filter Dropdown */}
        {setDateFilter && (
          <div className="flex items-center gap-2">
            <div className="relative inline-flex items-center">
              <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="appearance-none bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-semibold pl-8 pr-7 py-1.5 h-9 rounded-xl shadow-2xs focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer transition"
              >
                {filterOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
            </div>

            {/* Custom Range Date Pickers */}
            {dateFilter === 'Custom Range' && setStartDate && setEndDate && (
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-purple-200 shadow-2xs">
                <div className="flex items-center gap-1 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-500">From:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-6.5 px-1.5 py-0.5 text-xs font-bold border border-slate-200 rounded outline-none bg-slate-50 focus:bg-white"
                  />
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-500">To:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-6.5 px-1.5 py-0.5 text-xs font-bold border border-slate-200 rounded outline-none bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subtle Status Filter Toggles */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl text-xs font-semibold text-slate-600 shrink-0">
          {[
            { id: 'All Status', label: 'All' },
            { id: 'Active', label: 'Active' },
            { id: 'Inactive', label: 'Inactive' },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-purple-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
