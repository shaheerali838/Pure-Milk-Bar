import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFuelLogContext } from '@/context/FuelLogContext';
import FuelLogTable from './FuelLogTable';

export default function FuelLog({ onLogFuel }) {
  const { fuelLogs = [] } = useFuelLogContext();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = fuelLogs.filter((log) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      (log.staffName && log.staffName.toLowerCase().includes(term)) ||
      (log.date && log.date.includes(term)) ||
      (log.notes && log.notes.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-1.5">
      {/* Top Header & Action */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-1.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search fuel receipts by staff name, date, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-7.5 pl-8 pr-2.5 py-0.5 bg-white border border-slate-200 rounded-md text-xs focus-visible:border-blue-500 focus-visible:ring-0 placeholder:text-slate-400"
          />
        </div>

        <Button
          type="button"
          onClick={onLogFuel}
          className="h-7.5 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Log Fuel Receipt
        </Button>
      </div>

      {/* Fuel Log Table */}
      <FuelLogTable fuelLogs={filteredLogs} />
    </div>
  );
}
