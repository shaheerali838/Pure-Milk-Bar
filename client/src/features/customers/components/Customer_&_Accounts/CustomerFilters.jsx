import React from 'react';
import { Search } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';

export default function CustomerFilters() {
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter } = useCustomerContext();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[280px]">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, phone, Online Payment, or area..."
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full border border-slate-200/90 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-2xs"
        />
      </div>

      {/* Status Filter Dropdown */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-2.5 bg-white rounded-full border border-slate-200/90 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-2xs cursor-pointer"
      >
        <option value="All Status">All Status</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>
    </div>
  );
}
