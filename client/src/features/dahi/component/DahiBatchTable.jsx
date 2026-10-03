import React, { useState, useMemo } from 'react';
import { Layers, Trash2, Search, CheckCircle2, ShoppingCart, Clock, Thermometer } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useDahiContext } from '@/context/DahiContext';

export default function DahiBatchTable({ batches = [], onDeleteBatch, onViewDetail }) {
  const { metrics = {} } = useDahiContext() || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const totalGlobalPosSold = parseFloat(String(metrics?.dahiSoldInPOS || '0').replace(/[^\d.]/g, '')) || 0;

  // Compute sold metrics per batch
  const enrichedBatches = useMemo(() => {
    const posList = batches.filter((b) => b.stage === 'pos' || b.stage === 'sold_out');
    const totalPosTransferred = posList.reduce((acc, b) => {
      const val = parseFloat(String(b.outputVal || b.output || 0).replace(/[^\d.]/g, '')) || 0;
      return acc + val;
    }, 0);

    return batches.map((b) => {
      const outputNum = parseFloat(String(b.outputVal || b.output || 0).replace(/[^\d.]/g, '')) || 0;
      let soldKg = 0;
      let remainingKg = outputNum;
      let isSoldOut = b.stage === 'sold_out';

      if (b.stage === 'pos' || b.stage === 'sold_out') {
        const ratio = totalPosTransferred > 0 ? outputNum / totalPosTransferred : 1;
        soldKg = Number(Math.min(outputNum, totalGlobalPosSold * ratio).toFixed(1));
        remainingKg = Math.max(0, Number((outputNum - soldKg).toFixed(1)));
        if (remainingKg <= 0 || b.stage === 'sold_out') {
          isSoldOut = true;
          remainingKg = 0;
        }
      }

      return {
        ...b,
        outputNum,
        soldKg,
        remainingKg,
        isSoldOut,
      };
    });
  }, [batches, totalGlobalPosSold]);

  const filtered = enrichedBatches.filter((b) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (b.id || '').toLowerCase().includes(q) ||
      (b.batchNumber || '').toLowerCase().includes(q) ||
      (b.product || '').toLowerCase().includes(q) ||
      (b.source || '').toLowerCase().includes(q);

    let matchesStatus = true;
    if (statusFilter === 'Sold') {
      matchesStatus = b.isSoldOut || b.soldKg > 0;
    } else if (statusFilter === 'pos') {
      matchesStatus = b.stage === 'pos' && !b.isSoldOut;
    } else if (statusFilter === 'chilled') {
      matchesStatus = b.stage === 'chilled';
    } else if (statusFilter === 'incubating') {
      matchesStatus = b.stage === 'incubating';
    } else if (statusFilter !== 'all') {
      matchesStatus = b.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 h-9 shadow-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search batch ID, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none outline-none bg-transparent text-xs text-slate-700 w-45"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#009689] shadow-xs cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Sold">Sold / Sold Out</option>
            <option value="pos">Active at POS</option>
            <option value="chilled">Chilled & Ready</option>
            <option value="incubating">Incubating</option>
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
              {['Batch ID', 'Product', 'Source', 'Milk Input', 'Produced Output', 'Sold at POS', 'Remaining', 'Status', 'Actions'].map((h) => (
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
                    <p className="text-slate-400 text-[11px]">Click "Record New Batch" to start production.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((b) => {
                return (
                  <TableRow
                    key={b.id}
                    onClick={() => onViewDetail && onViewDetail(b.id)}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <TableCell className="px-3.5 py-3">
                      <span className="flex items-center gap-1.5 font-mono text-[12px] font-bold text-slate-800 tabular">
                        <Layers className="w-3.5 h-3.5 text-[#009689]" />
                        {b.batchNumber || b.id}
                      </span>
                    </TableCell>

                    <TableCell className="px-3.5 py-3 font-bold text-slate-900">{b.product}</TableCell>

                    <TableCell className="px-3.5 py-3 text-xs text-slate-600">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {b.source || 'Farm Milk'}
                      </span>
                    </TableCell>

                    <TableCell className="px-3.5 py-3 text-slate-700 font-medium tabular">
                      {b.milkUsed || `${b.milkUsedVal || 0} L`}
                    </TableCell>

                    <TableCell className="px-3.5 py-3 font-bold text-slate-900 tabular">
                      {b.output || `${b.outputNum} kg`}
                    </TableCell>

                    {/* Sold at POS column */}
                    <TableCell className="px-3.5 py-3 tabular">
                      {b.soldKg > 0 ? (
                        <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-xs">
                          {b.soldKg} kg Sold
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-mono">0.0 kg</span>
                      )}
                    </TableCell>

                    {/* Remaining Stock column */}
                    <TableCell className="px-3.5 py-3 tabular">
                      {b.isSoldOut ? (
                        <span className="text-rose-600 font-bold text-xs">0.0 kg (Depleted)</span>
                      ) : b.stage === 'pos' ? (
                        <span className="text-emerald-700 font-bold text-xs">{b.remainingKg} kg available</span>
                      ) : (
                        <span className="text-slate-500 font-medium text-xs">{b.outputNum} kg in kitchen</span>
                      )}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="px-3.5 py-3">
                      {b.isSoldOut ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <CheckCircle2 className="w-3 h-3 text-rose-600" />
                          Sold Out
                        </span>
                      ) : b.stage === 'pos' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <ShoppingCart className="w-3 h-3 text-emerald-600" />
                          {b.soldKg > 0 ? `Selling (${b.soldKg}kg sold)` : 'Live at POS'}
                        </span>
                      ) : b.stage === 'chilled' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Thermometer className="w-3 h-3 text-blue-600" />
                          Chilled &amp; Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Incubating
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="px-3.5 py-3">
                      {onDeleteBatch && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteBatch(b.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Batch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </TableCell>
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
