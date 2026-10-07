import React from 'react';
import { Search, X } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';

export default function CustomerFilters() {
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter } = useCustomerContext();

  return (
    <div className="flex flex-col md:flex-row gap-3 items-center justify-between w-full">
      {/* Search Input matching Supplier Dashboard */}
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

      {/* Status Filter Navigation Pills matching Supplier Dashboard */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full text-xs font-semibold text-slate-600 self-start md:self-auto shrink-0">
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
  );
}

