import React from 'react';
import { Search } from 'lucide-react';
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
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter } = useCustomerContext();

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, phone, Online Payment, or area..."
          className="compact-control w-full pl-8 pr-3 py-1 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-700 placeholder-slate-400 shadow-none"
        />
      </div>

      <div className="w-40">
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
  );
}
