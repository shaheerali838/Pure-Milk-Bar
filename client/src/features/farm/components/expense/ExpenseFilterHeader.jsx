import React, { useState } from 'react';
import { Search } from 'lucide-react';

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
}) {
  const [localSearch, setLocalSearch] = useState('');
  const [localCategory, setLocalCategory] = useState('All');

  const query = setSearchQuery ? searchQuery : localSearch;
  const onQueryChange = setSearchQuery || setLocalSearch;

  const category = setCategoryFilter ? categoryFilter : localCategory;
  const onCategoryChange = setCategoryFilter || setLocalCategory;

  return (
    <div className="flex flex-col px-4 py-2 sm:flex-row justify-between items-start sm:items-center gap-3 space-y-4 sm:space-y-0">
      {/* Left side: Search Input */}
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-700 w-full sm:w-72 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all shadow-2xs">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search From Expense..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-medium"
        />
      </div>

      {/* Right side: Category Select Filter */}
      <div className="flex items-center w-full sm:w-auto">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full sm:w-auto bg-white border border-slate-200 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 cursor-pointer shadow-2xs transition-all"
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
  );
}
