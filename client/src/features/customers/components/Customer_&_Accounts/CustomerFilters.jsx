import React from 'react';
import { Search, X, Calendar } from 'lucide-react';
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
    <div className="flex flex-col md:flex-row gap-3 items-center justify-between w-full">
      {/* Search Input */}
      <div className="flex items-center gap-2 w-full md:w-80 bg-slate-50 border border-slate-200 rounded-full px-3.5 h-9.5">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by name, phone, Online Payment, or area..."
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

      <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
        {/* Date Filter Pills if setDateFilter exists */}
        {setDateFilter && (
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-full border border-slate-200/90 shadow-2xs overflow-x-auto no-scrollbar">
            {filterOptions.map((opt) => {
              const active = dateFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDateFilter(opt.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
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
        )}

        {/* Custom Range Date Pickers */}
        {dateFilter === 'Custom Range' && setStartDate && setEndDate && (
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-blue-200 shadow-2xs">
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

        {/* Status Filter Navigation Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full text-xs font-semibold text-slate-600 shrink-0">
          {[
            { id: 'All Status', label: 'All' },
            { id: 'Active', label: 'Active' },
            { id: 'Inactive', label: 'Inactive' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
