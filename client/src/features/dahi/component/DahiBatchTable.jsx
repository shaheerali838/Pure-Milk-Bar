import React, { useState } from 'react';
import { Layers, Trash2, Search, Filter } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const statusStyle = {
  Completed: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  'In Progress': 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  Failed: 'bg-red-100 text-red-700 hover:bg-red-100',
};

export default function DahiBatchTable({ batches = [], onDeleteBatch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = batches.filter((b) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (b.id || '').toLowerCase().includes(q) ||
      (b.product || '').toLowerCase().includes(q) ||
      (b.source || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 h-[36px] shadow-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search batch ID, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none outline-none bg-transparent text-xs text-slate-700 w-[180px]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-[36px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#009689] shadow-xs cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filtered.length}</span> of {batches.length} batches
        </div>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-xs">
        <Table className="w-full border-collapse text-[13px]">
          <TableHeader>
            <TableRow className="bg-slate-50/80 border-b border-slate-200 hover:bg-slate-50/80">
              {['Batch ID', 'Product', 'Source', 'Milk Input', 'Dahi Output', 'Fat %', 'Date', 'Status', 'Actions'].map((h) => (
                <TableHead
                  key={h}
                  className="px-3.5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="px-4 py-12 text-center text-slate-400 text-xs font-medium">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Layers className="w-8 h-8 text-slate-300" />
                    <p className="font-semibold text-slate-600">No Dahi batches found</p>
                    <p className="text-slate-400 text-[11px]">Click "New Batch" to record a processing run.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((b) => (
                <TableRow
                  key={b.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition-colors"
                >
                  <TableCell className="px-3.5 py-3">
                    <span className="flex items-center gap-1.5 font-mono text-[12px] font-bold text-slate-800 tabular">
                      <Layers className="w-3.5 h-3.5 text-[#009689]" />
                      {b.id}
                    </span>
                  </TableCell>
                  <TableCell className="px-3.5 py-3 font-bold text-slate-900">{b.product}</TableCell>
                  <TableCell className="px-3.5 py-3 text-xs text-slate-600">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      {b.source || 'Farm Milk'}
                    </span>
                  </TableCell>
                  <TableCell className="px-3.5 py-3 text-slate-700 font-medium tabular">{b.milkUsed}</TableCell>
                  <TableCell className="px-3.5 py-3 font-bold text-slate-900 tabular">{b.output}</TableCell>
                  <TableCell className="px-3.5 py-3 font-semibold text-blue-600 tabular">{b.fat}</TableCell>
                  <TableCell className="px-3.5 py-3 text-slate-600 tabular">{b.date}</TableCell>
                  <TableCell className="px-3.5 py-3">
                    <Badge
                      variant="outline"
                      className={
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border-0 ' +
                        (statusStyle[b.status] || 'bg-slate-100 text-slate-600')
                      }
                    >
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3.5 py-3">
                    {onDeleteBatch && (
                      <button
                        type="button"
                        onClick={() => onDeleteBatch(b.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Batch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
