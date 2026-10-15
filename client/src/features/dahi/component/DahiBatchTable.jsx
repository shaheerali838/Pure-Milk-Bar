import React, { useState, useMemo } from 'react';
import { Layers, Trash2, Search, Calendar } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export default function DahiBatchTable({ batches = [], onDeleteBatch, onViewDetail }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Normalize batches strictly for manufacturing logs (Date, Batch ID, Product, Source, Milk Input, Output)
  const manufacturingBatches = useMemo(() => {
    return batches.map((b) => {
      const outputNum = parseFloat(String(b.outputVal || b.outputQuantity || b.output || 0).replace(/[^\d.]/g, '')) || 0;
      const milkNum = parseFloat(String(b.milkUsedVal || b.milkUsedQuantity || b.milkUsed || 0).replace(/[^\d.]/g, '')) || 0;

      const bDate = b.date
        ? (typeof b.date === 'string' && b.date.includes('T') ? b.date.split('T')[0] : String(b.date).slice(0, 10))
        : (b.createdAt ? String(b.createdAt).slice(0, 10) : 'Today');

      return {
        ...b,
        outputNum,
        milkNum,
        formattedDate: bDate,
        displayOutput: b.output || `${outputNum} kg`,
        displayMilk: b.milkUsed || `${milkNum} L`,
      };
    });
  }, [batches]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return manufacturingBatches;

    return manufacturingBatches.filter((b) => {
      return (
        (b.id || '').toLowerCase().includes(q) ||
        (b.batchNumber || '').toLowerCase().includes(q) ||
        (b.product || '').toLowerCase().includes(q) ||
        (b.source || '').toLowerCase().includes(q) ||
        (b.formattedDate || '').toLowerCase().includes(q)
      );
    });
  }, [manufacturingBatches, searchTerm]);

  const headers = ['Date', 'Batch ID', 'Product', 'Source', 'Milk Input', 'Produced Output'];
  if (onDeleteBatch) {
    headers.push('Actions');
  }

  return (
    <div className="space-y-3">
      {/* Search and Records Count Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 h-9 shadow-xs">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search batch ID, product, source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-none outline-none bg-transparent text-xs text-slate-700 w-52 sm:w-64"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filtered.length}</span> of {batches.length} batches
        </div>
      </div>

      {/* Historical Manufacturing Logs Table */}
      <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-xs">
        <Table className="w-full border-collapse text-[13px]">
          <TableHeader>
            <TableRow className="bg-slate-50/80 border-b border-slate-200 hover:bg-slate-50/80">
              {headers.map((h) => (
                <TableHead
                  key={h}
                  className={`px-3.5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap ${
                    h === 'Actions' ? 'text-right' : 'text-left'
                  }`}
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headers.length} className="px-4 py-12 text-center text-slate-400 text-xs font-medium">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Layers className="w-8 h-8 text-slate-300" />
                    <p className="font-semibold text-slate-600">No manufacturing batches found</p>
                    <p className="text-slate-400 text-[11px]">Click "Record New Batch" to record production.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((b) => {
                return (
                  <TableRow
                    key={b.id || b.batchNumber}
                    onClick={() => onViewDetail && onViewDetail(b.id)}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    {/* 1. Date */}
                    <TableCell className="px-3.5 py-3 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 font-mono text-[11.5px] font-semibold text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        {b.formattedDate}
                      </span>
                    </TableCell>

                    {/* 2. Batch ID */}
                    <TableCell className="px-3.5 py-3">
                      <span className="flex items-center gap-1.5 font-mono text-[12px] font-bold text-slate-800 tabular">
                        <Layers className="w-3.5 h-3.5 text-[#009689]" />
                        {b.batchNumber || b.id}
                      </span>
                    </TableCell>

                    {/* 3. Product */}
                    <TableCell className="px-3.5 py-3 font-bold text-slate-900">{b.product}</TableCell>

                    {/* 4. Source */}
                    <TableCell className="px-3.5 py-3 text-xs text-slate-600">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {b.source || 'Farm Milk'}
                      </span>
                    </TableCell>

                    {/* 5. Milk Input */}
                    <TableCell className="px-3.5 py-3 text-slate-700 font-medium tabular">
                      {b.displayMilk}
                    </TableCell>

                    {/* 6. Produced Output */}
                    <TableCell className="px-3.5 py-3 font-bold text-slate-900 tabular">
                      {b.displayOutput}
                    </TableCell>

                    {/* 7. Actions */}
                    {onDeleteBatch && (
                      <TableCell className="px-3.5 py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteBatch(b.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="Delete Batch Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
