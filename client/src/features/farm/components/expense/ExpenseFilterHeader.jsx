import React, { useState } from 'react';
import { Search, Calendar, X } from 'lucide-react';

export const EXPENSE_CATEGORIES = [
  "Feed & Fodder (Silage, Wanda, Vanda)",
  "Seed, Fertilizer & Crop Inputs",
  "Veterinary, Medicine & AI Services",
  "Fuel & Transportation",
  "Machinery Maintenance & Repairs",
  "Electricity & Utilities",
  "Salaries, Wages & Labour",
  "Kitchen, Mess & Staff Meals",
  "Shed Maintenance & Cleaning",
  "Dairy/Milking Supplies & Chemicals",
  "Hardware & Tools",
  "Livestock Purchase",
  "Other / Miscellaneous"
];

export default function ExpenseFilterHeader({
  searchQuery = '',
  setSearchQuery,
  categoryFilter = 'All',
  setCategoryFilter,
  dateFilter = 'all',
  setDateFilter,
  startDate = '',
  setStartDate,
  endDate = '',
  setEndDate,
}) {
  const [localSearch, setLocalSearch] = useState('');
  const [localCategory, setLocalCategory] = useState('All');
  const [localDateFilter, setLocalDateFilter] = useState('all');
  const [localStartDate, setLocalStartDate] = useState('');
  const [localEndDate, setLocalEndDate] = useState('');

  const query = setSearchQuery ? searchQuery : localSearch;
  const onQueryChange = setSearchQuery || setLocalSearch;

  const category = setCategoryFilter ? categoryFilter : localCategory;
  const onCategoryChange = setCategoryFilter || setLocalCategory;

  const activeDateFilter = setDateFilter ? dateFilter : localDateFilter;
  const onDateFilterChange = setDateFilter || setLocalDateFilter;

  const start = setStartDate ? startDate : localStartDate;
  const onStartChange = setStartDate || setLocalStartDate;

  const end = setEndDate ? endDate : localEndDate;
  const onEndChange = setEndDate || setLocalEndDate;

  const dateTabs = [
    { id: 'all', label: 'All History' },
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="p-4 space-y-3">
      {/* Top Filter Bar: Search, Date Tabs & Category */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        {/* Search Input */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 w-full sm:w-72 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all shadow-2xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search farm expenses..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Date Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          {dateTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onDateFilterChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeDateFilter === tab.id
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center w-full sm:w-auto">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 cursor-pointer shadow-2xs transition-all"
          >
            <option value="All" className="font-semibold text-slate-800">
              All Categories
            </option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="text-slate-700">
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Date Range Pickers (Active when 'custom' is selected) */}
      {activeDateFilter === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Select Date Range:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-400 font-medium">From:</span>
              <input
                type="date"
                value={start}
                onChange={(e) => onStartChange(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-800 font-semibold cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-400 font-medium">To:</span>
              <input
                type="date"
                value={end}
                onChange={(e) => onEndChange(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-800 font-semibold cursor-pointer"
              />
            </div>

            {(start || end) && (
              <button
                type="button"
                onClick={() => {
                  onStartChange('');
                  onEndChange('');
                }}
                className="text-[11px] text-slate-500 hover:text-rose-600 underline font-medium cursor-pointer ml-1"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
